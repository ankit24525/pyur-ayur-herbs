import { NextResponse } from "next/server";
import { resolveSession, extractSessionToken } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const cookieHeader = request.headers.get("cookie");
    const token = extractSessionToken(cookieHeader);
    const user = await resolveSession(token);

    if (!user) {
      return NextResponse.json({ success: false, user: null }, { status: 401 });
    }

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error("[Auth/Me]", error);
    return NextResponse.json({ success: false, user: null }, { status: 500 });
  }
}
