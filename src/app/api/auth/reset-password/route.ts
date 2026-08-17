import { NextResponse } from "next/server";
import { readDB, writeDB } from "@/lib/db";
import crypto from "crypto";

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, otp, newPassword } = body;

    if (!email || !otp || !newPassword) {
      return NextResponse.json({ success: false, error: "Email, OTP code, and new password are required." }, { status: 400 });
    }

    const db = readDB();
    
    // Verify OTP matches
    const otps = (db as any).otps || [];
    const otpIndex = otps.findIndex((o: any) => o.email.toLowerCase() === email.toLowerCase() && String(o.otp) === String(otp));
    
    if (otpIndex === -1) {
      return NextResponse.json({ success: false, error: "Invalid verification OTP code. Please request a new one." }, { status: 400 });
    }
    
    const otpRecord = otps[otpIndex];
    if (Date.now() > otpRecord.expiresAt) {
      // Clean up expired OTP
      (db as any).otps = otps.filter((_: any, idx: number) => idx !== otpIndex);
      writeDB(db);
      return NextResponse.json({ success: false, error: "OTP code has expired. Please request a new one." }, { status: 400 });
    }

    const users = db.users || [];
    const idx = users.findIndex((u) => u.email.toLowerCase() === email.toLowerCase());
    if (idx === -1) {
      return NextResponse.json({ success: false, error: "No account found with this email. Please Sign Up first!" }, { status: 400 });
    }

    // Reset password
    users[idx].passwordHash = hashPassword(newPassword);
    db.users = users;
    
    // Clean up OTP record
    (db as any).otps = otps.filter((_: any, idx: number) => idx !== otpIndex);
    
    writeDB(db);

    return NextResponse.json({ success: true, message: "Password updated successfully. You can now login!" });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
