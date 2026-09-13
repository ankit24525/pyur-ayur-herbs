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
    if (res.ok && data?.data?.shipping_address) {
      return data.data.shipping_address.map((addr: any) => addr.pickup_location || addr.address_nickname).filter(Boolean);
    }
  } catch (err) {
    console.error("[Shiprocket Fetch Pickup Locations Error]:", err);
  }
  return [];
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
      return { ok: res.ok && data?.order_id, data, status: res.status };
    };

    // First attempt with given pickup_location
    let result = await makeRequest(payload.pickup_location);

    // If failed due to pickup location mismatch, automatically fetch live pickup locations and retry
    if (!result.ok) {
      const availableLocations = await getShiprocketPickupLocations(token);
      if (availableLocations.length > 0 && availableLocations[0] !== payload.pickup_location) {
        console.log(`[Shiprocket Retrying with fetched location]: ${availableLocations[0]}`);
        result = await makeRequest(availableLocations[0]);
      }
    }

    return { success: result.ok, data: result.data, statusCode: result.status };
  } catch (error: any) {
    console.error("[Shiprocket Order Creation Error]:", error);
    return { success: false, error: error?.message || "Network Error" };
  }
}

export async function getShiprocketTracking(shipmentId: string | number, token: string) {
  try {
    const res = await fetch(`https://apiv2.shiprocket.in/v1/external/courier/track/shipment/${shipmentId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await res.json();
    return { success: res.ok, data };
  } catch (error: any) {
    console.error("[Shiprocket Tracking Error]:", error);
    return { success: false, error: error?.message || "Network Error" };
  }
}
