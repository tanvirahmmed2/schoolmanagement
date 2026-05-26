import { getTickets, createTicket } from "@/lib/support";
import { getTenantByOwner } from "@/lib/tenant";
import { requireAuth } from "@/lib/middleware";
import { sendOk, sendCreated, sendPaginated, sendBadRequest, sendServerError } from "@/utils/response";
import { validateRequired } from "@/utils/validator";

export async function GET(request) {
  const { user, error } = await requireAuth(request, ["admin", "manager", "support", "client"]);
  if (error) return error;
  try {
    const sp = new URL(request.url).searchParams;
    // Clients can only see their own tenant's tickets
    if (user.role === "client") {
      const clientTenant = await getTenantByOwner(user.id);
      if (!clientTenant) {
        return sendPaginated([], { page: 1, pageSize: 20, total: 0 });
      }
      sp.set("tenantId", clientTenant.id);
    }
    const { tickets, pagination } = await getTickets(sp);
    return sendPaginated(tickets, pagination);
  } catch (err) { return sendServerError(err); }
}

export async function POST(request) {
  const { user, error } = await requireAuth(request, ["client", "admin"]);
  if (error) return error;
  try {
    const body = await request.json();
    const { valid, errors } = validateRequired(body, ["subject", "message"]);
    if (!valid) return sendBadRequest("Validation failed", errors);

    let tenantId;
    if (user.role === "client") {
      const clientTenant = await getTenantByOwner(user.id);
      if (!clientTenant) return sendBadRequest("No tenant associated with user");
      tenantId = clientTenant.id;
    } else {
      tenantId = body.tenantId;
      if (!tenantId) return sendBadRequest("tenantId is required");
    }

    const ticket = await createTicket({
      tenantId,
      userId:   user.id,
      subject:  body.subject,
      message:  body.message,
    });
    return sendCreated(ticket);
  } catch (err) { return sendServerError(err); }
}
