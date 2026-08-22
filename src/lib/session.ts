import crypto from "crypto";
import { readDB, writeDB } from "./db";

const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export function generateSessionToken(): string {
  return crypto.randomBytes(48).toString("hex");
}

/** Creates a session in DB and returns the token */
export async function createSession(userId: string): Promise<string> {
  const token = generateSessionToken();
  const expiresAt = Date.now() + SESSION_DURATION_MS;

  const db = await readDB();
  const sessions = (db.sessions || []).filter(
    (s) => s.expiresAt > Date.now() // prune expired sessions on write
  );
  sessions.push({ token, userId, expiresAt });
  db.sessions = sessions;
  await writeDB(db);

  return token;
}

/** Resolves a session token to a user object (without passwordHash). Returns null if invalid/expired. */
export async function resolveSession(token: string | undefined): Promise<any | null> {
  if (!token) return null;

  const db = await readDB();
  const session = (db.sessions || []).find(
    (s) => s.token === token && s.expiresAt > Date.now()
  );
  if (!session) return null;

  const user = (db.users || []).find((u) => u.id === session.userId);
  if (!user) return null;

  const { passwordHash, ...safeUser } = user;
  return safeUser;
}

/** Deletes a session by token */
export async function deleteSession(token: string): Promise<void> {
  const db = await readDB();
  db.sessions = (db.sessions || []).filter((s) => s.token !== token);
  await writeDB(db);
}

/** Builds the Set-Cookie header string for setting the session cookie */
export function buildSessionCookie(token: string): string {
  const maxAge = Math.floor(SESSION_DURATION_MS / 1000); // seconds
  return `pyur_session=${token}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${maxAge}`;
}

/** Builds the Set-Cookie header string to clear the session cookie */
export function clearSessionCookie(): string {
  return `pyur_session=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0`;
}

/** Extracts pyur_session cookie value from a Cookie header string */
export function extractSessionToken(cookieHeader: string | null): string | undefined {
  if (!cookieHeader) return undefined;
  const match = cookieHeader.match(/(?:^|;\s*)pyur_session=([^;]+)/);
  return match ? match[1] : undefined;
}
