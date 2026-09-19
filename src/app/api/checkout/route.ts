import { NextResponse } from "next/server";
import { readDB, writeDB } from "@/lib/db";
import { pushOrderToShiprocket } from "@/lib/shiprocket";
import { sendOrderConfirmationWhatsApp } from "@/lib/whatsapp-notifications";
import { checkCustomerFraudStatus } from "@/lib/fraud-prevention";
import { extractSessionToken, resolveSession } from "@/lib/session";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, phone, address, pincode, city, state, paymentMethod, items, subtotal, email, altPhone, companyName, landmark, coinsRedeemed } = body;

    // Server-side validation
    if (!name || !phone || !address || !pincode || pincode.length !== 6 || !city || !state || !items || items.length === 0) {
      return NextResponse.json(
        { success: false, error: "Validation failed. All address fields, 6-digit Pincode and items are required." },
        { status: 400 }
      );
    }

    const cleanPhone = (phone || "").replace(/\D/g, "").slice(-10);
    const db = await readDB();

    // Check authentication: if guest (no active session), phone MUST be verified via OTP
    const cookieHeader = request.headers.get("cookie");
    const sessionToken = extractSessionToken(cookieHeader);
    const sessionUser = await resolveSession(sessionToken);

    if (!sessionUser) {
      const isVerified = (db.verifiedPhones || []).some(
        (v: any) => v.phone === cleanPhone && Date.now() < (v.expiresAt || 0)
      );

      if (!isVerified) {
        return NextResponse.json(
          {
            success: false,
            error: "Mobile number verification required. Please verify your phone number via OTP to place your order.",
            requiresOtp: true,
          },
          { status: 400 }
        );
      }
    }

    // COD Abuse & Fraud Prevention Check (Amazon & Flipkart Policy)
    if (paymentMethod === "cod") {
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

    const discount = paymentMethod === "prepaid" ? Math.round(subtotal * (db.settings.prepaidDiscount / 100)) : 0;
    const coinsDiscount = parseFloat(coinsRedeemed) || 0;
    const shipping = subtotal >= 999 ? 0 : 49;
    const total = Math.max(0, subtotal - discount - coinsDiscount + shipping);

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
      discount,
      coinsRedeemed: coinsDiscount,
      total,
      method: paymentMethod === "prepaid" ? "Prepaid" : "COD",
      status: paymentMethod === "cod" ? "Verified" : "Processing",
      date: new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
      items: `${items.map((i: any) => {
        const prod = db.products.find((p) => p.id === i.productId);
        return `${prod ? prod.name : "Remedy"} x${i.quantity}`;
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

    db.orders.push(newOrder);
    await writeDB(db);

    // Automated Shiprocket Order Auto-Push
    try {
      await pushOrderToShiprocket(newOrder, db);
    } catch (srErr) {
      console.error("[Shiprocket Auto-Push Exception]:", srErr);
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

    // 1. Mark matching abandoned carts as Converted in database
    try {
      const db = await readDB();
      if (Array.isArray(db.abandonedCarts)) {
        const cleanPhone10 = (phone || "").replace(/\D/g, "").slice(-10);
        let cartUpdated = false;
        db.abandonedCarts.forEach((c: any) => {
          const cPhone = (c.phone || "").replace(/\D/g, "").slice(-10);
          if ((cPhone && cPhone === cleanPhone10) || (email && c.email === email)) {
            if (c.status !== "Converted") {
              c.status = "Converted";
              c.convertedOrderId = orderId;
              c.convertedAt = new Date().toISOString();
              cartUpdated = true;
            }
          }
        });
        if (cartUpdated) await writeDB(db);
      }
    } catch (acErr) {
      console.error("[Abandoned Cart Conversion Error]:", acErr);
    }

    // 2. Automated WhatsApp Order Confirmation Notification (Pillar 3)
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

    return NextResponse.json({
      success: true,
      orderId,
      subtotal,
      discount,
      shipping,
      total,
      message: "Order placed successfully!",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
