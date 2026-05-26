import { loginUser } from "@/lib/auth";
import { sendOk, sendBadRequest, sendServerError } from "@/utils/response";
import { validateRequired, isValidEmail } from "@/utils/validator";
import { COOKIE_ACCESS_TOKEN, COOKIE_REFRESH_TOKEN } from "@/lib/constants";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const body = await request.json();
    const { valid, errors } = validateRequired(body, ["email", "password"]);
    if (!valid) return sendBadRequest("Validation failed", errors);
    if (!isValidEmail(body.email)) return sendBadRequest("Invalid email format");

    const { user, accessToken, refreshToken } = await loginUser({
      email: body.email.toLowerCase().trim(),
      password: body.password,
    });

    const response = sendOk({ user, accessToken });

    // Set httpOnly cookies
    const isSecure = process.env.NODE_ENV === "production";
    response.cookies.set(COOKIE_ACCESS_TOKEN, accessToken, {
      httpOnly: true,
      secure: isSecure,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 15, // 15 min
    });
    response.cookies.set(COOKIE_REFRESH_TOKEN, refreshToken, {
      httpOnly: true,
      secure: isSecure,
      sameSite: "lax",
      path: "/api/auth/refresh",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (err) {
    if (err.status === 401 || err.status === 403) {
      return NextResponse.json({ success: false, message: err.message }, { status: err.status });
    }
    return sendServerError(err);
  }
}

