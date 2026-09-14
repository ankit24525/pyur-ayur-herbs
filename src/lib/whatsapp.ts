/**
 * Meta WhatsApp Cloud API Service
 * Utility for sending automated WhatsApp notifications to customers.
 */

export async function sendWhatsAppTextMessage(to: string, text: string) {
  try {
    const token = process.env.WHATSAPP_ACCESS_TOKEN;
    const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;

    if (!token || !phoneId || token === "your_permanent_access_token_here") {
      console.warn("[WhatsApp API] Missing WHATSAPP_ACCESS_TOKEN or WHATSAPP_PHONE_NUMBER_ID in environment variables.");
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
