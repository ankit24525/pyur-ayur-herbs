import { NextResponse } from "next/server";
import { readDB, writeDB } from "@/lib/db";
import { pushOrderToLogistics } from "@/lib/logistics";
import { sendOrderConfirmationWhatsApp } from "@/lib/whatsapp-notifications";
import { checkCustomerFraudStatus } from "@/lib/fraud-prevention";
import { extractSessionToken, resolveSession } from "@/lib/session";

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
      paymentMethod,
      items,
      subtotal,
      email,
      altPhone,
      companyName,
      landmark,
      coinsRedeemed,
      couponDiscount: incomingCouponDiscount,
      appliedCoupon,
      saveAsPendingOtp,
      pendingOrderId,
    } = body;

    // Server-side validation
    if (!name || !phone || !address || !pincode || pincode.length !== 6 || !city || !state || !items || items.length === 0) {
      return NextResponse.json(
        { success: false, error: "Validation failed. All address fields, 6-digit Pincode and items are required." },
        { status: 400 }
      );
    }

    const cleanPhone = (phone || "").replace(/\D/g, "").slice(-10);
    const db = await readDB(true);

    // Check authentication: if guest (no active session) and NOT saving initial Pending OTP record, phone MUST be verified via OTP
    const cookieHeader = request.headers.get("cookie");
    const sessionToken = extractSessionToken(cookieHeader);
    const sessionUser = await resolveSession(sessionToken);

    // Check if phone was already verified in session or verified list
    const isPhoneAlreadyVerified =
      (sessionUser && (sessionUser.phone || "").replace(/\D/g, "").slice(-10) === cleanPhone) ||
      (db.verifiedPhones || []).some(
        (v: any) => v.phone === cleanPhone && Date.now() < (v.expiresAt || 0)
      );

    const isCod = paymentMethod === "cod";
    const isCodPending = isCod && !isPhoneAlreadyVerified;
    const codVerified = isCod ? isPhoneAlreadyVerified : true;

    // COD Abuse & Fraud Prevention Check (Amazon & Flipkart Policy)
    if (isCod) {
      const fraudStatus = await checkCustomerFraudStatus(phone);
      if (fraudStatus.isCodBlocked) {
        return NextResponse.json(
          {
            success: false,
            error:
              fraudStatus.codBlockReason ||
              "Cash on Delivery is unavailable for this mobile number due to previous order cancellations. Please complete your purchase using Online Payment (UPI / PhonePe / Cards).",
          },
          { status: 400 }
        );
      }
    }

    // Auto-generate and dispatch WhatsApp OTP for unverified COD orders
    if (isCodPending) {
      try {
        const { generateOTP, saveOTP, sendWhatsAppOTP } = await import("@/lib/whatsapp-otp");
        const otp = generateOTP();
        await saveOTP(cleanPhone, otp, "cod", 15);
        void sendWhatsAppOTP(cleanPhone, otp, "cod").catch((err) =>
          console.error("[Auto WhatsApp COD OTP Error]:", err)
        );
      } catch (otpErr) {
        console.error("[Generate COD OTP Exception]:", otpErr);
      }
    }

    const discount = paymentMethod === "prepaid" ? Math.round(subtotal * ((Number(db.settings?.prepaidDiscount ?? 0)) / 100)) : 0;
    const couponDiscount = parseFloat(incomingCouponDiscount) || 0;
    const coinsDiscount = parseFloat(coinsRedeemed) || 0;
    const freeThreshold = db.settings?.shipping?.freeThreshold ?? 999;
    const baseRate = db.settings?.shipping?.baseRate ?? 49;
    const shipping = subtotal >= freeThreshold ? 0 : baseRate;
    const total = Math.max(0, subtotal - discount - couponDiscount - coinsDiscount + shipping);

    // Check if there is an existing Pending OTP order to update instead of creating a duplicate
    const existingPendingIdx = (db.orders || []).findIndex((o: any) => {
      if (pendingOrderId && o.id === pendingOrderId) return true;
      const oPhone = (o.phone || "").replace(/\D/g, "").slice(-10);
      return o.status === "Pending OTP" && oPhone === cleanPhone;
    });

    const orderId =
      existingPendingIdx !== -1
        ? db.orders[existingPendingIdx].id
        : `PYR-ORD-${Math.floor(100000 + Math.random() * 900000)}`;

    const fullAddress = [
      address,
      landmark ? `Landmark: ${landmark}` : "",
      companyName ? `Company: ${companyName}` : "",
    ].filter(Boolean).join(", ");

    const orderStatus = saveAsPendingOtp || isCodPending
      ? "Pending OTP"
      : isCod
      ? "Verified"
      : "Processing";

    const newOrder = {
      ...(existingPendingIdx !== -1 ? db.orders[existingPendingIdx] : {}),
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
      discount,
      couponDiscount,
      appliedCoupon: appliedCoupon || "",
      coinsRedeemed: coinsDiscount,
      total,
      method: paymentMethod === "prepaid" ? "Prepaid" : "COD",
      status: orderStatus,
      codVerified,
      createdAt:
        existingPendingIdx !== -1 && db.orders[existingPendingIdx].createdAt
          ? db.orders[existingPendingIdx].createdAt
          : new Date().toISOString(),
      date: new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
      items: `${items.map((i: any) => {
        const prod = db.products.find((p) => p.id === i.productId);
        const itemName = i.name || (prod ? prod.name : "Remedy");
        return `${itemName} x${i.quantity}`;
      }).join(", ")}`,
      itemsRaw: items,
    };

    // Auto-create or link customer profile in db.users for guest orders
    try {
      const cleanCustomerPhone = (phone || "").replace(/\D/g, "").slice(-10);
      if (cleanCustomerPhone.length === 10) {
        const users = db.users || [];
        const existingUser = users.find((u: any) => {
          const uPhone = (u.phone || "").replace(/\D/g, "").slice(-10);
          return uPhone === cleanCustomerPhone;
        });

        if (!existingUser) {
          const newGuestUser = {
            id: `USR-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
            name: name,
            phone: cleanCustomerPhone,
            email: email || `${cleanCustomerPhone}@pureayurherbs.com`,
            savedAddresses: [
              {
                id: `ADR-${Date.now()}`,
                name: name,
                phone: cleanCustomerPhone,
                street: address,
                landmark: landmark || "",
                city: city,
                state: state,
                pincode: pincode,
                isDefault: true,
              },
            ],
            role: "Customer",
            createdAt: new Date().toISOString(),
          };
          db.users = [...users, newGuestUser];
        } else {
          // If address list doesn't have this address yet, save it
          const existingAddresses = existingUser.savedAddresses || [];
          const hasThisAddress = existingAddresses.some((a: any) => a.pincode === pincode && a.street === address);
          if (!hasThisAddress) {
            existingUser.savedAddresses = [
              ...existingAddresses,
              {
                id: `ADR-${Date.now()}`,
                name: name,
                phone: cleanCustomerPhone,
                street: address,
                landmark: landmark || "",
                city: city,
                state: state,
                pincode: pincode,
                isDefault: existingAddresses.length === 0,
              },
            ];
            db.users = users.map((u: any) => (u.id === existingUser.id ? existingUser : u));
          }
        }
      }
    } catch (userErr) {
      console.error("[Checkout Guest User Auto-Creation Warning]:", userErr);
    }

    if (existingPendingIdx !== -1) {
      db.orders[existingPendingIdx] = newOrder;
    } else {
      db.orders.push(newOrder);
    }

    // If saving as Pending OTP before verification, NEVER push to NimbusPost/Shiprocket or fire Purchase events
    if (saveAsPendingOtp) {
      await writeDB(db);
      return NextResponse.json({
        success: true,
        pendingOtp: true,
        orderId,
        subtotal,
        discount,
        shipping,
        total,
        message: "Order saved as Pending OTP. Awaiting verification.",
      });
    }

    // Mark matching abandoned carts as Converted in database
    try {
      if (Array.isArray(db.abandonedCarts)) {
        db.abandonedCarts.forEach((c: any) => {
          const cPhone = (c.phone || "").replace(/\D/g, "").slice(-10);
          if ((cPhone && cPhone === cleanPhone) || (email && c.email === email)) {
            if (c.status !== "Converted") {
              c.status = "Converted";
              c.convertedOrderId = orderId;
              c.convertedAt = new Date().toISOString();
            }
          }
        });
      }
    } catch (acErr) {
      console.error("[Abandoned Cart Conversion Error]:", acErr);
    }

    await writeDB(db);

    // Automated Logistics Partner Order Auto-Push (NimbusPost / Shiprocket) - ONLY for verified orders
    if (orderStatus !== "Pending OTP") {
      try {
        await pushOrderToLogistics(newOrder, db);
      } catch (logisticsErr) {
        console.error("[Logistics Auto-Push Exception]:", logisticsErr);
      }

      // Automated WhatsApp Order Confirmation Notification (Pillar 3)
      try {
        const waRes = await sendOrderConfirmationWhatsApp(newOrder);
        if (waRes.success) {
          console.log(`[WhatsApp Order Confirmation Dispatched]: Order ${orderId} sent to ${phone}`);
        } else {
          console.warn(`[WhatsApp Order Confirmation Warning]:`, waRes.error);
        }
      } catch (waErr) {
        console.error("[WhatsApp Confirmation Exception]:", waErr);
      }
    }

    // Simulated Server-Side Meta Conversions API (CAPI) trigger
    try {
      const capiPayload = {
        event_name: "Purchase",
        event_time: Math.floor(Date.now() / 1000),
        user_data: {
          fn: name.toLowerCase().trim(),
          ph: phone.trim(),
        },
        custom_data: {
          currency: "INR",
          value: total,
          order_id: orderId,
        },
      };
      console.log("[CAPI Server Trigger Success]:", capiPayload);
    } catch (e) {
      console.error("[CAPI Server Trigger Failed]:", e);
    }

    return NextResponse.json({
      success: true,
      orderId,
      subtotal,
      discount,
      shipping,
      total,
      method: paymentMethod === "prepaid" ? "Prepaid" : "COD",
      codVerified,
      requiresCodOtp: isCodPending,
      phone: cleanPhone,
      message: isCodPending
        ? "Order recorded successfully! Please verify WhatsApp OTP on confirmation screen."
        : "Order placed successfully!",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
