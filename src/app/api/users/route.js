import { getUsers, createUser } from "@/lib/user";
import { requireAuth } from "@/lib/middleware";
import { sendOk, sendCreated, sendPaginated, sendBadRequest, sendServerError } from "@/utils/response";
import { validateRequired } from "@/utils/validator";

export async function GET(request) {
  const { user, error } = await requireAuth(request, ["admin", "manager"]);
  if (error) return error;
  try {
    const { users, pagination } = await getUsers(new URL(request.url).searchParams);
    return sendPaginated(users, pagination);
  } catch (err) { return sendServerError(err); }
}

export async function POST(request) {
  const { user, error } = await requireAuth(request, ["admin"]);
  if (error) return error;
  try {
    const body = await request.json();
    const { valid, errors } = validateRequired(body, ["name", "email", "password", "role"]);
    if (!valid) return sendBadRequest("Validation failed", errors);

    const newUser = await createUser(body);
    return sendCreated(newUser);
  } catch (err) {
    if (err.code === "23505") {
      return sendBadRequest("Email already exists");
    }
    return sendServerError(err);
  }
}
