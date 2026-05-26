import { getCurrentUser, findUserById } from "@/lib/auth";
import { sendOk, sendUnauthorized, sendServerError } from "@/utils/response";
import { sanitiseUser } from "@/utils/helpers";

/** GET /api/auth/me — returns the currently authenticated user */
export async function GET(request) {
  try {
    const tokenPayload = await getCurrentUser(request);
    if (!tokenPayload) return sendUnauthorized();

    const user = await findUserById(tokenPayload.id);
    if (!user || !user.is_active) return sendUnauthorized("Account not found or inactive");

    return sendOk(sanitiseUser(user));
  } catch (err) { return sendServerError(err); }
}
