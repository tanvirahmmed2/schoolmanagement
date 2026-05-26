import { getUserById, updateUser, deactivateUser, deleteUser } from "@/lib/user";
import { requireAuth } from "@/lib/middleware";
import { sendOk, sendNoContent, sendBadRequest, sendNotFound, sendServerError } from "@/utils/response";

export async function GET(request, { params }) {
  const { user, error } = await requireAuth(request, ["admin", "manager"]);
  if (error) return error;
  try {
    const { id } = await params;
    const data = await getUserById(id);
    return sendOk(data);
  } catch (err) {
    if (err.status === 404) return sendNotFound("User");
    return sendServerError(err);
  }
}

export async function PATCH(request, { params }) {
  const { user, error } = await requireAuth(request, ["admin"]);
  if (error) return error;
  try {
    const body    = await request.json();
    const { id } = await params;
    const updated = await updateUser(id, body);
    return sendOk(updated);
  } catch (err) {
    if (err.status === 404) return sendNotFound("User");
    return sendServerError(err);
  }
}

export async function DELETE(request, { params }) {
  const { user, error } = await requireAuth(request, ["admin"]);
  if (error) return error;
  try {
    const { id } = await params;
    await deleteUser(id);
    return sendNoContent();
  } catch (err) { return sendServerError(err); }
}
