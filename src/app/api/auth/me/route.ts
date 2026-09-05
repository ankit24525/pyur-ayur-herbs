import { NextResponse } from "next/server";
import { resolveSession, extractSessionToken, clearSessionCookie, createSession, buildSessionCookie } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const cookieHeader = request.headers.get("cookie");
    const token = extractSessionToken(cookieHeader);
    const user = await resolveSession(token);

    if (!user) {
      const res = NextResponse.json({ success: false, user: null }, { status: 401 });
      res.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");
      if (token) {
        res.headers.set("Set-Cookie", clearSessionCookie());
        res.cookies.delete("pyur_session");
      }
      return res;
    }

    // Refresh sliding session cookie for active user (15 min inactivity window)
    const newToken = await createSession(user.id);
    const res = NextResponse.json({ success: true, user });
    res.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");
    res.headers.set("Set-Cookie", buildSessionCookie(newToken));
    return res;
  } catch (error) {
    console.error("[Auth/Me]", error);
    const res = NextResponse.json({ success: false, user: null }, { status: 500 });
    res.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");
    return res;
  }
}
