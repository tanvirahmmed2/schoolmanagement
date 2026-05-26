import { query } from "@/lib/db";
import { requireAuth } from "@/lib/middleware";
import { sendOk, sendServerError } from "@/utils/response";

export async function GET(request) {
  const { user, error } = await requireAuth(request, ["admin", "manager", "support"]);
  if (error) return error;

  try {
    const { rows } = await query(`
      SELECT 
        COUNT(*)::int AS total,
        COUNT(CASE WHEN status = 'open' THEN 1 END)::int AS open,
        COUNT(CASE WHEN status = 'in_progress' THEN 1 END)::int AS in_progress,
        COUNT(CASE WHEN status = 'resolved' THEN 1 END)::int AS resolved
      FROM support_tickets
    `);
    
    return sendOk(rows[0]);
  } catch (err) {
    return sendServerError(err);
  }
}
