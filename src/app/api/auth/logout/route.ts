import { NextResponse } from "next/server";
import { deleteSession, extractSessionToken, clearSessionCookie } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const cookieHeader = request.headers.get("cookie");
    const token = extractSessionToken(cookieHeader);

    if (token) {
      try {
        await deleteSession(token);
      } catch (e) {
        console.error("[Auth/Logout] Session deletion warning:", e);
      }
    }

    const response = NextResponse.json({ success: true, message: "Logged out successfully" });
    response.cookies.delete("pyur_session");
    response.headers.set("Set-Cookie", clearSessionCookie());
    return response;
  } catch (error) {
    console.error("[Auth/Logout]", error);
    const response = NextResponse.json({ success: true, message: "Logged out" });
    response.cookies.delete("pyur_session");
    response.headers.set("Set-Cookie", clearSessionCookie());
    return response;
  }
}
