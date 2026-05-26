import { requireAuth } from "@/lib/middleware";
import { query, withTransaction } from "@/lib/db";
import { sendOk, sendBadRequest, sendNotFound, sendServerError, sendNoContent } from "@/utils/response";
import { computeEndDate } from "@/utils/helpers";

export async function PATCH(request, { params }) {
  const { user, error } = await requireAuth(request, ["admin", "manager"]);
  if (error) return error;

  try {
    const { id } = await params;
    const body = await request.json();
    const { action } = body;

    if (!["approve", "reject"].includes(action)) {
      return sendBadRequest("Action must be 'approve' or 'reject'");
    }

    // Get payment first
    const { rows: payments } = await query(
      `SELECT p.*, s.id AS subscription_id, s.plan_id, sp.billing_cycle, t.owner_user_id, t.id AS tenant_id
       FROM payments p
       JOIN tenants t ON t.id = p.tenant_id
       LEFT JOIN subscriptions s ON s.id = p.subscription_id
       LEFT JOIN subscription_plans sp ON sp.id = s.plan_id
       WHERE p.id = $1`,
      [id]
    );

    if (payments.length === 0) {
      return sendNotFound("Payment request");
    }

    const payment = payments[0];

    const result = await withTransaction(async (dbClient) => {
      if (action === "approve") {
        // 1. Update payment status to success
        await dbClient.query(
          `UPDATE payments SET status = 'success' WHERE id = $1`,
          [id]
        );

        // 2. Update tenant status to active
        await dbClient.query(
          `UPDATE tenants SET status = 'active' WHERE id = $1`,
          [payment.tenant_id]
        );

        // 3. Update subscription status to active and calculate dates
        if (payment.subscription_id) {
          const startDate = new Date().toISOString().split("T")[0];
          const endDate = computeEndDate(startDate, payment.billing_cycle || "monthly");
          await dbClient.query(
            `UPDATE subscriptions
             SET status = 'active', start_date = $2, end_date = $3
             WHERE id = $1`,
            [payment.subscription_id, startDate, endDate]
          );
        }

        // 4. Create support ticket between manager and client
        const ticketSubject = "Portal Setup Support & Verification";
        const ticketMsg = "Your institution has been approved and activated! We have created this ticket to assist you with onboarding, student records upload, and portal customization.";
        
        const ticketRes = await dbClient.query(
          `INSERT INTO support_tickets (tenant_id, user_id, subject, message, status)
           VALUES ($1, $2, $3, $4, 'open')
           RETURNING id`,
          [payment.tenant_id, payment.owner_user_id, ticketSubject, ticketMsg]
        );

        const ticketId = ticketRes.rows[0].id;

        // Add a message from the manager in the support message thread
        await dbClient.query(
          `INSERT INTO support_messages (ticket_id, sender_id, message)
           VALUES ($1, $2, $3)`,
          [
            ticketId,
            user.id, // the manager who approved the payment
            `Welcome onboard! Your payment is approved and your school portal is now active. If you need any assistance setting up your students or teachers, please reply directly in this ticket thread.`
          ]
        );

        return { status: "success", approved: true };
      } else {
        // reject purchase
        await dbClient.query(
          `UPDATE payments SET status = 'failed' WHERE id = $1`,
          [id]
        );

        await dbClient.query(
          `UPDATE tenants SET status = 'suspended' WHERE id = $1`,
          [payment.tenant_id]
        );

        if (payment.subscription_id) {
          await dbClient.query(
            `UPDATE subscriptions SET status = 'cancelled' WHERE id = $1`,
            [payment.subscription_id]
          );
        }

        return { status: "success", approved: false };
      }
    });

    return sendOk(result);
  } catch (err) {
    return sendServerError(err);
  }
}

export async function DELETE(request, { params }) {
  const { user, error } = await requireAuth(request, ["admin", "manager"]);
  if (error) return error;

  try {
    const { id } = await params;
    
    // delete the payment record
    await query(`DELETE FROM payments WHERE id = $1`, [id]);
    return sendNoContent();
  } catch (err) {
    return sendServerError(err);
  }
}
