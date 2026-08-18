import { NextResponse } from "next/server";
import { readDB, writeDB } from "@/lib/db";
import crypto from "crypto";

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, name, phone, password } = body;

    if (!userId || !name || !phone) {
      return NextResponse.json({ success: false, error: "User ID, name, and phone are required." }, { status: 400 });
    }

    const db = await readDB();
    const users = db.users || [];

    const idx = users.findIndex((u) => String(u.id) === String(userId));
    if (idx === -1) {
      return NextResponse.json({ success: false, error: "User not found." }, { status: 404 });
    }

    // Update details
    users[idx].name = name;
    users[idx].phone = phone;

    if (password && password.trim() !== "") {
      users[idx].passwordHash = hashPassword(password);
    }

    db.users = users;
    await writeDB(db);

    const { passwordHash, ...userResponse } = users[idx];
    return NextResponse.json({
      success: true,
      user: userResponse,
      message: "Profile updated successfully!",
    });
  } catch (error) {
    console.error("[Profile Update API] Error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
