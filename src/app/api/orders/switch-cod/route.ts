import { NextResponse } from "next/server";
import { readDB, writeDB } from "@/lib/db";
import { pushOrderToShiprocket } from "@/lib/shiprocket";
import { sendOrderConfirmationWhatsApp } from "@/lib/whatsapp-notifications";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const host = request.headers.get("host") || "localhost:3000";
  const protocol = host.includes("localhost") ? "http" : "https";
  const origin = `${protocol}://${host}`;

  try {
    const url = new URL(request.url);
    const orderId = url.searchParams.get("orderId");
    const token = url.searchParams.get("token"); // phone 10-digits

    if (!orderId) {
      return NextResponse.redirect(`${origin}/checkout?error=Missing+order+ID`, { status: 303 });
    }

    const db = await readDB();
    const orders = db.orders || [];
    const orderIdx = orders.findIndex((o: any) => o.id === orderId);

    if (orderIdx === -1) {
      return NextResponse.redirect(`${origin}/checkout?error=Order+not+found`, { status: 303 });
    }

    const order = orders[orderIdx];

    // Security check: Match last 10 digits of phone
    if (token) {
      const orderPhone10 = (order.phone || "").replace(/\D/g, "").slice(-10);
      const token10 = token.replace(/\D/g, "").slice(-10);
      if (orderPhone10 && token10 && orderPhone10 !== token10) {
        return NextResponse.redirect(`${origin}/checkout?error=Unauthorized+order+access`, { status: 303 });
      }
    }

    // If order is already confirmed / processing
    if (order.status === "Processing" || order.status === "Shipped" || order.status === "Delivered") {
      return NextResponse.redirect(`${origin}/track?orderId=${encodeURIComponent(orderId)}`, { status: 303 });
    }

    // Convert from Pending Payment / Payment Failed to Cash on Delivery
    order.status = "Processing";
    order.method = "Cash on Delivery";
    order.paymentMethod = "cod";
    order.switchedToCodAt = new Date().toISOString();
    order.codSwitchedVia = "WhatsApp 1-Click Recovery";

    orders[orderIdx] = order;
    db.orders = orders;
    await writeDB(db);

    // Automated Push to Shiprocket
    try {
      await pushOrderToShiprocket(order, db);
    } catch (srErr) {
      console.error("[Switch-COD Shiprocket Auto-Push Error]:", srErr);
    }

    // Automated WhatsApp Order Confirmation
    try {
      await sendOrderConfirmationWhatsApp(order);
    } catch (waErr) {
      console.error("[Switch-COD WhatsApp Confirmation Error]:", waErr);
    }

    // Redirect to checkout success with switchedCod parameter
    return NextResponse.redirect(
      `${origin}/checkout?success=true&orderId=${encodeURIComponent(orderId)}&switchedCod=true`,
      { status: 303 }
    );
  } catch (error: any) {
    console.error("[Switch-COD Error]:", error);
    return NextResponse.redirect(
      `${origin}/checkout?error=${encodeURIComponent(error.message || "Failed to switch to Cash on Delivery")}`,
      { status: 303 }
    );
  }
}
