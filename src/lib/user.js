import { query } from "@/lib/db";
import { sanitiseUser } from "@/utils/helpers";
import { parsePagination } from "@/utils/validator";
import { hashPassword } from "@/lib/hash";

// ==========================================
// 1. DATABASE QUERY FUNCTIONS
// ==========================================

/** List all users with optional role filter + pagination */
export async function listUsers({ role, isActive, limit = 20, offset = 0 }) {
  const conditions = ["1=1"];
  const params = [];
  if (role)     { conditions.push(`role = $${params.push(role)}`); }
  if (isActive !== undefined) { conditions.push(`is_active = $${params.push(isActive)}`); }
  params.push(limit, offset);

  const { rows } = await query(
    `SELECT id, name, email, role, is_active, created_at, updated_at
     FROM saas_users
     WHERE ${conditions.join(" AND ")}
     ORDER BY created_at DESC
     LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params
  );
  return rows;
}

/** Count users (for pagination) */
export async function countUsers({ role, isActive }) {
  const conditions = ["1=1"];
  const params = [];
  if (role)     { conditions.push(`role = $${params.push(role)}`); }
  if (isActive !== undefined) { conditions.push(`is_active = $${params.push(isActive)}`); }

  const { rows } = await query(
    `SELECT COUNT(*)::int AS total FROM saas_users WHERE ${conditions.join(" AND ")}`,
    params
  );
  return rows[0].total;
}

/** Get a single user by ID from DB */
export async function dbGetUserById(id) {
  const { rows } = await query(
    `SELECT id, name, email, role, is_active, created_at, updated_at
     FROM saas_users WHERE id = $1`,
    [id]
  );
  return rows[0] || null;
}

/** Update user fields in DB */
export async function dbUpdateUser(id, { name, email, role, isActive, is_active }) {
  const activeVal = isActive !== undefined ? isActive : is_active;
  const { rows } = await query(
    `UPDATE saas_users
     SET name = COALESCE($2, name),
         email = COALESCE($3, email),
         role = COALESCE($4, role),
         is_active = COALESCE($5, is_active)
     WHERE id = $1
     RETURNING id, name, email, role, is_active, updated_at`,
    [id, name, email, role, activeVal]
  );
  return rows[0] || null;
}

/** Soft-delete by deactivating in DB */
export async function dbDeactivateUser(id) {
  const { rows } = await query(
    `UPDATE saas_users SET is_active = FALSE WHERE id = $1
     RETURNING id, is_active`,
    [id]
  );
  return rows[0] || null;
}

/** Hard delete user in DB */
export async function dbDeleteUser(id) {
  await query(`DELETE FROM saas_users WHERE id = $1`, [id]);
}

// ==========================================
// 2. SERVICE LOGIC FUNCTIONS
// ==========================================

export async function getUsers(searchParams) {
  const { page, pageSize, offset } = parsePagination(searchParams);
  const role     = searchParams.get?.("role") || undefined;
  const isActive = searchParams.get?.("isActive");

  const [rows, total] = await Promise.all([
    listUsers({ role, isActive: isActive !== null ? isActive === "true" : undefined, limit: pageSize, offset }),
    countUsers({ role, isActive: isActive !== null ? isActive === "true" : undefined }),
  ]);

  return { users: rows.map(sanitiseUser), pagination: { page, pageSize, total } };
}

export async function getUserById(id) {
  const user = await dbGetUserById(id);
  if (!user) throw Object.assign(new Error("User not found"), { status: 404 });
  return sanitiseUser(user);
}

export async function updateUser(id, body) {
  const updated = await dbUpdateUser(id, body);
  if (!updated) throw Object.assign(new Error("User not found"), { status: 404 });
  return sanitiseUser(updated);
}

export async function deactivateUser(id) {
  const result = await dbDeactivateUser(id);
  if (!result) throw Object.assign(new Error("User not found"), { status: 404 });
  return result;
}

export async function deleteUser(id) {
  await dbDeleteUser(id);
}

export async function createUser({ name, email, password, role = "client" }) {
  const hashedPassword = await hashPassword(password);
  const { rows } = await query(
    `INSERT INTO saas_users (name, email, password, role, is_active, is_verified)
     VALUES ($1, $2, $3, $4, TRUE, TRUE)
     RETURNING id, name, email, role, is_active, created_at`,
    [name, email, hashedPassword, role]
  );
  return sanitiseUser(rows[0]);
}
