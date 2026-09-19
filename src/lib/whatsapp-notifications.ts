/**
 * WhatsApp Order Lifecycle & Abandoned Cart Notification Service
 * Pillar 3: Automated customer updates for Order Placed, Shipped, Out for Delivery, Delivered, and Abandoned Carts.
 */

import { sendWhatsAppTextMessage } from "./whatsapp";

const DEFAULT_TOKEN =
  "EAAYQ1WWZCjosBSZAyG6hGLLrF9b0c5RMPMeYv9g6xUVaCCf0zhFnfwR1pYrVmFx5oFU0FABvRWQYnAEa4hcpECjd9ZBHNCfhNEHUnYGz9uz3R5q1EZCBD9ZBKZBKkfZCgvqzEiy1WleH9fNSEKGVjbr8nFjPqitURMQvdZArUcDjTx0nfSNVB43pUqvOS1KkfKVNYwZDZD";
const DEFAULT_PHONE_ID = "1363740400150399";
const BASE_URL = "https://www.purreayurherbs.com";

function getCleanPhone(phone: string): string {
  let cleaned = (phone || "").replace(/\D/g, "");
  if (cleaned.length === 10) {
    cleaned = "91" + cleaned;
  }
  return cleaned;
}

/**
 * 1. Order Confirmation WhatsApp Notification
 */
export async function sendOrderConfirmationWhatsApp(order: any): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const rawPhone = order.phone || order.customerPhone || "";
    const cleanPhone = getCleanPhone(rawPhone);
    if (!cleanPhone || cleanPhone.length < 10) {
      return { success: false, error: "Invalid recipient phone number." };
    }

    const orderId = order.id || "PYR-ORD";
    const name = order.name || order.customer || "Valued Customer";
    const total = order.total ? `₹${Number(order.total).toLocaleString("en-IN")}` : "₹0";
    const paymentMode = order.paymentMethod === "prepaid" || order.method === "Prepaid"
      ? "💳 Prepaid (PhonePe / Online)"
      : "💵 Cash on Delivery (COD)";
    
    // Format items list
    let itemsSummary = "";
    if (Array.isArray(order.items)) {
      itemsSummary = order.items
        .map((i: any) => `• ${i.name || i.title || "Item"} (Qty: ${i.quantity || i.qty || 1})`)
        .join("\n");
    } else if (typeof order.items === "string") {
      itemsSummary = `• ${order.items}`;
    } else {
      itemsSummary = "• Ayurvedic Wellness Formulations";
    }

    const city = order.city || "";
    const state = order.state || "";
    const destination = [city, state].filter(Boolean).join(", ") || "India";
    const trackingLink = `${BASE_URL}/track?orderId=${encodeURIComponent(orderId)}`;
    const cancelLink = `${BASE_URL}/track?orderId=${encodeURIComponent(orderId)}&action=cancel`;

    const messageText = `🌿 *ORDER CONFIRMED — PURE AYUR HERBS* 🌿

Namaste ${name}! 🙏

Thank you for choosing Pure Ayur Herbs. Your order has been placed successfully and is being prepared with strict Ministry of AYUSH medical hygiene protocols.

📋 *Order ID:* ${orderId}
📦 *Items:*
${itemsSummary}
💰 *Total Amount:* ${total}
💳 *Payment Mode:* ${paymentMode}
📍 *Delivery Destination:* ${destination}

🚚 *Live Tracking Link:*
${trackingLink}

❌ *Cancel Order Option:*
If you ordered by mistake or wish to cancel:
👉 *Reply to this chat:* CANCEL ${orderId}
🔗 *Or Cancel Online (1-Click):*
${cancelLink}
_(1-click instant cancellation available before parcel dispatch)_

_Standard priority shipping takes 2–4 business days across India._

Need assistance or have dosage questions? Simply reply to this chat anytime to talk with our 24/7 Ayurvedic Assistant!`;

    const res = await sendWhatsAppTextMessage(cleanPhone, messageText);
    return res;
  } catch (error: any) {
    console.error("[sendOrderConfirmationWhatsApp Error]:", error);
    return { success: false, error: error.message };
  }
}

/**
 * 2. Order Shipped & In-Transit Notification
 */
