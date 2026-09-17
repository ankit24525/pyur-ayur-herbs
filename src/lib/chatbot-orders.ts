import { readDB } from "./db";
import { getShiprocketToken, getShiprocketTracking } from "./shiprocket";

export interface OrderLookupResult {
  found: boolean;
  order?: any;
  multiple?: any[];
  error?: string;
}

/**
 * Searches for orders matching a customer's phone number, order ID, or search query.
 */
export async function findOrdersForCustomer(query: string, customerPhone?: string): Promise<OrderLookupResult> {
  try {
    const db = await readDB();
    const orders = db.orders || [];

    const cleanQuery = (query || "").trim().toLowerCase();
    const cleanPhone = (customerPhone || "").replace(/\D/g, "").slice(-10);

    // 1. Check for Order ID pattern (e.g. PYR-ORD-123456 or 6 digits)
    const orderIdPattern = /([A-Za-z0-9_-]*ORD[A-Za-z0-9_-]*|\d{4,9})/i;
    const match = cleanQuery.match(orderIdPattern);
    const extractedId = match ? match[0].toLowerCase() : "";

    if (extractedId) {
      const singleOrder = orders.find((o: any) => {
        if (!o || !o.id) return false;
        const oId = String(o.id).toLowerCase();
        const oDigits = o.id.replace(/\D/g, "");
        const extractDigits = extractedId.replace(/\D/g, "");

        return (
          oId === extractedId ||
          oId.includes(extractedId) ||
          (extractDigits.length >= 4 && oDigits.includes(extractDigits)) ||
          (o.shiprocketOrderId && String(o.shiprocketOrderId).toLowerCase() === extractedId) ||
          (o.shiprocketShipmentId && String(o.shiprocketShipmentId).toLowerCase() === extractedId)
        );
      });

      if (singleOrder) {
        return { found: true, order: singleOrder };
      }
    }

    // 2. Search by phone number (customer's WhatsApp number or typed phone)
    const phoneToSearch = cleanPhone || cleanQuery.replace(/\D/g, "").slice(-10);
    if (phoneToSearch.length === 10) {
      const customerOrders = orders.filter((o: any) => {
        const oPhone = (o.phone || "").replace(/\D/g, "").slice(-10);
        return oPhone === phoneToSearch;
      });

      if (customerOrders.length === 1) {
        return { found: true, order: customerOrders[0] };
      }
      if (customerOrders.length > 1) {
        // Return latest order as primary, and others in list
        customerOrders.sort((a: any, b: any) => (new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime()));
        return { found: true, order: customerOrders[0], multiple: customerOrders };
      }
    }

    return { found: false };
  } catch (error: any) {
    console.error("[Chatbot Orders Lookup Error]:", error);
    return { found: false, error: error.message };
  }
}

/**
 * Formats an order object into a professional, easy-to-read WhatsApp message.
 */
export async function formatOrderStatusMessage(order: any, customerName?: string): Promise<string> {
  const db = await readDB();
  const orderId = order.id || "PYR-ORD";
  const name = customerName || order.customer || "Valued Customer";
  const status = order.status || "Processing";
  const date = order.date || new Date().toLocaleDateString("en-IN");
  const total = order.total ? `₹${order.total.toLocaleString("en-IN")}` : "₹0";
  const paymentMethod = order.method === "Prepaid" ? "💳 Prepaid (PhonePe)" : "💵 Cash on Delivery (COD)";
  const city = order.city || "";
  const state = order.state || "";
  const location = [city, state].filter(Boolean).join(", ") || "India";

  // Check Shiprocket live tracking if available
  let shiprocketInfo = "";
  if (order.shiprocketShipmentId) {
    try {
      const srConfig = db.settings?.shiprocket || {};
      const srEmail = srConfig.email || process.env.SHIPROCKET_EMAIL;
      const srPassword = srConfig.password || process.env.SHIPROCKET_PASSWORD;
      if (srEmail && srPassword) {
        const token = await getShiprocketToken(srEmail, srPassword);
        if (token) {
          const trackRes = await getShiprocketTracking(order.shiprocketShipmentId, token);
          if (trackRes.success && trackRes.data?.tracking_data?.track_status) {
            shiprocketInfo = `\n🚚 *Courier Status:* ${trackRes.data.tracking_data.track_status}`;
          }
        }
      }
    } catch {}
  }

  const trackingUrl = `https://pureayurherbs.com/track?orderId=${encodeURIComponent(orderId)}`;

  let statusEmoji = "📦";
  if (status.toLowerCase().includes("delivered")) statusEmoji = "✅";
  else if (status.toLowerCase().includes("transit") || status.toLowerCase().includes("shipped")) statusEmoji = "🚚";
  else if (status.toLowerCase().includes("cancel")) statusEmoji = "❌";

  return `*${statusEmoji} Order Details: ${orderId}*

Namaste ${name}! Here is the latest update on your Pure Ayur Herbs order:

*Status:* ${statusEmoji} ${status}${shiprocketInfo}
*Date:* ${date}
*Items:* ${order.items || "Ayurvedic Remedy Pack"}
*Total Amount:* ${total} (${paymentMethod})
*Delivery Destination:* ${location}

🔗 *Live Tracking Link:*
${trackingUrl}

_Packed with Ayurvedic medical safety protocols. Standard priority delivery takes 2–4 business days._

Need to speak with a Vaidya or change address? Reply *Support* anytime!`;
}
