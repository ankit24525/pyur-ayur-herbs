import { NextResponse } from "next/server";
import { readDB, writeDB } from "@/lib/db";
import { sendOrderConfirmationWhatsApp } from "@/lib/whatsapp-notifications";
import { cancelOrderOnShiprocket } from "@/lib/shiprocket";

export const dynamic = "force-dynamic";

export async function GET() {
  const db = await readDB(true);
  return NextResponse.json(
    { orders: db.orders || [] },
    {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0, s-maxage=0",
        "Pragma": "no-cache",
        "Expires": "0",
      },
    }
  );
}

export async function POST(request: Request) {
  try {
    const { orderId, newStatus } = await request.json();
    const db = await readDB();

    const orderIndex = db.orders.findIndex((o) => o.id === orderId);
    if (orderIndex === -1) {
      return NextResponse.json({ success: false, error: "Order not found." }, { status: 404 });
    }

    const prevStatus = db.orders[orderIndex].status;
    db.orders[orderIndex].status = newStatus;

    if (newStatus === "Cancelled") {
      db.orders[orderIndex].cancellationReason = "Cancelled by Admin";
      db.orders[orderIndex].cancelledBy = "Admin";
      db.orders[orderIndex].cancellationDate = new Date().toISOString();
      try {
        await cancelOrderOnShiprocket(db.orders[orderIndex], db);
      } catch (srErr) {
        console.error("[Admin Orders Route Shiprocket Cancel Error]:", srErr);
      }
    }

    await writeDB(db);

    // If status changed to Confirmed, send WhatsApp Order Confirmation to customer
    if (newStatus === "Confirmed" && prevStatus !== "Confirmed") {
      try {
        await sendOrderConfirmationWhatsApp(db.orders[orderIndex]);
      } catch (waErr) {
        console.error("[Admin Order Confirmation WhatsApp Error]:", waErr);
      }
    }

    return NextResponse.json({ success: true, message: "Order status updated successfully!" });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
