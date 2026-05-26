import { query } from "@/lib/db";
import { slugify } from "@/utils/helpers";
import { logger } from "@/utils/logger";

// ==========================================
// 1. DATABASE QUERY FUNCTIONS
// ==========================================

/** List tenants with owner info, optional status filter */
export async function listTenants({ status, type, search, limit = 20, offset = 0 }) {
  const conditions = ["1=1"];
  const params = [];

  if (status) { conditions.push(`t.status = $${params.push(status)}`); }
  if (type)   { conditions.push(`t.institution_type = $${params.push(type)}`); }
  if (search) { conditions.push(`(t.institution_name ILIKE $${params.push(`%${search}%`)} OR t.email ILIKE $${params.length})`); }
  params.push(limit, offset);

  const { rows } = await query(
    `SELECT t.id, t.institution_name, t.institution_type, t.email, t.phone,
            t.country, t.status, t.created_at, t.updated_at,
            u.id AS owner_id, u.name AS owner_name, u.email AS owner_email
     FROM tenants t
     LEFT JOIN saas_users u ON u.id = t.owner_user_id
     WHERE ${conditions.join(" AND ")}
     ORDER BY t.created_at DESC
     LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params
  );
  return rows;
}

export async function countTenants({ status, type, search }) {
  const conditions = ["1=1"];
  const params = [];
  if (status) { conditions.push(`status = $${params.push(status)}`); }
  if (type)   { conditions.push(`institution_type = $${params.push(type)}`); }
  if (search) { conditions.push(`institution_name ILIKE $${params.push(`%${search}%`)}`); }

  const { rows } = await query(
    `SELECT COUNT(*)::int AS total FROM tenants WHERE ${conditions.join(" AND ")}`,
    params
  );
  return rows[0].total;
}

/** Get a single tenant with owner + active subscription */
export async function dbGetTenantById(id) {
  const { rows } = await query(
    `SELECT t.*, u.name AS owner_name, u.email AS owner_email,
            sp.name AS plan_name, s.status AS sub_status, s.end_date AS sub_end
     FROM tenants t
     LEFT JOIN saas_users u ON u.id = t.owner_user_id
     LEFT JOIN subscriptions s ON s.tenant_id = t.id AND s.status = 'active'
     LEFT JOIN subscription_plans sp ON sp.id = s.plan_id
     WHERE t.id = $1`,
    [id]
  );
  return rows[0] || null;
}

/** Get tenant by owner user ID */
export async function getTenantByOwner(ownerId) {
  const { rows } = await query(
    `SELECT t.*,
            sp.name AS plan_name, s.status AS sub_status, s.end_date AS sub_end,
            sp.max_students, sp.max_teachers
     FROM tenants t
     LEFT JOIN subscriptions s ON s.tenant_id = t.id AND s.status = 'active'
     LEFT JOIN subscription_plans sp ON sp.id = s.plan_id
     WHERE t.owner_user_id = $1`,
    [ownerId]
  );
  return rows[0] || null;
}

/** Insert a new tenant */
export async function insertTenant({ ownerUserId, institutionName, institutionType, email, phone, country = "Bangladesh" }) {
  const { rows } = await query(
    `INSERT INTO tenants (owner_user_id, institution_name, institution_type, email, phone, country)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [ownerUserId, institutionName, institutionType, email, phone, country]
  );
  return rows[0];
}

/** Update tenant fields */
export async function dbUpdateTenant(id, fields) {
  const { institutionName, institutionType, email, phone, status } = fields;
  const { rows } = await query(
    `UPDATE tenants
     SET institution_name = COALESCE($2, institution_name),
         institution_type = COALESCE($3, institution_type),
         email = COALESCE($4, email),
         phone = COALESCE($5, phone),
         status = COALESCE($6, status)
     WHERE id = $1
     RETURNING *`,
    [id, institutionName, institutionType, email, phone, status]
  );
  return rows[0] || null;
}

/** Update tenant status (activate/suspend/expire) */
export async function dbSetTenantStatus(id, status) {
  const { rows } = await query(
    `UPDATE tenants SET status = $2 WHERE id = $1 RETURNING id, status`,
    [id, status]
  );
  return rows[0] || null;
}

/** Delete tenant */
export async function dbDeleteTenant(id) {
  await query(`DELETE FROM tenants WHERE id = $1`, [id]);
}

/** Get domain for a tenant */
export async function getTenantDomain(tenantId) {
  const { rows } = await query(
    `SELECT * FROM tenant_domains WHERE tenant_id = $1 ORDER BY is_primary DESC`,
    [tenantId]
  );
  return rows;
}

/** Upsert subdomain for a tenant */
export async function setTenantSubdomain(tenantId, subdomain) {
  const { rows } = await query(
    `INSERT INTO tenant_domains (tenant_id, subdomain, is_primary)
     VALUES ($1, $2, TRUE)
     ON CONFLICT (subdomain) DO NOTHING
     RETURNING *`,
    [tenantId, subdomain]
  );
  return rows[0] || null;
}

// ==========================================
// 2. SERVICE LOGIC FUNCTIONS
// ==========================================

export async function getTenants(searchParams) {
  const page     = Math.max(1, parseInt(searchParams.get?.("page") || "1", 10));
  const pageSize = Math.min(100, parseInt(searchParams.get?.("pageSize") || "20", 10));
  const offset   = (page - 1) * pageSize;
  const status   = searchParams.get?.("status") || undefined;
  const type     = searchParams.get?.("type") || undefined;
  const search   = searchParams.get?.("search") || undefined;

  const [rows, total] = await Promise.all([
    listTenants({ status, type, search, limit: pageSize, offset }),
    countTenants({ status, type, search }),
  ]);

  return { tenants: rows, pagination: { page, pageSize, total } };
}

export async function getTenantById(id) {
  const tenant = await dbGetTenantById(id);
  if (!tenant) throw Object.assign(new Error("Tenant not found"), { status: 404 });
  return tenant;
}

export async function createTenant({ ownerUserId, institutionName, institutionType, email, phone, country }) {
  const tenant = await insertTenant({
    ownerUserId, institutionName, institutionType, email, phone, country,
  });

  // Auto-create subdomain from institution name
  const subdomain = slugify(institutionName);
  await setTenantSubdomain(tenant.id, subdomain).catch(() => {
    logger.warn("Subdomain already taken", { subdomain, tenantId: tenant.id });
  });

  logger.info("Tenant created", { id: tenant.id, name: institutionName });
  return tenant;
}

export async function updateTenant(id, body) {
  const updated = await dbUpdateTenant(id, body);
  if (!updated) throw Object.assign(new Error("Tenant not found"), { status: 404 });
  return updated;
}

export async function setTenantStatus(id, status) {
  const result = await dbSetTenantStatus(id, status);
  if (!result) throw Object.assign(new Error("Tenant not found"), { status: 404 });
  logger.info("Tenant status changed", { id, status });
  return result;
}

export async function deleteTenant(id) {
  await dbDeleteTenant(id);
  logger.info("Tenant deleted", { id });
}

export async function getClientTenant(userId) {
  const tenant = await getTenantByOwner(userId);
  if (!tenant) throw Object.assign(new Error("No tenant found for this user"), { status: 404 });
  return tenant;
}
