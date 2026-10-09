import { NextResponse } from "next/server";
import { readDB, writeDB } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { partner } = body;

    if (partner !== "nimbuspost" && partner !== "shiprocket") {
      return NextResponse.json(
        { success: false, error: "Invalid partner. Must be 'nimbuspost' or 'shiprocket'." },
        { status: 400 }
      );
    }

    const db = await readDB();
    if (!db.settings) db.settings = {};
    db.settings.activeLogisticsPartner = partner;
    await writeDB(db);

    return NextResponse.json({
      success: true,
      partner,
      message: `Active logistics partner switched to ${partner === "nimbuspost" ? "NimbusPost (v2 API)" : "Shiprocket"}!`,
    });
  } catch (error: any) {
    console.error("[Logistics Toggle Error]:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
