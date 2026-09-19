import { NextResponse } from "next/server";
import { readDB } from "@/lib/db";
import { pushOrderToShiprocket } from "@/lib/shiprocket";
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

    const result = await pushOrderToShiprocket(order, db);

    if (result.success) {
      // Automated WhatsApp Shipment Alert
      if (order.phone) {
        try {
          await sendOrderShippedWhatsApp({
            order,
            courierName: "Shiprocket Express",
            awb: `SR-SHP-${result.shipmentId || order.shiprocketShipmentId}`,
          });
          console.log(`[Admin Shiprocket Push]: Sent Shipped WhatsApp notification for ${orderId}`);
        } catch (waErr) {
          console.warn("[Admin Shiprocket Push WhatsApp Warning]:", waErr);
        }
      }

      return NextResponse.json({
        success: true,
        message: `Order ${orderId} successfully pushed to Shiprocket!`,
        shiprocketOrderId: result.shiprocketOrderId,
        shipmentId: result.shipmentId,
      });
    } else {
      return NextResponse.json(
        { success: false, error: result.error || "Shiprocket API rejected the order." },
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
