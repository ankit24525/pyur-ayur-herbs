import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const hostname = (request.headers.get("host") || request.nextUrl.hostname || "").toLowerCase();
  const { pathname } = request.nextUrl;

  // Handle admin subdomain (e.g. admin.purreayurherbs.com or admin.pureayurherbs.com)
  if (hostname.startsWith("admin.")) {
    // If request is not already on /admin, /api, or static assets, rewrite to /admin
    if (!pathname.startsWith("/admin") && !pathname.startsWith("/api") && !pathname.startsWith("/_next")) {
      return NextResponse.rewrite(new URL("/admin", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
