import { NextResponse } from "next/server";
import { checkCustomerFraudStatus } from "@/lib/fraud-prevention";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const phone = searchParams.get("phone") || "";

    const fraudStatus = await checkCustomerFraudStatus(phone);

    return NextResponse.json({
      success: true,
      phone: fraudStatus.phone,
      isCodBlocked: fraudStatus.isCodBlocked,
      codBlockReason: fraudStatus.codBlockReason,
      stats: fraudStatus.stats,
    });
  } catch (error: any) {
    console.error("[Checkout Eligibility API Error]:", error);
    return NextResponse.json(
      { success: false, isCodBlocked: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
