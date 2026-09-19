import { readDB, writeDB } from "@/lib/db";

const DEFAULT_PERMANENT_TOKEN =
  "EAAYQ1WWZCjosBSZAyG6hGLLrF9b0c5RMPMeYv9g6xUVaCCf0zhFnfwR1pYrVmFx5oFU0FABvRWQYnAEa4hcpECjd9ZBHNCfhNEHUnYGz9uz3R5q1EZCBD9ZBKZBKkfZCgvqzEiy1WleH9fNSEKGVjbr8nFjPqitURMQvdZArUcDjTx0nfSNVB43pUqvOS1KkfKVNYwZDZD";
const DEFAULT_PHONE_ID = "1363740400150399";

function getCredentials() {
  const envToken = process.env.WHATSAPP_ACCESS_TOKEN?.trim();
  const isValidToken =
    envToken &&
    envToken.startsWith("EAA") &&
    !envToken.startsWith("EAAYQ1WWZCjosBSR") &&
    envToken.length > 100;
  const token = isValidToken ? envToken : DEFAULT_PERMANENT_TOKEN;

  const envPhoneId = process.env.WHATSAPP_PHONE_NUMBER_ID?.trim();
  const isNumericPhoneId =
    envPhoneId && /^\d{10,}$/.test(envPhoneId) && envPhoneId !== "1339746809219792";
  const phoneId = isNumericPhoneId ? envPhoneId : DEFAULT_PHONE_ID;

  return { token, phoneId };
}

/**
 * Generate a 6-digit random numeric OTP
 */
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Clean phone number to standard 12-digit Indian format (e.g. 919876543210)
 */
export function formatPhoneNumber(phone: string): string {
  let clean = phone.replace(/\D/g, "");
  if (clean.length === 10) {
    clean = "91" + clean;
  }
  return clean;
}

/**
 * Save an OTP record to MongoDB / local DB with TTL expiration
 */
export async function saveOTP(
  identifier: string,
  otp: string,
  purpose: "login" | "reset" | "cod" | "checkout",
  ttlMinutes = 10
): Promise<void> {
  const db = await readDB();
  const cleanId = identifier.trim().toLowerCase();
  const expiresAt = Date.now() + ttlMinutes * 60 * 1000;

  (db as any).otps = ((db as any).otps || []).filter(
    (item: any) => !(item.identifier?.toLowerCase() === cleanId && (item.purpose === purpose || (purpose === "checkout" && item.purpose === "cod") || (purpose === "cod" && item.purpose === "checkout")))
  );

  (db as any).otps.push({
    identifier: cleanId,
    otp,
    purpose,
    expiresAt,
    createdAt: Date.now(),
  });

  await writeDB(db);
}

/**
 * Verify and consume (burn) an OTP record
 */
export async function verifyOTP(
  identifier: string,
  otp: string,
  purpose: "login" | "reset" | "cod" | "checkout"
): Promise<{ valid: boolean; error?: string }> {
  const db = await readDB();
  const cleanId = identifier.trim().toLowerCase();
  const otps = (db as any).otps || [];

  const index = otps.findIndex(
    (item: any) =>
      item.identifier?.toLowerCase() === cleanId &&
      item.purpose === purpose &&
      String(item.otp).trim() === String(otp).trim()
  );

  if (index === -1) {
    return { valid: false, error: "Invalid verification code. Please check and try again." };
  }

  const record = otps[index];
  if (Date.now() > record.expiresAt) {
    // Remove expired OTP
    (db as any).otps = otps.filter((_: any, i: number) => i !== index);
    await writeDB(db);
    return { valid: false, error: "This verification code has expired. Please request a new one." };
  }

  // Valid OTP -> Burn it so it cannot be reused
  (db as any).otps = otps.filter((_: any, i: number) => i !== index);
  await writeDB(db);

  return { valid: true };
}

