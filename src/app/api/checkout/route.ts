import { NextResponse } from "next/server";
import { readDB, writeDB } from "@/lib/db";
import { getShiprocketToken, createShiprocketOrder } from "@/lib/shiprocket";
import { sendOrderConfirmationWhatsApp } from "@/lib/whatsapp-notifications";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, phone, address, pincode, city, state, paymentMethod, items, subtotal, email } = body;

    // Server-side validation
    if (!name || !phone || !address || !pincode || pincode.length !== 6 || !city || !state || !items || items.length === 0) {
      return NextResponse.json(
        { success: false, error: "Validation failed. All address fields, 6-digit Pincode and items are required." },
        { status: 400 }
      );
    }

    const db = await readDB();

    const discount = paymentMethod === "prepaid" ? Math.round(subtotal * (db.settings.prepaidDiscount / 100)) : 0;
    const shipping = subtotal >= 999 ? 0 : 49;
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
      method: paymentMethod === "prepaid" ? "Prepaid" : "COD",
      status: paymentMethod === "cod" ? "Verified" : "Processing",
      date: new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
      items: `${items.map((i: any) => {
        const prod = db.products.find((p) => p.id === i.productId);
        return `${prod ? prod.name : "Remedy"} x${i.quantity}`;
      }).join(", ")}`,
    };

    db.orders.push(newOrder);
    await writeDB(db);

    // Automated Shiprocket Direct API Order Push
    try {
      const srConfig = db.settings?.shiprocket || {};
      const srEmail = srConfig.email || process.env.SHIPROCKET_EMAIL;
      const srPassword = srConfig.password || process.env.SHIPROCKET_PASSWORD;
      const srEnabled = srConfig.enabled ?? Boolean(srEmail && srPassword);

      if (srEnabled && srEmail && srPassword) {
        const token = await getShiprocketToken(srEmail, srPassword);
        if (token) {
          const orderItems = items.map((i: any) => {
            const prod = db.products.find((p) => p.id === i.productId);
            return {
              name: prod ? prod.name : "Ayurvedic Remedy",
              sku: prod ? (prod.sku || `SKU-${i.productId}`) : `SKU-${i.productId}`,
              units: i.quantity || 1,
              selling_price: prod ? prod.price : Math.round(total / items.length),
              discount: 0,
              tax: 0,
            };
          });

          const dateObj = new Date();
          const year = dateObj.getFullYear();
          const month = String(dateObj.getMonth() + 1).padStart(2, "0");
          const day = String(dateObj.getDate()).padStart(2, "0");
          const hours = String(dateObj.getHours()).padStart(2, "0");
          const mins = String(dateObj.getMinutes()).padStart(2, "0");
          const nowStr = `${year}-${month}-${day} ${hours}:${mins}`;

          const nameParts = (name || "Customer").trim().split(" ");
          const firstName = nameParts[0] || "Customer";
          const lastName = nameParts.slice(1).join(" ") || "Customer";

          const srRes = await createShiprocketOrder({
            order_id: orderId,
            order_date: nowStr,
            pickup_location: srConfig.pickupLocation || "PURE AYUR HERBS",
            billing_customer_name: firstName,
            billing_last_name: lastName,
            billing_address: address,
            billing_city: city,
            billing_pincode: pincode,
            billing_state: state,
            billing_email: email || "customer@pureayurherbs.com",
            billing_phone: phone,
            payment_method: paymentMethod === "prepaid" ? "Prepaid" : "COD",
            sub_total: subtotal,
            order_items: orderItems,
          }, token);

          if (srRes.success && srRes.data) {
            (newOrder as any).shiprocketOrderId = srRes.data.order_id;
            (newOrder as any).shiprocketShipmentId = srRes.data.shipment_id;
            (newOrder as any).shiprocketStatus = "Pushed";
            await writeDB(db);
            console.log(`[Shiprocket Push Success]: Order ${orderId} synced (SR ID: ${srRes.data.order_id}, Shipment: ${srRes.data.shipment_id})`);
          } else {
            console.error("[Shiprocket Push Failed]:", srRes);
          }
        }
      }
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
