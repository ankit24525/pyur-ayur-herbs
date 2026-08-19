import { NextResponse } from "next/server";
import { readDB, writeDB } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const db = await readDB();
  return NextResponse.json({ settings: db.settings });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const db = await readDB();

    db.settings = {
      ...db.settings,
      storeName: body.storeName || db.settings.storeName,
      supportEmail: body.supportEmail || db.settings.supportEmail,
      whatsappNumber: body.whatsappNumber !== undefined ? body.whatsappNumber : db.settings.whatsappNumber,
      whatsappMessage: body.whatsappMessage !== undefined ? body.whatsappMessage : db.settings.whatsappMessage,
      codOtpEnabled: typeof body.codOtpEnabled === "boolean" ? body.codOtpEnabled : db.settings.codOtpEnabled,
      prepaidDiscount: typeof body.prepaidDiscount === "number" ? body.prepaidDiscount : db.settings.prepaidDiscount,
      taxRate: typeof body.taxRate === "number" ? body.taxRate : db.settings.taxRate,
    };

    await writeDB(db);

    return NextResponse.json({ success: true, settings: db.settings });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
