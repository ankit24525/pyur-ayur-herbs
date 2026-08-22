import { NextResponse } from "next/server";
import { readDB } from "@/lib/db";
import { createSession, buildSessionCookie } from "@/lib/session";
import crypto from "crypto";

export const dynamic = "force-dynamic";

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ success: false, error: "Email and password are required." }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ success: false, error: "Please enter a valid email address." }, { status: 400 });
    }

    const db = await readDB();
    const users = db.users || [];

    const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      return NextResponse.json({ success: false, error: "No account found with this email. Please Sign Up first!" }, { status: 400 });
    }

    const enteredHash = hashPassword(password);
    if (user.passwordHash !== enteredHash) {
      return NextResponse.json({ success: false, error: "Invalid email or password." }, { status: 400 });
    }

    // Create a secure server-side session
    const token = await createSession(user.id);

    // Return minimal user info (only what's safe to expose for immediate UI use)
    const { passwordHash, ...safeUser } = user;

    return NextResponse.json(
      { success: true, user: safeUser },
      {
        headers: {
          "Set-Cookie": buildSessionCookie(token),
        },
      }
    );
  } catch (error) {
    console.error("[Auth/Login]", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
