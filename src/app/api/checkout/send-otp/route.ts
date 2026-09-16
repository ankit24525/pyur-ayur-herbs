import { NextResponse } from "next/server";
import { generateOTP, saveOTP, sendWhatsAppOTP } from "@/lib/whatsapp-otp";
import { sendOTPEmail } from "@/lib/email";

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

    const otp = generateOTP();

    // 1. Primary Channel: Send to WhatsApp if phone number provided
    if (cleanPhone && cleanPhone.length === 10) {
      await saveOTP(cleanPhone, otp, "cod", 10);
      if (cleanEmail) {
        await saveOTP(cleanEmail, otp, "cod", 10);
      }

      const waResult = await sendWhatsAppOTP(cleanPhone, otp, "cod");

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
