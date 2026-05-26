import { addMessage, getMessages, getTicketById } from "@/lib/support";
import { getTenantByOwner } from "@/lib/tenant";
import { requireAuth } from "@/lib/middleware";
import { sendOk, sendCreated, sendBadRequest, sendForbidden, sendNotFound, sendServerError } from "@/utils/response";
import { validateRequired } from "@/utils/validator";

export async function GET(request, { params }) {
  const { user, error } = await requireAuth(request, ["admin","support","client"]);
  if (error) return error;
  try {
    const { id } = await params;
    const ticket = await getTicketById(id);
    if (user.role === "client") {
      const tenant = await getTenantByOwner(user.id);
      if (!tenant || ticket.tenant_id !== tenant.id) {
        return sendForbidden("Access denied to this ticket's messages");
      }
    }
    const messages = await getMessages(id);
    return sendOk(messages);
  } catch (err) {
    if (err.status === 404) return sendNotFound("Ticket");
    return sendServerError(err);
  }
}

export async function POST(request, { params }) {
  const { user, error } = await requireAuth(request, ["admin","support","client"]);
  if (error) return error;
  try {
    const body = await request.json();
    const { valid, errors } = validateRequired(body, ["message"]);
    if (!valid) return sendBadRequest("Validation failed", errors);

    const { id } = await params;
    const ticket = await getTicketById(id);
    if (user.role === "client") {
      const tenant = await getTenantByOwner(user.id);
      if (!tenant || ticket.tenant_id !== tenant.id) {
        return sendForbidden("Access denied to this ticket");
      }
    }

    const msg = await addMessage({
      ticketId:    id,
      senderId:    user.id,
      message:     body.message,
      attachments: body.attachments || null,
    });
    return sendCreated(msg);
  } catch (err) {
    if (err.status === 404) return sendNotFound("Ticket");
    return sendServerError(err);
  }
}
