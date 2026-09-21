import { NextResponse } from "next/server";
import { readDB, writeDB } from "@/lib/db";
import { sendOrderReturnRequestWhatsApp } from "@/lib/whatsapp-notifications";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { orderId, contact, reason, resolution = "Replacement", comments } = body;

    if (!orderId) {
      return NextResponse.json({ success: false, error: "Order ID is required." }, { status: 400 });
    }

    if (!reason) {
      return NextResponse.json({ success: false, error: "Please select a reason for your return/replacement." }, { status: 400 });
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

      return isExactMatch || isNumericMatch || isSrOrderMatch || isSrShipmentMatch;
    });

    if (orderIndex === -1) {
      return NextResponse.json({ success: false, error: "Order not found. Please verify your Order ID." }, { status: 404 });
    }

    const order = orders[orderIndex];

    // Authorization check if contact is supplied
    if (contact) {
      const userEmail = (order.email || "").toLowerCase().trim();
      const userPhone = (order.phone || "").replace(/\D/g, "").slice(-10);
      const cleanContact = String(contact).toLowerCase().trim();
      const contactDigits = cleanContact.replace(/\D/g, "").slice(-10);

      const isEmailMatch = Boolean(userEmail && userEmail === cleanContact);
      const isPhoneMatch = Boolean(contactDigits.length >= 5 && userPhone.length >= 5 && (userPhone === contactDigits || userPhone.includes(contactDigits) || contactDigits.includes(userPhone)));

      if (!isEmailMatch && !isPhoneMatch) {
        return NextResponse.json({ success: false, error: "Unauthorized. The provided contact does not match this order." }, { status: 403 });
      }
    }

    const currentStatus = String(order.status || "").toLowerCase().trim();

    // Check if already requested return
    if (currentStatus === "return request" || currentStatus === "returned" || currentStatus === "refunded") {
      return NextResponse.json({
        success: false,
        error: `A return/refund request is already active for this order (Status: ${order.status}). Our team is processing it.`,
        order,
      }, { status: 400 });
    }

    if (currentStatus === "cancelled" || currentStatus.includes("cancel")) {
      return NextResponse.json({
        success: false,
        error: "This order was cancelled prior to delivery. Returns are not applicable.",
        order,
      }, { status: 400 });
    }

    // Verify order is delivered
    const isDelivered = currentStatus === "delivered" || String(order.shiprocketStatus || "").toLowerCase() === "delivered";
    if (!isDelivered) {
      return NextResponse.json({
        success: false,
        error: "Returns can only be requested once the parcel has been delivered to your address.",
        order,
      }, { status: 400 });
    }

    // Update order with Return Request metadata
    order.status = "Return Request";
    order.returnReason = reason;
    order.returnResolution = resolution;
    order.returnComments = comments || "";
    order.returnDate = new Date().toISOString();
    order.returnStatus = "Under Review";

    db.orders[orderIndex] = order;
    await writeDB(db);

    // Send WhatsApp notification to customer
    try {
      await sendOrderReturnRequestWhatsApp(order, { reason, resolution, comments });
    } catch (waErr) {
      console.error("[Return Route WhatsApp Error]:", waErr);
    }

    return NextResponse.json({
      success: true,
      message: `Your ${resolution === "Refund" ? "refund" : "replacement"} request has been registered successfully. Our care team will contact you within 24 hours.`,
      order,
    });
  } catch (error: any) {
    console.error("[Return Order API Error]:", error);
    return NextResponse.json({ success: false, error: error?.message || "Internal Server Error" }, { status: 500 });
  }
}
