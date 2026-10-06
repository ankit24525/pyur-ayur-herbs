import { NextResponse } from "next/server";
import { generateOTP, saveOTP, sendWhatsAppOTP } from "@/lib/whatsapp-otp";
import { sendOTPEmail } from "@/lib/email";
import { getClientIp, checkRateLimit, rateLimitResponse } from "@/lib/rate-limit";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { phone, email } = body;

    const cleanPhone = phone ? phone.replace(/\D/g, "").slice(-10) : "";
    const cleanEmail = email && email.includes("@") ? email.trim() : "";

    if (!cleanPhone && !cleanEmail) {
      return NextResponse.json(
        { success: false, error: "A valid mobile phone number or email is required." },
        { status: 400 }
      );
    }

    // Rate Limiting Protection
    const clientIp = getClientIp(request);

    // 1. IP Limit: Max 10 OTP requests per 10 minutes per IP
    const ipCheck = checkRateLimit(`otp:ip:${clientIp}`, 10, 600);
    if (!ipCheck.allowed) {
      return rateLimitResponse(
        ipCheck.retryAfterSeconds,
        "Too many verification requests from this device. Please wait a few minutes."
      );
    }

    // 2. Phone Limit: Max 3 OTP requests per 10 minutes, with 30s cooldown between attempts
    if (cleanPhone) {
      const phoneCheck = checkRateLimit(`otp:phone:${cleanPhone}`, 3, 600, 30);
      if (!phoneCheck.allowed) {
        if (phoneCheck.cooldownRemainingSeconds) {
          return rateLimitResponse(
            phoneCheck.cooldownRemainingSeconds,
            `Please wait ${phoneCheck.cooldownRemainingSeconds} seconds before requesting another code.`
          );
        }
        return rateLimitResponse(
          phoneCheck.retryAfterSeconds,
          "Maximum verification attempts reached for this phone number. Please try again in 10 minutes."
        );
      }
    }

    const otp = generateOTP();

    // 1. Primary Channel: Send to WhatsApp if phone number provided
    if (cleanPhone && cleanPhone.length === 10) {
      await saveOTP(cleanPhone, otp, "checkout", 10);
      if (cleanEmail) {
        await saveOTP(cleanEmail, otp, "checkout", 10);
      }

      const waResult = await sendWhatsAppOTP(cleanPhone, otp, "checkout");

      // Also fire email in parallel if email is provided
      if (cleanEmail) {
        void sendOTPEmail(cleanEmail, otp).catch(() => {});
      }

      if (waResult.success) {
        return NextResponse.json({
          success: true,
          channel: "whatsapp",
          message: `A 6-digit verification code has been sent to your WhatsApp on +91 ${cleanPhone}`,
          phone: cleanPhone,
        });
      }

      console.warn("[Checkout Send OTP] WhatsApp dispatch failed, attempting email fallback:", waResult.error);
    }

    // 2. Fallback Channel: Send via Email if WhatsApp is unavailable or no phone was provided
    if (cleanEmail) {
      await saveOTP(cleanEmail, otp, "cod", 10);
      const emailSent = await sendOTPEmail(cleanEmail, otp);

      return NextResponse.json({
        success: true,
        channel: "email",
        message: emailSent
          ? `A 6-digit verification code has been sent to ${cleanEmail}`
          : `Verification code generated: ${otp}`,
        email: cleanEmail,
      });
    }

    return NextResponse.json(
      { success: false, error: "Unable to dispatch verification code. Please check your phone number." },
      { status: 500 }
    );
  } catch (error: any) {
    console.error("[Checkout Send OTP Error]:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
