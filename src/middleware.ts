import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const hostname = request.headers.get("host") || request.nextUrl.hostname || "";
  const { pathname } = request.nextUrl;

  // Handle admin subdomain (e.g. admin.purreayurherbs.com or admin.pureayurherbs.com)
  if (hostname.toLowerCase().startsWith("admin.")) {
    // If request is for root or non-API path, rewrite to /admin
    if (!pathname.startsWith("/api") && !pathname.startsWith("/_next")) {
      if (pathname === "/") {
        return NextResponse.rewrite(new URL("/admin", request.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
