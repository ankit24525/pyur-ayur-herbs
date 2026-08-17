import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { phone, otp } = await request.json();

    if (!phone || !otp || otp.length !== 4) {
      return NextResponse.json(
        { success: false, error: "Invalid mobile number or 4-digit verification code." },
        { status: 400 }
      );
    }

    // Gokwik / Otpless style simulated OTP verification (Accepts any 4-digit code)
    return NextResponse.json({
      success: true,
      verified: true,
      message: "Mobile verification successful!",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
