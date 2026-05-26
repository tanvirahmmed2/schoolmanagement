import { getContactSubmissionById, createContactReply, getContactReplies, updateContactSubmissionStatus } from "@/lib/contact";
import { sendContactReplyEmail } from "@/lib/mail";
import { requireAuth } from "@/lib/middleware";
import { sendOk, sendCreated, sendBadRequest, sendNotFound, sendServerError } from "@/utils/response";
import { validateRequired } from "@/utils/validator";

/**
 * GET /api/contact/[id]/replies
 * Gets the reply history for a specific contact submission.
 */
export async function GET(request, { params }) {
  const { user, error } = await requireAuth(request, ["admin", "support"]);
  if (error) return error;

  try {
    const { id } = await params;
    // Verify submission exists
    await getContactSubmissionById(id);
    const replies = await getContactReplies(id);
    return sendOk(replies);
  } catch (err) {
    if (err.status === 404) return sendNotFound("Contact submission");
    return sendServerError(err);
  }
}

/**
 * POST /api/contact/[id]/replies
 * Sends an email reply using Brevo and stores it in the database.
 */
export async function POST(request, { params }) {
  const { user, error } = await requireAuth(request, ["admin", "support"]);
  if (error) return error;

  try {
    const body = await request.json();
    const { valid, errors } = validateRequired(body, ["message"]);
    if (!valid) {
      return sendBadRequest("Message is required", errors);
    }

    const { id } = await params;
    const submission = await getContactSubmissionById(id);

    // 1. Send the email using Brevo
    await sendContactReplyEmail({
      email: submission.email,
      name: submission.name,
      subject: `Inquiry: ${submission.institution}`,
      replyMessage: body.message
    });

    // 2. Store the reply in database
    const reply = await createContactReply({
      contactSubmissionId: id,
      senderId: user.id,
      message: body.message
    });

    // 3. Mark the submission as replied
    await updateContactSubmissionStatus(id, "replied");

    return sendCreated(reply);
  } catch (err) {
    if (err.status === 404) return sendNotFound("Contact submission");
    return sendServerError(err);
  }
}
