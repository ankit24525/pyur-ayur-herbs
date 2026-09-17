import { NextResponse } from "next/server";
import { readDB, writeDB } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, phone, email, items, cartTotal } = body || {};

    const cleanPhone = (phone || "").replace(/\D/g, "");
    if (!cleanPhone || cleanPhone.length < 10) {
      return NextResponse.json({ success: false, error: "Valid 10-digit mobile number required." }, { status: 400 });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ success: false, error: "Cart items cannot be empty." }, { status: 400 });
    }

    const phone10 = cleanPhone.slice(-10);
    const db = await readDB();
    db.abandonedCarts = db.abandonedCarts || [];

    // Find existing cart for this phone
    const existingIndex = db.abandonedCarts.findIndex((c: any) => {
      const cPhone = (c.phone || "").replace(/\D/g, "").slice(-10);
      return cPhone === phone10 && c.status !== "Converted";
    });

    const now = new Date().toISOString();
    const cartId = existingIndex !== -1 ? db.abandonedCarts[existingIndex].id : `AC-${Date.now()}`;

    const cartRecord = {
      id: cartId,
      phone: phone10,
      name: (name || "Valued Customer").trim(),
      email: (email || "").trim(),
      items: items.map((i: any) => ({
        id: i.id || i.product?.id || "prod",
        name: i.name || i.product?.name || "Ayurvedic Remedy",
        quantity: i.quantity || 1,
        price: i.price || i.product?.price || 0,
      })),
      cartTotal: Number(cartTotal) || 0,
      status: "Abandoned",
      discountCode: "AYUR5",
      recoveryMessagesSent: existingIndex !== -1 ? db.abandonedCarts[existingIndex].recoveryMessagesSent || 0 : 0,
      createdAt: existingIndex !== -1 ? db.abandonedCarts[existingIndex].createdAt : now,
      lastActive: now,
      recoveryUrl: `https://purreayurherbs.com/cart`,
    };

    if (existingIndex !== -1) {
      db.abandonedCarts[existingIndex] = cartRecord;
    } else {
      db.abandonedCarts.unshift(cartRecord);
    }

    // Keep only last 200 abandoned carts to avoid unbounded file growth
    if (db.abandonedCarts.length > 200) {
      db.abandonedCarts = db.abandonedCarts.slice(0, 200);
    }

    await writeDB(db);

    return NextResponse.json({ success: true, cartId });
  } catch (error: any) {
    console.error("[Abandoned Cart Tracking Error]:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
