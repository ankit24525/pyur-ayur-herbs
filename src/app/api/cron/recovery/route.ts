import { NextResponse } from "next/server";
import { readDB, writeDB } from "@/lib/db";
import {
  sendPaymentFailedWhatsApp,
  sendAbandonedCartWhatsApp,
} from "@/lib/whatsapp-notifications";

export const dynamic = "force-dynamic";

async function runRecoveryEngine(request: Request) {
  const host = request.headers.get("host") || "localhost:3000";
  const protocol = host.includes("localhost") ? "http" : "https";
  const origin = `${protocol}://${host}`;

  try {
    const db = await readDB();
    const now = Date.now();
    const tenMinutesAgo = now - 10 * 60 * 1000;
    const fifteenMinutesAgo = now - 15 * 60 * 1000;
    const twentyFourHoursAgo = now - 24 * 60 * 60 * 1000;

    const notifiedOrders: any[] = [];
    const notifiedCarts: any[] = [];

    // -------------------------------------------------------------
    // Task 1: Logged-in Users with Incomplete / Pending / Failed Payments
    // -------------------------------------------------------------
    const orders = Array.isArray(db.orders) ? db.orders : [];
    let ordersModified = false;

    for (const order of orders) {
      const isLoggedUser = Boolean(order.isLoggedInUser || order.userId);
      if (!isLoggedUser) continue;

      // Must be in Pending Payment or Payment Failed
      const isPaymentIncomplete =
        order.status === "Pending Payment" || order.status === "Payment Failed";
      if (!isPaymentIncomplete) continue;

      // Check if already notified
      if (order.paymentFailedAlertSent) continue;

      // Check timestamp: created > 10 mins ago and < 24 hours ago
      let createdTime = order.createdAt ? new Date(order.createdAt).getTime() : null;
      if (!createdTime && order.date) {
        createdTime = new Date(order.date).getTime();
      }

      // If timestamp is valid and was initiated at least 10 minutes ago
      if (createdTime && createdTime <= tenMinutesAgo && createdTime >= twentyFourHoursAgo) {
        try {
          const res = await sendPaymentFailedWhatsApp(order, { baseUrl: origin });
          if (res.success) {
            order.paymentFailedAlertSent = true;
            order.paymentFailedAlertSentAt = new Date().toISOString();
            ordersModified = true;
            notifiedOrders.push({
              orderId: order.id,
              customer: order.customer,
              phone: order.phone,
              total: order.total,
              status: order.status,
            });
            console.log(`[Recovery Cron]: Sent payment recovery WhatsApp for order ${order.id}`);
          }
        } catch (err: any) {
          console.error(`[Recovery Cron]: Error sending WhatsApp for order ${order.id}:`, err);
        }
      }
    }

    // -------------------------------------------------------------
    // Task 2: Logged-in Users with Abandoned Carts (> 15 mins)
    // -------------------------------------------------------------
    const carts = Array.isArray(db.abandonedCarts) ? db.abandonedCarts : [];
    let cartsModified = false;

    for (const cart of carts) {
      const isLoggedUser = Boolean(cart.isLoggedInUser || cart.userId);
      if (!isLoggedUser) continue;

      // Must be in Abandoned status and not notified yet
      if (cart.status !== "Abandoned" || (cart.recoveryMessagesSent || 0) > 0) continue;

      // Check timestamp: created > 15 mins ago
      const createdTime = cart.createdAt ? new Date(cart.createdAt).getTime() : 0;
      if (createdTime && createdTime <= fifteenMinutesAgo && createdTime >= twentyFourHoursAgo) {
        // Check if user has already placed an order after cart was created
        const cartPhone10 = (cart.phone || "").replace(/\D/g, "").slice(-10);
        const hasOrdered = orders.some((o: any) => {
          const oPhone10 = (o.phone || "").replace(/\D/g, "").slice(-10);
          const isSameUser = (cart.userId && o.userId === cart.userId) || (cartPhone10 && oPhone10 === cartPhone10);
          const isPaidOrProcessing = o.status === "Processing" || o.status === "Shipped" || o.status === "Delivered";
          return isSameUser && isPaidOrProcessing;
        });

        if (hasOrdered) {
          cart.status = "Converted";
          cartsModified = true;
          continue;
        }

        try {
          const res = await sendAbandonedCartWhatsApp({
            phone: cart.phone,
            name: cart.name,
            items: cart.items,
            cartTotal: cart.cartTotal,
            discountCode: cart.discountCode || "AYUR5",
            recoveryUrl: `${origin}/checkout?recoverCart=${encodeURIComponent(cart.id)}&coupon=AYUR5`,
          });

          if (res.success) {
            cart.recoveryMessagesSent = (cart.recoveryMessagesSent || 0) + 1;
            cart.lastNotifiedAt = new Date().toISOString();
            cart.status = "Notified";
            cartsModified = true;
            notifiedCarts.push({
              cartId: cart.id,
              customer: cart.name,
              phone: cart.phone,
              total: cart.cartTotal,
            });
            console.log(`[Recovery Cron]: Sent cart recovery WhatsApp for cart ${cart.id}`);
          }
        } catch (err: any) {
          console.error(`[Recovery Cron]: Error sending WhatsApp for cart ${cart.id}:`, err);
        }
      }
    }

    if (ordersModified || cartsModified) {
      await writeDB(db);
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      summary: {
        paymentRecoveryAlertsSent: notifiedOrders.length,
        cartRecoveryAlertsSent: notifiedCarts.length,
      },
      notifiedOrders,
      notifiedCarts,
    });
  } catch (error: any) {
    console.error("[Recovery Cron Engine Exception]:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function GET(request: Request) {
  return runRecoveryEngine(request);
}

export async function POST(request: Request) {
  return runRecoveryEngine(request);
}
