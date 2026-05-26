import { query } from "@/lib/db";
import { requireAuth } from "@/lib/middleware";
import { sendOk, sendServerError } from "@/utils/response";

export async function GET(request) {
  const { user, error } = await requireAuth(request, ["admin", "manager"]);
  if (error) return error;

  try {
    const [tenantsRes, subsRes, revRes, typeRes, monthlyRes] = await Promise.all([
      query(`SELECT COUNT(*)::int AS count FROM tenants`),
      query(`SELECT COUNT(*)::int AS count FROM subscriptions WHERE status = 'active'`),
      query(`SELECT COALESCE(SUM(amount), 0)::float AS sum FROM payments WHERE status = 'success'`),
      query(`SELECT institution_type AS type, COUNT(*)::int AS count FROM tenants GROUP BY institution_type`),
      query(`
        SELECT TO_CHAR(created_at, 'Mon') AS month,
               COALESCE(SUM(amount), 0)::float AS revenue,
               COUNT(DISTINCT tenant_id)::int AS tenants,
               TO_CHAR(created_at, 'YYYY-MM') AS month_key
        FROM payments
        WHERE status = 'success'
          AND created_at >= NOW() - INTERVAL '6 months'
        GROUP BY TO_CHAR(created_at, 'Mon'), TO_CHAR(created_at, 'YYYY-MM')
        ORDER BY month_key ASC
      `)
    ]);

    const totalTenants = tenantsRes.rows[0].count;
    const activeSubs = subsRes.rows[0].count;
    const totalRevenue = revRes.rows[0].sum;

    const typeCounts = typeRes.rows.reduce((acc, row) => {
      acc[row.type] = row.count;
      return acc;
    }, {});
    
    const types = ["school", "college", "madrasah", "coaching"];
    const typeBreakdown = types.map(t => {
      const count = typeCounts[t] || 0;
      const pct = totalTenants > 0 ? (count / totalTenants) * 100 : 0;
      return {
        type: t.charAt(0).toUpperCase() + t.slice(1),
        count,
        pct: parseFloat(pct.toFixed(1)),
      };
    });

    // Populate last 6 months chronologically
    const monthlyTrend = [];
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const name = months[d.getMonth()];
      monthlyTrend.push({ month: name, revenue: 0, tenants: 0 });
    }

    monthlyRes.rows.forEach(row => {
      const match = monthlyTrend.find(m => m.month.toLowerCase() === row.month.toLowerCase().trim());
      if (match) {
        match.revenue = row.revenue;
        match.tenants = row.tenants;
      }
    });

    return sendOk({
      totalRevenue,
      totalTenants,
      activeSubs,
      avgMrr: totalTenants > 0 ? totalRevenue / totalTenants : 0,
      monthlyTrend,
      typeBreakdown
    });
  } catch (err) {
    return sendServerError(err);
  }
}
