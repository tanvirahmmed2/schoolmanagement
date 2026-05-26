import { NextResponse } from "next/server";
import { verifyAccessToken, extractCookieToken, extractBearerToken } from "@/lib/auth";
import { ROLE_HOME, ROLE_PROTECTED_PATHS, hasMinRole } from "@/lib/roles";
import { ROLES } from "@/lib/constants";

// Public routes — no auth needed
const PUBLIC_PATHS = ["/", "/about", "/features", "/pricing", "/contact", "/demo", "/faq", "/login", "/register", "/forgot-password", "/reset-password"];

// API routes that are public
const PUBLIC_API = ["/api/auth/login", "/api/auth/register", "/api/auth/refresh", "/api/auth/verify", "/api/health", "/api/subscriptions/plans", "/api/reviews"];

export async function proxy(request) {
  const { pathname } = request.nextUrl;

  // Allow Next.js internals & static assets
  if (pathname.startsWith("/_next") || pathname.startsWith("/favicon") || pathname.includes(".")) {
    return NextResponse.next();
  }

  // Allow public API routes
  if (PUBLIC_API.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Allow public pages
  if (PUBLIC_PATHS.includes(pathname)) {
    // If the user is already authenticated, redirect them away from auth-specific pages
    const token = extractCookieToken(request) || extractBearerToken(request);
    if (token) {
      try {
        const user = await verifyAccessToken(token);
        if (user && ["/login", "/register", "/forgot-password", "/reset-password"].includes(pathname)) {
          const home = ROLE_HOME[user.role] || "/login";
          return NextResponse.redirect(new URL(home, request.url));
        }
      } catch {
        // Token is invalid/expired, let them view the public page
      }
    }
    return NextResponse.next();
  }

  // Extract token from cookie or Authorization header
  const token = extractCookieToken(request) || extractBearerToken(request);

  // No token — redirect to login (or return 401 for APIs)
  if (!token) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  let user;
  try {
    user = await verifyAccessToken(token);
  } catch {
    // Expired / invalid — redirect to login (or return 401 for APIs)
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
    }
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete("access_token");
    return response;
  }

  // Enforce panel protection based on required roles / hierarchy
  for (const [role, paths] of Object.entries(ROLE_PROTECTED_PATHS)) {
    if (paths.some((p) => pathname.startsWith(p)) && !hasMinRole(user.role, role)) {
      // Redirect to their own dashboard instead of 403
      const home = ROLE_HOME[user.role] || "/login";
      return NextResponse.redirect(new URL(home, request.url));
    }
  }

  // Attach user info to request headers for server components
  const headers = new Headers(request.headers);
  headers.set("x-user-id",   user.id);
  headers.set("x-user-role", user.role);
  headers.set("x-user-email", user.email || "");

  return NextResponse.next({ request: { headers } });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
