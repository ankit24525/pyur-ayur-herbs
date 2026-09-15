import { NextResponse } from "next/server";
import { readDB } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = (searchParams.get("email") || "").trim().toLowerCase();
    const phone = (searchParams.get("phone") || "").replace(/\D/g, "");
    const name = (searchParams.get("name") || "").trim().toLowerCase();
    const orderIdQuery = (searchParams.get("orderId") || "").trim().toLowerCase();

    if (!email && !phone && !name && !orderIdQuery) {
      return NextResponse.json({ success: false, error: "Email, phone number, customer name, or Order ID is required." }, { status: 400 });
    }

    const db = await readDB();
    const allOrders = db.orders || [];

    // Filter orders matching email, phone number, customer name, or order ID
    const userOrders = allOrders.filter((order) => {
      if (!order) return false;

      // 1. Order ID match
      if (orderIdQuery) {
        const cleanOrderQuery = orderIdQuery.replace(/\D/g, "");
        const idLower = String(order.id || "").trim().toLowerCase();
        const idNumeric = idLower.replace(/\D/g, "");
        const srOrder = String(order.shiprocketOrderId || "").trim().toLowerCase();
        const srShipment = String(order.shiprocketShipmentId || "").trim().toLowerCase();

        if (
          idLower === orderIdQuery ||
          idLower.includes(orderIdQuery) ||
          (cleanOrderQuery.length >= 4 && (idNumeric === cleanOrderQuery || idNumeric.includes(cleanOrderQuery))) ||
          srOrder === orderIdQuery ||
          srShipment === orderIdQuery
        ) {
          return true;
        }
      }

      // 2. Email match
      const orderEmail = (order.email || "").trim().toLowerCase();
      const matchEmail = email && orderEmail && (
        orderEmail === email ||
        orderEmail.includes(email) ||
        email.includes(orderEmail)
      );

      // 3. Phone number match
      const cleanUserPhone = phone.replace(/\D/g, "").slice(-10);
      const cleanOrderPhone = (order.phone || "").replace(/\D/g, "").slice(-10);
      const matchPhone = cleanUserPhone.length >= 5 && cleanOrderPhone.length >= 5 && (
        cleanUserPhone === cleanOrderPhone ||
        cleanOrderPhone.includes(cleanUserPhone) ||
        cleanUserPhone.includes(cleanOrderPhone)
      );

      // 4. Customer Name match (full name or first name)
      const orderCustomer = (order.customer || order.customerName || order.name || "").trim().toLowerCase();
      const userFirstName = name.split(" ")[0];
      const orderFirstName = orderCustomer.split(" ")[0];

      const matchName = name && name.length >= 3 && orderCustomer && (
        orderCustomer === name ||
        orderCustomer.includes(name) ||
        name.includes(orderCustomer) ||
        (userFirstName.length >= 3 && userFirstName === orderFirstName)
      );

      return Boolean(matchEmail || matchPhone || matchName);
    });

    // Sort orders by date/id descending (newest first)
    userOrders.reverse();

    // Calculate Pure Coins:
    // 1. Welcome Bonus = 100
    // 2. Earned from orders = 5% of order total
    let coinsBalance = 100;
    const transactions = [
      {
        id: "TX-WELCOME",
        type: "credit",
        amount: 100,
        description: "Welcome Bonus - Joined Pure Ayur Herbs",
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
