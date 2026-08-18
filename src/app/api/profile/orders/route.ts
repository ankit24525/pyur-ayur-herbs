import { NextResponse } from "next/server";
import { readDB } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const phone = searchParams.get("phone") || "";

    if (!phone) {
      return NextResponse.json({ success: false, error: "Phone number is required." }, { status: 400 });
    }

    const db = await readDB();
    const allOrders = db.orders || [];

    // Filter orders matching the phone number
    const normalizedPhone = phone.trim().replace(/\s+/g, "");
    const userOrders = allOrders.filter((order) => {
      const orderPhone = (order.phone || "").trim().replace(/\s+/g, "");
      return orderPhone === normalizedPhone || orderPhone.includes(normalizedPhone) || normalizedPhone.includes(orderPhone);
    });

    // Sort orders by date/id descending (newest first)
    userOrders.reverse();

    // Calculate Pyur Coins:
    // 1. Welcome Bonus = 100
    // 2. Earned from orders = 5% of order total
    let coinsBalance = 100;
    const transactions = [
      {
        id: "TX-WELCOME",
        type: "credit",
        amount: 100,
        description: "Welcome Bonus - Joined Pyur Ayur Herbs",
        date: "Joined Date",
      },
    ];

    userOrders.forEach((order) => {
      const earned = Math.round(order.total * 0.05) || 10; // minimum 10 coins per order
      coinsBalance += earned;
      transactions.push({
        id: `TX-${order.id}`,
        type: "credit",
        amount: earned,
        description: `Coins earned from Order #${order.id}`,
        date: order.date || "Order Date",
      });
    });

    // Return newest transactions first
    transactions.reverse();

    return NextResponse.json({
      success: true,
      orders: userOrders,
      coinsBalance,
      transactions,
    });
  } catch (error) {
    console.error("[Profile Orders API] Error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
