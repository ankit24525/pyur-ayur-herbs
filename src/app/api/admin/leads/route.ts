import { NextResponse } from "next/server";
import { readDB, writeDB, invalidateDBCache } from "@/lib/db";

export const dynamic = "force-dynamic";

const NO_CACHE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0, s-maxage=0",
  "Pragma": "no-cache",
  "Expires": "0",
};

export async function GET() {
  const db = await readDB(true);
  return NextResponse.json(
    { leads: db.leads || [] },
    { headers: NO_CACHE_HEADERS }
  );
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Lead ID required for deletion." },
        { status: 400, headers: NO_CACHE_HEADERS }
      );
    }

    const db = await readDB(true);
    const leads = Array.isArray(db.leads) ? db.leads : [];

    const targetStr = String(id).trim();
    db.leads = leads.filter((l: any) => {
      const match =
        (l.id && String(l.id).trim() === targetStr) ||
        (l._id && String(l._id).trim() === targetStr) ||
        (l.waMessageId && String(l.waMessageId).trim() === targetStr) ||
        (l.phone && String(l.phone).trim() === targetStr);
      return !match;
    });

    const success = await writeDB(db);
    invalidateDBCache();

    if (!success) {
      return NextResponse.json(
        { success: false, error: "Failed to persist deletion to database." },
        { status: 500, headers: NO_CACHE_HEADERS }
      );
    }

    return NextResponse.json(
      { success: true, message: "Lead deleted successfully", leads: db.leads },
      { headers: NO_CACHE_HEADERS }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Internal Server Error" },
      { status: 500, headers: NO_CACHE_HEADERS }
    );
  }
}
