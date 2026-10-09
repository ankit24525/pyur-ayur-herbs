import { NextResponse } from "next/server";
import { readDB } from "@/lib/db";
import { pushOrderToNimbusPost } from "@/lib/nimbuspost";
import { sendOrderShippedWhatsApp } from "@/lib/whatsapp-notifications";

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

    const result = await pushOrderToNimbusPost(order, db);

    if (result.success) {
      // Automated WhatsApp Shipment Alert
      if (order.phone) {
        try {
          await sendOrderShippedWhatsApp({
            order,
            courierName: result.courierName || "NimbusPost Priority Courier",
            awb: result.awb || order.nimbusAwb || "Booked",
          });
          console.log(`[Admin NimbusPost Push]: Sent Shipped WhatsApp notification for ${orderId}`);
        } catch (waErr) {
          console.warn("[Admin NimbusPost Push WhatsApp Warning]:", waErr);
        }
      }

      return NextResponse.json({
        success: true,
        message: `Order ${orderId} successfully booked on NimbusPost! Courier: ${result.courierName || "Assigned"}`,
        awb: result.awb,
        courierName: result.courierName,
        trackingUrl: result.trackingUrl,
        labelUrl: result.labelUrl,
      });
    } else {
      return NextResponse.json(
        { success: false, error: result.error || "NimbusPost API rejected the order." },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error("[Admin NimbusPost Push Error]:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
