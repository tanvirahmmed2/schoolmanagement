import { getPlans, getAllPlans, createPlan } from "@/lib/subscription";
import { requireAuth } from "@/lib/middleware";
import { sendOk, sendCreated, sendBadRequest, sendServerError } from "@/utils/response";
import { validateRequired } from "@/utils/validator";

/** GET /api/subscriptions/plans — returns subscription plans */
export async function GET(request) {
  try {
    const sp = new URL(request.url).searchParams;
    const all = sp.get("all") === "true";

    if (all) {
      const { error } = await requireAuth(request, ["admin", "manager"]);
      if (error) return error;
      const plans = await getAllPlans();
      return sendOk(plans);
    }

    const plans = await getPlans();
    return sendOk(plans);
  } catch (err) {
    return sendServerError(err);
  }
}

/** POST /api/subscriptions/plans — create a new plan */
export async function POST(request) {
  const { user, error } = await requireAuth(request, ["admin", "manager"]);
  if (error) return error;
  try {
    const body = await request.json();
    const { valid, errors } = validateRequired(body, ["name", "price", "billingCycle"]);
    if (!valid) return sendBadRequest("Validation failed", errors);

    const plan = await createPlan({
      name: body.name,
      price: body.price,
      billingCycle: body.billingCycle,
      maxStudents: body.maxStudents || null,
      maxTeachers: body.maxTeachers || null,
      features: body.features || {},
    });
    return sendCreated(plan);
  } catch (err) {
    return sendServerError(err);
  }
}
