import { updateReviewStatus } from "@/lib/review";
import { requireAuth } from "@/lib/middleware";
import { sendOk, sendBadRequest, sendServerError } from "@/utils/response";

export async function PATCH(request, { params }) {
  const { user, error } = await requireAuth(request, ["admin", "manager"]);
  if (error) return error;

  try {
    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    if (!status) {
      return sendBadRequest("Status is required");
    }

    const review = await updateReviewStatus(id, status);
    return sendOk(review);
  } catch (err) {
    if (err.status) {
      return sendBadRequest(err.message);
    }
    return sendServerError(err);
  }
}
