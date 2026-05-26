import { getTenants, createTenant, getClientTenant } from "@/lib/tenant";
import { requireAuth } from "@/lib/middleware";
import { sendOk, sendCreated, sendPaginated, sendBadRequest, sendServerError } from "@/utils/response";
import { validateRequired, isValidInstitutionType } from "@/utils/validator";

export async function GET(request) {
  const { user, error } = await requireAuth(request, ["admin", "manager", "support"]);
  if (error) return error;
  try {
    const { tenants, pagination } = await getTenants(new URL(request.url).searchParams);
    return sendPaginated(tenants, pagination);
  } catch (err) { return sendServerError(err); }
}

export async function POST(request) {
  const { user, error } = await requireAuth(request, ["admin"]);
  if (error) return error;
  try {
    const body = await request.json();
    const { valid, errors } = validateRequired(body, ["institutionName", "institutionType", "ownerUserId"]);
    if (!valid) return sendBadRequest("Validation failed", errors);
    if (!isValidInstitutionType(body.institutionType)) return sendBadRequest("Invalid institution type");
    const tenant = await createTenant(body);
    return sendCreated(tenant);
  } catch (err) { return sendServerError(err); }
}
