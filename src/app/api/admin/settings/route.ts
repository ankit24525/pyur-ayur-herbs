import { NextResponse } from "next/server";
import { readDB, writeDB } from "@/lib/db";

export async function GET() {
  const db = readDB();
  return NextResponse.json({ settings: db.settings });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const db = readDB();

    db.settings = {
      storeName: body.storeName || db.settings.storeName,
      supportEmail: body.supportEmail || db.settings.supportEmail,
      codOtpEnabled: typeof body.codOtpEnabled === "boolean" ? body.codOtpEnabled : db.settings.codOtpEnabled,
      prepaidDiscount: typeof body.prepaidDiscount === "number" ? body.prepaidDiscount : db.settings.prepaidDiscount,
      taxRate: typeof body.taxRate === "number" ? body.taxRate : db.settings.taxRate,
    };

    writeDB(db);

    return NextResponse.json({ success: true, settings: db.settings });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
