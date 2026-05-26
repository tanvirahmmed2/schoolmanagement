import { getSettings, saveSettings } from "@/lib/settings";
import { requireAuth } from "@/lib/middleware";
import { sendOk, sendServerError } from "@/utils/response";

export async function GET(request) {
  const { user, error } = await requireAuth(request, ["admin", "manager"]);
  if (error) return error;
  try {
    const settings = getSettings();
    return sendOk(settings);
  } catch (err) {
    return sendServerError(err);
  }
}

export async function PATCH(request) {
  const { user, error } = await requireAuth(request, ["admin"]);
  if (error) return error;
  try {
    const body = await request.json();
    const updated = saveSettings(body);
    return sendOk(updated);
  } catch (err) {
    return sendServerError(err);
  }
}
