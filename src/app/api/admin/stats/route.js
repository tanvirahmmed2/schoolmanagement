import { requireAuth } from "@/lib/middleware";
import { query } from "@/lib/db";
import { sendOk, sendServerError } from "@/utils/response";

/** GET /api/admin/stats — returns platform stats for admin/manager */
export async function GET(request) {
  const { user, error } = await requireAuth(request, ["admin", "manager"]);
  if (error) return error;

  try {
    const [tenantsRes, subsRes, revRes, ticketsRes] = await Promise.all([
      query(`SELECT COUNT(*) FROM tenants`),
      query(`SELECT COUNT(*) FROM subscriptions WHERE status = 'active'`),
      query(`SELECT SUM(amount) FROM payments WHERE status = 'success'`),
      query(`SELECT COUNT(*) FROM support_tickets WHERE status = 'open'`)
    ]);

    const stats = {
      totalTenants: parseInt(tenantsRes.rows[0].count || "0", 10),
      activeSubscriptions: parseInt(subsRes.rows[0].count || "0", 10),
      totalRevenue: parseFloat(revRes.rows[0].sum || "0"),
      openTickets: parseInt(ticketsRes.rows[0].count || "0", 10)
    };

    return sendOk(stats);
  } catch (err) {
    return sendServerError(err);
  }
}
