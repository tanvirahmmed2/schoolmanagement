import { getTenantById, updateTenant, setTenantStatus, deleteTenant } from "@/lib/tenant";
import { requireAuth } from "@/lib/middleware";
import { sendOk, sendNoContent, sendBadRequest, sendNotFound, sendServerError } from "@/utils/response";

export async function GET(request, { params }) {
  const { user, error } = await requireAuth(request, ["admin", "manager", "support"]);
  if (error) return error;
  try {
    const { id } = await params;
    const tenant = await getTenantById(id);
    return sendOk(tenant);
  } catch (err) {
    if (err.status === 404) return sendNotFound("Tenant");
    return sendServerError(err);
  }
}

export async function PATCH(request, { params }) {
  const { user, error } = await requireAuth(request, ["admin", "manager", "client"]);
  if (error) return error;
  try {
    const body = await request.json();
    const { id } = await params;
    const tenant = await getTenantById(id);
    if (!tenant) return sendNotFound("Tenant");

    // Client can only update their own tenant
    if (user.role === "client" && tenant.owner_user_id !== user.id) {
      return sendBadRequest("Unauthorized to modify this tenant");
    }

    // Handle status change separately (admin/manager only)
    if (body.status) {
      if (user.role === "client") {
        return sendBadRequest("Clients cannot change tenant status");
      }
      const VALID = ["pending","active","suspended","expired"];
      if (!VALID.includes(body.status)) return sendBadRequest("Invalid status");
      const result = await setTenantStatus(id, body.status);
      return sendOk(result);
    }

    const updated = await updateTenant(id, body);
    return sendOk(updated);
  } catch (err) {
    if (err.status === 404) return sendNotFound("Tenant");
    return sendServerError(err);
  }
}

export async function DELETE(request, { params }) {
  const { user, error } = await requireAuth(request, ["admin"]);
  if (error) return error;
  try {
    const { id } = await params;
    await deleteTenant(id);
    return sendNoContent();
  } catch (err) { return sendServerError(err); }
}
