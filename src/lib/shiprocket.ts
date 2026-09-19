/**
 * Shiprocket API Client for Pure Ayur Herbs
 * Handles authentication, automated order creation, and live shipment tracking.
 */

let cachedToken: string | null = null;
let tokenExpiresAt: number = 0;

export async function getShiprocketToken(email?: string, password?: string): Promise<string | null> {
  const srEmail = email || process.env.SHIPROCKET_EMAIL;
  const srPassword = password || process.env.SHIPROCKET_PASSWORD;

  if (!srEmail || !srPassword) {
    console.warn("[Shiprocket API] Missing email or password credentials.");
    return null;
  }

  // Return cached token if valid
  if (cachedToken && Date.now() < tokenExpiresAt) {
    return cachedToken;
  }

  try {
    const res = await fetch("https://apiv2.shiprocket.in/v1/external/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: srEmail, password: srPassword }),
    });

    const data = await res.json();
    if (res.ok && data?.token) {
      cachedToken = data.token;
      // Tokens are valid for 10 days; cache for 9 days in milliseconds
      tokenExpiresAt = Date.now() + 9 * 24 * 60 * 60 * 1000;
      return cachedToken;
    } else {
      console.error("[Shiprocket Auth Error]:", data);
      return null;
    }
  } catch (error) {
    console.error("[Shiprocket Auth Network Error]:", error);
    return null;
  }
}

export async function getShiprocketPickupLocations(token: string): Promise<string[]> {
  try {
    const res = await fetch("https://apiv2.shiprocket.in/v1/external/settings/company/pickup", {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    const addresses = data?.data?.shipping_address || data?.shipping_address || (Array.isArray(data?.data) ? data.data : []);
    if (Array.isArray(addresses)) {
      const locations = addresses
        .map((addr: any) => addr.pickup_location || addr.address_nickname || addr.name || addr.pickup_location_name)
        .filter(Boolean);
      if (locations.length > 0) return locations;
    }
  } catch (err) {
    console.error("[Shiprocket Fetch Pickup Locations Error]:", err);
  }
  return ["PURE AYUR HERBS", "Primary"];
}

export interface ShiprocketOrderItem {
  name: string;
  sku: string;
  units: number;
  selling_price: number | string;
  discount?: number | string;
  tax?: number | string;
  hsn?: number | string;
}

export interface CreateShiprocketOrderPayload {
  order_id: string;
  order_date: string; // YYYY-MM-DD HH:mm
  pickup_location: string;
  billing_customer_name: string;
  billing_last_name?: string;
  billing_address: string;
  billing_city: string;
  billing_pincode: string;
  billing_state: string;
  billing_country?: string;
  billing_email?: string;
  billing_phone: string;
  shipping_is_billing?: boolean;
  order_items: ShiprocketOrderItem[];
  payment_method: "COD" | "Prepaid";
  shipping_charges?: number;
  total_discount?: number;
  sub_total: number;
  length?: number;
  breadth?: number;
  height?: number;
  weight?: number; // in KG (e.g. 0.5)
}

export async function createShiprocketOrder(
  payload: CreateShiprocketOrderPayload,
  token: string
) {
  try {
    const makeRequest = async (locationName: string) => {
      const res = await fetch("https://apiv2.shiprocket.in/v1/external/orders/create/adhoc", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...payload,
          billing_customer_name: payload.billing_customer_name || "Customer",
          billing_last_name: payload.billing_last_name || "Customer",
          pickup_location: locationName,
          billing_country: payload.billing_country || "India",
          shipping_is_billing: true,
          length: payload.length || 10,
          breadth: payload.breadth || 10,
          height: payload.height || 10,
          weight: payload.weight || 0.5,
        }),
      });
      const data = await res.json();
      return { ok: res.ok && Boolean(data?.order_id), data, status: res.status };
    };

    // First attempt with given pickup_location (or "PURE AYUR HERBS" if default/Primary)
    const initialLocation = (!payload.pickup_location || payload.pickup_location === "Primary")
      ? "PURE AYUR HERBS"
      : payload.pickup_location;

    let result = await makeRequest(initialLocation);

    // If failed, automatically fetch live pickup locations and retry
    if (!result.ok) {
      const candidateLocations = ["PURE AYUR HERBS", "Primary", ...(await getShiprocketPickupLocations(token))];
      const uniqueLocations = Array.from(new Set(candidateLocations));

      for (const loc of uniqueLocations) {
        if (loc !== initialLocation) {
          console.log(`[Shiprocket Retrying order creation with location]: ${loc}`);
          result = await makeRequest(loc);
          if (result.ok) break;
        }
      }
    }

    // Format detailed error message if rejection occurred
    let formattedErrorMessage = result.data?.message || "";
    if (result.data?.errors && typeof result.data.errors === "object") {
      const fieldErrors = Object.entries(result.data.errors)
        .map(([key, val]) => (Array.isArray(val) ? `${key}: ${val.join(", ")}` : `${key}: ${val}`))
        .join(" | ");
      if (fieldErrors) {
        formattedErrorMessage = `${result.data?.message ? result.data.message + " - " : ""}${fieldErrors}`;
      }
    }

    if (!result.ok && (formattedErrorMessage.toLowerCase().includes("pickup") || formattedErrorMessage.toLowerCase().includes("invalid data"))) {
      const availableLocations = await getShiprocketPickupLocations(token);
      if (availableLocations.length === 0) {
        formattedErrorMessage = "No Pickup Address found in your Shiprocket Account. Please add a Pickup Address in your Shiprocket Dashboard under Settings -> Pickup Addresses.";
      }
    }

    return {
      success: Boolean(result.ok),
      data: result.data,
      statusCode: result.status,
      errorMessage: formattedErrorMessage || "Shiprocket API rejected order creation.",
    };
  } catch (error: any) {
    console.error("[Shiprocket Order Creation Error]:", error);
    return { success: false, error: error?.message || "Network Error" };
  }
}

