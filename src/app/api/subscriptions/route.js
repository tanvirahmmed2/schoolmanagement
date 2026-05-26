import { getSubscriptions, getPlans, subscribeTenant } from "@/lib/subscription";
import { requireAuth } from "@/lib/middleware";
import { sendOk, sendCreated, sendPaginated, sendBadRequest, sendServerError } from "@/utils/response";
import { validateRequired, isValidUUID, isValidBillingCycle } from "@/utils/validator";

export async function GET(request) {
  const { user, error } = await requireAuth(request, ["admin", "manager"]);
  if (error) return error;
  try {
    const { subscriptions, pagination } = await getSubscriptions(new URL(request.url).searchParams);
    return sendPaginated(subscriptions, pagination);
  } catch (err) { return sendServerError(err); }
}

export async function POST(request) {
  const { user, error } = await requireAuth(request, ["admin", "client"]);
  if (error) return error;
  try {
    const body = await request.json();
    const { valid, errors } = validateRequired(body, ["tenantId", "planId"]);
    if (!valid) return sendBadRequest("Validation failed", errors);
    if (!isValidUUID(body.tenantId)) return sendBadRequest("Invalid tenantId");
    if (!isValidUUID(body.planId))   return sendBadRequest("Invalid planId");
    if (body.billingCycle && !isValidBillingCycle(body.billingCycle)) {
      return sendBadRequest("billingCycle must be monthly or yearly");
    }
    const sub = await subscribeTenant({
      tenantId: body.tenantId,
      planId: body.planId,
      billingCycle: body.billingCycle,
      status: body.status || "active"
    });
    return sendCreated(sub);
  } catch (err) { return sendServerError(err); }
}
