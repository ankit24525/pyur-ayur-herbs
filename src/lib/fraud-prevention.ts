import { readDB } from "./db";

export interface CustomerFraudStatus {
  phone: string;
  isCodBlocked: boolean;
  isCancelBlocked: boolean;
  codBlockReason?: string;
  cancelBlockReason?: string;
  stats: {
    totalOrders: number;
    cancelledOrders: number;
    codCancelledOrders: number;
    recentCancellations: number;
  };
}

/**
 * Normalizes customer phone number to 10 digits
 */
export function normalizePhone(phone: string): string {
  return (phone || "").replace(/\D/g, "").slice(-10);
}

/**
 * Evaluates a customer's order and cancellation history to protect
 * against COD abuse, serial cancellations, and fake orders (Amazon & Flipkart Policy).
 */
export async function checkCustomerFraudStatus(rawPhone: string): Promise<CustomerFraudStatus> {
  const cleanPhone = normalizePhone(rawPhone);

  if (!cleanPhone || cleanPhone.length !== 10) {
    return {
      phone: cleanPhone,
      isCodBlocked: false,
      isCancelBlocked: false,
      stats: {
        totalOrders: 0,
        cancelledOrders: 0,
        codCancelledOrders: 0,
        recentCancellations: 0,
      },
    };
  }

  const db = await readDB();
  const orders = db.orders || [];
  const settings = db.settings || {};

  // Configurable thresholds
  const codAbuseThreshold = typeof settings.codAbuseThreshold === "number" ? settings.codAbuseThreshold : 2;
  const maxMonthlyCancellations = typeof settings.maxMonthlyCancellations === "number" ? settings.maxMonthlyCancellations : 3;
  const blockedCodPhones: string[] = Array.isArray(settings.blockedCodPhones)
    ? settings.blockedCodPhones.map(normalizePhone)
    : [];

  // Filter orders matching this customer
  const customerOrders = orders.filter((o: any) => {
    if (!o) return false;
    const oPhone = normalizePhone(o.phone || o.customerPhone);
    return oPhone === cleanPhone;
  });

  const now = Date.now();
  const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;

  let totalOrders = customerOrders.length;
  let cancelledOrders = 0;
  let codCancelledOrders = 0;
  let recentCancellations = 0;

  for (const o of customerOrders) {
    const status = String(o.status || "").toLowerCase();
    const isCancelled = status === "cancelled" || status.includes("cancel");

    if (isCancelled) {
      cancelledOrders++;

      const isCod =
        String(o.paymentMethod || o.method || "").toLowerCase().includes("cod") ||
        String(o.paymentMethod || o.method || "").toLowerCase().includes("cash");

      if (isCod) {
        codCancelledOrders++;
      }

      const orderTime = new Date(o.cancellationDate || o.date || 0).getTime();
      if (orderTime >= thirtyDaysAgo) {
        recentCancellations++;
      }
    }
  }

  // Check COD block conditions
  const isManuallyBlocked = blockedCodPhones.includes(cleanPhone);
  const isAutoCodBlocked = codCancelledOrders >= codAbuseThreshold;
  const isCodBlocked = isManuallyBlocked || isAutoCodBlocked;

  let codBlockReason = undefined;
  if (isManuallyBlocked) {
    codBlockReason = "Cash on Delivery is disabled for this mobile number by store administration.";
  } else if (isAutoCodBlocked) {
    codBlockReason = `Cash on Delivery is unavailable due to ${codCancelledOrders} previous cancelled COD order(s).`;
  }

  // Check Cancellation ceiling condition (spammer guard)
  const isCancelBlocked = recentCancellations >= maxMonthlyCancellations;
  let cancelBlockReason = undefined;
  if (isCancelBlocked) {
    cancelBlockReason = `You have reached the limit of ${maxMonthlyCancellations} automated cancellations in the last 30 days.`;
  }

  return {
    phone: cleanPhone,
    isCodBlocked,
    isCancelBlocked,
    codBlockReason,
    cancelBlockReason,
    stats: {
      totalOrders,
      cancelledOrders,
      codCancelledOrders,
      recentCancellations,
    },
  };
}
