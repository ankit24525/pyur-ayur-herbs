import { NextResponse } from "next/server";
import { readDB } from "@/lib/db";
import crypto from "crypto";

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

    // Return user details without password hash
    const { passwordHash, ...userResponse } = user;
    return NextResponse.json({ success: true, user: userResponse });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
