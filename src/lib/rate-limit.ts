import { NextResponse } from "next/server";

interface RateLimitRecord {
  count: number;
  lastAttempt: number;
  resetAt: number;
}

// In-memory token bucket store (persists across warm serverless requests)
const memoryStore = new Map<string, RateLimitRecord>();

// Periodic garbage collection to prevent memory leaks
let lastCleanup = Date.now();
function cleanupExpired() {
  const now = Date.now();
  if (now - lastCleanup < 60000) return; // Clean up at most once per minute
  lastCleanup = now;

  for (const [key, record] of memoryStore.entries()) {
    if (now >= record.resetAt) {
      memoryStore.delete(key);
    }
  }

  // Safety cap: If memoryStore exceeds 5,000 entries, evict oldest entries
  if (memoryStore.size > 5000) {
    const keys = Array.from(memoryStore.keys()).slice(0, 2000);
    keys.forEach((k) => memoryStore.delete(k));
  }
}

/**
 * Extract client IP from incoming Next.js Request headers
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const firstIp = forwarded.split(",")[0]?.trim();
    if (firstIp) return firstIp;
  }
  const realIp = request.headers.get("x-real-ip")?.trim();
  if (realIp) return realIp;

  const cfIp = request.headers.get("cf-connecting-ip")?.trim();
  if (cfIp) return cfIp;

  return "127.0.0.1";
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
  cooldownRemainingSeconds?: number;
}

/**
 * Check if a request exceeds rate limits.
 *
 * @param key Unique key to rate limit (e.g., "otp:phone:9876543210" or "login:ip:1.2.3.4")
 * @param maxRequests Maximum allowed requests in the time window
 * @param windowSeconds Duration of the time window in seconds
 * @param minGapSeconds Optional minimum cooldown gap between consecutive requests (e.g. 30s)
 */
export function checkRateLimit(
  key: string,
  maxRequests: number,
  windowSeconds: number,
  minGapSeconds = 0
): RateLimitResult {
  cleanupExpired();

  const now = Date.now();
  const windowMs = windowSeconds * 1000;
  const minGapMs = minGapSeconds * 1000;

  const record = memoryStore.get(key);

  if (!record || now >= record.resetAt) {
    // New window
    memoryStore.set(key, {
      count: 1,
      lastAttempt: now,
      resetAt: now + windowMs,
    });
    return {
      allowed: true,
      remaining: maxRequests - 1,
      retryAfterSeconds: 0,
    };
  }

  // Check minimum cooldown gap between consecutive requests (e.g. at least 30s between OTP sends)
  if (minGapMs > 0 && now - record.lastAttempt < minGapMs) {
    const cooldownRemainingSeconds = Math.ceil((minGapMs - (now - record.lastAttempt)) / 1000);
    return {
      allowed: false,
      remaining: Math.max(0, maxRequests - record.count),
      retryAfterSeconds: cooldownRemainingSeconds,
      cooldownRemainingSeconds,
    };
  }

  // Check total request count within window
  if (record.count >= maxRequests) {
    const retryAfterSeconds = Math.max(1, Math.ceil((record.resetAt - now) / 1000));
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds,
    };
  }

  // Increment attempt count
  record.count += 1;
  record.lastAttempt = now;
  memoryStore.set(key, record);

  return {
    allowed: true,
    remaining: maxRequests - record.count,
    retryAfterSeconds: 0,
  };
}

/**
 * Generate a standard 429 Too Many Requests response
 */
export function rateLimitResponse(
  retryAfterSeconds: number,
  customMessage?: string
): NextResponse {
  const message =
    customMessage ||
    `Too many requests. Please wait ${retryAfterSeconds} seconds before trying again.`;

  return NextResponse.json(
    {
      success: false,
      error: message,
      retryAfter: retryAfterSeconds,
    },
    {
      status: 429,
      headers: {
        "Retry-After": String(retryAfterSeconds),
      },
    }
  );
}
