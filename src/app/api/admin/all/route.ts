import { NextResponse } from "next/server";
import { readDB, writeDB } from "@/lib/db";

export async function GET() {
  try {
    const db = readDB();
    return NextResponse.json(db);
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, key, value, data } = body;
    const db = readDB();

    if (action === "updateKey" && key && value) {
      (db as any)[key] = value;
      writeDB(db);
      return NextResponse.json({ success: true, message: `${key} updated successfully.` });
    }

    if (action === "saveSettings" && data) {
      db.settings = { ...db.settings, ...data };
      writeDB(db);
      return NextResponse.json({ success: true, settings: db.settings });
    }

    if (action === "saveSeo" && data) {
      db.seo = { ...db.seo, ...data };
      writeDB(db);
      return NextResponse.json({ success: true, seo: db.seo });
    }

    if (action === "updateOrder" && body.orderId && body.newStatus) {
      const idx = db.orders.findIndex((o) => o.id === body.orderId);
      if (idx !== -1) {
        db.orders[idx].status = body.newStatus;
        writeDB(db);
        return NextResponse.json({ success: true });
      }
    }

    return NextResponse.json({ success: false, error: "Invalid action parameters." }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
