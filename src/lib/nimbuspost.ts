/**
 * NimbusPost Partner API v2 Client for Pure Ayur Herbs
 * Built against NimbusPost Partner API v2 (JSON-over-HTTPS REST)
 * Docs: https://api-v2.nimbuspost.com/docs/reference/v2
 */

export const NIMBUS_BASE_URL = "https://api-v2.nimbuspost.com";

export const DEFAULT_NIMBUSPOST_API_KEY = process.env.NIMBUSPOST_API_KEY || "npk_aa1f06c9aebdfbe5";
export const DEFAULT_NIMBUSPOST_API_SECRET = process.env.NIMBUSPOST_API_SECRET || "X7XeU-4-4Y3B_GznPoKOtCCcEWqi_aC8";
export const DEFAULT_NIMBUSPOST_WAREHOUSE_ID = process.env.NIMBUSPOST_WAREHOUSE_ID || "3f262abb-df43-4ec8-aec2-0ce27ecf57ca";

export interface NimbusConfig {
  apiKey?: string;
  apiSecret?: string;
  warehouseId?: string;
  enabled?: boolean;
}

export interface NimbusOrderItem {
  name: string;
  qty: number;
  price: number;
  sku: string;
}

export interface CreateNimbusShipmentPayload {
  order_number: string;
  order_type: "b2c" | "reverse";
  payment_mode: "cod" | "prepaid";
  order_collectable_amount: number;
  warehouse_id: string;
  shipping_address: {
    name: string;
    email: string;
    address: string;
    address_opt?: string;
    pincode: number;
    city: string;
    state: string;
    country: string;
    phone: number;
  };
  items: NimbusOrderItem[];
  package: {
    weight: number; // in kg (e.g. 0.5)
    length: number; // in cm
    width: number;
    height: number;
  };
  courier_id?: string;
}

/**
 * Returns standard authentication headers required by NimbusPost Partner API v2
 */
export function getNimbusHeaders(apiKey?: string, apiSecret?: string) {
  const key = apiKey || DEFAULT_NIMBUSPOST_API_KEY;
  const secret = apiSecret || DEFAULT_NIMBUSPOST_API_SECRET;

  return {
    "x-api-key": key,
    "x-api-secret": secret,
    "Content-Type": "application/json",
    Accept: "application/json",
  };
}

/**
 * Fetches configured warehouses from NimbusPost account to verify or auto-resolve warehouse IDs
 */
export async function getNimbusWarehouses(config?: NimbusConfig): Promise<any[]> {
  try {
    const headers = getNimbusHeaders(config?.apiKey, config?.apiSecret);
    if (!headers["x-api-key"] || !headers["x-api-secret"]) {
      return [];
    }

    const res = await fetch(`${NIMBUS_BASE_URL}/v2/warehouses`, {
      method: "GET",
      headers,
    });
    const data = await res.json();
    if (res.ok && data?.success && Array.isArray(data?.data)) {
      return data.data;
    }
  } catch (err) {
    console.error("[NimbusPost Get Warehouses Exception]:", err);
  }
  return [];
}

/**
 * Creates and auto-books a shipment on NimbusPost in a single call (v2 /v2/shipments)
 */
export async function createNimbusShipment(
  payload: CreateNimbusShipmentPayload,
  config?: NimbusConfig
): Promise<{ success: boolean; data?: any; error?: string; status?: number }> {
  try {
    const headers = getNimbusHeaders(config?.apiKey, config?.apiSecret);
    if (!headers["x-api-key"] || !headers["x-api-secret"]) {
      return {
        success: false,
        error: "NimbusPost API Key or API Secret missing. Please configure NIMBUSPOST_API_KEY and NIMBUSPOST_API_SECRET.",
      };
    }

    const res = await fetch(`${NIMBUS_BASE_URL}/v2/shipments`, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (res.ok && data?.success) {
      return { success: true, data: data.data };
    }

    const errDetail =
      data?.error?.detail ||
      data?.error?.title ||
      data?.error?.message ||
      data?.message ||
      `NimbusPost API returned status ${res.status}`;

    return {
      success: false,
      error: errDetail,
      data,
      status: res.status,
    };
  } catch (error: any) {
    console.error("[NimbusPost Create Shipment Network Exception]:", error);
    return { success: false, error: error?.message || "Network error contacting NimbusPost API" };
  }
}

/**
 * Cancels a booked shipment on NimbusPost by AWB
 */
export async function cancelNimbusShipmentByAwb(
  awb: string,
  reason = "Customer cancelled",
  config?: NimbusConfig
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const headers = getNimbusHeaders(config?.apiKey, config?.apiSecret);
    if (!headers["x-api-key"] || !headers["x-api-secret"]) {
      return { success: false, error: "NimbusPost API credentials missing." };
    }

    const res = await fetch(`${NIMBUS_BASE_URL}/v2/shipments/cancel`, {
      method: "POST",
      headers,
      body: JSON.stringify({ awb, reason }),
    });

    const data = await res.json();
    if (res.ok && data?.success) {
      return { success: true, data: data.data };
    }

    return {
      success: false,
      error: data?.error?.detail || data?.error?.title || "Failed to cancel shipment on NimbusPost.",
    };
  } catch (error: any) {
    console.error("[NimbusPost Cancel Shipment Exception]:", error);
    return { success: false, error: error?.message || "Network error cancelling shipment" };
  }
}

