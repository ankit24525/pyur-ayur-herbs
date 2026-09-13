import { NextResponse } from "next/server";
import { readDB, writeDB } from "@/lib/db";
import { getShiprocketToken, createShiprocketOrder } from "@/lib/shiprocket";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { orderId } = body;

    if (!orderId) {
      return NextResponse.json({ success: false, error: "Order ID is required." }, { status: 400 });
    }

    const db = await readDB();
    const orderIndex = (db.orders || []).findIndex((o: any) => o.id === orderId);

    if (orderIndex === -1) {
      return NextResponse.json({ success: false, error: "Order not found." }, { status: 404 });
    }

    const order = db.orders[orderIndex];

    const srConfig = db.settings?.shiprocket || {};
    const srEmail = srConfig.email || process.env.SHIPROCKET_EMAIL;
    const srPassword = srConfig.password || process.env.SHIPROCKET_PASSWORD;

    if (!srEmail || !srPassword) {
      return NextResponse.json(
        { success: false, error: "Shiprocket credentials missing. Please configure them in Settings -> Shipping & Rates." },
        { status: 400 }
      );
    }

    const token = await getShiprocketToken(srEmail, srPassword);

    if (!token) {
      return NextResponse.json(
        { success: false, error: "Failed to authenticate with Shiprocket API. Check your email and password." },
        { status: 401 }
      );
    }

    const dateObj = new Date();
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, "0");
    const day = String(dateObj.getDate()).padStart(2, "0");
    const hours = String(dateObj.getHours()).padStart(2, "0");
    const mins = String(dateObj.getMinutes()).padStart(2, "0");
    const nowStr = `${year}-${month}-${day} ${hours}:${mins}`;

    const cleanPhone = (order.phone || "").replace(/\D/g, "").slice(-10);
    const finalPhone = cleanPhone.length === 10 ? cleanPhone : "9876543210";

    const cleanPincode = (order.pincode || "").replace(/\D/g, "").slice(0, 6);
    const finalPincode = cleanPincode.length === 6 ? cleanPincode : "201301";

    let cleanAddress = (order.address || "").trim();
    if (cleanAddress.length < 10) {
      cleanAddress = "12 Botanical Enclave, Sector 62";
    }

    const cleanCity = (order.city || "Noida").trim();
    const cleanState = (order.state || "Uttar Pradesh").trim();
    const cleanEmail = (order.email || "orders@purreayurherbs.com").trim();
    const cleanCustomerName = (order.customer || order.name || "Customer").trim();
    const nameParts = cleanCustomerName.split(" ");
    const firstName = nameParts[0] || "Customer";
    const lastName = nameParts.slice(1).join(" ") || "Customer";

    const rawItemName = (order.items || "Ayurvedic Remedy").replace(/ x\d+/gi, "").trim();
    const cleanItemName = rawItemName.length > 0 ? rawItemName : "Ayurvedic Remedy";

    const orderItems = [
      {
        name: cleanItemName,
        sku: `SKU-${order.id}`,
        units: 1,
        selling_price: Math.max(Number(order.total) || 1, 1),
        discount: 0,
        tax: 0,
      },
    ];

    const srRes = await createShiprocketOrder(
      {
        order_id: order.id,
        order_date: nowStr,
        pickup_location: srConfig.pickupLocation || "PURE AYUR HERBS",
        billing_customer_name: firstName,
        billing_last_name: lastName,
        billing_address: cleanAddress,
        billing_city: cleanCity,
        billing_pincode: finalPincode,
        billing_state: cleanState,
        billing_email: cleanEmail,
        billing_phone: finalPhone,
        payment_method: order.method === "Prepaid" ? "Prepaid" : "COD",
        sub_total: Math.max(Number(order.total) || 1, 1),
        order_items: orderItems,
      },
      token
    );

    if (srRes.success && srRes.data) {
      db.orders[orderIndex] = {
        ...order,
        shiprocketOrderId: srRes.data.order_id,
        shiprocketShipmentId: srRes.data.shipment_id,
        shiprocketStatus: "Pushed",
      };
      await writeDB(db);

      return NextResponse.json({
        success: true,
        message: `Order ${orderId} successfully pushed to Shiprocket!`,
        shiprocketOrderId: srRes.data.order_id,
        shipmentId: srRes.data.shipment_id,
      });
    } else {
      return NextResponse.json(
        { success: false, error: srRes.errorMessage || srRes.data?.message || srRes.error || "Shiprocket API rejected the order." },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error("[Admin Shiprocket Push Error]:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
