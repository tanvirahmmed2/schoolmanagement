import { sendOk, sendServerError } from "@/utils/response";
import { requireAuth } from "@/lib/middleware";

/** GET /api/notifications — stub for in-app notifications (extend later) */
export async function GET(request) {
  const { user, error } = await requireAuth(request);
  if (error) return error;
  try {
    // Placeholder — extend with a notifications table later
    return sendOk([], { message: "Notification system coming soon" });
  } catch (err) { return sendServerError(err); }
}
