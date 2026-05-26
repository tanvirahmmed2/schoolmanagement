import { getPaymentById, confirmPayment, refundPayment } from "@/lib/payment";
import { requireAuth } from "@/lib/middleware";
import { sendOk, sendBadRequest, sendNotFound, sendServerError } from "@/utils/response";

export async function GET(request, { params }) {
  const { user, error } = await requireAuth(request, ["admin", "manager", "client"]);
  if (error) return error;
  try {
    const { id } = await params;
    const payment = await getPaymentById(id);
    return sendOk(payment);
  } catch (err) {
    if (err.status === 404) return sendNotFound("Payment");
    return sendServerError(err);
  }
}

export async function PATCH(request, { params }) {
  const { user, error } = await requireAuth(request, ["admin"]);
  if (error) return error;
  try {
    const body = await request.json();
    const VALID_ACTIONS = ["confirm", "refund"];
    if (!VALID_ACTIONS.includes(body.action)) {
      return sendBadRequest("action must be 'confirm' or 'refund'");
    }
    const { id } = await params;
    const result = body.action === "confirm"
      ? await confirmPayment(id)
      : await refundPayment(id);
    return sendOk(result);
  } catch (err) {
    if (err.status === 404) return sendNotFound("Payment");
    return sendServerError(err);
  }
}
