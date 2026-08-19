import { NextResponse } from "next/server";
import { readDB, writeDB } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const db = await readDB();
    return NextResponse.json(db);
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, key, value, data } = body;
    const db = await readDB();

    if (action === "updateKey" && key && value) {
      (db as any)[key] = value;
      const success = await writeDB(db);
      if (!success) {
        return NextResponse.json({ success: false, error: "Database write failed." }, { status: 500 });
      }
      return NextResponse.json({ success: true, message: `${key} updated successfully.` });
    }

    if (action === "saveSettings" && data) {
      db.settings = { ...db.settings, ...data };
      const success = await writeDB(db);
      if (!success) {
        return NextResponse.json({ success: false, error: "Database write failed." }, { status: 500 });
      }
      return NextResponse.json({ success: true, settings: db.settings });
    }

    if (action === "saveSeo" && data) {
      db.seo = { ...db.seo, ...data };
      const success = await writeDB(db);
      if (!success) {
        return NextResponse.json({ success: false, error: "Database write failed." }, { status: 500 });
      }
      return NextResponse.json({ success: true, seo: db.seo });
    }

    if (action === "updateOrder" && body.orderId && body.newStatus) {
      const idx = db.orders.findIndex((o) => o.id === body.orderId);
      if (idx !== -1) {
        db.orders[idx].status = body.newStatus;
        const success = await writeDB(db);
        if (!success) {
          return NextResponse.json({ success: false, error: "Database write failed." }, { status: 500 });
        }
        return NextResponse.json({ success: true });
      }
    }

    return NextResponse.json({ success: false, error: "Invalid action parameters." }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
