import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const hostname = request.headers.get("host") || "";

  // Check if the visitor is accessing the admin subdomain
  if (hostname.startsWith("admin.purreayurherbs.com") || hostname.startsWith("admin.localhost")) {
    // Rewrite the root path "/" of the admin subdomain to the "/admin" page route internally
    if (url.pathname === "/") {
      url.pathname = "/admin";
      return NextResponse.rewrite(url);
    }
  }

  return NextResponse.next();
}

// Exclude Next.js internal files, static assets, and favicon from middleware execution
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
