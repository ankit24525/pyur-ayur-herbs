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
