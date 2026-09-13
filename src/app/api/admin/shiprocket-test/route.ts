import { NextResponse } from "next/server";
import { getShiprocketToken } from "@/lib/shiprocket";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Please provide both Shiprocket account Email and Password." },
        { status: 400 }
      );
    }

    const token = await getShiprocketToken(email, password);

    if (token) {
      return NextResponse.json({
        success: true,
        message: "Successfully connected to Shiprocket Direct API!",
        tokenReceived: true,
      });
    } else {
      return NextResponse.json(
        { success: false, error: "Shiprocket Authentication Failed. Check your email and password." },
        { status: 401 }
      );
    }
  } catch (error: any) {
    console.error("[Shiprocket Test API Error]:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
