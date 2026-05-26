import { query } from "@/lib/db";
import { computeEndDate } from "@/utils/helpers";
import { logger } from "@/utils/logger";

// ==========================================
// 1. DATABASE QUERY FUNCTIONS
// ==========================================

/** List all active subscription plans */
export async function listPlans({ isActive } = {}) {
  const conditions = isActive !== undefined ? [`is_active = $1`] : ["1=1"];
  const params = isActive !== undefined ? [isActive] : [];
  const { rows } = await query(
    `SELECT * FROM subscription_plans WHERE ${conditions.join(" AND ")} ORDER BY price ASC`,
    params
  );
  return rows;
}

/** Get a plan by ID */
export async function getPlanById(id) {
  const { rows } = await query(`SELECT * FROM subscription_plans WHERE id = $1`, [id]);
  return rows[0] || null;
}

/** Insert a new plan */
export async function insertPlan({ name, price, billingCycle, maxStudents, maxTeachers, features }) {
  const { rows } = await query(
    `INSERT INTO subscription_plans (name, price, billing_cycle, max_students, max_teachers, features)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [name, price, billingCycle, maxStudents, maxTeachers, JSON.stringify(features)]
  );
  return rows[0];
}

/** Update a plan */
export async function dbUpdatePlan(id, { name, price, billingCycle, maxStudents, maxTeachers, features, isActive }) {
  const { rows } = await query(
    `UPDATE subscription_plans
     SET name = COALESCE($2, name),
         price = COALESCE($3, price),
         billing_cycle = COALESCE($4, billing_cycle),
         max_students = COALESCE($5, max_students),
         max_teachers = COALESCE($6, max_teachers),
         features = COALESCE($7, features),
         is_active = COALESCE($8, is_active)
     WHERE id = $1 RETURNING *`,
    [id, name, price, billingCycle, maxStudents, maxTeachers, features ? JSON.stringify(features) : null, isActive]
  );
  return rows[0] || null;
}

/** Get active subscription for a tenant */
export async function getTenantSubscription(tenantId) {
  const { rows } = await query(
    `SELECT s.*, sp.name AS plan_name, sp.price, sp.billing_cycle,
            sp.max_students, sp.max_teachers, sp.features
     FROM subscriptions s
     JOIN subscription_plans sp ON sp.id = s.plan_id
     WHERE s.tenant_id = $1 AND s.status = 'active'
     ORDER BY s.created_at DESC LIMIT 1`,
    [tenantId]
  );
  return rows[0] || null;
}

/** List subscriptions with tenant info */
export async function listSubscriptions({ status, limit = 20, offset = 0 }) {
  const conditions = status ? [`s.status = $${1}`] : ["1=1"];
  const params = status ? [status, limit, offset] : [limit, offset];

  const { rows } = await query(
    `SELECT s.*, t.institution_name, t.institution_type,
            sp.name AS plan_name, sp.price, sp.billing_cycle
     FROM subscriptions s
     JOIN tenants t ON t.id = s.tenant_id
     JOIN subscription_plans sp ON sp.id = s.plan_id
     WHERE ${conditions.join(" AND ")}
     ORDER BY s.created_at DESC
     LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params
  );
  return rows;
}

/** Insert a new subscription */
export async function insertSubscription({ tenantId, planId, startDate, endDate, status = 'active' }) {
  const { rows } = await query(
    `INSERT INTO subscriptions (tenant_id, plan_id, start_date, end_date, status)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [tenantId, planId, startDate, endDate, status]
  );
  return rows[0];
}

/** Update subscription status */
export async function updateSubscriptionStatus(id, status) {
  const { rows } = await query(
    `UPDATE subscriptions SET status = $2 WHERE id = $1 RETURNING id, status`,
    [id, status]
  );
  return rows[0] || null;
}

// ==========================================
// 2. SERVICE LOGIC FUNCTIONS
// ==========================================

export async function getPlans() {
  return listPlans({ isActive: true });
}

export async function getAllPlans() {
  return listPlans();
}

export async function createPlan(body) {
  return insertPlan(body);
}

export async function updatePlan(id, body) {
  const result = await dbUpdatePlan(id, body);
  if (!result) throw Object.assign(new Error("Plan not found"), { status: 404 });
  return result;
}

export async function getSubscriptions(searchParams) {
  const page     = Math.max(1, parseInt(searchParams.get?.("page") || "1", 10));
  const pageSize = parseInt(searchParams.get?.("pageSize") || "20", 10);
  const offset   = (page - 1) * pageSize;
  const status   = searchParams.get?.("status") || undefined;
  const rows     = await listSubscriptions({ status, limit: pageSize, offset });
  return { subscriptions: rows, pagination: { page, pageSize } };
}

/**
 * Subscribe a tenant to a plan.
 * If they already have an active subscription, cancel it first.
 */
export async function subscribeTenant({ tenantId, planId, billingCycle, status = 'active' }) {
  const plan = await getPlanById(planId);
  if (!plan) throw Object.assign(new Error("Plan not found"), { status: 404 });

  const startDate = new Date().toISOString().split("T")[0];
  const endDate   = computeEndDate(startDate, billingCycle || plan.billing_cycle);

  const sub = await insertSubscription({ tenantId, planId, startDate, endDate, status });
  logger.info("Tenant subscribed", { tenantId, planId, endDate, status });
  return sub;
}

export async function cancelSubscription(id) {
  const result = await updateSubscriptionStatus(id, "cancelled");
  if (!result) throw Object.assign(new Error("Subscription not found"), { status: 404 });
  return result;
}
