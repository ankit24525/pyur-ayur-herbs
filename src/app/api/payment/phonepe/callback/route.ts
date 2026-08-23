import { NextResponse } from "next/server";
import { readDB, writeDB } from "@/lib/db";
import crypto from "crypto";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    let merchantTransactionId = "";
    let code = "";

    // Parse the body. PhonePe can send POST redirect as application/x-www-form-urlencoded with a 'response' param
    const contentType = request.headers.get("content-type") || "";
    if (contentType.includes("form-urlencoded")) {
      const formData = await request.formData();
      const responseBase64 = formData.get("response") as string;
      if (responseBase64) {
        const decodedString = Buffer.from(responseBase64, "base64").toString("utf-8");
        const responseJson = JSON.parse(decodedString);
        merchantTransactionId = responseJson.data?.merchantTransactionId || responseJson.merchantTransactionId || "";
        code = responseJson.code || "";
      }
    } else {
      const body = await request.json().catch(() => ({}));
      merchantTransactionId = body.data?.merchantTransactionId || body.merchantTransactionId || "";
      code = body.code || "";
    }

    if (!merchantTransactionId) {
      // Fallback: If no transaction ID, redirect to checkout page with error
      const host = request.headers.get("host") || "localhost:3000";
      const protocol = host.includes("localhost") ? "http" : "https";
      return NextResponse.redirect(`${protocol}://${host}/checkout?error=Payment+verification+failed`, { status: 303 });
    }

    const db = await readDB();

    const phonepeSettings = db.settings.phonepe || {
      merchantId: "PGBARCHUPGTEST",
      saltKey: "099eb0cd-02cf-4e2a-8aca-3e6c6aff0399",
      saltIndex: "1",
      env: "sandbox",
      enabled: true
    };

    // Construct Checksum for Status API check: SHA256("/pg/v1/status/" + merchantId + "/" + transactionId + saltKey) + "###" + saltIndex
    const checksumString = `/pg/v1/status/${phonepeSettings.merchantId}/${merchantTransactionId}${phonepeSettings.saltKey}`;
    const hash = crypto.createHash("sha256").update(checksumString).digest("hex");
    const xVerify = `${hash}###${phonepeSettings.saltIndex}`;

    const phonepeStatusUrl = phonepeSettings.env === "production"
      ? `https://api.phonepe.com/apis/hermes/pg/v1/status/${phonepeSettings.merchantId}/${merchantTransactionId}`
      : `https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/status/${phonepeSettings.merchantId}/${merchantTransactionId}`;

    console.log("[PhonePe PG Verification]: Verification url:", phonepeStatusUrl);

    // Call status API
    const verifyRes = await fetch(phonepeStatusUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-VERIFY": xVerify,
        "X-MERCHANT-ID": phonepeSettings.merchantId,
        "accept": "application/json",
      }
    });

    const verifyData = await verifyRes.json();
    const isSuccess = verifyData.success && (verifyData.code === "PAYMENT_SUCCESS" || code === "PAYMENT_SUCCESS");

    const host = request.headers.get("host") || "localhost:3000";
    const protocol = host.includes("localhost") ? "http" : "https";
    const origin = `${protocol}://${host}`;

    // Update order status in db
    const orders = db.orders || [];
    const idx = orders.findIndex((o) => o.id === merchantTransactionId);

    if (isSuccess) {
      if (idx !== -1) {
        orders[idx].status = "Processing"; // Paid & verified status
        db.orders = orders;
        await writeDB(db);

        // Fire Server-Side Meta Conversions API (CAPI) on success
        try {
          const capiPayload = {
            event_name: "Purchase",
            event_time: Math.floor(Date.now() / 1000),
            user_data: {
              ph: orders[idx].phone,
            },
            custom_data: {
              currency: "INR",
              value: orders[idx].total,
              order_id: merchantTransactionId,
            },
          };
          console.log("[CAPI PhonePe Callback Success]:", capiPayload);
        } catch {}
      }

      return NextResponse.redirect(`${origin}/checkout?success=true&orderId=${merchantTransactionId}`, { status: 303 });
    } else {
      if (idx !== -1) {
        orders[idx].status = "Payment Failed";
        db.orders = orders;
        await writeDB(db);
      }
      return NextResponse.redirect(`${origin}/checkout?error=Payment+failed.+Please+try+again.`, { status: 303 });
    }
  } catch (error) {
    console.error("[PhonePe Callback Error]:", error);
    const host = request.headers.get("host") || "localhost:3000";
    const protocol = host.includes("localhost") ? "http" : "https";
    return NextResponse.redirect(`${protocol}://${host}/checkout?error=Internal+Server+Error`, { status: 303 });
  }
}
