import { cancelSubscription, getTenantSubscription } from "@/lib/subscription";
import { requireAuth } from "@/lib/middleware";
import { sendOk, sendNotFound, sendServerError } from "@/utils/response";

export async function GET(request, { params }) {
  const { user, error } = await requireAuth(request, ["admin", "manager", "client"]);
  if (error) return error;
  try {
    // For clients, id is treated as tenantId
    const { id } = await params;
    const sub = await getTenantSubscription(id);
    if (!sub) return sendNotFound("Subscription");
    return sendOk(sub);
  } catch (err) { return sendServerError(err); }
}

export async function DELETE(request, { params }) {
  const { user, error } = await requireAuth(request, ["admin"]);
  if (error) return error;
  try {
    const { id } = await params;
    const result = await cancelSubscription(id);
    return sendOk(result);
  } catch (err) {
    if (err.status === 404) return sendNotFound("Subscription");
    return sendServerError(err);
  }
}
