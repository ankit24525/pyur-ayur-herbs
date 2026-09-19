import { NextResponse } from "next/server";
import { readDB, writeDB } from "@/lib/db";
import { verifyOTP } from "@/lib/whatsapp-otp";
import { createSession, buildSessionCookie } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { phone, otp, name } = body;

    if (!phone || !otp) {
      return NextResponse.json(
        { success: false, error: "Phone number and verification code are required." },
        { status: 400 }
      );
    }

    const clean = phone.replace(/\D/g, "").slice(-10);
    if (clean.length !== 10) {
      return NextResponse.json(
        { success: false, error: "Please provide a valid 10-digit mobile number." },
        { status: 400 }
      );
    }

    // 1. Verify and burn OTP
    const verification = await verifyOTP(clean, String(otp).trim(), "login");
    if (!verification.valid) {
      return NextResponse.json(
        { success: false, error: verification.error || "Invalid verification code." },
        { status: 400 }
      );
    }

    // 2. Fetch or create customer record
    const db = await readDB();
    const users = db.users || [];

    let user = users.find((u: any) => {
      const uPhone = (u.phone || "").replace(/\D/g, "").slice(-10);
      return uPhone === clean;
    });

    if (!user) {
      const newUserId = `USR-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
      user = {
        id: newUserId,
        name: name || `Customer ${clean.slice(-4)}`,
        phone: clean,
        email: `${clean}@pureayurherbs.com`,
        role: "Customer",
        createdAt: new Date().toISOString(),
      };
      db.users = [...users, user];
      await writeDB(db);
    } else if (name && name.trim() && user.name !== name.trim()) {
      user.name = name.trim();
      db.users = users.map((u: any) => (u.id === user.id ? user : u));
      await writeDB(db);
    }

    // 3. Generate session and secure HTTP-only cookie
    const token = await createSession(user.id);
    const { passwordHash, ...safeUser } = user;

    return NextResponse.json(
      {
        success: true,
        message: "Logged in successfully!",
        user: safeUser,
      },
      {
        headers: {
          "Set-Cookie": buildSessionCookie(token),
        },
      }
    );
  } catch (error: any) {
    console.error("[Auth/WhatsApp/VerifyOTP]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
