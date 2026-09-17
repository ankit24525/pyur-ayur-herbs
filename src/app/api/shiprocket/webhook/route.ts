import { NextResponse } from "next/server";
import { readDB, writeDB } from "@/lib/db";
import {
  sendOrderShippedWhatsApp,
  sendOrderOutForDeliveryWhatsApp,
  sendOrderDeliveredWhatsApp,
} from "@/lib/whatsapp-notifications";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log("[Shiprocket Webhook Event Received]:", body);

    const {
      order_id,
      current_status,
      awb,
      courier_name,
      etd,
      scans,
    } = body || {};

    if (!order_id) {
      return NextResponse.json({ success: false, error: "Missing order_id" }, { status: 400 });
    }

    const db = await readDB();
    const orderIndex = (db.orders || []).findIndex(
      (o: any) => o.id?.trim()?.toLowerCase() === String(order_id).trim().toLowerCase()
    );

    if (orderIndex !== -1) {
      const order = db.orders[orderIndex];
      const statusUpper = String(current_status || "").toUpperCase();

      let mappedStatus = order.status;
      if (statusUpper.includes("DELIVERED")) {
        mappedStatus = "Delivered";
      } else if (statusUpper.includes("OUT FOR DELIVERY")) {
        mappedStatus = "Out for Delivery";
      } else if (statusUpper.includes("SHIPPED") || statusUpper.includes("IN TRANSIT") || statusUpper.includes("PICKED UP")) {
        mappedStatus = "Shipped";
      } else if (statusUpper.includes("CANCEL") || statusUpper.includes("RTO") || statusUpper.includes("RETURN")) {
        mappedStatus = "Cancelled";
      }

      db.orders[orderIndex] = {
        ...order,
        status: mappedStatus,
        shiprocketStatus: current_status,
        awb: awb || order.awb,
        courierName: courier_name || order.courierName,
        etd: etd || order.etd,
        lastScans: scans || order.lastScans,
        updatedAt: new Date().toISOString(),
      };

      await writeDB(db);
      console.log(`[Shiprocket Webhook Updated]: Order ${order_id} -> Status: ${mappedStatus} (${current_status})`);

      // Automated WhatsApp Order Lifecycle Updates (Pillar 3)
      if (order.phone) {
        try {
          const updatedOrder = db.orders[orderIndex];
          if (mappedStatus === "Shipped") {
            await sendOrderShippedWhatsApp({
              order: updatedOrder,
              courierName: courier_name,
              awb: awb,
              etd: etd,
            });
            console.log(`[Shiprocket Webhook]: Sent Shipped WhatsApp notification for ${order_id}`);
          } else if (mappedStatus === "Out for Delivery") {
            await sendOrderOutForDeliveryWhatsApp(updatedOrder);
            console.log(`[Shiprocket Webhook]: Sent Out for Delivery WhatsApp notification for ${order_id}`);
          } else if (mappedStatus === "Delivered") {
            await sendOrderDeliveredWhatsApp(updatedOrder);
            console.log(`[Shiprocket Webhook]: Sent Delivered WhatsApp notification for ${order_id}`);
          }
        } catch (wErr) {
          console.error("[Shiprocket Webhook WhatsApp Trigger Error]:", wErr);
        }
      }
    }

    return NextResponse.json({ success: true, message: "Webhook processed successfully" });
  } catch (error: any) {
    console.error("[Shiprocket Webhook Error]:", error);
    return NextResponse.json({ success: false, error: error?.message || "Server Error" }, { status: 500 });
  }
}