/**
 * Send OTP via Meta WhatsApp Cloud API (Template with text message fallback)
 */
export async function sendWhatsAppOTP(
  phone: string,
  otp: string,
  purpose: "login" | "reset" | "cod" | "checkout"
): Promise<{ success: boolean; error?: string; messageId?: string }> {
  const { token, phoneId } = getCredentials();
  const cleanPhone = formatPhoneNumber(phone);

  if (!cleanPhone || cleanPhone.length < 10) {
    return { success: false, error: "Invalid phone number provided." };
  }

  // 1. Attempt 1: Try sending via pre-approved Meta Authentication Template
  try {
    const langCode = process.env.WHATSAPP_OTP_LANG || "en";
    const templatePayload = {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: cleanPhone,
      type: "template",
      template: {
        name: "pyur_auth_otp",
        language: { code: langCode },
        components: [
          {
            type: "body",
            parameters: [{ type: "text", text: otp }],
          },
          {
            type: "button",
            sub_type: "url",
            index: "0",
            parameters: [{ type: "text", text: otp }],
          },
        ],
      },
    };

    let templateRes = await fetch(`https://graph.facebook.com/v20.0/${phoneId}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(templatePayload),
    });

    let templateData = await templateRes.json();

    // If 'en' failed with language mismatch, try 'en_US'
    if (!templateRes.ok && templateData.error?.code === 132001 && langCode === "en") {
      templatePayload.template.language.code = "en_US";
      templateRes = await fetch(`https://graph.facebook.com/v20.0/${phoneId}/messages`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(templatePayload),
      });
      templateData = await templateRes.json();
    }

    if (templateRes.ok && templateData.messages?.[0]?.id) {
      console.log(`[WhatsApp OTP Template Success] Sent to ${cleanPhone}: ${otp}`);
      return { success: true, messageId: templateData.messages[0].id };
    }

    console.warn("[WhatsApp OTP Template Error, Falling back to High-Priority Text]:", templateData.error?.message);
  } catch (templateErr) {
    console.warn("[WhatsApp OTP Template Request Failed, Trying Direct Text Fallback]:", templateErr);
  }

  // 2. Attempt 2: Fallback to direct high-priority WhatsApp Text Message
  try {
    let messageBody = "";
    if (purpose === "login") {
      messageBody = `*${otp}* is your verification code for Pure Ayur Herbs. 🙏\n\nValid for 10 minutes. For your security, do not share this code with anyone.\n\n🌿 Pure Ayur Herbs - 100% Certified Ayurvedic Wellness`;
    } else if (purpose === "reset") {
      messageBody = `*${otp}* is your password reset code for Pure Ayur Herbs.\n\nValid for 10 minutes. If you did not request this, please ignore this message.`;
    } else {
      messageBody = `*${otp}* is your order verification code for Pure Ayur Herbs. 📦\n\nValid for 10 minutes. Please enter this code on the checkout screen to confirm your order.\n\n🌿 Pure Ayur Herbs - 100% Certified Ayurvedic Wellness`;
    }

    const textPayload = {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: cleanPhone,
      type: "text",
      text: {
        preview_url: false,
        body: messageBody,
      },
    };

    const textRes = await fetch(`https://graph.facebook.com/v20.0/${phoneId}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(textPayload),
    });

    const textData = await textRes.json();
    if (textRes.ok && textData.messages?.[0]?.id) {
      console.log(`[WhatsApp OTP Text Success] Sent to ${cleanPhone}: ${otp}`);
      return { success: true, messageId: textData.messages[0].id };
    }

    console.error("[WhatsApp OTP Text Error]:", textData);
    return {
      success: false,
      error: textData.error?.message || "Failed to deliver WhatsApp verification code.",
    };
  } catch (error: any) {
    console.error("[WhatsApp OTP Dispatch Error]:", error);
    return { success: false, error: error.message || "Failed to dispatch WhatsApp OTP." };
  }
}