export async function sendOrderShippedWhatsApp(params: {
  order: any;
  courierName?: string;
  awb?: string;
  etd?: string;
}): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const { order, courierName, awb, etd } = params;
    const rawPhone = order.phone || order.customerPhone || "";
    const cleanPhone = getCleanPhone(rawPhone);
    if (!cleanPhone || cleanPhone.length < 10) {
      return { success: false, error: "Invalid recipient phone number." };
    }

    const orderId = order.id || "PYR-ORD";
    const name = order.name || order.customer || "Valued Customer";
    const courier = courierName || order.courierName || "Shiprocket Express";
    const awbCode = awb || order.awb || "Tracking in progress";
    const estArrival = etd || order.etd || "2–3 business days";
    const trackingLink = `${BASE_URL}/track?orderId=${encodeURIComponent(orderId)}`;

    const messageText = `🚚 *YOUR ORDER IS ON ITS WAY!* 🚚

Namaste ${name}! 

Great news — your Pure Ayur Herbs remedies have been packed and dispatched with our courier partner.

📋 *Order ID:* ${orderId}
🚛 *Courier Partner:* ${courier}
🔖 *AWB / Tracking No:* ${awbCode}
⏱️ *Estimated Delivery:* ${estArrival}

🔗 *Track Shipment Live:*
${trackingLink}

🛡️ *Want to Cancel? (Doorstep Refusal Option)*
Since your parcel is already in transit with the courier, online cancellation is closed. Just like Amazon & Flipkart, you can simply refuse delivery at your doorstep when the courier executive arrives (₹0 COD fee / 100% full refund for prepaid).

_Please ensure someone is available at your address to receive the package._

Questions about your delivery? Reply to this message anytime!`;

    return await sendWhatsAppTextMessage(cleanPhone, messageText);
  } catch (error: any) {
    console.error("[sendOrderShippedWhatsApp Error]:", error);
    return { success: false, error: error.message };
  }
}

/**
 * 3. Out for Delivery Alert
 */
export async function sendOrderOutForDeliveryWhatsApp(order: any): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const rawPhone = order.phone || order.customerPhone || "";
    const cleanPhone = getCleanPhone(rawPhone);
    if (!cleanPhone || cleanPhone.length < 10) {
      return { success: false, error: "Invalid recipient phone number." };
    }

    const orderId = order.id || "PYR-ORD";
    const name = order.name || order.customer || "Valued Customer";
    const isCod = order.paymentMethod === "cod" || order.method === "COD";
    const total = order.total ? `₹${Number(order.total).toLocaleString("en-IN")}` : "";

    const codReminder = isCod
      ? `\n\n💵 *COD Reminder:* Please keep ${total} in cash or UPI ready for the delivery agent.`
      : "";

    const messageText = `📍 *OUT FOR DELIVERY TODAY!* 🛵

Namaste ${name}! 

Your Pure Ayur Herbs package (*Order ${orderId}*) is out for delivery with your local courier agent and will arrive at your doorstep today.${codReminder}

🔗 *Live Status:*
${BASE_URL}/track?orderId=${encodeURIComponent(orderId)}

Thank you for choosing natural Ayurvedic wellness! 🙏`;

    return await sendWhatsAppTextMessage(cleanPhone, messageText);
  } catch (error: any) {
    console.error("[sendOrderOutForDeliveryWhatsApp Error]:", error);
    return { success: false, error: error.message };
  }
}

/**
 * 4. Delivered & Review Invitation
 */
export async function sendOrderDeliveredWhatsApp(order: any): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const rawPhone = order.phone || order.customerPhone || "";
    const cleanPhone = getCleanPhone(rawPhone);
    if (!cleanPhone || cleanPhone.length < 10) {
      return { success: false, error: "Invalid recipient phone number." };
    }

    const orderId = order.id || "PYR-ORD";
    const name = order.name || order.customer || "Valued Customer";

    const messageText = `✅ *PACKAGE SAFELY DELIVERED!* 🎉

Namaste ${name}! 

Your order *${orderId}* has been safely delivered. We hope you love your 100% natural Ayurvedic formulations!

🥄 *Need Dosage & Usage Instructions?*
Reply with *"How to use"* or the product name (e.g. *"Virja dosage"* or *"Madhunashi dosage"*) right here in this chat for instant guidance!

⭐ *Loved our products?*
Share your valuable feedback on our store:
${BASE_URL}/products

Wishing you vibrant health and vitality,
*Team Pure Ayur Herbs* 🙏`;

    return await sendWhatsAppTextMessage(cleanPhone, messageText);
  } catch (error: any) {
    console.error("[sendOrderDeliveredWhatsApp Error]:", error);
    return { success: false, error: error.message };
  }
}

