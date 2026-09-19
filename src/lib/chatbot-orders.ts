import { readDB, writeDB } from "./db";
import { getShiprocketToken, cancelShiprocketOrder, getShiprocketTracking } from "./shiprocket";
import { checkCustomerFraudStatus } from "./fraud-prevention";

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

  const trackingUrl = `https://www.purreayurherbs.com/track?orderId=${encodeURIComponent(orderId)}`;
  const cancelUrl = `https://www.purreayurherbs.com/track?orderId=${encodeURIComponent(orderId)}&action=cancel`;

  let statusEmoji = "📦";
  if (status.toLowerCase().includes("delivered")) statusEmoji = "✅";
  else if (status.toLowerCase().includes("transit") || status.toLowerCase().includes("shipped")) statusEmoji = "🚚";
  else if (status.toLowerCase().includes("cancel")) statusEmoji = "❌";

  const stLower = (status || "").toLowerCase();
  const isCancelled = stLower === "cancelled" || stLower.includes("cancel");
  const isDelivered = stLower.includes("delivered");
  const isDispatched = stLower.includes("shipped") || stLower.includes("transit") || stLower.includes("out for delivery");
  const isUnshipped = !isCancelled && !isDelivered && !isDispatched;

  let cancelSection = "";
  if (isCancelled) {
    cancelSection = `\n\n❌ *Order Status:* This order is cancelled.${order.refundStatus ? ` (${order.refundStatus})` : ""}`;
  } else if (isUnshipped) {
    cancelSection = `\n\n❌ *Want to Cancel this Order?*
👉 Reply: *CANCEL ${orderId}*
🔗 Or Cancel Online (1-Click):
${cancelUrl}
_(Instant 1-click cancellation available before package dispatch)_`;
  } else if (isDispatched) {
    cancelSection = `\n\n🛡️ *Dispatched Parcel Policy:*
Parcel is in transit with the courier. If you wish to cancel, you can simply refuse delivery at your doorstep when the delivery partner arrives (₹0 COD charge / Full Prepaid refund).`;
  }

  return `*${statusEmoji} Order Details: ${orderId}*

Namaste ${name}! Here is the latest update on your Pure Ayur Herbs order:

*Status:* ${statusEmoji} ${status}${shiprocketInfo}
*Date:* ${date}
*Items:* ${order.items || "Ayurvedic Remedy Pack"}
*Total Amount:* ${total} (${paymentMethod})
*Delivery Destination:* ${location}

🔗 *Live Tracking Link:*
${trackingUrl}${cancelSection}

_Packed with Ayurvedic medical safety protocols. Standard priority delivery takes 2–4 business days._

Need to speak with a Vaidya or change address? Reply *Support* anytime!`;
}

/**
 * Formats multiple orders for a customer into an organized WhatsApp list.
 */
export async function formatMultipleOrdersMessage(orders: any[], customerName?: string): Promise<string> {
  const name = customerName || orders[0]?.customer || "Valued Customer";
  const displayOrders = orders.slice(0, 5); // Show up to 5 latest orders

  const list = displayOrders
    .map((order: any, idx: number) => {
      const orderId = order.id || `PYR-ORD-${idx + 1}`;
      const status = order.status || "Processing";
      const date = order.date || (order.createdAt ? new Date(order.createdAt).toLocaleDateString("en-IN") : "Recent");
      const total = order.total ? `₹${Number(order.total).toLocaleString("en-IN")}` : "";
      const items = order.items || (Array.isArray(order.itemsList) ? order.itemsList.map((i: any) => i.name).join(", ") : "Ayurvedic Remedies");

      let statusEmoji = "📦";
      if (status.toLowerCase().includes("delivered")) statusEmoji = "✅";
      else if (status.toLowerCase().includes("transit") || status.toLowerCase().includes("shipped")) statusEmoji = "🚚";
      else if (status.toLowerCase().includes("cancel")) statusEmoji = "❌";

      const trackingUrl = `https://www.purreayurherbs.com/track?orderId=${encodeURIComponent(orderId)}`;
      const stLower = (status || "").toLowerCase();
      const isUnshipped = !stLower.includes("shipped") && !stLower.includes("transit") && !stLower.includes("delivered") && !stLower.includes("cancel");
      const cancelOption = isUnshipped ? `\n• ❌ *Cancel:* Reply *CANCEL ${orderId}*` : "";

      return `${idx + 1}️⃣ *Order ${orderId}* ${idx === 0 ? "_(Latest)_" : ""}
• *Status:* ${statusEmoji} ${status}
• *Date:* ${date}${total ? ` | *Total:* ${total}` : ""}
• *Items:* ${items}
🔗 *Live Tracking:* ${trackingUrl}${cancelOption}`;
    })
    .join("\n\n");

  return `📦 *Pure Ayur Herbs - Your Orders*

Namaste ${name}! We found *${orders.length} orders* registered with your mobile number:

${list}

${orders.length > 5 ? `_...and ${orders.length - 5} older orders._\n` : ""}
═══════════════════════
_💡 To track any order above, click its link. To cancel an unshipped order, reply *CANCEL <Order ID>* (e.g. *CANCEL ${displayOrders[0]?.id || "PYR-ORD-146050"}*)!_

Need assistance or want to talk with our team? Reply *Support* anytime!`;
}

