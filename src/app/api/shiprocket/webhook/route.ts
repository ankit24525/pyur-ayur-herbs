import { NextResponse } from "next/server";
import { readDB, writeDB } from "@/lib/db";

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

      // Send WhatsApp Order Status Update if WhatsApp API configured
      const whatsappToken = process.env.WHATSAPP_ACCESS_TOKEN;
      const whatsappPhoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;

      if (whatsappToken && whatsappPhoneId && order.phone) {
        try {
          let cleanedPhone = order.phone.replace(/\D/g, "");
          if (cleanedPhone.length === 10) cleanedPhone = "91" + cleanedPhone;

          const metaApiUrl = `https://graph.facebook.com/v19.0/${whatsappPhoneId}/messages`;
          await fetch(metaApiUrl, {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${whatsappToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              messaging_product: "whatsapp",
              to: cleanedPhone,
              type: "template",
              template: {
                name: "hello_world",
                language: { code: "en_US" },
              },
            }),
          });
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
