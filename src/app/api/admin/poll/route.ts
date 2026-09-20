import { NextResponse } from "next/server";
import { readDB } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const db = await readDB();
    const orders = Array.isArray(db.orders) ? db.orders : [];
    const latestOrder = orders.length > 0 ? orders[orders.length - 1] : null;

    return NextResponse.json(
      {
        ordersCount: orders.length,
        latestOrderId: latestOrder?.id || null,
        latestOrderCustomer: latestOrder?.customer || null,
        latestOrderTotal: latestOrder?.total || null,
        timestamp: Date.now(),
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0, s-maxage=0",
          "Pragma": "no-cache",
          "Expires": "0",
        },
      }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Poll error" },
      { status: 500 }
    );
  }
}
