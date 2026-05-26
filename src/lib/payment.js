import { query } from "@/lib/db";
import { logger } from "@/utils/logger";

// ==========================================
// 1. DATABASE QUERY FUNCTIONS
// ==========================================

/** List payments with tenant info */
export async function listPayments({ tenantId, status, method, limit = 20, offset = 0 }) {
  const conditions = ["1=1"];
  const params = [];
  if (tenantId) { conditions.push(`p.tenant_id = $${params.push(tenantId)}`); }
  if (status)   { conditions.push(`p.status = $${params.push(status)}`); }
  if (method)   { conditions.push(`p.payment_method = $${params.push(method)}`); }
  params.push(limit, offset);

  const { rows } = await query(
    `SELECT p.*, t.institution_name
     FROM payments p
     JOIN tenants t ON t.id = p.tenant_id
     WHERE ${conditions.join(" AND ")}
     ORDER BY p.created_at DESC
     LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params
  );
  return rows;
}

export async function countPayments({ tenantId, status, method }) {
  const conditions = ["1=1"];
  const params = [];
  if (tenantId) { conditions.push(`tenant_id = $${params.push(tenantId)}`); }
  if (status)   { conditions.push(`status = $${params.push(status)}`); }
  if (method)   { conditions.push(`payment_method = $${params.push(method)}`); }

  const { rows } = await query(
    `SELECT COUNT(*)::int AS total FROM payments WHERE ${conditions.join(" AND ")}`,
    params
  );
  return rows[0].total;
}

/** Get a single payment */
export async function dbGetPaymentById(id) {
  const { rows } = await query(
    `SELECT p.*, t.institution_name FROM payments p
     JOIN tenants t ON t.id = p.tenant_id WHERE p.id = $1`,
    [id]
  );
  return rows[0] || null;
}

/** Insert a payment record */
export async function insertPayment({ tenantId, subscriptionId, amount, currency = "BDT", paymentMethod, transactionId }) {
  const { rows } = await query(
    `INSERT INTO payments (tenant_id, subscription_id, amount, currency, payment_method, transaction_id)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [tenantId, subscriptionId, amount, currency, paymentMethod, transactionId]
  );
  return rows[0];
}

/** Update payment status */
export async function updatePaymentStatus(id, status) {
  const { rows } = await query(
    `UPDATE payments SET status = $2 WHERE id = $1 RETURNING id, status`,
    [id, status]
  );
  return rows[0] || null;
}

/** Get invoice list */
export async function listInvoices({ tenantId, status, limit = 20, offset = 0 }) {
  const conditions = ["1=1"];
  const params = [];
  if (tenantId) { conditions.push(`i.tenant_id = $${params.push(tenantId)}`); }
  if (status)   { conditions.push(`i.status = $${params.push(status)}`); }
  params.push(limit, offset);

  const { rows } = await query(
    `SELECT i.*, t.institution_name FROM invoices i
     JOIN tenants t ON t.id = i.tenant_id
     WHERE ${conditions.join(" AND ")}
     ORDER BY i.created_at DESC
     LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params
  );
  return rows;
}

/** Insert invoice */
export async function insertInvoice({ tenantId, subscriptionId, totalAmount, dueDate }) {
  const { rows } = await query(
    `INSERT INTO invoices (tenant_id, subscription_id, total_amount, due_date)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [tenantId, subscriptionId, totalAmount, dueDate]
  );
  return rows[0];
}

// ==========================================
// 2. SERVICE LOGIC FUNCTIONS
// ==========================================

export async function getPayments(searchParams) {
  const page     = Math.max(1, parseInt(searchParams.get?.("page") || "1", 10));
  const pageSize = parseInt(searchParams.get?.("pageSize") || "20", 10);
  const offset   = (page - 1) * pageSize;
  const tenantId = searchParams.get?.("tenantId") || undefined;
  const status   = searchParams.get?.("status") || undefined;
  const method   = searchParams.get?.("method") || undefined;

  const [rows, total] = await Promise.all([
    listPayments({ tenantId, status, method, limit: pageSize, offset }),
    countPayments({ tenantId, status, method }),
  ]);
  return { payments: rows, pagination: { page, pageSize, total } };
}

export async function getPaymentById(id) {
  const payment = await dbGetPaymentById(id);
  if (!payment) throw Object.assign(new Error("Payment not found"), { status: 404 });
  return payment;
}

export async function recordPayment({ tenantId, subscriptionId, amount, paymentMethod, transactionId }) {
  const payment = await insertPayment({
    tenantId, subscriptionId, amount, paymentMethod, transactionId,
  });
  logger.info("Payment recorded", { id: payment.id, amount, method: paymentMethod });
  return payment;
}

export async function confirmPayment(id) {
  const result = await updatePaymentStatus(id, "success");
  if (!result) throw Object.assign(new Error("Payment not found"), { status: 404 });
  return result;
}

export async function refundPayment(id) {
  const result = await updatePaymentStatus(id, "refunded");
  if (!result) throw Object.assign(new Error("Payment not found"), { status: 404 });
  logger.info("Payment refunded", { id });
  return result;
}

export async function getRevenueSummary() {
  const { rows } = await query(
    `SELECT
       COUNT(*)::int AS total_payments,
       SUM(CASE WHEN status = 'success' THEN amount ELSE 0 END) AS total_revenue,
       SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END) AS pending_revenue,
       SUM(CASE WHEN status = 'refunded' THEN amount ELSE 0 END) AS refunded_amount
     FROM payments`
  );
  return rows[0];
}

export async function getInvoices(searchParams) {
  const page     = Math.max(1, parseInt(searchParams.get?.("page") || "1", 10));
  const pageSize = parseInt(searchParams.get?.("pageSize") || "20", 10);
  const offset   = (page - 1) * pageSize;
  const tenantId = searchParams.get?.("tenantId") || undefined;
  const status   = searchParams.get?.("status") || undefined;
  return listInvoices({ tenantId, status, limit: pageSize, offset });
}