export interface CancelOrderResult {
  success: boolean;
  status: "CANCELLED" | "ALREADY_CANCELLED" | "DISPATCHED_DOORSTEP_REFUSAL" | "DELIVERED_NO_CANCEL" | "LIMIT_REACHED" | "NOT_FOUND" | "UNAUTHORIZED" | "ERROR";
  order?: any;
  message: string;
}

/**
 * Formats doorstep refusal guidance following Amazon & Flipkart policy
 */
export function formatDoorstepRefusalMessage(order: any, customerName?: string): string {
  const name = customerName || order.customer || "Valued Customer";
  const orderId = order.id || "PYR-ORD";
  const status = order.status || "Shipped";
  const isPrepaid = order.paymentMethod === "prepaid" || order.method === "Prepaid";
  const total = order.total ? `₹${Number(order.total).toLocaleString("en-IN")}` : "₹0";

  const refundText = isPrepaid
    ? `• *Prepaid Refund:* Once returned to our warehouse, full refund of *${total}* will be instantly returned to your original payment account (3–5 business days).`
    : `• *COD Order:* Since this is Cash on Delivery, you don't need to pay anything (*₹0 fee*).`;

  return `🚚 *Package Already Dispatched — Amazon & Flipkart Policy*

Namaste ${name}! 🙏

Your order *${orderId}* is already in transit (*${status}*) with our delivery partner and cannot be cancelled online.

🛡️ *Doorstep Refusal Option (No charges):*
When our courier executive arrives at your doorstep, you can simply inform them:
👉 *"I do not want this parcel. Please mark it as 'Customer Refused' / Return to Origin (RTO)."*

${refundText}

🔗 *Live Tracking:*
https://www.purreayurherbs.com/track?orderId=${encodeURIComponent(orderId)}

If you have any questions or need doctor assistance, simply reply *Support*!`;
}

/**
 * Formats message when an order is already cancelled
 */
export function formatAlreadyCancelledMessage(order: any, customerName?: string): string {
  const name = customerName || order.customer || "Valued Customer";
  const orderId = order.id || "PYR-ORD";
  const total = order.total ? `₹${Number(order.total).toLocaleString("en-IN")}` : "₹0";
  const isPrepaid = order.paymentMethod === "prepaid" || order.method === "Prepaid";

  const refundText = isPrepaid
    ? `💳 *Refund:* ${order.refundStatus || `Full refund of ${total} initiated (3–5 business days).`}`
    : `💵 *Billing:* Cash on Delivery (₹0 charged).`;

  return `❌ *Order Already Cancelled*

Namaste ${name}!
Order *${orderId}* was already cancelled${order.cancellationDate ? ` on ${new Date(order.cancellationDate).toLocaleDateString("en-IN")}` : ""}.

${refundText}
${order.cancellationReason ? `📝 *Reason:* ${order.cancellationReason}\n` : ""}
🌐 Visit Store: https://www.purreayurherbs.com
Reply *Support* if you need any further help!`;
}

/**
 * Formats message when an order is delivered and cannot be cancelled
 */