/**
 * Cancels an order on NimbusPost by Order ID
 */
export async function cancelNimbusOrderByOrderId(
  orderId: string,
  reason = "Customer cancelled",
  config?: NimbusConfig
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const headers = getNimbusHeaders(config?.apiKey, config?.apiSecret);
    if (!headers["x-api-key"] || !headers["x-api-secret"]) {
      return { success: false, error: "NimbusPost API credentials missing." };
    }

    const res = await fetch(`${NIMBUS_BASE_URL}/v2/orders/${encodeURIComponent(orderId)}/cancel`, {
      method: "POST",
      headers,
      body: JSON.stringify({ reason }),
    });

    const data = await res.json();
    if (res.ok && data?.success) {
      return { success: true, data: data.data };
    }

    return {
      success: false,
      error: data?.error?.detail || data?.error?.title || "Failed to cancel order on NimbusPost.",
    };
  } catch (error: any) {
    console.error("[NimbusPost Cancel Order Exception]:", error);
    return { success: false, error: error?.message || "Network error cancelling order" };
  }
}

/**
 * Retrieves real-time shipment tracking from NimbusPost by AWB
 */
export async function getNimbusTracking(
  awb: string,
  config?: NimbusConfig
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const headers = getNimbusHeaders(config?.apiKey, config?.apiSecret);
    if (!headers["x-api-key"] || !headers["x-api-secret"]) {
      return { success: false, error: "NimbusPost API credentials missing." };
    }

    const res = await fetch(`${NIMBUS_BASE_URL}/v2/tracking/${encodeURIComponent(awb)}`, {
      method: "GET",
      headers,
    });

    const data = await res.json();
    if (res.ok && data?.success) {
      return { success: true, data: data.data };
    }

    return {
      success: false,
      error: data?.error?.detail || data?.error?.title || "Tracking info not found on NimbusPost.",
    };
  } catch (error: any) {
    console.error("[NimbusPost Tracking Exception]:", error);
    return { success: false, error: error?.message || "Network error fetching tracking" };
  }
}

/**
 * Generates and fetches shipping labels (PDF download URL) from NimbusPost
 */
export async function getNimbusShippingLabel(
  identifier: string, // orderId or AWB
  config?: NimbusConfig
): Promise<{ success: boolean; labelUrl?: string; error?: string }> {
  try {
    const headers = getNimbusHeaders(config?.apiKey, config?.apiSecret);
    if (!headers["x-api-key"] || !headers["x-api-secret"]) {
      return { success: false, error: "NimbusPost API credentials missing." };
    }

    const res = await fetch(`${NIMBUS_BASE_URL}/v2/shipments/labels`, {
      method: "POST",
      headers,
      body: JSON.stringify({ ids: [identifier] }),
    });

    const data = await res.json();
    if (res.ok && data?.success && data?.data?.label_url) {
      return { success: true, labelUrl: data.data.label_url };
    }

    return {
      success: false,
      error: data?.error?.detail || "Label not yet available from courier partner.",
    };
  } catch (error: any) {
    return { success: false, error: error?.message || "Failed to fetch label" };
  }
}

/**
 * High-level auto-push function: Formats store order, resolves warehouse,
 * and pushes to NimbusPost v2 Partner API.
 */
