import { getClientTenant } from "@/lib/tenant";
import { requireAuth } from "@/lib/middleware";
import { sendOk, sendNotFound, sendServerError } from "@/utils/response";

/** GET /api/tenants/me — returns the authenticated client's own tenant */
export async function GET(request) {
  const { user, error } = await requireAuth(request, ["client"]);
  if (error) return error;
  try {
    const tenant = await getClientTenant(user.id);
    return sendOk(tenant);
  } catch (err) {
    if (err.status === 404) return sendNotFound("Tenant");
    return sendServerError(err);
  }
}