export async function getShiprocketTracking(shipmentId: string | number, token: string) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    const res = await fetch(`https://apiv2.shiprocket.in/v1/external/courier/track/shipment/${shipmentId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    const data = await res.json();
    return { success: res.ok, data };
  } catch (error: any) {
    console.error("[Shiprocket Tracking Error]:", error);
    return { success: false, error: error?.message || "Network Error" };
  }
}

/**
 * Cancels an order in Shiprocket courier system.
 */
export async function cancelShiprocketOrder(shiprocketOrderId: number | string, token: string) {
  try {
    const orderIdNum = Number(shiprocketOrderId);
    const res = await fetch("https://apiv2.shiprocket.in/v1/external/orders/cancel", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        ids: isNaN(orderIdNum) ? [shiprocketOrderId] : [orderIdNum],
      }),
    });

    let data: any = null;
    const text = await res.text();
    if (text) {
      try {
        data = JSON.parse(text);
      } catch {
        data = { message: text };
      }
    }

    const isSuccess = res.ok || res.status === 204;
    return {
      success: isSuccess,
      statusCode: res.status,
      data,
      error: !isSuccess ? (data?.message || data?.error || `Shiprocket cancellation returned status ${res.status}`) : undefined,
    };
  } catch (error: any) {
    console.error("[Shiprocket Cancel Order Error]:", error);
    return { success: false, error: error?.message || "Network Error" };
  }
}

/**
 * Search for an existing Shiprocket order by channel order ID (e.g. PYR-ORD-XXXXXX).
 */
export async function findShiprocketOrderIdByChannelId(channelOrderId: string, token: string): Promise<number | string | null> {
  try {
    const res = await fetch(`https://apiv2.shiprocket.in/v1/external/orders?search=${encodeURIComponent(channelOrderId)}`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return null;
    const data = await res.json();
    const list = data?.data || [];
    if (Array.isArray(list) && list.length > 0) {
      const match = list.find((item: any) =>
        String(item.channel_order_id || "").toLowerCase() === String(channelOrderId).toLowerCase() ||
        String(item.id || "") === String(channelOrderId)
      ) || list[0];
      return match?.id || null;
    }
  } catch (err) {
    console.warn("[Shiprocket Find Order By Channel ID Warning]:", err);
  }
  return null;
}

/**
 * Automatically pushes an order to Shiprocket, updating DB with IDs & status.
 */
