import { NextResponse } from "next/server";
import { readDB } from "@/lib/db";
import { getShiprocketToken, getShiprocketTracking } from "@/lib/shiprocket";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get("orderId") || "";
    const contact = searchParams.get("contact") || "";

    if (!orderId) {
      return NextResponse.json({ success: false, error: "Order ID is required." }, { status: 400 });
    }

    const db = await readDB();
    const allOrders = db.orders || [];

    // Find order matching ID, numeric digits, Shiprocket Order ID, or Shipment ID
    const cleanQuery = orderId.replace(/^order\s*id\s*:\s*/i, "").replace(/^order\s*:\s*/i, "").trim().toLowerCase();
    const numericQuery = cleanQuery.replace(/\D/g, "");

    const order = allOrders.find((o: any) => {
      if (!o || !o.id) return false;
      const orderIdLower = o.id.trim().toLowerCase();
      const orderNumeric = o.id.replace(/\D/g, "");
      
      const isExactIdMatch = orderIdLower === cleanQuery;
      const isNumericMatch = numericQuery.length >= 4 && (orderNumeric === numericQuery || orderIdLower.includes(cleanQuery));
      const isSrOrderMatch = o.shiprocketOrderId && String(o.shiprocketOrderId).trim().toLowerCase() === cleanQuery;
      const isSrShipmentMatch = o.shiprocketShipmentId && String(o.shiprocketShipmentId).trim().toLowerCase() === cleanQuery;

      return isExactIdMatch || isNumericMatch || isSrOrderMatch || isSrShipmentMatch;
    });

    if (!order) {
      return NextResponse.json({ success: false, error: "Order not found. Please check your Order ID (e.g. PYR-ORD-909337)." }, { status: 404 });
    }

    // Check authorization:
    // Authorized if 'contact' matches order's email or phone number
    const userEmail = (order.email || "").toLowerCase().trim();
    const userPhone = (order.phone || "").replace(/\D/g, "");
    const cleanContact = contact.toLowerCase().trim().replace(/\D/g, "");

    const isEmailMatch = !!contact && userEmail === contact.toLowerCase().trim();
    const isPhoneMatch = !!contact && cleanContact.length >= 4 && (userPhone === cleanContact || userPhone.includes(cleanContact) || cleanContact.includes(userPhone));
    const isAuthorized = isEmailMatch || isPhoneMatch;

    // Check live Shiprocket shipment status if pushed
    let liveTracking = null;
    if (order.shiprocketShipmentId) {
      try {
        const srConfig = db.settings?.shiprocket || {};
        const srEmail = srConfig.email || process.env.SHIPROCKET_EMAIL;
        const srPassword = srConfig.password || process.env.SHIPROCKET_PASSWORD;
        if (srEmail && srPassword) {
          const token = await getShiprocketToken(srEmail, srPassword);
          if (token) {
            const trackRes = await getShiprocketTracking(order.shiprocketShipmentId, token);
            if (trackRes.success) {
              liveTracking = trackRes.data;
            }
          }
        }
      } catch (err) {
        console.error("[Track Route Shiprocket Fetch Error]:", err);
      }
    }

    const orderWithTracking = {
      ...order,
      liveTracking,
    };

    if (isAuthorized) {
      return NextResponse.json({ success: true, authorized: true, order: orderWithTracking });
    }

    // Mask sensitive information for customer privacy:
    // Name, address, email, phone
    const maskString = (str: string, keep = 3) => {
      if (!str) return "";
      if (str.length <= keep) return "*".repeat(str.length);
      return str.slice(0, keep) + "*".repeat(str.length - keep);
    };

    const maskEmail = (email: string) => {
      if (!email) return "";
      const parts = email.split("@");
      if (parts.length !== 2) return maskString(email, 2);
      return maskString(parts[0], 2) + "@" + maskString(parts[1], 2);
    };

    const maskedOrder = {
      ...order,
      liveTracking,
      email: maskEmail(order.email),
      phone: order.phone ? order.phone.replace(/.(?=.{4})/g, "*") : "",
      customerName: maskString(order.customerName || order.name || "", 2),
      shippingAddress: order.shippingAddress ? {
        ...order.shippingAddress,
        street: maskString(order.shippingAddress.street || "", 4),
        city: order.shippingAddress.city || "",
        state: order.shippingAddress.state || "",
        pincode: order.shippingAddress.pincode ? order.shippingAddress.pincode.replace(/.(?=.{2})/g, "*") : "",
      } : null,
      // Keep other fields like items, pricing, date, status intact!
    };

    return NextResponse.json({ success: true, authorized: false, order: maskedOrder });
  } catch (error) {
    console.error("[Track API] Error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
