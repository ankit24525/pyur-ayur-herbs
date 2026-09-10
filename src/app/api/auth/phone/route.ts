import { NextResponse } from "next/server";
import { readDB, writeDB } from "@/lib/db";
import { createSession, buildSessionCookie } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { phone, firebaseUid, name } = body;

    if (!phone) {
      return NextResponse.json(
        { success: false, error: "Phone number is required." },
        { status: 400 }
      );
    }

    const cleanPhone = phone.replace(/\D/g, "").slice(-10);
    if (cleanPhone.length !== 10) {
      return NextResponse.json(
        { success: false, error: "Please provide a valid 10-digit phone number." },
        { status: 400 }
      );
    }

    const db = await readDB();
    const users = db.users || [];

    let user = users.find((u: any) => {
      const uPhone = (u.phone || "").replace(/\D/g, "").slice(-10);
      return uPhone === cleanPhone;
    });

    if (!user) {
      // Auto create new customer account on first phone login
      const newUserId = `USR-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
      user = {
        id: newUserId,
        name: name || `Member ${cleanPhone.slice(-4)}`,
        phone: cleanPhone,
        email: `${cleanPhone}@pureayurherbs.com`,
        firebaseUid: firebaseUid || "",
        role: "Customer",
        createdAt: new Date().toISOString(),
      };
      db.users = [...users, user];
      await writeDB(db);
    } else if (firebaseUid && !user.firebaseUid) {
      user.firebaseUid = firebaseUid;
      db.users = users;
      await writeDB(db);
    }

    // Create session token and HTTP-only cookie
    const token = await createSession(user.id);
    const { passwordHash, ...safeUser } = user;

    return NextResponse.json(
      { success: true, user: safeUser },
      {
        headers: {
          "Set-Cookie": buildSessionCookie(token),
        },
      }
    );
  } catch (error: any) {
    console.error("[Auth/Phone]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
