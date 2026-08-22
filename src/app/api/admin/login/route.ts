import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Hardcoded admin credentials (can be moved to env variables)
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "pyuradmin";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "PyurAyur@2025!";

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json({ success: false, error: "Username and password are required." }, { status: 400 });
    }

    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
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
