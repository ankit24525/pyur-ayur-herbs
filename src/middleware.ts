import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const hostname = request.headers.get("host") || "";

  // Check if the visitor is accessing via the admin subdomain (e.g., admin.purreayurherbs.com or admin.localhost:3000)
  const isAdminHost = hostname.startsWith("admin.");

  if (isAdminHost) {
    // If on admin subdomain and accessing "/", rewrite internally to "/admin" page route
    if (url.pathname === "/") {
      url.pathname = "/admin";
      return NextResponse.rewrite(url);
    }
    
    // Redirect storefront paths (like checkout, solutions, products) visited on admin subdomain back to main domain
    const allowedAdminPaths = ["/admin", "/api/admin", "/_next", "/favicon.ico"];
    const isAllowed = allowedAdminPaths.some(path => url.pathname === path || url.pathname.startsWith(path + "/"));
    
    if (!isAllowed) {
      const mainHost = hostname.replace(/^admin\./, "");
      const protocol = request.nextUrl.protocol || "https:";
      return NextResponse.redirect(new URL(`${protocol}//${mainHost}${url.pathname}${url.search}`), 307);
    }
  } else {
    // On the main domain (purreayurherbs.com / localhost:3000)
    // If they manually try to load "/admin" or admin API routes, redirect them to the home page!
    if (url.pathname === "/admin" || url.pathname.startsWith("/admin/") || url.pathname.startsWith("/api/admin")) {
      return NextResponse.redirect(new URL("/", request.url), 307);
    }
  }

  return NextResponse.next();
}

// Intercept all paths except static assets
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