export async function pushOrderToNimbusPost(
  order: any,
  dbInstance?: any
): Promise<{
  success: boolean;
  skipped?: boolean;
  nimbusOrderId?: string;
  awb?: string;
  courierName?: string;
  trackingUrl?: string;
  labelUrl?: string;
  error?: string;
}> {
  try {
    if (!order || !order.id) {
      return { success: false, error: "Valid order object is required." };
    }

    const { readDB, writeDB } = await import("@/lib/db");
    const db = dbInstance || (await readDB());

    const nimbusConfig: NimbusConfig = db.settings?.nimbuspost || {};
    const apiKey = nimbusConfig.apiKey || DEFAULT_NIMBUSPOST_API_KEY;
    const apiSecret = nimbusConfig.apiSecret || DEFAULT_NIMBUSPOST_API_SECRET;
    const warehouseId = nimbusConfig.warehouseId || DEFAULT_NIMBUSPOST_WAREHOUSE_ID;
    const isEnabled = nimbusConfig.enabled !== false;

    if (!apiKey || !apiSecret) {
      console.log(`[NimbusPost Auto-Push]: Skipped for ${order.id} (API credentials missing)`);
      return {
        success: false,
        skipped: true,
        error: "NimbusPost API credentials missing. Set NIMBUSPOST_API_KEY and NIMBUSPOST_API_SECRET.",
      };
    }

    if (!isEnabled) {
      console.log(`[NimbusPost Auto-Push]: Skipped for ${order.id} (NimbusPost is disabled in settings)`);
      return {
        success: false,
        skipped: true,
        error: "NimbusPost auto-push is disabled in settings.",
      };
    }

    // Clean Phone (Strict 10 digits as number)
    const rawPhone = (order.phone || order.altPhone || "9876543210").replace(/\D/g, "").slice(-10);
    const phoneNum = parseInt(rawPhone.length === 10 ? rawPhone : "9876543210", 10);

    // Clean Pincode (Strict 6 digits as number)
    const rawPincode = (order.pincode || "262405").replace(/\D/g, "").slice(0, 6);
    const pincodeNum = parseInt(rawPincode.length === 6 ? rawPincode : "262405", 10);

    // Clean Address
    let cleanAddress = (order.address || "").trim();
    if (cleanAddress.length < 8) {
      cleanAddress = `${cleanAddress || "Main Market"}, ${order.city || "Sitarganj"}, ${order.state || "Uttarakhand"}`;
    }

    const cleanCity = (order.city || "Sitarganj").trim();
    const cleanState = (order.state || "Uttarakhand").trim();
    const cleanEmail = (order.email || `${rawPhone}@pureayurherbs.com`).trim();
    const cleanCustomerName = (order.customer || order.name || "Customer").trim();

    // Build order items
    const orderTotalNum = Math.max(Math.round(Number(order.total) || 1), 1);
    let items: NimbusOrderItem[] = [];
    if (Array.isArray(order.itemsRaw) && order.itemsRaw.length > 0) {
      items = order.itemsRaw.map((i: any) => {
        const prod = (db.products || []).find((p: any) => p.id === i.productId);
        return {
          name: prod ? prod.name : i.name || "Ayurvedic Formulation",
          qty: Number(i.quantity) || 1,
          price: Math.max(Math.round(Number(prod?.price || i.price || orderTotalNum) || 1), 1),
          sku: prod?.sku || i.sku || `SKU-${i.productId || order.id}`,
        };
      });
    } else {
      const rawName = (typeof order.items === "string" ? order.items : "Ayurvedic Formulation").replace(/ x\d+/gi, "").trim();
      items = [
        {
          name: rawName || "Ayurvedic Formulation",
          qty: 1,
          price: orderTotalNum,
          sku: `SKU-${order.id}`,
        },
      ];
    }

    // NimbusPost computes order total strictly as sum(item.price * item.qty).
    // If order.total includes shipping/COD charges (e.g. ₹449 + ₹49 shipping = ₹498),
    // ensure the item total is at least orderTotalNum so collectable_amount <= order_total.
    const itemsSum = items.reduce((acc, item) => acc + item.price * item.qty, 0);
    if (itemsSum < orderTotalNum) {
      const diff = orderTotalNum - itemsSum;
      const singleQtyItem = items.find((it) => it.qty === 1);
      if (singleQtyItem) {
        singleQtyItem.price += diff;
      } else {
        items.push({
          name: "Shipping & Handling Charges",
          qty: 1,
          price: diff,
          sku: "PAH-SHIPPING",
        });
      }
    }

    // Determine Payment Mode
    const methodStr = String(order.method || order.paymentMethod || "").trim().toLowerCase();
    const isCod = methodStr.includes("cod") || methodStr.includes("cash");
    const paymentMode: "cod" | "prepaid" = isCod ? "cod" : "prepaid";
    const collectableAmount = isCod ? orderTotalNum : 0;

    // Resolve or match warehouse
    let resolvedWarehouseId = warehouseId;
    try {
      const liveWarehouses = await getNimbusWarehouses({ apiKey, apiSecret });
      if (liveWarehouses.length > 0) {
        // Try to match warehouse by name or id
        const matched = liveWarehouses.find(
          (w) =>
            w.warehouse_id === warehouseId ||
            w.name?.toLowerCase().trim() === warehouseId?.toLowerCase().trim() ||
            w.name?.toLowerCase().includes("ayur") ||
            w.name?.toLowerCase().includes("sitarganj")
        );
        if (matched?.warehouse_id) {
          resolvedWarehouseId = matched.warehouse_id;
        } else if (liveWarehouses[0]?.warehouse_id) {
          resolvedWarehouseId = liveWarehouses[0].warehouse_id;
        }
      }
    } catch {}

    const payload: CreateNimbusShipmentPayload = {
      order_number: order.id,
      order_type: "b2c",
      payment_mode: paymentMode,
      order_collectable_amount: collectableAmount,
      warehouse_id: resolvedWarehouseId,
      shipping_address: {
        name: cleanCustomerName,
        email: cleanEmail,
        address: cleanAddress,
        address_opt: order.landmark || "",
        pincode: pincodeNum,
        city: cleanCity,
        state: cleanState,
        country: "India",
        phone: phoneNum,
      },
      items,
      package: {
        weight: 0.5, // 500g default for herbal formulations
        length: 12,
        width: 10,
        height: 8,
      },
    };

    console.log(`[NimbusPost Auto-Push]: Pushing order ${order.id} to NimbusPost Partner API v2...`);
    const result = await createNimbusShipment(payload, { apiKey, apiSecret });

    const orderIdx = (db.orders || []).findIndex((o: any) => o.id === order.id);

    if (result.success && result.data) {
      const booking = result.data.booking || {};
      const orderData = result.data.order || {};

      order.nimbusOrderId = booking.order_id || orderData.order_id;
      order.nimbusAwb = booking.awb;
      order.awb = booking.awb || order.awb;
      order.nimbusCourierName = booking.courier_name || booking.courier_code || "Courier Partner";
      order.nimbusLabelUrl = booking.label_url || "";
      order.nimbusTrackingUrl = booking.tracking_url || booking.tracking_short_url || "";
      order.nimbusStatus = "Booked";
      order.logisticsPartner = "nimbuspost";
      delete order.nimbusError;

      if (orderIdx !== -1) {
        db.orders[orderIdx] = { ...db.orders[orderIdx], ...order };
      }
      await writeDB(db);

      console.log(
        `[NimbusPost Auto-Push Success]: Order ${order.id} booked! AWB: ${booking.awb}, Courier: ${booking.courier_name}`
      );

      return {
        success: true,
        nimbusOrderId: order.nimbusOrderId,
        awb: booking.awb,
        courierName: booking.courier_name,
        trackingUrl: order.nimbusTrackingUrl,
        labelUrl: booking.label_url,
      };
    } else {
      const errMsg = result.error || "NimbusPost API rejected shipment creation.";
      order.nimbusStatus = "Failed";
      order.nimbusError = errMsg;

      if (orderIdx !== -1) {
        db.orders[orderIdx] = { ...db.orders[orderIdx], ...order };
      }
      await writeDB(db);

      console.warn(`[NimbusPost Auto-Push Failed for ${order.id}]:`, errMsg);
      return { success: false, error: errMsg };
    }
  } catch (error: any) {
    console.error("[NimbusPost Auto-Push Exception]:", error);
    return { success: false, error: error?.message || "Internal error during NimbusPost push" };
  }
}

