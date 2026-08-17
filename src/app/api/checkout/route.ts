import { NextResponse } from "next/server";
import { readDB, writeDB } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, phone, address, pincode, city, state, paymentMethod, items, subtotal } = body;

    // Server-side validation
    if (!name || !phone || !address || !pincode || pincode.length !== 6 || !city || !state || !items || items.length === 0) {
      return NextResponse.json(
        { success: false, error: "Validation failed. All address fields, 6-digit Pincode and items are required." },
        { status: 400 }
      );
    }

    const db = readDB();

    const discount = paymentMethod === "prepaid" ? Math.round(subtotal * (db.settings.prepaidDiscount / 100)) : 0;
    const shipping = subtotal >= 999 ? 0 : 49;
    const total = subtotal - discount + shipping;

    const orderId = `PYR-ORD-${Math.floor(100000 + Math.random() * 900000)}`;

    const newOrder = {
      id: orderId,
      customer: name,
      phone: phone,
      address: address || "",
      pincode: pincode || "",
      city: city || "",
      state: state || "",
      total,
      method: paymentMethod === "prepaid" ? "Prepaid" : "COD",
      status: paymentMethod === "cod" ? "Verified" : "Processing",
      date: new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
      items: `${items.map((i: any) => {
        const prod = db.products.find((p) => p.id === i.productId);
        return `${prod ? prod.name : "Remedy"} x${i.quantity}`;
      }).join(", ")}`,
    };

    db.orders.push(newOrder);
    writeDB(db);

    // Simulated Server-Side Meta Conversions API (CAPI) trigger
    try {
      const capiPayload = {
        event_name: "Purchase",
        event_time: Math.floor(Date.now() / 1000),
        user_data: {
          fn: name.toLowerCase().trim(),
          ph: phone.trim(),
        },
        custom_data: {
          currency: "INR",
          value: total,
          order_id: orderId,
        },
      };
      console.log("[CAPI Server Trigger Success]:", capiPayload);
    } catch (e) {
      console.error("[CAPI Server Trigger Failed]:", e);
    }

    return NextResponse.json({
      success: true,
      orderId,
      subtotal,
      discount,
      shipping,
      total,
      message: "Order placed successfully!",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
