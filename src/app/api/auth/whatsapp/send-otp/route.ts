import { NextResponse } from "next/server";
import { generateOTP, saveOTP, sendWhatsAppOTP } from "@/lib/whatsapp-otp";
import { getClientIp, checkRateLimit, rateLimitResponse } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { phone } = body;

    if (!phone) {
      return NextResponse.json(
        { success: false, error: "Please enter your mobile phone number." },
        { status: 400 }
      );
    }

    const clean = phone.replace(/\D/g, "").slice(-10);
    if (clean.length !== 10) {
      return NextResponse.json(
        { success: false, error: "Please provide a valid 10-digit mobile number." },
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
    const phoneCheck = checkRateLimit(`otp:phone:${clean}`, 3, 600, 30);
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

    const otp = generateOTP();
    await saveOTP(clean, otp, "login", 10);

    const dispatchResult = await sendWhatsAppOTP(clean, otp, "login");

    if (!dispatchResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: dispatchResult.error || "Failed to deliver WhatsApp verification code.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `A 6-digit verification code has been sent to WhatsApp on +91 ${clean}`,
      phone: clean,
    });
  } catch (error: any) {
    console.error("[Auth/WhatsApp/SendOTP]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