/**
 * Cancels an order on NimbusPost when customer or admin requests cancellation
 */
export async function cancelOrderOnNimbusPost(
  order: any,
  reason = "Customer cancelled",
  dbInstance?: any
): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const { readDB, writeDB } = await import("@/lib/db");
    const db = dbInstance || (await readDB());

    const nimbusConfig = db.settings?.nimbuspost || {};
    const apiKey = nimbusConfig.apiKey || DEFAULT_NIMBUSPOST_API_KEY;
    const apiSecret = nimbusConfig.apiSecret || DEFAULT_NIMBUSPOST_API_SECRET;

    if (!apiKey || !apiSecret) {
      order.nimbusStatus = "Cancelled";
      return { success: true, message: "Order marked cancelled in store (NimbusPost API keys not configured)." };
    }

    let cancelRes: any = null;
    if (order.nimbusAwb) {
      cancelRes = await cancelNimbusShipmentByAwb(order.nimbusAwb, reason, { apiKey, apiSecret });
    } else if (order.nimbusOrderId) {
      cancelRes = await cancelNimbusOrderByOrderId(order.nimbusOrderId, reason, { apiKey, apiSecret });
    } else {
      order.nimbusStatus = "Cancelled";
      return { success: true, message: "Order had no NimbusPost AWB/booking, marked cancelled locally." };
    }

    if (cancelRes && cancelRes.success) {
      order.nimbusStatus = "Cancelled";
      delete order.nimbusError;
      return { success: true, message: "Order cancelled successfully on NimbusPost." };
    } else {
      order.nimbusStatus = "Cancel Failed";
      order.nimbusError = cancelRes?.error || "NimbusPost rejected cancellation request.";
      return { success: false, error: order.nimbusError };
    }
  } catch (err: any) {
    console.error("[cancelOrderOnNimbusPost Exception]:", err);
    return { success: false, error: err?.message || "Error cancelling on NimbusPost" };
  }
}
