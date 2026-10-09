import { NextResponse } from "next/server";
import { readDB, writeDB } from "@/lib/db";
import {
  sendOrderShippedWhatsApp,
  sendOrderOutForDeliveryWhatsApp,
  sendOrderDeliveredWhatsApp,
  sendOrderNdrWhatsApp,
} from "@/lib/whatsapp-notifications";

export const dynamic = "force-dynamic";

/**
 * NimbusPost Partner API v2 Automated Webhook Receiver
 * Listens for real-time shipment status transitions, courier scans, NDR alerts, and delivery confirmations.
 * Docs: https://api-v2.nimbuspost.com/docs/reference/v2
 */
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ success: false, error: "Empty or invalid JSON body" }, { status: 400 });
    }

    console.log("[NimbusPost Webhook Event Received]:", JSON.stringify(body, null, 2));

    // Handle single payload or array of events
    const eventData = Array.isArray(body) ? body[0] : (body.data || body);

    const rawOrderId = String(
      eventData.order_number ||
      eventData.order_id ||
      eventData.orderId ||
      body.order_number ||
      body.order_id ||
      ""
    ).trim();

    const rawAwb = String(
      eventData.awb ||
      eventData.awb_number ||
      eventData.tracking_number ||
      body.awb ||
      ""
    ).trim();

    const currentStatus = String(
      eventData.status ||
      eventData.shipment_status ||
      eventData.status_code ||
      body.status ||
      ""
    ).trim().toLowerCase();

    const courierName = String(
      eventData.courier_name ||
      eventData.courier ||
      body.courier_name ||
      "NimbusPost Express"
    ).trim();

    const location = String(eventData.location || body.location || "").trim();
    const eventTime = String(eventData.event_time || eventData.time || new Date().toISOString()).trim();
    const ndrReason = String(eventData.ndr_reason || eventData.reason || eventData.message || "").trim();

    if (!rawOrderId && !rawAwb) {
      return NextResponse.json({ success: false, error: "Neither order_id nor awb found in webhook payload." }, { status: 400 });
    }

    const db = await readDB();
    const orders = db.orders || [];

    // Find order matching ID or AWB
    const orderIndex = orders.findIndex((o: any) => {
      if (!o) return false;
      const idMatch = rawOrderId && (
        String(o.id).trim().toLowerCase() === rawOrderId.toLowerCase() ||
        String(o.nimbusOrderId).trim().toLowerCase() === rawOrderId.toLowerCase() ||
        String(o.id).replace(/\D/g, "") === rawOrderId.replace(/\D/g, "")
      );
      const awbMatch = rawAwb && (
        String(o.nimbusAwb || "").trim().toLowerCase() === rawAwb.toLowerCase() ||
        String(o.awb || "").trim().toLowerCase() === rawAwb.toLowerCase()
      );
      return idMatch || awbMatch;
    });

    if (orderIndex === -1) {
      console.warn(`[NimbusPost Webhook]: Order not found for orderId: "${rawOrderId}", awb: "${rawAwb}"`);
      return NextResponse.json({ success: true, message: "Order not found in store database (acknowledged)." });
    }

    const order = orders[orderIndex];
    const prevStatus = order.status;

    // Map NimbusPost status codes to store status
    let mappedStatus = order.status;
    let isDelivered = false;
    let isOutForDelivery = false;
    let isShipped = false;
    let isNdr = false;
    let isRto = false;

    if (
      currentStatus === "dl" ||
      currentStatus === "delivered" ||
      currentStatus.includes("deliver") && !currentStatus.includes("out for") && !currentStatus.includes("undeliver")
    ) {
      mappedStatus = "Delivered";
      isDelivered = true;
    } else if (
      currentStatus === "ofd" ||
      currentStatus === "out_for_delivery" ||
      currentStatus.includes("out for delivery")
    ) {
      mappedStatus = "Out for Delivery";
      isOutForDelivery = true;
    } else if (
      currentStatus === "it" ||
      currentStatus === "in_transit" ||
      currentStatus === "shipped" ||
      currentStatus === "picked_up" ||
      currentStatus === "manifested" ||
      currentStatus.includes("transit") ||
      currentStatus.includes("picked")
    ) {
      mappedStatus = "Shipped";
      isShipped = true;
    } else if (
      currentStatus === "ndr" ||
      currentStatus === "undelivered" ||
      currentStatus.includes("ndr") ||
      currentStatus.includes("attempt_failed")
    ) {
      isNdr = true;
    } else if (
      currentStatus === "rto" ||
      currentStatus.includes("rto") ||
      currentStatus.includes("return")
    ) {
      mappedStatus = "Returned";
      isRto = true;
    }

    // Append to scans history
    const scans = Array.isArray(order.nimbusScans) ? [...order.nimbusScans] : [];
    scans.push({
      status: currentStatus,
      location,
      time: eventTime,
      message: eventData.message || currentStatus,
    });

    // Update order object
    order.status = mappedStatus;
    order.nimbusStatus = currentStatus;
    if (rawAwb) order.nimbusAwb = rawAwb;
    if (courierName) order.nimbusCourierName = courierName;
    order.nimbusScans = scans;
    order.updatedAt = new Date().toISOString();

    if (isNdr) {
      order.ndrRaised = true;
      order.ndrReason = ndrReason || "Customer unavailable / re-attempt scheduled";
      order.ndrCount = (order.ndrCount || 0) + 1;
      order.lastNdrAt = new Date().toISOString();
    }

    db.orders[orderIndex] = order;
    await writeDB(db);

    console.log(`[NimbusPost Webhook Success]: Order ${order.id} updated -> Status: ${mappedStatus} (Raw: ${currentStatus})`);

    // Trigger WhatsApp lifecycle notifications
    if (order.phone) {
      try {
        if (isDelivered && prevStatus !== "Delivered") {
          await sendOrderDeliveredWhatsApp(order);
          console.log(`[NimbusPost Webhook]: Sent Delivered WhatsApp for ${order.id}`);
        } else if (isOutForDelivery && prevStatus !== "Out for Delivery") {
          await sendOrderOutForDeliveryWhatsApp(order);
          console.log(`[NimbusPost Webhook]: Sent Out for Delivery WhatsApp for ${order.id}`);
        } else if (isShipped && prevStatus !== "Shipped") {
          await sendOrderShippedWhatsApp({
            order,
            courierName: courierName || order.nimbusCourierName,
            awb: rawAwb || order.nimbusAwb,
          });
          console.log(`[NimbusPost Webhook]: Sent Shipped WhatsApp for ${order.id}`);
        } else if (isNdr) {
          await sendOrderNdrWhatsApp({
            order,
            reason: ndrReason || order.ndrReason,
            courierName: courierName || order.nimbusCourierName,
          });
          console.log(`[NimbusPost Webhook]: Sent NDR Alert WhatsApp for ${order.id}`);
        }
      } catch (waErr) {
        console.warn(`[NimbusPost Webhook WhatsApp Alert Warning for ${order.id}]:`, waErr);
      }
    }

    return NextResponse.json({
      success: true,
      orderId: order.id,
      status: mappedStatus,
      message: `Order status synchronized successfully with NimbusPost scan: ${currentStatus}`,
    });
  } catch (error: any) {
    console.error("[NimbusPost Webhook Exception]:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
