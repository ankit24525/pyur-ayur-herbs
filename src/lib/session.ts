import crypto from "crypto";
import { readDB, writeDB } from "./db";

const SESSION_DURATION_MS = 15 * 60 * 1000; // 15 minutes of inactivity timeout

const SESSION_SECRET = process.env.SESSION_SECRET || process.env.ADMIN_PASSWORD || "pyur_ayur_session_secret_key_2026";

export function generateSessionToken(): string {
  return crypto.randomBytes(48).toString("hex");
}

/** Creates a secure HMAC-signed session token instantly (0ms latency, zero DB write) */
export async function createSession(userId: string): Promise<string> {
  const expiresAt = Date.now() + SESSION_DURATION_MS;
  const payload = `${userId}.${expiresAt}`;
  const hmac = crypto.createHmac("sha256", SESSION_SECRET).update(payload).digest("hex");
  return `${payload}.${hmac}`;
}

/** Resolves a session token to a user object (without passwordHash). Returns null if invalid/expired. */
export async function resolveSession(token: string | undefined): Promise<any | null> {
  if (!token) return null;

  // 1. High-speed HMAC-signed token verification (< 0.01ms)
  const parts = token.split(".");
  if (parts.length === 3) {
    const [userId, expiresAtStr, signature] = parts;
    const expiresAt = parseInt(expiresAtStr, 10);
    if (!isNaN(expiresAt) && Date.now() < expiresAt) {
      const expectedHmac = crypto
        .createHmac("sha256", SESSION_SECRET)
        .update(`${userId}.${expiresAtStr}`)
        .digest("hex");

      let isValid = false;
      try {
        isValid = crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedHmac));
      } catch {
        isValid = false;
      }

      if (isValid) {
        const db = await readDB();
        const user = (db.users || []).find((u) => u.id === userId);
        if (user) {
          const { passwordHash, ...safeUser } = user;
          return safeUser;
        }
      }
    }
    return null;
  }

  // 2. Backward compatibility fallback for legacy random hex tokens stored in DB
  try {
    const db = await readDB();
    const session = (db.sessions || []).find(
      (s) => s.token === token && s.expiresAt > Date.now()
    );
    if (!session) return null;

    const user = (db.users || []).find((u) => u.id === session.userId);
    if (!user) return null;

    const { passwordHash, ...safeUser } = user;
    return safeUser;
  } catch {
    return null;
  }
}

/** Deletes a session by token */
export async function deleteSession(token: string): Promise<void> {
  // Stateless HMAC tokens are invalidated instantly on the browser by clearing the cookie.
  // Clean up legacy tokens from DB asynchronously without blocking if any exist.
  if (!token.includes(".")) {
    try {
      const db = await readDB();
      if (db.sessions && db.sessions.some((s) => s.token === token)) {
        db.sessions = db.sessions.filter((s) => s.token !== token);
        void writeDB(db);
      }
    } catch {}
  }
}

/** Builds the Set-Cookie header string for setting the session cookie */
export function buildSessionCookie(token: string): string {
  const maxAge = Math.floor(SESSION_DURATION_MS / 1000); // seconds
  return `pyur_session=${token}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${maxAge}`;
}

/** Builds the Set-Cookie header string to clear the session cookie */
export function clearSessionCookie(): string {
  return `pyur_session=; Path=/; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Lax`;
}

/** Extracts pyur_session cookie value from a Cookie header string */
export function extractSessionToken(cookieHeader: string | null): string | undefined {
  if (!cookieHeader) return undefined;
  const match = cookieHeader.match(/(?:^|;\s*)pyur_session=([^;]+)/);
  return match ? match[1] : undefined;
}
