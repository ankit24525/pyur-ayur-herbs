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

    // Filter orders strictly matching verified phone number, email, or order ID
    const cleanUserPhone = phone.replace(/\D/g, "").slice(-10);
    const cleanEmail = email.includes("@pureayurherbs.com") ? "" : email;

    const userOrders = allOrders.filter((order) => {
      if (!order) return false;

      // 1. Order ID match (from order search query)
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

      // 2. Verified Phone number match (exact 10-digit match)
      const cleanOrderPhone = (order.phone || "").replace(/\D/g, "").slice(-10);
      const matchPhone = cleanUserPhone.length === 10 && cleanOrderPhone === cleanUserPhone;

      // 3. Verified Email match (exact match, excluding synthetic placeholder emails)
      const orderEmail = (order.email || "").trim().toLowerCase();
      const matchEmail = Boolean(cleanEmail && orderEmail && orderEmail === cleanEmail);

      return Boolean(matchPhone || matchEmail);
    });

    // Sort orders by date/id descending (newest first)
    userOrders.reverse();

    // Calculate Pure Coins using live store settings:
    const coinsSettings = db.settings?.coinsSettings || {
      enabled: true,
      coinsPerRupee: 10,
      maxRedemptionPercent: 20,
      minCoinsToRedeem: 10,
      welcomeBonus: 100,
      orderRewardPercent: 5,
    };
    const welcomeBonus = Number(coinsSettings.welcomeBonus) ?? 100;
    const rewardPercent = (Number(coinsSettings.orderRewardPercent) || 5) / 100;
    const coinsPerRupee = Number(coinsSettings.coinsPerRupee) || 10;

    let coinsBalance = welcomeBonus;
    const transactions = [
      {
        id: "TX-WELCOME",
        type: "credit",
        amount: welcomeBonus,
        description: "Welcome Bonus - Joined Pure Ayur Herbs",
        date: "Joined Date",
      },
    ];

    userOrders.forEach((order) => {
      const earned = Math.round((order.total || 0) * rewardPercent) || 10;
      coinsBalance += earned;
      transactions.push({
        id: `TX-${order.id}`,
        type: "credit",
        amount: earned,
        description: `Coins earned from Order #${order.id}`,
        date: order.date || "Order Date",
      });

      if (order.coinsRedeemed && Number(order.coinsRedeemed) > 0) {
        const coinsSpent = Math.round(Number(order.coinsRedeemed) * coinsPerRupee);
        coinsBalance = Math.max(0, coinsBalance - coinsSpent);
        transactions.push({
          id: `TX-REDEEM-${order.id}`,
          type: "debit",
          amount: -coinsSpent,
          description: `Coins redeemed on Order #${order.id} (-₹${order.coinsRedeemed})`,
          date: order.date || "Order Date",
        });
      }
    });

    // Return newest transactions first
    transactions.reverse();

    return NextResponse.json({
      success: true,
      orders: userOrders,
      coinsBalance,
      coinsSettings,
      transactions,
    });
  } catch (error) {
    console.error("[Profile Orders API] Error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
