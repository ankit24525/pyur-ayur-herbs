import { NextResponse } from "next/server";
import { readDB, writeDB } from "@/lib/db";
import { sendOTPEmail } from "@/lib/email";

function generateOTP(): string {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email || !email.includes("@")) {
      return NextResponse.json({ success: false, error: "A valid email address is required." }, { status: 400 });
    }

    const otp = generateOTP();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes expiry

    // Save OTP to database
    const db = await readDB();
    if (!db.orderOtps) db.orderOtps = [];

    // Remove any existing OTPs for this email
    db.orderOtps = db.orderOtps.filter((o: any) => o.email !== email);

    db.orderOtps.push({ email, otp, expiresAt });
    await writeDB(db);

    // Send OTP via email using Resend
    const sent = await sendOrderOTPEmail(email, otp);

    if (!sent) {
      // Fallback: return the OTP in the response for local testing if SMTP is not configured
      return NextResponse.json({
        success: true,
        message: `Verification code sent to ${email}`,
        // Only shown if email fails (dev mode fallback)
        fallbackCode: process.env.NODE_ENV !== "production" ? otp : undefined,
      });
    }

    return NextResponse.json({
      success: true,
      message: `A 4-digit verification code has been sent to ${email}`,
    });
  } catch (error) {
    console.error("[Checkout Send OTP] Error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}

async function sendOrderOTPEmail(toEmail: string, otp: string): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY || "";
  const fromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";

  if (!apiKey) {
    console.warn(`[ORDER OTP] RESEND_API_KEY missing. OTP for ${toEmail}: ${otp}`);
    return false;
  }

  try {
    const { Resend } = await import("resend");
    const resend = new Resend(apiKey);

    const { error } = await resend.emails.send({
      from: `Pyur Ayur Herbs <${fromEmail}>`,
      to: toEmail,
      subject: "Your Order Verification Code - Pyur Ayur Herbs",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddddd9; border-radius: 12px; background-color: #ffffff;">
          <h2 style="color: #244f31; text-align: center; text-transform: uppercase; margin-bottom: 5px;">Pyur Ayur Herbs</h2>
          <p style="text-align: center; font-size: 11px; color: #666666; margin-top: 0; margin-bottom: 20px;">100% Certified Ministry of AYUSH Wellness</p>
          <hr style="border: 0; border-top: 1px solid #ddddd9; margin: 20px 0;" />
          <p>Hello,</p>
          <p>You are placing a <strong>Cash on Delivery (COD)</strong> order with us. To confirm your order, please use the following 4-digit verification code:</p>
          <div style="text-align: center; padding: 20px; margin: 20px 0; background-color: #f8faf1; border-radius: 8px; border: 1px dashed #244f31;">
            <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #244f31; font-family: monospace;">${otp}</span>
          </div>
          <p style="font-size: 12px; color: #444;">This code is valid for <strong>10 minutes</strong>. Please do not share it with anyone.</p>
          <p style="font-size: 11px; color: #666666;">If you did not place this order, please ignore this email and contact our support team.</p>
          <hr style="border: 0; border-top: 1px solid #ddddd9; margin: 20px 0;" />
          <p style="font-size: 10px; text-align: center; color: #999999;">© ${new Date().getFullYear()} Pyur Ayur Herbs Store. India.</p>
        </div>
      `,
    });

    if (error) {
      console.error("[ORDER OTP] Resend SDK error:", error);
      return false;
    }

    console.log(`[ORDER OTP] Verification email sent successfully to ${toEmail}`);
    return true;
  } catch (e) {
    console.error("[ORDER OTP] Error sending email:", e);
    return false;
  }
}
