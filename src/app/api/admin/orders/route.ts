import { NextResponse } from "next/server";
import { readDB, writeDB } from "@/lib/db";

export async function GET() {
  const db = await readDB();
  return NextResponse.json({ orders: db.orders });
}

export async function POST(request: Request) {
  try {
    const { orderId, newStatus } = await request.json();
    const db = await readDB();

    const orderIndex = db.orders.findIndex((o) => o.id === orderId);
    if (orderIndex === -1) {
      return NextResponse.json({ success: false, error: "Order not found." }, { status: 404 });
    }

    db.orders[orderIndex].status = newStatus;
    await writeDB(db);

    return NextResponse.json({ success: true, message: "Order status updated successfully!" });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
