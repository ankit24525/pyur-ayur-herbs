import { NextResponse } from "next/server";
import { readDB, writeDB } from "@/lib/db";
import { sendOTPEmail } from "@/lib/email";
import { generateOTP, saveOTP, sendWhatsAppOTP } from "@/lib/whatsapp-otp";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, phone, identifier } = body;
    const target = (identifier || phone || email || "").trim();

    if (!target) {
      return NextResponse.json(
        { success: false, error: "Please provide your registered mobile number or email." },
        { status: 400 }
      );
    }

    const isPhone = !target.includes("@") && target.replace(/\D/g, "").length >= 10;
    const db = await readDB();
    const users = db.users || [];

    let user: any = null;
    let cleanPhone = "";

    if (isPhone) {
      cleanPhone = target.replace(/\D/g, "").slice(-10);
      user = users.find((u: any) => {
        const uPhone = (u.phone || "").replace(/\D/g, "").slice(-10);
        return uPhone === cleanPhone;
      });
    } else {
      user = users.find((u: any) => u.email?.toLowerCase() === target.toLowerCase());
    }

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: isPhone
            ? "No account found with this mobile number. Please sign up or check the number."
            : "No account found with this email address. Please sign up first.",
        },
        { status: 400 }
      );
    }

    const otp = generateOTP();

    if (isPhone) {
      // 1. Send via WhatsApp OTP
      await saveOTP(cleanPhone, otp, "reset", 10);
      const waResult = await sendWhatsAppOTP(cleanPhone, otp, "reset");

      if (!waResult.success) {
        return NextResponse.json(
          {
            success: false,
            error: waResult.error || "Failed to deliver WhatsApp verification code.",
          },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        channel: "whatsapp",
        message: `A 6-digit password reset code has been sent to WhatsApp on +91 ${cleanPhone}`,
        identifier: cleanPhone,
      });
    } else {
      // 2. Send via Email OTP
      const expiresAt = Date.now() + 10 * 60 * 1000;
      const otps = ((db as any).otps || []).filter(
        (o: any) => o.email?.toLowerCase() !== target.toLowerCase()
      );
      (db as any).otps = [...otps, { email: target, otp, expiresAt, purpose: "reset" }];
      await writeDB(db);

      const emailSent = await sendOTPEmail(target, otp);

      return NextResponse.json({
        success: true,
        channel: "email",
        message: emailSent
          ? "Verification code has been sent to your email inbox!"
          : `Verification code generated! Use code: ${otp}`,
        identifier: target,
        otp: process.env.NODE_ENV !== "production" ? otp : undefined,
      });
    }
  } catch (error: any) {
    console.error("[Auth/ForgotPassword Error]:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
