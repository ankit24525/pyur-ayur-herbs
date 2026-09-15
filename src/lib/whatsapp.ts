/**
 * Meta WhatsApp Cloud API Service
 * Utility for sending automated WhatsApp notifications to customers.
 */

export async function sendWhatsAppTextMessage(to: string, text: string) {
  try {
    const token =
      process.env.WHATSAPP_ACCESS_TOKEN ||
      "EAAYQ1WWZCjosBSZAyG6hGLLrF9b0c5RMPMeYv9g6xUVaCCf0zhFnfwR1pYrVmFx5oFU0FABvRWQYnAEa4hcpECjd9ZBHNCfhNEHUnYGz9uz3R5q1EZCBD9ZBKZBKkfZCgvqzEiy1WleH9fNSEKGVjbr8nFjPqitURMQvdZArUcDjTx0nfSNVB43pUqvOS1KkfKVNYwZDZD";
    const phoneId =
      process.env.WHATSAPP_PHONE_NUMBER_ID || "1363740400150399";

    if (!token || !phoneId) {
      console.warn("[WhatsApp API] Missing WHATSAPP_ACCESS_TOKEN or WHATSAPP_PHONE_NUMBER_ID.");
      return { success: false, error: "WhatsApp API credentials not configured." };
    }

    // Clean recipient phone number (must include country code without +, e.g., 919876543210)
    let cleanPhone = to.replace(/\D/g, "");
    if (cleanPhone.length === 10) {
      cleanPhone = "91" + cleanPhone;
    }

    const response = await fetch(`https://graph.facebook.com/v20.0/${phoneId}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: cleanPhone,
        type: "text",
        text: {
          preview_url: true,
          body: text,
        },
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      console.error("[WhatsApp API Error]:", data);
      return { success: false, error: data.error?.message || "Failed to send WhatsApp message" };
    }

    return { success: true, data };
  } catch (error: any) {
    console.error("[WhatsApp API Exception]:", error);
    return { success: false, error: error.message || "Internal network error" };
  }
}
