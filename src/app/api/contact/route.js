import { createContactSubmission, getContactSubmissions } from "@/lib/contact";
import { requireAuth } from "@/lib/middleware";
import { sendOk, sendCreated, sendBadRequest, sendServerError } from "@/utils/response";
import { validateRequired } from "@/utils/validator";

/**
 * GET /api/contact
 * Lists all contact submissions (Admin and Support only).
 */
export async function GET(request) {
  const { user, error } = await requireAuth(request, ["admin", "support"]);
  if (error) return error;

  try {
    const list = await getContactSubmissions();
    return sendOk(list);
  } catch (err) {
    return sendServerError(err);
  }
}

/**
 * POST /api/contact
 * Unauthenticated endpoint for submitting the contact form.
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const required = ["name", "email", "institution", "type", "message"];
    const { valid, errors } = validateRequired(body, required);
    if (!valid) {
      return sendBadRequest("Missing required fields", errors);
    }

    const submission = await createContactSubmission({
      name: body.name,
      email: body.email,
      phone: body.phone,
      institution: body.institution,
      type: body.type,
      message: body.message
    });

    return sendCreated(submission);
  } catch (err) {
    return sendServerError(err);
  }
}
