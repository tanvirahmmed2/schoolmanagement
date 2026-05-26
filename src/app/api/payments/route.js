import { getPayments, recordPayment, getRevenueSummary } from "@/lib/payment";
import { getClientTenant } from "@/lib/tenant";
import { requireAuth } from "@/lib/middleware";
import { sendOk, sendCreated, sendPaginated, sendBadRequest, sendServerError } from "@/utils/response";
import { validateRequired, isValidPaymentMethod, isValidUUID } from "@/utils/validator";

export async function GET(request) {
  const { user, error } = await requireAuth(request, ["admin", "manager", "client"]);
  if (error) return error;
  try {
    const sp = new URL(request.url).searchParams;
    
    if (user.role === "client") {
      const clientTenant = await getClientTenant(user.id);
      if (!clientTenant) return sendBadRequest("No tenant associated with user");
      // Force filter to client's tenant
      sp.set("tenantId", clientTenant.id);
    } else if (sp.get("summary") === "true") {
      const summary = await getRevenueSummary();
      return sendOk(summary);
    }

    const { payments, pagination } = await getPayments(sp);
    return sendPaginated(payments, pagination);
  } catch (err) { return sendServerError(err); }
}

export async function POST(request) {
  const { user, error } = await requireAuth(request, ["admin", "client"]);
  if (error) return error;
  try {
    const body = await request.json();
    const { valid, errors } = validateRequired(body, ["tenantId", "amount", "paymentMethod"]);
    if (!valid) return sendBadRequest("Validation failed", errors);
    if (!isValidPaymentMethod(body.paymentMethod)) return sendBadRequest("Invalid payment method. Use: bkash, nagad, card, stripe, bank_transfer");
    if (!isValidUUID(body.tenantId)) return sendBadRequest("Invalid tenantId");

    const payment = await recordPayment({
      tenantId:       body.tenantId,
      subscriptionId: body.subscriptionId || null,
      amount:         body.amount,
      paymentMethod:  body.paymentMethod,
      transactionId:  body.transactionId || null,
    });
    return sendCreated(payment);
  } catch (err) { return sendServerError(err); }
}
