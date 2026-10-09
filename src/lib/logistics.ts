/**
 * Unified Logistics Router for Pure Ayur Herbs
 * Manages dual integration with NimbusPost (v2 API) and Shiprocket,
 * allowing instant toggling between partners with zero disruption.
 */

import { pushOrderToShiprocket, cancelOrderOnShiprocket, getShiprocketTracking, getShiprocketToken } from "./shiprocket";
import { pushOrderToNimbusPost, cancelOrderOnNimbusPost, getNimbusTracking } from "./nimbuspost";

export type LogisticsPartner = "nimbuspost" | "shiprocket";

export function getActiveLogisticsPartner(db?: any): LogisticsPartner {
  const fromDb = db?.settings?.activeLogisticsPartner;
  if (fromDb === "nimbuspost" || fromDb === "shiprocket") {
    return fromDb;
  }
  const fromEnv = process.env.ACTIVE_LOGISTICS_PARTNER?.toLowerCase().trim();
  if (fromEnv === "shiprocket") return "shiprocket";
  // Default to NimbusPost
  return "nimbuspost";
}

/**
 * Pushes a confirmed order to the currently active logistics partner
 */
export async function pushOrderToLogistics(
  order: any,
  dbInstance?: any
): Promise<{
  success: boolean;
  partner: LogisticsPartner;
  orderId?: string | number;
  shipmentId?: string | number;
  awb?: string;
  courierName?: string;
  trackingUrl?: string;
  labelUrl?: string;
  error?: string;
  skipped?: boolean;
}> {
  const partner = getActiveLogisticsPartner(dbInstance);

  if (partner === "nimbuspost") {
    const res = await pushOrderToNimbusPost(order, dbInstance);
    return {
      success: res.success,
      partner: "nimbuspost",
      orderId: res.nimbusOrderId,
      awb: res.awb,
      courierName: res.courierName,
      trackingUrl: res.trackingUrl,
      labelUrl: res.labelUrl,
      error: res.error,
      skipped: res.skipped,
    };
  } else {
    const res = await pushOrderToShiprocket(order, dbInstance);
    return {
      success: res.success,
      partner: "shiprocket",
      orderId: res.shiprocketOrderId,
      shipmentId: res.shipmentId,
      awb: order.awb,
      error: res.error,
      skipped: res.skipped,
    };
  }
}

/**
 * Cancels an order in whichever logistics provider it was booked with
 */
export async function cancelOrderInLogistics(
  order: any,
  reason = "Customer cancelled",
  dbInstance?: any
): Promise<{ success: boolean; partner?: LogisticsPartner; message?: string; error?: string }> {
  // If order was pushed to NimbusPost
  if (order.nimbusAwb || order.nimbusOrderId || order.logisticsPartner === "nimbuspost") {
    const res = await cancelOrderOnNimbusPost(order, reason, dbInstance);
    return { ...res, partner: "nimbuspost" };
  }

  // Otherwise cancel on Shiprocket
  const res = await cancelOrderOnShiprocket(order, dbInstance);
  return { ...res, partner: "shiprocket" };
}

/**
 * Fetches real-time tracking from either NimbusPost or Shiprocket depending on order booking
 */
export async function getOrderLiveTracking(
  order: any,
  dbInstance?: any
): Promise<{
  success: boolean;
  partner: LogisticsPartner;
  status?: string;
  courierName?: string;
  awb?: string;
  location?: string;
  eventTime?: string;
  trackingUrl?: string;
  error?: string;
}> {
  if (order.nimbusAwb) {
    const res = await getNimbusTracking(order.nimbusAwb);
    if (res.success && res.data) {
      const data = res.data;
      return {
        success: true,
        partner: "nimbuspost",
        status: data.latest?.shipStatus || data.orderStatus || "In Transit",
        courierName: data.shipment?.courierName || order.nimbusCourierName || "Courier Partner",
        awb: order.nimbusAwb,
        location: data.latest?.location,
        eventTime: data.latest?.eventTime,
        trackingUrl: order.nimbusTrackingUrl || `https://track.nimbuspost.com/track/${encodeURIComponent(order.nimbusAwb)}`,
      };
    }
    return {
      success: false,
      partner: "nimbuspost",
      error: res.error || "Unable to fetch NimbusPost tracking.",
    };
  }

  if (order.shiprocketShipmentId) {
    const srConfig = dbInstance?.settings?.shiprocket || {};
    const email = srConfig.email || process.env.SHIPROCKET_EMAIL;
    const password = srConfig.password || process.env.SHIPROCKET_PASSWORD;
    const token = await getShiprocketToken(email, password);
    if (token) {
      const res = await getShiprocketTracking(order.shiprocketShipmentId, token);
      if (res.success && res.data?.tracking_data) {
        const td = res.data.tracking_data;
        return {
          success: true,
          partner: "shiprocket",
          status: td.track_status || td.shipment_status || "In Transit",
          courierName: td.courier_name || "Shiprocket Express",
          awb: order.awb || `SR-${order.shiprocketShipmentId}`,
          trackingUrl: td.track_url || `https://shiprocket.co/tracking/${encodeURIComponent(order.shiprocketShipmentId)}`,
        };
      }
    }
  }

  return {
    success: false,
    partner: getActiveLogisticsPartner(dbInstance),
    status: order.status || "Processing",
    error: "No tracking available yet for this order.",
  };
}
