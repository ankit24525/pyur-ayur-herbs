import { NextResponse } from "next/server";
import { readDB, writeDB } from "@/lib/db";
import { cancelOrderOnShiprocket } from "@/lib/shiprocket";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const NO_CACHE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0, s-maxage=0",
  "Pragma": "no-cache",
  "Expires": "0",
  "Surrogate-Control": "no-store",
};

export async function GET() {
  try {
    // Always bypass cache for admin dashboard to ensure 100% fresh data
    const db = await readDB(true);
    const hasMongoUri = Boolean(process.env.MONGODB_URI);
    return NextResponse.json(
      {
        ...db,
        _dbStatus: {
          mongoConfigured: hasMongoUri,
          dbName: process.env.MONGODB_DB || "pure_ayur_herbs",
        },
      },
      {
        headers: NO_CACHE_HEADERS,
      }
    );
  } catch (error: any) {
    console.error("[GET /api/admin/all Error]:", error);
    return NextResponse.json(
      { error: error?.message || "Internal Server Error" },
      { status: 500, headers: NO_CACHE_HEADERS }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch((err) => {
      console.error("[/api/admin/all JSON Parse Error]:", err);
      return null;
    });

    if (!body) {
      return NextResponse.json(
        { success: false, error: "Invalid JSON body or payload exceeded size limit." },
        { status: 400, headers: NO_CACHE_HEADERS }
      );
    }

    const { action, key, value, data } = body;
    // Always read fresh from database when performing an admin mutation
    const db = await readDB(true);

    if (action === "updateKey" && key && value !== undefined) {
      (db as any)[key] = value;
      const success = await writeDB(db);
      if (!success) {
        return NextResponse.json(
          { success: false, error: "Database write failed." },
          { status: 500, headers: NO_CACHE_HEADERS }
        );
      }
      try {
        revalidatePath("/", "layout");
      } catch {}
      return NextResponse.json(
        { success: true, message: `${key} updated successfully.`, data: value },
        { headers: NO_CACHE_HEADERS }
      );
    }

    if (action === "saveSettings" && data) {
      db.settings = { ...db.settings, ...data };
      const success = await writeDB(db);
      if (!success) {
        return NextResponse.json(
          { success: false, error: "Database write failed." },
          { status: 500, headers: NO_CACHE_HEADERS }
        );
      }
      try {
        revalidatePath("/", "layout");
      } catch {}
      return NextResponse.json(
        { success: true, settings: db.settings },
        { headers: NO_CACHE_HEADERS }
      );
    }

    if (action === "saveSeo" && data) {
      db.seo = { ...db.seo, ...data };
      const success = await writeDB(db);
      if (!success) {
        return NextResponse.json(
          { success: false, error: "Database write failed." },
          { status: 500, headers: NO_CACHE_HEADERS }
        );
      }
      try {
        revalidatePath("/", "layout");
      } catch {}
      return NextResponse.json(
        { success: true, seo: db.seo },
        { headers: NO_CACHE_HEADERS }
      );
    }

    if (action === "updateOrder" && body.orderId && body.newStatus) {
      const idx = db.orders.findIndex((o) => o.id === body.orderId);
      if (idx !== -1) {
        db.orders[idx].status = body.newStatus;
        if (body.newStatus === "Cancelled") {
          db.orders[idx].cancellationReason = body.cancellationReason || "Cancelled by Admin";
          db.orders[idx].cancelledBy = "Admin";
          db.orders[idx].cancellationDate = new Date().toISOString();
          try {
            await cancelOrderOnShiprocket(db.orders[idx], db);
          } catch (srErr) {
            console.error("[Admin Update Order Shiprocket Cancel Error]:", srErr);
          }
        }
        const success = await writeDB(db);
        if (!success) {
          return NextResponse.json({ success: false, error: "Database write failed." }, { status: 500, headers: NO_CACHE_HEADERS });
        }
        return NextResponse.json({ success: true }, { headers: NO_CACHE_HEADERS });
      }
    }

    return NextResponse.json({ success: false, error: "Invalid action parameters." }, { status: 400, headers: NO_CACHE_HEADERS });
  } catch (error: any) {
    console.error("[POST /api/admin/all Error]:", error?.message || error);
    return NextResponse.json({ success: false, error: error?.message || "Internal Server Error" }, { status: 500, headers: NO_CACHE_HEADERS });
  }
}
