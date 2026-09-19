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
      let waVerify = await verifyOTP(cleanPhone, String(otp).trim(), "checkout");
      if (!waVerify.valid) {
        waVerify = await verifyOTP(cleanPhone, String(otp).trim(), "cod");
      }

      if (waVerify.valid) {
        const db = await readDB();
        const now = Date.now();
        db.verifiedPhones = (db.verifiedPhones || []).filter(
          (v: any) => v.phone !== cleanPhone && now < (v.expiresAt || 0)
        );
        db.verifiedPhones.push({
          phone: cleanPhone,
          verifiedAt: now,
          expiresAt: now + 30 * 60 * 1000, // 30 mins
        });
        await writeDB(db);

        return NextResponse.json({
          success: true,
          verified: true,
          phone: cleanPhone,
          message: "Order mobile number verified successfully via WhatsApp.",
        });
      }
    }

    // 2. Try verifying via email OTP (email)
    if (cleanEmail) {
      let emailVerify = await verifyOTP(cleanEmail, String(otp).trim(), "checkout");
      if (!emailVerify.valid) {
        emailVerify = await verifyOTP(cleanEmail, String(otp).trim(), "cod");
      }

      if (emailVerify.valid) {
        const db = await readDB();
        const now = Date.now();
        if (cleanPhone) {
          db.verifiedPhones = (db.verifiedPhones || []).filter(
            (v: any) => v.phone !== cleanPhone && now < (v.expiresAt || 0)
          );
          db.verifiedPhones.push({
            phone: cleanPhone,
            verifiedAt: now,
            expiresAt: now + 30 * 60 * 1000,
          });
          await writeDB(db);
        }

        return NextResponse.json({
          success: true,
          verified: true,
          phone: cleanPhone,
          message: "Order verified successfully.",
        });
      }

      // Legacy fallback check in db.orderOtps
      const db = await readDB();
      const legacyOtps = db.orderOtps || [];
      const record = legacyOtps.find((o: any) => o.email === cleanEmail);
      if (record && Date.now() <= record.expiresAt && record.otp === String(otp).trim()) {
        db.orderOtps = legacyOtps.filter((o: any) => o.email !== cleanEmail);
        const now = Date.now();
        if (cleanPhone) {
          db.verifiedPhones = (db.verifiedPhones || []).filter(
            (v: any) => v.phone !== cleanPhone && now < (v.expiresAt || 0)
          );
          db.verifiedPhones.push({
            phone: cleanPhone,
            verifiedAt: now,
            expiresAt: now + 30 * 60 * 1000,
          });
        }
        await writeDB(db);
        return NextResponse.json({
          success: true,
          verified: true,
          phone: cleanPhone,
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
