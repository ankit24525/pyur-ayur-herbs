import { NextResponse } from "next/server";
import { readDB, writeDB } from "@/lib/db";
import { sendOTPEmail } from "@/lib/email";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ success: false, error: "Email is required." }, { status: 400 });
    }

    const db = readDB();
    const users = db.users || [];

    // Verify user exists (If unregistered user tries to reset, prevent it!)
    const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      return NextResponse.json({ success: false, error: "No account found with this email. Please Sign Up first!" }, { status: 400 });
    }

    // Generate random 6-digit OTP code
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes from now

    // Save/update OTP entry
    const otps = ((db as any).otps || []).filter(
      (o: any) => o.email.toLowerCase() !== email.toLowerCase()
    );
    (db as any).otps = [...otps, { email, otp, expiresAt }];
    writeDB(db);

    // In a production environment, send email here. In this demo, we output it in the response and log it!
    console.log(`[AUTH SERVICE] Password reset OTP for ${email}: ${otp}`);

    // Try sending email via SMTP
    const emailSent = await sendOTPEmail(email, otp);

    return NextResponse.json({
      success: true,
      message: emailSent
        ? "Verification code has been sent to your email box!"
        : `Verification code sent! Use code: ${otp} (SMTP credentials missing in .env.local; code printed here for testing)`,
      otp
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
