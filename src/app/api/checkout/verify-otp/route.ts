import { NextResponse } from "next/server";
import { verifyOTP } from "@/lib/whatsapp-otp";
import { readDB, writeDB } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const { phone, email, otp, orderId } = await request.json();

    if (!otp) {
      return NextResponse.json(
        { success: false, error: "Verification code is required." },
        { status: 400 }
      );
    }

    const cleanPhone = phone ? phone.replace(/\D/g, "").slice(-10) : "";
    const cleanEmail = email && email.includes("@") ? email.trim() : "";

    if (!cleanPhone && !cleanEmail) {
      return NextResponse.json(
        { success: false, error: "Mobile number or email is required." },
        { status: 400 }
      );
    }

    let lastError = "";

    // Helper to confirm order in db.orders and push to logistics
    const confirmOrderInDB = async (db: any) => {
      let confirmedOrder: any = null;
      if (Array.isArray(db.orders)) {
        const orderIdx = db.orders.findIndex((o: any) => {
          if (orderId && o.id === orderId) return true;
          const oPhone = (o.phone || "").replace(/\D/g, "").slice(-10);
          return (
            (cleanPhone && oPhone === cleanPhone) &&
            (o.status === "Pending OTP" || o.codVerified === false)
          );
        });

        if (orderIdx !== -1) {
          db.orders[orderIdx].status = "Processing";
          db.orders[orderIdx].codVerified = true;
          db.orders[orderIdx].verifiedAt = new Date().toISOString();
          confirmedOrder = db.orders[orderIdx];
        }
      }
      return confirmedOrder;
    };

    const triggerPostVerificationServices = async (order: any, db: any) => {
      if (!order) return;
      try {
        const { pushOrderToLogistics } = await import("@/lib/logistics");
        await pushOrderToLogistics(order, db);
      } catch (logErr) {
        console.error("[Post-OTP Logistics Push Warning]:", logErr);
      }
      try {
        const { sendOrderConfirmationWhatsApp } = await import("@/lib/whatsapp-notifications");
        await sendOrderConfirmationWhatsApp(order);
      } catch (waErr) {
        console.error("[Post-OTP WhatsApp Confirmation Warning]:", waErr);
      }
    };

    // 1. Try verifying via WhatsApp OTP (phone)
    if (cleanPhone) {
      let waVerify = await verifyOTP(cleanPhone, String(otp).trim(), "checkout");
      if (!waVerify.valid) {
        waVerify = await verifyOTP(cleanPhone, String(otp).trim(), "cod");
      }
      if (!waVerify.valid) {
        waVerify = await verifyOTP(cleanPhone, String(otp).trim(), "login");
      }

      if (waVerify.valid) {
        const db = await readDB(true);
        const now = Date.now();
        db.verifiedPhones = (db.verifiedPhones || []).filter(
          (v: any) => v.phone !== cleanPhone && now < (v.expiresAt || 0)
        );
        db.verifiedPhones.push({
          phone: cleanPhone,
          verifiedAt: now,
          expiresAt: now + 30 * 60 * 1000, // 30 mins
        });

        const confirmedOrder = await confirmOrderInDB(db);
        await writeDB(db);

        if (confirmedOrder) {
          await triggerPostVerificationServices(confirmedOrder, db);
        }

        return NextResponse.json({
          success: true,
          verified: true,
          phone: cleanPhone,
          orderId: confirmedOrder?.id || orderId,
          message: "Order mobile number verified successfully via WhatsApp.",
        });
      } else if (waVerify.error) {
        lastError = waVerify.error;
      }
    }

    // 2. Try verifying via email OTP (email)
    if (cleanEmail) {
      let emailVerify = await verifyOTP(cleanEmail, String(otp).trim(), "checkout");
      if (!emailVerify.valid) {
        emailVerify = await verifyOTP(cleanEmail, String(otp).trim(), "cod");
      }
      if (!emailVerify.valid) {
        emailVerify = await verifyOTP(cleanEmail, String(otp).trim(), "login");
      }

      if (emailVerify.valid) {
        const db = await readDB(true);
        const now = Date.now();
        if (cleanPhone) {
          db.verifiedPhones = (db.verifiedPhones || []).filter(
            (v: any) => v.phone !== cleanPhone && now < (v.expiresAt || 0)
          );
          db.verifiedPhones.push({
            phone: cleanPhone,
            verifiedAt: now,
            expiresAt: now + 30 * 60 * 1000,
          });
        }

        const confirmedOrder = await confirmOrderInDB(db);
        await writeDB(db);

        if (confirmedOrder) {
          await triggerPostVerificationServices(confirmedOrder, db);
        }

        return NextResponse.json({
          success: true,
          verified: true,
          phone: cleanPhone,
          orderId: confirmedOrder?.id || orderId,
          message: "Order verified successfully.",
        });
      } else if (emailVerify.error && !lastError) {
        lastError = emailVerify.error;
      }

      // Legacy fallback check in db.orderOtps
      const db = await readDB(true);
      const legacyOtps = db.orderOtps || [];
      const record = legacyOtps.find((o: any) => o.email === cleanEmail);
      if (record && Date.now() <= record.expiresAt && record.otp === String(otp).trim()) {
        db.orderOtps = legacyOtps.filter((o: any) => o.email !== cleanEmail);
        const now = Date.now();
        if (cleanPhone) {
          db.verifiedPhones = (db.verifiedPhones || []).filter(
            (v: any) => v.phone !== cleanPhone && now < (v.expiresAt || 0)
          );
          db.verifiedPhones.push({
            phone: cleanPhone,
            verifiedAt: now,
            expiresAt: now + 30 * 60 * 1000,
          });
        }

        const confirmedOrder = await confirmOrderInDB(db);
        await writeDB(db);

        if (confirmedOrder) {
          await triggerPostVerificationServices(confirmedOrder, db);
        }

        return NextResponse.json({
          success: true,
          verified: true,
          phone: cleanPhone,
          orderId: confirmedOrder?.id || orderId,
          message: "Order verified successfully.",
        });
      }
    }

    return NextResponse.json(
      { success: false, error: lastError || "Incorrect or expired verification code. Please try again." },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("[Checkout Verify OTP Error]:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
