import { requireAuth } from "@/lib/middleware";
import { query } from "@/lib/db";
import { sendOk, sendServerError } from "@/utils/response";

export async function GET(request) {
  const { user, error } = await requireAuth(request, ["admin", "manager"]);
  if (error) return error;

  try {
    const { rows } = await query(
      `SELECT p.id, p.amount, p.currency, p.payment_method, p.transaction_id, p.status, p.created_at,
              t.id AS tenant_id, t.institution_name, t.institution_type, t.email AS tenant_email, t.phone AS tenant_phone,
              sp.name AS plan_name, sp.billing_cycle, s.id AS subscription_id
       FROM payments p
       JOIN tenants t ON t.id = p.tenant_id
       LEFT JOIN subscriptions s ON s.id = p.subscription_id
       LEFT JOIN subscription_plans sp ON sp.id = s.plan_id
       WHERE p.status = 'pending'
       ORDER BY p.created_at DESC`
    );
    return sendOk(rows);
  } catch (err) {
    return sendServerError(err);
  }
}
