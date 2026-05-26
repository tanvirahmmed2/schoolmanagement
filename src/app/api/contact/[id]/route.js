import { updateContactSubmissionStatus } from "@/lib/contact";
import { requireAuth } from "@/lib/middleware";
import { sendOk, sendBadRequest, sendNotFound, sendServerError } from "@/utils/response";

const VALID_STATUSES = ["pending", "read", "replied"];

/**
 * PATCH /api/contact/[id]
 * Updates status of a contact submission (Admin and Support only).
 */
export async function PATCH(request, { params }) {
  const { user, error } = await requireAuth(request, ["admin", "support"]);
  if (error) return error;

  try {
    const { status } = await request.json();
    if (!status || !VALID_STATUSES.includes(status)) {
      return sendBadRequest(`status must be one of: ${VALID_STATUSES.join(", ")}`);
    }

    const { id } = await params;
    const result = await updateContactSubmissionStatus(id, status);
    return sendOk(result);
  } catch (err) {
    if (err.status === 404) return sendNotFound("Contact submission");
    return sendServerError(err);
  }
}
