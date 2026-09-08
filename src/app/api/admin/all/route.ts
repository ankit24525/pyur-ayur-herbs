import { NextResponse } from "next/server";
import { readDB, writeDB } from "@/lib/db";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET() {
  try {
    const db = await readDB();
    const hasMongoUri = Boolean(process.env.MONGODB_URI);
    return NextResponse.json({
      ...db,
      _dbStatus: {
        mongoConfigured: hasMongoUri,
        dbName: process.env.MONGODB_DB || "pure_ayur_herbs",
      },
    });
  } catch (error: any) {
    console.error("[GET /api/admin/all Error]:", error);
    return NextResponse.json({ error: error?.message || "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch((err) => {
      console.error("[/api/admin/all JSON Parse Error]:", err);
      return null;
    });

    if (!body) {
      return NextResponse.json({ success: false, error: "Invalid JSON body or payload exceeded size limit." }, { status: 400 });
    }

    const { action, key, value, data } = body;
    const db = await readDB();

    if (action === "updateKey" && key && value !== undefined) {
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
  } catch (error: any) {
    console.error("[POST /api/admin/all Error]:", error?.message || error);
    return NextResponse.json({ success: false, error: error?.message || "Internal Server Error" }, { status: 500 });
  }
}
