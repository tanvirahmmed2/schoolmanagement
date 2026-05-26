import { updatePlan } from "@/lib/subscription";
import { requireAuth } from "@/lib/middleware";
import { sendOk, sendNotFound, sendServerError } from "@/utils/response";

export async function PATCH(request, { params }) {
  const { user, error } = await requireAuth(request, ["admin", "manager"]);
  if (error) return error;
  try {
    const { id } = await params;
    const body = await request.json();

    const mappedBody = {
      ...body,
      billingCycle: body.billingCycle !== undefined ? body.billingCycle : body.billing_cycle,
      maxStudents: body.maxStudents !== undefined ? body.maxStudents : body.max_students,
      maxTeachers: body.maxTeachers !== undefined ? body.maxTeachers : body.max_teachers,
      isActive: body.isActive !== undefined ? body.isActive : body.is_active,
    };

    const result = await updatePlan(id, mappedBody);
    return sendOk(result);
  } catch (err) {
    if (err.status === 404) return sendNotFound("Plan");
    return sendServerError(err);
  }
}

export async function DELETE(request, { params }) {
  const { user, error } = await requireAuth(request, ["admin", "manager"]);
  if (error) return error;
  try {
    const { id } = await params;
    const result = await updatePlan(id, { isActive: false });
    return sendOk({ success: true, message: "Plan deactivated", data: result });
  } catch (err) {
    if (err.status === 404) return sendNotFound("Plan");
    return sendServerError(err);
  }
}
