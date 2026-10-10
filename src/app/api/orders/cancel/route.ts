import { NextResponse } from "next/server";
import { readDB, writeDB } from "@/lib/db";
import { cancelOrderInLogistics } from "@/lib/logistics";
import { sendOrderCancellationWhatsApp } from "@/lib/whatsapp-notifications";
import { checkCustomerFraudStatus } from "@/lib/fraud-prevention";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { orderId, contact, reason, comments } = body;

    if (!orderId) {
      return NextResponse.json({ success: false, error: "Order ID is required." }, { status: 400 });
    }

    const db = await readDB();
    const orders = db.orders || [];

    const cleanQuery = String(orderId).replace(/^order\s*id\s*:\s*/i, "").replace(/^order\s*:\s*/i, "").trim().toLowerCase();
    const numericQuery = cleanQuery.replace(/\D/g, "");

    const orderIndex = orders.findIndex((o: any) => {
      if (!o || !o.id) return false;
      const orderIdLower = String(o.id).trim().toLowerCase();
      const orderNumeric = String(o.id).replace(/\D/g, "");

      const isExactMatch = orderIdLower === cleanQuery;
      const isNumericMatch = numericQuery.length >= 4 && (orderNumeric === numericQuery || orderIdLower.includes(cleanQuery));
      const isSrOrderMatch = o.shiprocketOrderId && String(o.shiprocketOrderId).trim().toLowerCase() === cleanQuery;
      const isSrShipmentMatch = o.shiprocketShipmentId && String(o.shiprocketShipmentId).trim().toLowerCase() === cleanQuery;
      const isNimbusOrderMatch = o.nimbusOrderId && String(o.nimbusOrderId).trim().toLowerCase() === cleanQuery;
      const isNimbusAwbMatch = o.nimbusAwb && String(o.nimbusAwb).trim().toLowerCase() === cleanQuery;

      return isExactMatch || isNumericMatch || isSrOrderMatch || isSrShipmentMatch || isNimbusOrderMatch || isNimbusAwbMatch;
    });

    if (orderIndex === -1) {
      return NextResponse.json({ success: false, error: "Order not found. Please verify your Order ID." }, { status: 404 });
    }

    const order = orders[orderIndex];

    // Mandatory verification: Verify that the submitted phone number or email matches the order
    const userEmail = (order.email || "").toLowerCase().trim();
    const userPhone = (order.phone || "").replace(/\D/g, "").slice(-10);
    const altPhone = (order.altPhone || "").replace(/\D/g, "").slice(-10);
    const cleanContact = String(contact || "").toLowerCase().trim();
    const contactDigits = cleanContact.replace(/\D/g, "").slice(-10);

    if (!cleanContact || cleanContact.includes("*")) {
      return NextResponse.json(
        {
          success: false,
          error: "Verification required: Please enter the 10-digit mobile number or email address used to place this order.",
        },
        { status: 403 }
      );
    }

    const isEmailMatch = Boolean(userEmail && userEmail === cleanContact);
    const isPhoneMatch = Boolean(
      contactDigits.length >= 10 &&
        ((userPhone.length >= 10 && userPhone === contactDigits) ||
          (altPhone.length >= 10 && altPhone === contactDigits))
    );

    if (!isEmailMatch && !isPhoneMatch) {
      return NextResponse.json(
        {
          success: false,
          error: "Verification failed: The mobile number or email entered does not match the one used to place this order.",
        },
        { status: 403 }
      );
    }

    const currentStatus = String(order.status || "Processing").toLowerCase();

    // 1. Already Cancelled
    if (currentStatus === "cancelled" || currentStatus.includes("cancel")) {
      return NextResponse.json({
        success: false,
        error: "This order is already cancelled.",
        order,
      }, { status: 400 });
    }

    // 2. Already Delivered
    if (currentStatus.includes("delivered")) {
      return NextResponse.json({
        success: false,
        error: "This order has already been delivered. Cancellation is no longer possible. If you wish to return a damaged or incorrect Ayurvedic remedy, please contact our support team.",
        order,
      }, { status: 400 });
    }

    // 3. Shipped, In-Transit, or Out for Delivery with courier (Amazon & Flipkart Doorstep Refusal Policy)
    const nimbusStatusLower = String(order.nimbusStatus || "").toLowerCase();
    const srStatusLower = String(order.shiprocketStatus || "").toLowerCase();
    const combinedStatus = `${currentStatus} ${nimbusStatusLower} ${srStatusLower}`;

    const isAlreadyDispatched =
      combinedStatus.includes("shipped") ||
      combinedStatus.includes("dispatched") ||
      combinedStatus.includes("in transit") ||
      combinedStatus.includes("transit") ||
      combinedStatus.includes("out for delivery") ||
      combinedStatus.includes("ofd") ||
      combinedStatus.includes("picked up");

    if (isAlreadyDispatched) {
      return NextResponse.json({
        success: false,
        eligibleForDoorstepRefusal: true,
        isDispatched: true,
        error: "Your order has already been shipped / is out for delivery with our courier partner and cannot be cancelled online. Like Amazon and Flipkart, you can simply refuse delivery at your doorstep when the courier executive arrives. The package will be returned to us safely with ₹0 charge or a full refund for prepaid orders.",
        order,
      }, { status: 400 });
    }

    // 3.5. Cancellation Abuse & Limit Check (Amazon & Flipkart Policy)
    const fraudStatus = await checkCustomerFraudStatus(order.phone);
    if (fraudStatus.isCancelBlocked) {
      return NextResponse.json({
        success: false,
        limitReached: true,
        error: fraudStatus.cancelBlockReason
          ? `${fraudStatus.cancelBlockReason} To cancel this order, please contact our customer care desk at +91 72478 24101.`
          : "You have reached the maximum automated cancellation limit for this mobile number. Please contact our support team at +91 72478 24101 to cancel.",
        order,
      }, { status: 400 });
    }

    // 4. Cancel on Active Logistics Partner (NimbusPost / Shiprocket)
    const logCancelResult = await cancelOrderInLogistics(order, reason, db);
    if (!logCancelResult.success && (logCancelResult as any).alreadyDispatched) {
      return NextResponse.json({
        success: false,
        eligibleForDoorstepRefusal: true,
        isDispatched: true,
        error: "Your parcel is already dispatched with our courier partner and cannot be cancelled online. Like Amazon and Flipkart, you can simply refuse delivery at your doorstep when the courier executive arrives. The package will be returned to us safely with ₹0 charge or a full refund for prepaid orders.",
        order,
      }, { status: 400 });
    }

    const isPrepaid = order.paymentMethod === "prepaid" || order.method === "Prepaid" || order.method === "PhonePe";
    const cancellationReasonText = reason || "Customer requested cancellation";

    order.status = "Cancelled";
    if (order.shiprocketStatus) order.shiprocketStatus = "Cancelled";
    if (order.nimbusStatus) order.nimbusStatus = "Cancelled";
    order.cancellationReason = cancellationReasonText;
    order.cancellationComments = comments || "";
    order.cancellationDate = new Date().toISOString();
    order.cancelledBy = "Customer";
    order.refundStatus = isPrepaid
      ? "Refund Initiated (3–5 business days)"
      : "Not Applicable (Cash on Delivery - ₹0)";

    // Update orders array in DB
    db.orders[orderIndex] = order;
    await writeDB(db);

    // Send instant WhatsApp notification
    try {
      await sendOrderCancellationWhatsApp(order, cancellationReasonText);
    } catch (waErr) {
      console.error("[Cancel Route WhatsApp Notification Error]:", waErr);
    }

    return NextResponse.json({
      success: true,
      message: "Your order has been cancelled successfully.",
      order,
      logisticsCancelled: logCancelResult.success,
      shiprocketCancelled: logCancelResult.success,
    });
  } catch (error: any) {
    console.error("[Cancel Order API Error]:", error);
    return NextResponse.json({ success: false, error: error?.message || "Internal Server Error" }, { status: 500 });
  }
}
