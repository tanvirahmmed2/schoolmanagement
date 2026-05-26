import { requireAuth } from "@/lib/middleware";
import { query } from "@/lib/db";
import { hashPassword, comparePassword } from "@/lib/hash";
import { sendOk, sendBadRequest, sendNotFound, sendServerError } from "@/utils/response";
import { sanitiseUser } from "@/utils/helpers";

export async function GET(request) {
  const { user, error } = await requireAuth(request);
  if (error) return error;
  try {
    const { rows } = await query(
      `SELECT id, name, email, role, is_active, is_verified, created_at FROM saas_users WHERE id = $1`,
      [user.id]
    );
    if (!rows[0]) return sendNotFound("User");
    return sendOk(sanitiseUser(rows[0]));
  } catch (err) {
    return sendServerError(err);
  }
}

export async function PATCH(request) {
  const { user, error } = await requireAuth(request);
  if (error) return error;
  try {
    const body = await request.json();
    const { name, email, currentPassword, newPassword } = body;

    // If changing password, verify current password first
    if (newPassword) {
      if (!currentPassword) return sendBadRequest("currentPassword is required to change password");
      const { rows } = await query(`SELECT password FROM saas_users WHERE id = $1`, [user.id]);
      if (!rows[0]) return sendNotFound("User");
      const valid = await comparePassword(currentPassword, rows[0].password);
      if (!valid) return sendBadRequest("Current password is incorrect");
      const hashed = await hashPassword(newPassword);
      await query(
        `UPDATE saas_users SET name = COALESCE($2, name), email = COALESCE($3, email), password = $4 WHERE id = $1`,
        [user.id, name || null, email || null, hashed]
      );
    } else {
      await query(
        `UPDATE saas_users SET name = COALESCE($2, name), email = COALESCE($3, email) WHERE id = $1`,
        [user.id, name || null, email || null]
      );
    }

    const { rows: updated } = await query(
      `SELECT id, name, email, role, is_active, created_at FROM saas_users WHERE id = $1`,
      [user.id]
    );
    return sendOk(sanitiseUser(updated[0]));
  } catch (err) {
    if (err.code === "23505") return sendBadRequest("Email already in use");
    return sendServerError(err);
  }
}
