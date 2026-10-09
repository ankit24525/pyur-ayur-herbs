import { NextResponse } from "next/server";
import { readDB } from "@/lib/db";
import { getNimbusWarehouses } from "@/lib/nimbuspost";
import { getShiprocketToken } from "@/lib/shiprocket";
import { getActiveLogisticsPartner } from "@/lib/logistics";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const db = await readDB();
    const activePartner = getActiveLogisticsPartner(db);

    const nimbusConfig = db.settings?.nimbuspost || {};
    const apiKey = nimbusConfig.apiKey || process.env.NIMBUSPOST_API_KEY || "npk_aa1f06c9aebdfbe5";
    const apiSecret = nimbusConfig.apiSecret || process.env.NIMBUSPOST_API_SECRET || "X7XeU-4-4Y3B_GznPoKOtCCcEWqi_aC8";
    const warehouseId = nimbusConfig.warehouseId || process.env.NIMBUSPOST_WAREHOUSE_ID || "PURE AYUR HERBS";

    const srConfig = db.settings?.shiprocket || {};
    const srEmail = srConfig.email || process.env.SHIPROCKET_EMAIL || "imranshah244830@gmail.com";
    const srPassword = srConfig.password || process.env.SHIPROCKET_PASSWORD || "@16*APnSzf$&O9oZi#AT2kVISPTvRrqi";

    // 1. Test NimbusPost Connection
    const startNimbus = Date.now();
    let nimbusConnected = false;
    let nimbusLatency = 0;
    let nimbusWarehouses: any[] = [];
    let nimbusError: string | null = null;

    if (apiKey && apiSecret) {
      try {
        nimbusWarehouses = await getNimbusWarehouses({ apiKey, apiSecret });
        nimbusLatency = Date.now() - startNimbus;
        nimbusConnected = nimbusWarehouses.length > 0;
        if (!nimbusConnected) {
          nimbusError = "Credentials provided but no warehouses returned from NimbusPost.";
        }
      } catch (err: any) {
        nimbusLatency = Date.now() - startNimbus;
        nimbusError = err?.message || "Failed to contact NimbusPost API v2";
      }
    } else {
      nimbusError = "API Key or API Secret not yet populated in .env.local";
    }

    // 2. Test Shiprocket Legacy Connection
    const startSr = Date.now();
    let srConnected = false;
    let srLatency = 0;
    try {
      const srToken = await getShiprocketToken(srEmail, srPassword);
      srLatency = Date.now() - startSr;
      srConnected = !!srToken;
    } catch {
      srLatency = Date.now() - startSr;
    }

    // 3. Count Orders per provider
    const orders = db.orders || [];
    const nimbusOrders = orders.filter((o: any) => o.nimbusAwb || o.nimbusOrderId || o.logisticsPartner === "nimbuspost");
    const shiprocketOrders = orders.filter((o: any) => o.shiprocketOrderId || o.shiprocketShipmentId);

    const host = process.env.NEXT_PUBLIC_BASE_URL || "https://www.purreayurherbs.com";
    const webhookUrl = `${host}/api/nimbuspost/webhook`;

    return NextResponse.json({
      success: true,
      activePartner,
      nimbuspost: {
        configured: Boolean(apiKey && apiSecret),
        connected: nimbusConnected,
        latencyMs: nimbusLatency,
        warehouseName: warehouseId,
        warehousesFound: nimbusWarehouses.length,
        error: nimbusError,
        activeOrdersCount: nimbusOrders.length,
      },
      shiprocket: {
        configured: Boolean(srEmail && srPassword),
        connected: srConnected,
        latencyMs: srLatency,
        email: srEmail,
        pickupLocation: srConfig.pickupLocation || "PURE AYUR HERBS",
        historicOrdersCount: shiprocketOrders.length,
      },
      dualTrackingProtection: {
        enabled: true,
        status: "Active (Legacy Shiprocket orders protected while new orders route to NimbusPost)",
        totalStoreOrders: orders.length,
        nimbusOrdersCount: nimbusOrders.length,
        shiprocketOrdersCount: shiprocketOrders.length,
      },
      webhook: {
        endpoint: webhookUrl,
        eventsSupported: ["in_transit", "out_for_delivery", "delivered", "ndr", "rto"],
        automatedWhatsApp: true,
      },
    });
  } catch (error: any) {
    console.error("[Logistics Verify Error]:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
