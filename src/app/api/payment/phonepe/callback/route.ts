import { NextResponse } from "next/server";
import { readDB, writeDB } from "@/lib/db";
import { verifyPhonePePayment } from "@/lib/phonepe";

export const dynamic = "force-dynamic";

async function handlePaymentCallback(request: Request, isGet: boolean) {
  const host = request.headers.get("host") || "localhost:3000";
  const protocol = host.includes("localhost") ? "http" : "https";
  const origin = `${protocol}://${host}`;

  let merchantOrderId = "";

  if (isGet) {
    const url = new URL(request.url);
    merchantOrderId =
      url.searchParams.get("merchantOrderId") ||
      url.searchParams.get("orderId") ||
      url.searchParams.get("merchantTransactionId") ||
      url.searchParams.get("transactionId") ||
      "";
  } else {
    const url = new URL(request.url);
    merchantOrderId =
      url.searchParams.get("merchantOrderId") ||
      url.searchParams.get("orderId") ||
      url.searchParams.get("merchantTransactionId") ||
      url.searchParams.get("transactionId") ||
      "";

    const contentType = request.headers.get("content-type") || "";
    if (contentType.includes("form-urlencoded")) {
      try {
        const formData = await request.formData();
        const responseBase64 = formData.get("response") as string;
        if (responseBase64) {
          const decoded = Buffer.from(responseBase64, "base64").toString("utf-8");
          const parsed = JSON.parse(decoded);
          merchantOrderId =
            parsed.payload?.merchantOrderId ||
            parsed.payload?.orderId ||
            parsed.data?.merchantTransactionId ||
            parsed.data?.merchantOrderId ||
            parsed.merchantOrderId ||
            parsed.merchantTransactionId ||
            merchantOrderId;
        }
      } catch (e) {
        console.error("[PhonePe Callback POST form parse error]:", e);
      }
    } else if (contentType.includes("json")) {
      try {
        const body = await request.json();
        merchantOrderId =
          body.payload?.merchantOrderId ||
          body.payload?.orderId ||
          body.data?.merchantTransactionId ||
          body.data?.merchantOrderId ||
          body.merchantOrderId ||
          body.merchantTransactionId ||
          merchantOrderId;
      } catch (e) {
        console.error("[PhonePe Callback POST json parse error]:", e);
      }
    }
  }

  const db = await readDB();

  // If merchantOrderId wasn't passed in params, find the most recent pending PhonePe order
  if (!merchantOrderId) {
    const pendingOrders = (db.orders || []).filter(
      (o: any) => o.status === "Pending Payment" && o.method === "PhonePe"
    );
    if (pendingOrders.length > 0) {
      merchantOrderId = pendingOrders[pendingOrders.length - 1].id;
      console.log("[PhonePe Callback Fallback]: Matched latest pending order:", merchantOrderId);
    }
  }

  if (!merchantOrderId) {
    console.warn("[PhonePe Callback]: No merchantOrderId identified in callback request.");
    if (isGet || request.headers.get("accept")?.includes("text/html")) {
      return NextResponse.redirect(
        `${origin}/checkout?error=Payment+verification+failed.+No+order+ID+found.`,
        { status: 303 }
      );
    }
    return NextResponse.json({ success: false, error: "Order ID missing" }, { status: 400 });
  }
  const phonepeSettings = db.settings?.phonepe || {};
  const orders = db.orders || [];
  const orderIdx = orders.findIndex((o) => o.id === merchantOrderId);

  // If already marked Processing, prevent redundant checks and redirect safely
  if (orderIdx !== -1 && orders[orderIdx].status === "Processing") {
    console.log(`[PhonePe Callback]: Order ${merchantOrderId} already processed.`);
    if (isGet || request.headers.get("accept")?.includes("text/html")) {
      return NextResponse.redirect(
        `${origin}/checkout?success=true&orderId=${merchantOrderId}`,
        { status: 303 }
      );
    }
    return NextResponse.json({ success: true, orderId: merchantOrderId, status: "Processing" });
  }

  // Verify payment with PhonePe
  const result = await verifyPhonePePayment(merchantOrderId, phonepeSettings);
  console.log(`[PhonePe Callback Verification Result for ${merchantOrderId}]:`, result);

  if (result.success) {
    if (orderIdx !== -1) {
      orders[orderIdx].status = "Processing"; // Confirmed & paid
      db.orders = orders;
      await writeDB(db);

      // Trigger Meta CAPI Purchase Event
      try {
        console.log(`[Meta CAPI]: Purchase confirmed for order ${merchantOrderId} value ₹${orders[orderIdx].total}`);
      } catch {}
    }

    if (isGet || request.headers.get("accept")?.includes("text/html")) {
      return NextResponse.redirect(
        `${origin}/checkout?success=true&orderId=${merchantOrderId}`,
        { status: 303 }
      );
    }
    return NextResponse.json({ success: true, orderId: merchantOrderId, status: "Processing" });
  } else {
    // Payment failed or cancelled
    if (orderIdx !== -1 && orders[orderIdx].status === "Pending Payment") {
      orders[orderIdx].status = "Payment Failed";
      db.orders = orders;
      await writeDB(db);
    }

    if (isGet || request.headers.get("accept")?.includes("text/html")) {
      return NextResponse.redirect(
        `${origin}/checkout?error=Payment+failed+or+was+cancelled.+Please+try+again.`,
        { status: 303 }
      );
    }
    return NextResponse.json(
      { success: false, orderId: merchantOrderId, status: result.state || "FAILED" },
      { status: 400 }
    );
  }
}

export async function GET(request: Request) {
  return handlePaymentCallback(request, true);
}

export async function POST(request: Request) {
  return handlePaymentCallback(request, false);
}
