import { getTicketById, updateTicketStatus } from "@/lib/support";
import { getTenantByOwner } from "@/lib/tenant";
import { requireAuth } from "@/lib/middleware";
import { sendOk, sendBadRequest, sendNotFound, sendForbidden, sendServerError } from "@/utils/response";

const VALID_STATUSES = ["open", "in_progress", "resolved", "closed"];

export async function GET(request, { params }) {
  const { user, error } = await requireAuth(request, ["admin","manager","support","client"]);
  if (error) return error;
  try {
    const { id } = await params;
    const ticket = await getTicketById(id);
    if (user.role === "client") {
      const tenant = await getTenantByOwner(user.id);
      if (!tenant || ticket.tenant_id !== tenant.id) {
        return sendForbidden("Access denied to this ticket");
      }
    }
    return sendOk(ticket);
  } catch (err) {
    if (err.status === 404) return sendNotFound("Ticket");
    return sendServerError(err);
  }
}

export async function PATCH(request, { params }) {
  const { user, error } = await requireAuth(request, ["admin","support","client"]);
  if (error) return error;
  try {
    const { status } = await request.json();
    if (!VALID_STATUSES.includes(status)) return sendBadRequest(`status must be one of: ${VALID_STATUSES.join(", ")}`);
    
    const { id } = await params;
    const ticket = await getTicketById(id);
    if (user.role === "client") {
      const tenant = await getTenantByOwner(user.id);
      if (!tenant || ticket.tenant_id !== tenant.id) {
        return sendForbidden("Access denied to this ticket");
      }
      if (status !== "closed" && status !== "resolved") {
        return sendBadRequest("Clients can only mark tickets as resolved or closed");
      }
    }

    const result = await updateTicketStatus(id, status);
    return sendOk(result);
  } catch (err) {
    if (err.status === 404) return sendNotFound("Ticket");
    return sendServerError(err);
  }
}
