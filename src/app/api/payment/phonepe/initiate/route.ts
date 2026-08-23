import { NextResponse } from "next/server";
import { readDB, writeDB } from "@/lib/db";
import crypto from "crypto";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, phone, address, pincode, city, state, items, subtotal, email } = body;

    // Server-side validation
    if (!name || !phone || !address || !pincode || pincode.length !== 6 || !city || !state || !items || items.length === 0) {
      return NextResponse.json(
        { success: false, error: "Validation failed. Address fields, 6-digit Pincode and items are required." },
        { status: 400 }
      );
    }

    const db = await readDB();

    // Compute order price values
    const discount = Math.round(subtotal * ((db.settings.prepaidDiscount || 5) / 100));
    const shipping = subtotal >= (db.settings.shipping?.freeThreshold ?? 999) ? 0 : (db.settings.shipping?.baseRate ?? 49);
    const total = subtotal - discount + shipping;

    const orderId = `PYR-ORD-${Math.floor(100000 + Math.random() * 900000)}`;

    const newOrder = {
      id: orderId,
      customer: name,
      email: email || "",
      phone: phone,
      address: address || "",
      pincode: pincode || "",
      city: city || "",
      state: state || "",
      total,
      method: "PhonePe",
      status: "Pending Payment",
      date: new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
      items: `${items.map((i: any) => {
        const prod = db.products.find((p) => p.id === i.productId);
        return `${prod ? prod.name : "Remedy"} x${i.quantity}`;
      }).join(", ")}`,
    };

    db.orders.push(newOrder);
    await writeDB(db);

    // Retrieve PhonePe credentials
    const phonepeSettings = db.settings.phonepe || {
      merchantId: "PGBARCHUPGTEST",
      saltKey: "099eb0cd-02cf-4e2a-8aca-3e6c6aff0399",
      saltIndex: "1",
      env: "sandbox",
      enabled: true
    };

    const host = request.headers.get("host") || "localhost:3000";
    const protocol = host.includes("localhost") ? "http" : "https";
    const origin = `${protocol}://${host}`;

    const redirectUrl = `${origin}/api/payment/phonepe/callback`;
    const callbackUrl = `${origin}/api/payment/phonepe/callback`;

    // Construct PhonePe initiate payload
    const transactionId = orderId;
    const phonepePayload = {
      merchantId: phonepeSettings.merchantId,
      merchantTransactionId: transactionId,
      merchantUserId: `USR-${phone.replace(/\D/g, "") || "GUEST"}`,
      amount: total * 100, // in paise
      redirectUrl: redirectUrl,
      redirectMode: "POST",
      callbackUrl: callbackUrl,
      mobileNumber: phone.replace(/\D/g, ""),
      paymentInstrument: {
        type: "PAY_PAGE"
      }
    };

    const payloadString = JSON.stringify(phonepePayload);
    const base64Payload = Buffer.from(payloadString).toString("base64");

    // Checksum formula: SHA256(base64Payload + "/pg/v1/pay" + saltKey) + "###" + saltIndex
    const checksumString = base64Payload + "/pg/v1/pay" + phonepeSettings.saltKey;
    const hash = crypto.createHash("sha256").update(checksumString).digest("hex");
    const xVerify = `${hash}###${phonepeSettings.saltIndex}`;

    // Select correct API URL based on environment
    const phonepeUrl = phonepeSettings.env === "production"
      ? "https://api.phonepe.com/apis/hermes/pg/v1/pay"
      : "https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/pay";

    console.log("[PhonePe PG Initiate]: Calling API", phonepeUrl, "for Order", orderId, "Total", total);

    const apiRes = await fetch(phonepeUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-VERIFY": xVerify,
        "accept": "application/json",
      },
      body: JSON.stringify({ request: base64Payload }),
    });

    const resData = await apiRes.json();

    if (apiRes.ok && resData.success && resData.data?.instrumentResponse?.redirectInfo?.url) {
      return NextResponse.json({
        success: true,
        redirectUrl: resData.data.instrumentResponse.redirectInfo.url,
        orderId,
      });
    } else {
      console.error("[PhonePe PG Error Response]:", resData);
      return NextResponse.json({
        success: false,
        error: resData.message || "Failed to initialize payment gateway with PhonePe."
      }, { status: 500 });
    }
  } catch (error: any) {
    console.error("[PhonePe Initiate Exception]:", error);
    return NextResponse.json({ success: false, error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