export function formatDeliveredCannotCancelMessage(order: any, customerName?: string): string {
  const name = customerName || order.customer || "Valued Customer";
  const orderId = order.id || "PYR-ORD";

  return `✅ *Order Already Delivered*

Namaste ${name}!
Your order *${orderId}* has already been marked as *Delivered*. As per Ayurvedic safety & hygiene standards, delivered products cannot be cancelled online.

If you received a damaged package or have any medical queries, reply *Support* or call +91 72478 24101 and our Vaidya team will assist you! 🙏`;
}

/**
 * Formats order cancellation confirmation prompt (Step 1)
 */
export function formatCancellationPrompt(order: any, customerName?: string): string {
  const name = customerName || order.customer || "Valued Customer";
  const orderId = order.id || "PYR-ORD";
  const total = order.total ? `₹${Number(order.total).toLocaleString("en-IN")}` : "₹0";
  const paymentMethod = order.paymentMethod === "prepaid" || order.method === "Prepaid" ? "💳 Prepaid" : "💵 COD";
  const items = order.items || "Ayurvedic Remedies";

  return `⚠️ *Confirm Order Cancellation*

Namaste ${name}! You requested to cancel your order:

📦 *Order ID:* ${orderId}
🌿 *Items:* ${items}
💰 *Total:* ${total} (${paymentMethod})
📊 *Status:* ${order.status || "Processing"} (Eligible for instant cancellation)

Are you sure you want to cancel this order?
To proceed, please reply:
👉 *CONFIRM CANCEL ${orderId}*

🔗 *Or Cancel Online (1-Click):*
https://www.purreayurherbs.com/track?orderId=${encodeURIComponent(orderId)}&action=cancel

_(Or provide a reason, e.g. "CONFIRM CANCEL ${orderId} Ordered by mistake")_

If you wish to keep your order, simply ignore this message. 🙏`;
}

/**
 * Formats cancellation success message
 */
export function formatCancellationSuccessMessage(order: any, reason?: string, customerName?: string): string {
  const name = customerName || order.customer || "Valued Customer";
  const orderId = order.id || "PYR-ORD";
  const total = order.total ? `₹${Number(order.total).toLocaleString("en-IN")}` : "₹0";
  const isPrepaid = order.paymentMethod === "prepaid" || order.method === "Prepaid";

  const refundText = isPrepaid
    ? `💳 *Refund Status:* Full refund of *${total}* has been initiated to your original payment method. It will reflect within *3–5 business days*.`
    : `💵 *Billing:* Cash on Delivery (COD). *₹0 charge* applies.`;

  return `🚫 *ORDER CANCELLED SUCCESSFULLY* 🚫

Namaste ${name}! 🙏

Your order *${orderId}* has been successfully cancelled.

${refundText}
${reason ? `📝 *Reason:* ${reason}\n` : ""}
📦 *Dispatch Status:* Order has been stopped and will not be dispatched.

We hope to serve you again soon with pure Ayurvedic health remedies.

🌐 Pure Ayur Herbs: https://www.purreayurherbs.com
💬 Questions? Reply directly here on WhatsApp anytime!`;
}

/**
 * Cancels an order directly from WhatsApp Chatbot
 */
