import { NextResponse } from "next/server";
import { readDB, writeDB } from "@/lib/db";
import { getShiprocketToken, createShiprocketOrder } from "@/lib/shiprocket";

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

          const srRes = await createShiprocketOrder({
            order_id: orderId,
            order_date: nowStr,
            pickup_location: srConfig.pickupLocation || "Primary",
            billing_customer_name: name,
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

    // WhatsApp Cloud API Order Notification Trigger
    const whatsappToken = process.env.WHATSAPP_ACCESS_TOKEN;
    const whatsappPhoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;

    if (
      whatsappToken &&
      whatsappPhoneId &&
      whatsappToken !== "your_permanent_access_token_here" &&
      whatsappPhoneId !== "your_phone_number_id_here"
    ) {
      try {
        let cleanedPhone = phone.replace(/\D/g, "");
        if (cleanedPhone.length === 10) {
          cleanedPhone = "91" + cleanedPhone;
        }

        const metaApiUrl = `https://graph.facebook.com/v19.0/${whatsappPhoneId}/messages`;

        // Send template order confirmation notification (using standard hello_world template for testing)
        const response = await fetch(metaApiUrl, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${whatsappToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messaging_product: "whatsapp",
            to: cleanedPhone,
            type: "template",
            template: {
              name: "hello_world",
              language: {
                code: "en_US"
              }
            }
          }),
        });

        const resJson = await response.json();
        if (response.ok) {
          console.log(`[WhatsApp API Success]: Confirmation sent to ${cleanedPhone} for order ${orderId}`, resJson);
        } else {
          console.error(`[WhatsApp API Error]: Meta rejected message dispatch for ${orderId}:`, resJson);
        }
      } catch (e) {
        console.error(`[WhatsApp API Network Error]: Failed to dispatch message for ${orderId}:`, e);
      }
    } else {
      console.log(`[WhatsApp API Simulation]: Order ${orderId} placed. Set WHATSAPP_ACCESS_TOKEN & WHATSAPP_PHONE_NUMBER_ID in .env.local to send live WhatsApp notifications.`);
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
