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

    const response = NextResponse.json(
      { success: true, message: "Logged out successfully" },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
          "Set-Cookie": clearSessionCookie(),
        },
      }
    );
    response.cookies.delete("pyur_session");
    return response;
  } catch (error) {
    console.error("[Auth/Logout]", error);
    const response = NextResponse.json(
      { success: true, message: "Logged out" },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
          "Set-Cookie": clearSessionCookie(),
        },
      }
    );
    response.cookies.delete("pyur_session");
    return response;
  }
}
