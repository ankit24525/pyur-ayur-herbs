import { NextResponse } from "next/server";
import { deleteSession, extractSessionToken, clearSessionCookie } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const cookieHeader = request.headers.get("cookie");
    const token = extractSessionToken(cookieHeader);

    if (token) {
      await deleteSession(token);
    }

    return NextResponse.json(
      { success: true },
      {
        headers: {
          "Set-Cookie": clearSessionCookie(),
        },
      }
    );
  } catch (error) {
    console.error("[Auth/Logout]", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
