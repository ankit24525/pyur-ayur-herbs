import { NextResponse } from "next/server";
import { readDB, writeDB } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const { email, otp } = await request.json();

    if (!email || !otp) {
      return NextResponse.json({ success: false, error: "Email and OTP are required." }, { status: 400 });
    }

    const db = await readDB();
    const orderOtps = db.orderOtps || [];

    const record = orderOtps.find((o: any) => o.email === email);

    if (!record) {
      return NextResponse.json({ success: false, error: "No verification code was found for this email. Please request a new code." }, { status: 400 });
    }

    // Check expiry
    if (Date.now() > record.expiresAt) {
      // Remove expired OTP
      db.orderOtps = orderOtps.filter((o: any) => o.email !== email);
      await writeDB(db);
      return NextResponse.json({ success: false, error: "Your verification code has expired. Please request a new one." }, { status: 400 });
    }

    // Check if OTP matches
    if (record.otp !== String(otp)) {
      return NextResponse.json({ success: false, error: "Incorrect verification code. Please try again." }, { status: 400 });
    }

    // OTP is valid — remove it so it can't be reused
    db.orderOtps = orderOtps.filter((o: any) => o.email !== email);
    await writeDB(db);

    return NextResponse.json({
      success: true,
      verified: true,
      message: "Email verified successfully.",
    });
  } catch (error) {
    console.error("[Checkout Verify OTP] Error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