export async function pushOrderToShiprocket(order: any, dbInstance?: any): Promise<{
  success: boolean;
  shiprocketOrderId?: number | string;
  shipmentId?: number | string;
  error?: string;
  skipped?: boolean;
}> {
  try {
    if (!order || !order.id) {
      return { success: false, error: "Valid order object is required." };
    }

    const { readDB, writeDB } = await import("@/lib/db");
    const db = dbInstance || (await readDB());

    const srConfig = db.settings?.shiprocket || {};
    const srEmail = srConfig.email || process.env.SHIPROCKET_EMAIL;
    const srPassword = srConfig.password || process.env.SHIPROCKET_PASSWORD;
    const srEnabled = srConfig.enabled !== false;

    if (!srEmail || !srPassword) {
      console.log(`[Shiprocket Auto-Push]: Skipped for ${order.id} (Credentials not configured in Settings -> Shipping & Rates)`);
      return { success: false, skipped: true, error: "Shiprocket credentials missing. Please configure them in Settings -> Shipping & Rates." };
    }

    if (!srEnabled) {
      console.log(`[Shiprocket Auto-Push]: Skipped for ${order.id} (Auto-push toggle is turned off in Settings)`);
      return { success: false, skipped: true, error: "Shiprocket auto-push is disabled in settings." };
    }

    const token = await getShiprocketToken(srEmail, srPassword);
    if (!token) {
      const errMsg = "Failed to authenticate with Shiprocket API. Please verify email and password.";
      order.shiprocketStatus = "Failed";
      order.shiprocketError = errMsg;
      const orderIdx = (db.orders || []).findIndex((o: any) => o.id === order.id);
      if (orderIdx !== -1) db.orders[orderIdx] = { ...order };
      await writeDB(db);
      return { success: false, error: errMsg };
    }

    const dateObj = new Date();
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, "0");
    const day = String(dateObj.getDate()).padStart(2, "0");
    const hours = String(dateObj.getHours()).padStart(2, "0");
    const mins = String(dateObj.getMinutes()).padStart(2, "0");
    const nowStr = `${year}-${month}-${day} ${hours}:${mins}`;

    const cleanPhone = (order.phone || "").replace(/\D/g, "").slice(-10);
    const finalPhone = cleanPhone.length === 10 ? cleanPhone : (order.altPhone || "9876543210").replace(/\D/g, "").slice(-10) || "9876543210";

    const cleanPincode = (order.pincode || "").replace(/\D/g, "").slice(0, 6);
    const finalPincode = cleanPincode.length === 6 ? cleanPincode : "201301";

    let cleanAddress = (order.address || "").trim();
    if (cleanAddress.length < 10) {
      cleanAddress = `${cleanAddress || "Main Market"}, ${order.city || "Noida"}, ${order.state || "Uttar Pradesh"}`;
    }

    const cleanCity = (order.city || "Noida").trim();
    const cleanState = (order.state || "Uttar Pradesh").trim();
    const cleanEmail = (order.email || `${finalPhone}@pureayurherbs.com`).trim();
    const cleanCustomerName = (order.customer || order.name || "Customer").trim();
    const nameParts = cleanCustomerName.split(" ");
    const firstName = nameParts[0] || "Customer";
    const lastName = nameParts.slice(1).join(" ") || "Customer";

    // Build order items
    let orderItems: ShiprocketOrderItem[] = [];
    if (Array.isArray(order.itemsRaw) && order.itemsRaw.length > 0) {
      orderItems = order.itemsRaw.map((i: any) => {
        const prod = (db.products || []).find((p: any) => p.id === i.productId);
        return {
          name: prod ? prod.name : (i.name || "Ayurvedic Remedy"),
          sku: prod?.sku || i.sku || `SKU-${i.productId || order.id}`,
          units: Number(i.quantity) || 1,
          selling_price: Math.max(Number(prod?.price || i.price || order.total) || 1, 1),
          discount: 0,
          tax: 0,
        };
      });
    } else {
      const rawItemName = (typeof order.items === "string" ? order.items : "Ayurvedic Remedy").replace(/ x\d+/gi, "").trim();
      const cleanItemName = rawItemName.length > 0 ? rawItemName : "Ayurvedic Remedy";
      orderItems = [
        {
          name: cleanItemName,
          sku: `SKU-${order.id}`,
          units: 1,
          selling_price: Math.max(Number(order.total) || 1, 1),
          discount: 0,
          tax: 0,
        },
      ];
    }

    const methodStr = String(order.method || order.paymentMethod || "").trim().toLowerCase();
    const isCod = methodStr.includes("cod") || methodStr.includes("cash");
    const isPrepaid = !isCod && (
      methodStr.includes("prepaid") ||
      methodStr.includes("phonepe") ||
      methodStr.includes("online") ||
      methodStr.includes("upi") ||
      methodStr.includes("card") ||
      order.status === "Processing"
    );

    const srRes = await createShiprocketOrder(
      {
        order_id: order.id,
        order_date: nowStr,
        pickup_location: srConfig.pickupLocation || "PURE AYUR HERBS",
        billing_customer_name: firstName,
        billing_last_name: lastName,
        billing_address: cleanAddress,
        billing_city: cleanCity,
        billing_pincode: finalPincode,
        billing_state: cleanState,
        billing_email: cleanEmail,
        billing_phone: finalPhone,
        payment_method: isPrepaid ? "Prepaid" : "COD",
        sub_total: Math.max(Number(order.total) || 1, 1),
        order_items: orderItems,
      },
      token
    );

    const orderIdx = (db.orders || []).findIndex((o: any) => o.id === order.id);

    if (srRes.success && srRes.data) {
      order.shiprocketOrderId = srRes.data.order_id;
      order.shiprocketShipmentId = srRes.data.shipment_id;
      order.shiprocketStatus = "Pushed";
      order.awb = order.awb || `SR-${srRes.data.shipment_id}`;
      delete order.shiprocketError;

      if (orderIdx !== -1) {
        db.orders[orderIdx] = { ...db.orders[orderIdx], ...order };
      }
      await writeDB(db);

      console.log(`[Shiprocket Auto-Push Success]: Order ${order.id} pushed (SR ID: ${srRes.data.order_id}, Shipment: ${srRes.data.shipment_id})`);
      return {
        success: true,
        shiprocketOrderId: srRes.data.order_id,
        shipmentId: srRes.data.shipment_id,
      };
    } else {
      const errMsg = srRes.errorMessage || srRes.data?.message || srRes.error || "Shiprocket API rejected order creation.";
      order.shiprocketStatus = "Failed";
      order.shiprocketError = errMsg;

      if (orderIdx !== -1) {
        db.orders[orderIdx] = { ...db.orders[orderIdx], ...order };
      }
      await writeDB(db);

      console.warn(`[Shiprocket Auto-Push Failed for ${order.id}]:`, errMsg);
      return { success: false, error: errMsg };
    }
  } catch (error: any) {
    console.error("[Shiprocket Auto-Push Exception]:", error);
    return { success: false, error: error?.message || "Internal error during Shiprocket push" };
  }
}

