import { NextResponse } from "next/server";
import { COOKIE_ACCESS_TOKEN, COOKIE_REFRESH_TOKEN } from "@/lib/constants";

export async function POST() {
  const response = NextResponse.json({ success: true, message: "Logged out" });
  response.cookies.set(COOKIE_ACCESS_TOKEN,  "", { maxAge: 0, path: "/" });
  response.cookies.set(COOKIE_REFRESH_TOKEN, "", { maxAge: 0, path: "/api/auth/refresh" });
  return response;
}

export async function GET(request) {
  const response = NextResponse.redirect(new URL("/login", request.url));
  response.cookies.set(COOKIE_ACCESS_TOKEN,  "", { maxAge: 0, path: "/" });
  response.cookies.set(COOKIE_REFRESH_TOKEN, "", { maxAge: 0, path: "/api/auth/refresh" });
  return response;
}
