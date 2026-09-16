import { NextResponse } from "next/server";
import { readDB, writeDB } from "@/lib/db";
import { verifyOTP } from "@/lib/whatsapp-otp";
import crypto from "crypto";

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, phone, identifier, otp, newPassword } = body;
    const target = (identifier || phone || email || "").trim();

    if (!target || !otp || !newPassword) {
      return NextResponse.json(
        { success: false, error: "Mobile number/email, OTP code, and new password are required." },
        { status: 400 }
      );
    }

    // Server-side password strength check
    if (
      newPassword.length < 8 ||
      !/[A-Z]/.test(newPassword) ||
      !/[a-z]/.test(newPassword) ||
      !/[0-9]/.test(newPassword) ||
      !/[!@#$%^&*(),.?\":{}|<>]/.test(newPassword)
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Password must be at least 8 characters and contain uppercase, lowercase, numbers, and special characters.",
        },
        { status: 400 }
      );
    }

    const isPhone = !target.includes("@") && target.replace(/\D/g, "").length >= 10;
    const db = await readDB();
    const users = db.users || [];

    let userIndex = -1;

    if (isPhone) {
      const cleanPhone = target.replace(/\D/g, "").slice(-10);
      // 1. Verify WhatsApp OTP
      const verification = await verifyOTP(cleanPhone, String(otp).trim(), "reset");
      if (!verification.valid) {
        return NextResponse.json(
          { success: false, error: verification.error || "Invalid verification code." },
          { status: 400 }
        );
      }

      userIndex = users.findIndex((u: any) => {
        const uPhone = (u.phone || "").replace(/\D/g, "").slice(-10);
        return uPhone === cleanPhone;
      });
    } else {
      // 2. Verify Email OTP
      const otps = (db as any).otps || [];
      const otpIndex = otps.findIndex(
        (o: any) =>
          (o.email?.toLowerCase() === target.toLowerCase() || o.identifier?.toLowerCase() === target.toLowerCase()) &&
          String(o.otp).trim() === String(otp).trim()
      );

      if (otpIndex === -1) {
        return NextResponse.json(
          { success: false, error: "Invalid verification code. Please request a new one." },
          { status: 400 }
        );
      }

      const otpRecord = otps[otpIndex];
      if (Date.now() > otpRecord.expiresAt) {
        (db as any).otps = otps.filter((_: any, idx: number) => idx !== otpIndex);
        await writeDB(db);
        return NextResponse.json(
          { success: false, error: "Verification code has expired. Please request a new one." },
          { status: 400 }
        );
      }

      // Burn OTP
      (db as any).otps = otps.filter((_: any, idx: number) => idx !== otpIndex);
      userIndex = users.findIndex((u: any) => u.email?.toLowerCase() === target.toLowerCase());
    }

    if (userIndex === -1) {
      return NextResponse.json(
        { success: false, error: "No account found with this credential." },
        { status: 400 }
      );
    }

    // Update password
    users[userIndex].passwordHash = hashPassword(newPassword);
    db.users = users;
    await writeDB(db);

    return NextResponse.json({
      success: true,
      message: "Password updated successfully! You can now log in.",
    });
  } catch (error: any) {
    console.error("[Auth/ResetPassword Error]:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
