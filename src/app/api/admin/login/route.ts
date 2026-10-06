import { NextResponse } from "next/server";
import { getClientIp, checkRateLimit, rateLimitResponse } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

// Hardcoded admin credentials (can be moved to env variables)
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "pyuradmin";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "pureayurherbs@gmail.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "pureayurherbadmin@24";

export async function POST(request: Request) {
  try {
    const clientIp = getClientIp(request);

    // Brute force protection: Max 5 failed login attempts per 10 minutes per IP
    const rateCheck = checkRateLimit(`login:ip:${clientIp}`, 5, 600);
    if (!rateCheck.allowed) {
      return rateLimitResponse(
        rateCheck.retryAfterSeconds,
        `Too many login attempts. Please wait ${rateCheck.retryAfterSeconds} seconds before trying again.`
      );
    }

    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json({ success: false, error: "Username/Email and password are required." }, { status: 400 });
    }

    const isMatch = (username.toLowerCase() === ADMIN_USERNAME.toLowerCase() || username.toLowerCase() === ADMIN_EMAIL.toLowerCase()) && 
                    password === ADMIN_PASSWORD;

    if (isMatch) {
      // Successful login — return a session token
      const token = Buffer.from(`${username}:${Date.now()}`).toString("base64");
      return NextResponse.json({ success: true, token, expiresIn: 86400 });
    }

    return NextResponse.json({ success: false, error: "Invalid credentials. Access denied." }, { status: 401 });
  } catch (e) {
    console.error("[Admin Auth] Error:", e);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
