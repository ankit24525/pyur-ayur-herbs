import { NextResponse } from "next/server";
import { readDB } from "@/lib/db";

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

    // Find order matching ID (case-insensitive, strip spaces)
    const normalizedSearchId = orderId.trim().toLowerCase();
    const order = allOrders.find(
      (o) => o.id.trim().toLowerCase() === normalizedSearchId
    );

    if (!order) {
      return NextResponse.json({ success: false, error: "Order not found." }, { status: 404 });
    }

    // Check authorization:
    // Authorized if 'contact' matches order's email or phone number
    const userEmail = (order.email || "").toLowerCase().trim();
    const userPhone = (order.phone || "").replace(/\D/g, "");
    const cleanContact = contact.toLowerCase().trim().replace(/\D/g, "");

    const isEmailMatch = !!contact && userEmail === contact.toLowerCase().trim();
    const isPhoneMatch = !!contact && cleanContact.length >= 4 && (userPhone === cleanContact || userPhone.includes(cleanContact) || cleanContact.includes(userPhone));
    const isAuthorized = isEmailMatch || isPhoneMatch;

    if (isAuthorized) {
      return NextResponse.json({ success: true, authorized: true, order });
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
