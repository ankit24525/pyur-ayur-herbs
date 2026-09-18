import { NextResponse } from "next/server";
import { readDB, writeDB } from "@/lib/db";
import { sendAbandonedCartWhatsApp } from "@/lib/whatsapp-notifications";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const db = await readDB();
    const carts = Array.isArray(db.abandonedCarts) ? db.abandonedCarts : [];

    const stats = {
      total: carts.length,
      abandoned: carts.filter((c: any) => c.status === "Abandoned").length,
      recovered: carts.filter((c: any) => c.status === "Converted").length,
      recoveryRate:
        carts.length > 0
          ? Math.round((carts.filter((c: any) => c.status === "Converted").length / carts.length) * 100)
          : 0,
      totalValue: carts.reduce((sum: number, c: any) => sum + (Number(c.cartTotal) || 0), 0),
    };

    return NextResponse.json({ success: true, carts, stats });
  } catch (error: any) {
    console.error("[GET /api/admin/abandoned-carts Error]:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { cartId, discountCode = "AYUR5" } = body || {};

    if (!cartId) {
      return NextResponse.json({ success: false, error: "Cart ID is required." }, { status: 400 });
    }

    const db = await readDB();
    const carts = db.abandonedCarts || [];
    const cartIndex = carts.findIndex((c: any) => c.id === cartId);

    if (cartIndex === -1) {
      return NextResponse.json({ success: false, error: "Abandoned cart record not found." }, { status: 404 });
    }

    const cart = carts[cartIndex];

    const waRes = await sendAbandonedCartWhatsApp({
      phone: cart.phone,
      name: cart.name,
      items: cart.items,
      cartTotal: cart.cartTotal,
      discountCode: discountCode,
      recoveryUrl: cart.recoveryUrl || "https://www.purreayurherbs.com/cart",
    });

    if (waRes.success) {
      cart.recoveryMessagesSent = (cart.recoveryMessagesSent || 0) + 1;
      cart.lastNotifiedAt = new Date().toISOString();
      cart.lastStatus = "Notified";
      await writeDB(db);
      return NextResponse.json({ success: true, message: `Recovery WhatsApp sent to +91 ${cart.phone}` });
    } else {
      return NextResponse.json({ success: false, error: waRes.error || "Failed to send WhatsApp message." }, { status: 400 });
    }
  } catch (error: any) {
    console.error("[POST /api/admin/abandoned-carts Error]:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