export async function cancelCustomerOrder(
  orderIdOrQuery: string,
  customerPhone?: string,
  reason?: string
): Promise<CancelOrderResult> {
  try {
    const db = await readDB();
    const orders = db.orders || [];

    const cleanQuery = (orderIdOrQuery || "").trim().toLowerCase();
    const cleanPhone = (customerPhone || "").replace(/\D/g, "").slice(-10);

    const orderIndex = orders.findIndex((o: any) => {
      if (!o || !o.id) return false;
      const oId = String(o.id).toLowerCase();
      const oDigits = o.id.replace(/\D/g, "");
      const queryDigits = cleanQuery.replace(/\D/g, "");

      const isExactMatch = oId === cleanQuery || oId.includes(cleanQuery);
      const isDigitsMatch = queryDigits.length >= 4 && (oDigits === queryDigits || oDigits.includes(queryDigits));
      const isSrMatch =
        (o.shiprocketOrderId && String(o.shiprocketOrderId).toLowerCase() === cleanQuery) ||
        (o.shiprocketShipmentId && String(o.shiprocketShipmentId).toLowerCase() === cleanQuery);

      return isExactMatch || isDigitsMatch || isSrMatch;
    });

    if (orderIndex === -1) {
      return {
        success: false,
        status: "NOT_FOUND",
        message: "We couldn't find an order matching that ID. Please check your Order ID (e.g. PYR-ORD-146050) or reply *Order* to view your active orders.",
      };
    }

    const order = orders[orderIndex];

    // Phone verification if provided
    if (cleanPhone) {
      const orderPhone = (order.phone || "").replace(/\D/g, "").slice(-10);
      if (orderPhone && orderPhone.length >= 6 && orderPhone !== cleanPhone) {
        return {
          success: false,
          status: "UNAUTHORIZED",
          order,
          message: "The mobile number does not match this order's billing details. If you need help, please reply *Support*.",
        };
      }
    }

    const status = String(order.status || "Processing").toLowerCase();

    // 1. Already Cancelled
    if (status === "cancelled" || status.includes("cancel")) {
      return {
        success: false,
        status: "ALREADY_CANCELLED",
        order,
        message: formatAlreadyCancelledMessage(order),
      };
    }

    // 2. Already Delivered
    if (status.includes("delivered")) {
      return {
        success: false,
        status: "DELIVERED_NO_CANCEL",
        order,
        message: formatDeliveredCannotCancelMessage(order),
      };
    }

    // 3. Shipped / In Transit / Out for Delivery (Amazon/Flipkart Doorstep Refusal)
    const isDispatched = status.includes("shipped") || status.includes("transit") || status.includes("out for delivery");
    if (isDispatched) {
      return {
        success: false,
        status: "DISPATCHED_DOORSTEP_REFUSAL",
        order,
        message: formatDoorstepRefusalMessage(order),
      };
    }

    // 3.5. Cancellation Limit & Anti-Spam Check (Amazon & Flipkart Policy)
    const fraudStatus = await checkCustomerFraudStatus(order.phone || cleanPhone);
    if (fraudStatus.isCancelBlocked) {
      const name = order.customer || "Valued Customer";
      return {
        success: false,
        status: "LIMIT_REACHED",
        order,
        message: `⚠️ *Cancellation Limit Reached*

Namaste ${name}! 🙏

You have reached the limit of automated order cancellations allowed for this mobile number in the last 30 days.

To cancel this order, please speak with our support desk directly:
📞 *Helpline:* +91 72478 24101
💬 Or reply *Support* right here on WhatsApp!`,
      };
    }

    // 4. Pre-dispatch Cancellation
    if (order.shiprocketOrderId) {
      try {
        const srConfig = db.settings?.shiprocket || {};
        const srEmail = srConfig.email || process.env.SHIPROCKET_EMAIL;
        const srPassword = srConfig.password || process.env.SHIPROCKET_PASSWORD;
        if (srEmail && srPassword) {
          const token = await getShiprocketToken(srEmail, srPassword);
          if (token) {
            await cancelShiprocketOrder(order.shiprocketOrderId, token);
          }
        }
      } catch (srErr) {
        console.error("[Shiprocket Cancellation Error in Chatbot]:", srErr);
      }
    }

    const isPrepaid = order.paymentMethod === "prepaid" || order.method === "Prepaid";
    const cancellationReasonText = reason || "Cancelled via WhatsApp Chatbot";

    order.status = "Cancelled";
    order.shiprocketStatus = "Cancelled";
    order.cancellationReason = cancellationReasonText;
    order.cancellationDate = new Date().toISOString();
    order.cancelledBy = "Customer (WhatsApp)";
    order.refundStatus = isPrepaid
      ? "Refund Initiated (3–5 business days)"
      : "Not Applicable (Cash on Delivery - ₹0)";

    db.orders[orderIndex] = order;
    await writeDB(db);

    const confirmationMsg = formatCancellationSuccessMessage(order, cancellationReasonText);
    return {
      success: true,
      status: "CANCELLED",
      order,
      message: confirmationMsg,
    };
  } catch (error: any) {
    console.error("[cancelCustomerOrder Error]:", error);
    return {
      success: false,
      status: "ERROR",
      message: "An unexpected error occurred while processing your cancellation. Please reply *Support* to talk with our team.",
    };
  }
}

