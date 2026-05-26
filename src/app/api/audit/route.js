import { getAuditLogs } from "@/lib/support";
import { requireAuth } from "@/lib/middleware";
import { sendOk, sendServerError } from "@/utils/response";

/** GET /api/audit — admin only */
export async function GET(request) {
  const { user, error } = await requireAuth(request, ["admin"]);
  if (error) return error;
  try {
    const logs = await getAuditLogs(new URL(request.url).searchParams);
    return sendOk(logs);
  } catch (err) { return sendServerError(err); }
}
