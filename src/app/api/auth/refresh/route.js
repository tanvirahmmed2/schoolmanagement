import { refreshTokens } from "@/lib/auth";
import { sendOk, sendUnauthorized, sendServerError } from "@/utils/response";
import { COOKIE_ACCESS_TOKEN, COOKIE_REFRESH_TOKEN } from "@/lib/constants";

export async function POST(request) {
  try {
    const cookies = request.headers.get("cookie") || "";
    const match   = cookies.match(/(?:^|;\s*)refresh_token=([^;]+)/);
    const refreshToken = match?.[1];

    if (!refreshToken) return sendUnauthorized("No refresh token");

    const { accessToken, user } = await refreshTokens(refreshToken);

    const response = sendOk({ user, accessToken });
    response.cookies.set(COOKIE_ACCESS_TOKEN, accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 15,
    });
    return response;
  } catch (err) {
    if (err.status === 401) return sendUnauthorized(err.message);
    return sendServerError(err);
  }
}
