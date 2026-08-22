import { NextResponse } from "next/server";
import { readDB, writeDB } from "@/lib/db";
import { createSession, buildSessionCookie } from "@/lib/session";
import crypto from "crypto";

export const dynamic = "force-dynamic";

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, phone, password } = body;

    if (!name || !email || !password) {
      return NextResponse.json({ success: false, error: "Name, email, and password are required." }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ success: false, error: "Please enter a valid email address." }, { status: 400 });
    }

    if (phone) {
      const phoneRegex = /^[0-9]{10}$/;
      if (!phoneRegex.test(phone)) {
        return NextResponse.json({ success: false, error: "Please enter a valid 10-digit mobile number." }, { status: 400 });
      }
    }

    const db = await readDB();
    const users = db.users || [];

    const exists = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (exists) {
      return NextResponse.json({ success: false, error: "A user with this email already exists." }, { status: 400 });
    }

    const newUser = {
      id: String(Date.now()),
      name,
      email: email.toLowerCase(),
      phone: phone || "",
      passwordHash: hashPassword(password),
      createdAt: new Date().toISOString(),
    };

    db.users = [...users, newUser];
    await writeDB(db);

    // Create a secure server-side session
    const token = await createSession(newUser.id);

    // Return safe user (no passwordHash)
    const { passwordHash, ...safeUser } = newUser;

    return NextResponse.json(
      { success: true, user: safeUser },
      {
        headers: {
          "Set-Cookie": buildSessionCookie(token),
        },
      }
    );
  } catch (error) {
    console.error("[Auth/Signup]", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