/**
 * 5. Abandoned Cart Recovery WhatsApp Notification
 */
export async function sendAbandonedCartWhatsApp(params: {
  phone: string;
  name?: string;
  items?: any[];
  cartTotal?: number;
  discountCode?: string;
  recoveryUrl?: string;
}): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const { phone, name, items, cartTotal, discountCode = "AYUR5", recoveryUrl } = params;
    const cleanPhone = getCleanPhone(phone);
    if (!cleanPhone || cleanPhone.length < 10) {
      return { success: false, error: "Invalid recipient phone number." };
    }

    const customerName = name || "Friend";
    const totalStr = cartTotal ? ` (Worth ₹${Number(cartTotal).toLocaleString("en-IN")})` : "";
    const link = recoveryUrl || `${BASE_URL}/cart`;

    let itemsList = "";
    if (Array.isArray(items) && items.length > 0) {
      itemsList = items
        .slice(0, 3)
        .map((i: any) => `• ${i.name || i.title || "Ayurvedic Remedy"}`)
        .join("\n");
    }

    const messageText = `🌿 *YOU LEFT SOMETHING SPECIAL IN YOUR CART!* 🛒

Namaste ${customerName}! 🙏

We noticed you didn't complete your order for your Pure Ayur Herbs wellness pack${totalStr}.

${itemsList ? `*Selected Items:*\n${itemsList}\n` : ""}
To help you start your natural Ayurvedic journey today, here is an exclusive **5% DISCOUNT** just for you:

🎁 *Coupon Code:* *${discountCode}*
🚚 *Free Priority Shipping Across India*
🛡️ *100% AYUSH Certified & Pure*

👉 *Tap below to complete your order now:*
${link}

_This discount code is valid for the next 24 hours._ Need any help? Just reply to this message!`;

    return await sendWhatsAppTextMessage(cleanPhone, messageText);
  } catch (error: any) {
    console.error("[sendAbandonedCartWhatsApp Error]:", error);
    return { success: false, error: error.message };
  }
}

/**
 * 6. Order Cancellation Confirmation WhatsApp Notification
 */
export async function sendOrderCancellationWhatsApp(
  order: any,
  reason?: string
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const rawPhone = order.phone || order.customerPhone || "";
    const cleanPhone = getCleanPhone(rawPhone);
    if (!cleanPhone || cleanPhone.length < 10) {
      return { success: false, error: "Invalid recipient phone number." };
    }

    const orderId = order.id || "PYR-ORD";
    const name = order.name || order.customer || "Valued Customer";
    const total = order.total ? `₹${Number(order.total).toLocaleString("en-IN")}` : "₹0";
    const isPrepaid = order.paymentMethod === "prepaid" || order.method === "Prepaid";

    const refundText = isPrepaid
      ? `💳 *Refund Status:* Full refund of *${total}* has been initiated to your original payment method (PhonePe/Bank). It will reflect in your account within *3–5 business days*.`
      : `💵 *Billing:* This was a Cash on Delivery (COD) order. *No charges apply* (₹0).`;

    const messageText = `🚫 *ORDER CANCELLED — PURE AYUR HERBS* 🚫

Namaste ${name}! 🙏

Your order *${orderId}* has been successfully cancelled as per your request.

${refundText}
${reason ? `📝 *Reason:* ${reason}\n` : ""}
📦 *Shipment Status:* Dispatch stopped.

We are sorry to see you go! If you ever need advice or herbal remedies for your health in the future, we're always here for you.

🌐 Visit Store: https://www.purreayurherbs.com
💬 Have questions? Reply directly to this WhatsApp chat!`;

    return await sendWhatsAppTextMessage(cleanPhone, messageText);
  } catch (error: any) {
    console.error("[sendOrderCancellationWhatsApp Error]:", error);
    return { success: false, error: error.message };
  }
}