/**
 * Automatically cancels an order on Shiprocket when cancelled by customer or admin.
 */
export async function cancelOrderOnShiprocket(order: any, dbInstance?: any): Promise<{
  success: boolean;
  message?: string;
  error?: string;
  alreadyDispatched?: boolean;
}> {
  try {
    if (!order || !order.id) {
      return { success: false, error: "Valid order object is required." };
    }

    const { readDB, writeDB } = await import("@/lib/db");
    const db = dbInstance || (await readDB());

    const srConfig = db.settings?.shiprocket || {};
    const srEmail = srConfig.email || process.env.SHIPROCKET_EMAIL;
    const srPassword = srConfig.password || process.env.SHIPROCKET_PASSWORD;

    if (!srEmail || !srPassword) {
      console.log(`[Shiprocket Auto-Cancel]: No credentials found, marking order ${order.id} cancelled in store.`);
      order.shiprocketStatus = "Cancelled";
      return { success: true, message: "Order cancelled in store (Shiprocket credentials not configured)" };
    }

    const token = await getShiprocketToken(srEmail, srPassword);
    if (!token) {
      order.shiprocketStatus = "Cancel Failed";
      order.shiprocketError = "Failed to authenticate with Shiprocket API";
      return { success: false, error: "Shiprocket authentication failed" };
    }

    let srOrderId = order.shiprocketOrderId;
    if (!srOrderId) {
      srOrderId = await findShiprocketOrderIdByChannelId(order.id, token);
      if (srOrderId) {
        order.shiprocketOrderId = srOrderId;
      }
    }

    if (!srOrderId) {
      order.shiprocketStatus = "Cancelled";
      console.log(`[Shiprocket Auto-Cancel]: Order ${order.id} was not present in Shiprocket, marked cancelled in store.`);
      return { success: true, message: "Order was not present in Shiprocket, marked cancelled locally." };
    }

    const cancelRes = await cancelShiprocketOrder(srOrderId, token);
    const orderIdx = (db.orders || []).findIndex((o: any) => o.id === order.id);

    if (cancelRes.success) {
      order.shiprocketStatus = "Cancelled";
      delete order.shiprocketError;
      if (orderIdx !== -1) {
        db.orders[orderIdx] = { ...db.orders[orderIdx], ...order };
      }
      await writeDB(db);

      console.log(`[Shiprocket Auto-Cancel Success]: Order ${order.id} (SR ID: ${srOrderId}) cancelled on Shiprocket.`);
      return { success: true, message: `Shiprocket order #${srOrderId} cancelled successfully.` };
    } else {
      const errMsg = cancelRes.error || cancelRes.data?.message || "";
      const isAlreadyDispatched =
        errMsg.toLowerCase().includes("shipped") ||
        errMsg.toLowerCase().includes("pickup") ||
        errMsg.toLowerCase().includes("in-transit") ||
        errMsg.toLowerCase().includes("delivered") ||
        errMsg.toLowerCase().includes("cannot be cancelled");

      order.shiprocketStatus = "Cancel Failed";
      order.shiprocketError = errMsg;
      if (orderIdx !== -1) {
        db.orders[orderIdx] = { ...db.orders[orderIdx], ...order };
      }
      await writeDB(db);

      console.warn(`[Shiprocket Auto-Cancel Failed for ${order.id}]:`, errMsg);
      return {
        success: false,
        alreadyDispatched: isAlreadyDispatched,
        error: errMsg || "Shiprocket rejected cancellation request.",
      };
    }
  } catch (err: any) {
    console.error("[Shiprocket Auto-Cancel Exception]:", err);
    return { success: false, error: err?.message || "Internal error during Shiprocket cancellation" };
  }
}


