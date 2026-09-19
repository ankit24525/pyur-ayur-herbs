import { NextResponse } from "next/server";
import { readDB, writeDB } from "@/lib/db";
import { initiatePhonePePayment } from "@/lib/phonepe";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      name,
      phone,
      address,
      pincode,
      city,
      state,
      items,
      subtotal,
      email,
      altPhone,
      companyName,
      landmark,
      couponDiscount: incomingCouponDiscount,
      coinsRedeemed: incomingCoinsRedeemed,
    } = body;

    // Server-side validation
    if (
      !name ||
      !phone ||
      !address ||
      !pincode ||
      pincode.length !== 6 ||
      !city ||
      !state ||
      !items ||
      items.length === 0
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed. Address fields, 6-digit Pincode and items are required.",
        },
        { status: 400 }
      );
    }

    const db = await readDB();

    // Compute order price values
    const prepaidDiscountPercent = db.settings?.prepaidDiscount ?? 5;
    const prepaidDiscount = Math.round((subtotal * prepaidDiscountPercent) / 100);
    const couponDiscount = Number(incomingCouponDiscount) || 0;
    const coinsDiscount = Number(incomingCoinsRedeemed) || 0;
    const totalDiscount = prepaidDiscount + couponDiscount + coinsDiscount;

    const freeThreshold = db.settings?.shipping?.freeThreshold ?? 999;
    const baseRate = db.settings?.shipping?.baseRate ?? 49;
    const shipping = subtotal >= freeThreshold ? 0 : baseRate;
    const total = Math.max(1, Math.round(subtotal - totalDiscount + shipping));

    const orderId = `PYR-ORD-${Math.floor(100000 + Math.random() * 900000)}`;

    const fullAddress = [
      address,
      landmark ? `Landmark: ${landmark}` : "",
      companyName ? `Company: ${companyName}` : "",
    ].filter(Boolean).join(", ");

    const newOrder = {
      id: orderId,
      customer: name,
      email: email || "",
      phone: phone,
      altPhone: altPhone || "",
      companyName: companyName || "",
      landmark: landmark || "",
      address: fullAddress || address || "",
      rawAddress: address || "",
      pincode: pincode || "",
      city: city || "",
      state: state || "",
      country: "India",
      shippingAddress: {
        street: address || "",
        landmark: landmark || "",
        companyName: companyName || "",
        city: city || "",
        state: state || "",
        pincode: pincode || "",
        country: "India",
      },
      subtotal,
      discount: prepaidDiscount,
      couponDiscount,
      coinsRedeemed: coinsDiscount,
      total,
      method: "PhonePe",
      status: "Pending Payment",
      date: new Date().toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
      items: `${items
        .map((i: any) => {
          const prod = db.products.find((p) => p.id === i.productId);
          return `${prod ? prod.name : "Remedy"} x${i.quantity}`;
        })
        .join(", ")}`,
    };

    db.orders.push(newOrder);
    await writeDB(db);

    // Retrieve PhonePe settings
    const phonepeSettings = db.settings?.phonepe || {
      merchantId: "PGBARCHUPGTEST",
      saltKey: "099eb0cd-02cf-4e2a-8aca-3e6c6aff0399",
      saltIndex: "1",
      env: "sandbox",
      enabled: true,
    };

    const host = request.headers.get("host") || "localhost:3000";
    const protocol = host.includes("localhost") ? "http" : "https";
    const origin = `${protocol}://${host}`;
    const redirectUrl = `${origin}/api/payment/phonepe/callback?orderId=${orderId}&merchantOrderId=${orderId}`;

    console.log(
      `[PhonePe Initiate]: Starting payment for Order ${orderId} (Total: ₹${total}, Mode: ${
        phonepeSettings.version === "v1" ? "V1" : "V2"
      })`
    );

    const paymentResult = await initiatePhonePePayment({
      orderId,
      amountInPaise: total * 100,
      phone,
      redirectUrl,
      settings: phonepeSettings,
    });

    if (paymentResult.success && paymentResult.redirectUrl) {
      return NextResponse.json({
        success: true,
        redirectUrl: paymentResult.redirectUrl,
        orderId,
      });
    } else {
      console.error("[PhonePe Initiate Failed]:", paymentResult.error);
      return NextResponse.json(
        {
          success: false,
          error: paymentResult.error || "Failed to initialize payment gateway with PhonePe.",
        },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error("[PhonePe Initiate Exception]:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
