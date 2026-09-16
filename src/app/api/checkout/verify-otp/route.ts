import { NextResponse } from "next/server";
import { verifyOTP } from "@/lib/whatsapp-otp";
import { readDB, writeDB } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const { phone, email, otp } = await request.json();

    if (!otp) {
      return NextResponse.json(
        { success: false, error: "Verification code is required." },
        { status: 400 }
      );
    }

    const cleanPhone = phone ? phone.replace(/\D/g, "").slice(-10) : "";
    const cleanEmail = email && email.includes("@") ? email.trim() : "";

    if (!cleanPhone && !cleanEmail) {
      return NextResponse.json(
        { success: false, error: "Mobile number or email is required." },
        { status: 400 }
      );
    }

    // 1. Try verifying via WhatsApp OTP (phone)
    if (cleanPhone) {
      const waVerify = await verifyOTP(cleanPhone, String(otp).trim(), "cod");
      if (waVerify.valid) {
        return NextResponse.json({
          success: true,
          verified: true,
          message: "Order mobile number verified successfully via WhatsApp.",
        });
      }
    }

    // 2. Try verifying via email OTP (email)
    if (cleanEmail) {
      const emailVerify = await verifyOTP(cleanEmail, String(otp).trim(), "cod");
      if (emailVerify.valid) {
        return NextResponse.json({
          success: true,
          verified: true,
          message: "Order verified successfully.",
        });
      }

      // Legacy fallback check in db.orderOtps
      const db = await readDB();
      const legacyOtps = db.orderOtps || [];
      const record = legacyOtps.find((o: any) => o.email === cleanEmail);
      if (record && Date.now() <= record.expiresAt && record.otp === String(otp).trim()) {
        db.orderOtps = legacyOtps.filter((o: any) => o.email !== cleanEmail);
        await writeDB(db);
        return NextResponse.json({
          success: true,
          verified: true,
          message: "Order verified successfully.",
        });
      }
    }

    return NextResponse.json(
      { success: false, error: "Incorrect or expired verification code. Please try again." },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("[Checkout Verify OTP Error]:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
