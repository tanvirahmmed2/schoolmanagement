import { query } from "@/lib/db";
import { logger } from "@/utils/logger";

// ==========================================
// 1. DATABASE QUERY FUNCTIONS
// ==========================================

/** List support tickets */
export async function listTickets({ tenantId, status, limit = 20, offset = 0 }) {
  const conditions = ["1=1"];
  const params = [];
  if (tenantId) { conditions.push(`st.tenant_id = $${params.push(tenantId)}`); }
  if (status)   { conditions.push(`st.status = $${params.push(status)}`); }
  params.push(limit, offset);

  const { rows } = await query(
    `SELECT st.*, t.institution_name,
            u.name AS user_name, u.email AS user_email
     FROM support_tickets st
     JOIN tenants t ON t.id = st.tenant_id
     LEFT JOIN saas_users u ON u.id = st.user_id
     WHERE ${conditions.join(" AND ")}
     ORDER BY st.created_at DESC
     LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params
  );
  return rows;
}

export async function countTickets({ tenantId, status }) {
  const conditions = ["1=1"];
  const params = [];
  if (tenantId) { conditions.push(`tenant_id = $${params.push(tenantId)}`); }
  if (status)   { conditions.push(`status = $${params.push(status)}`); }

  const { rows } = await query(
    `SELECT COUNT(*)::int AS total FROM support_tickets WHERE ${conditions.join(" AND ")}`,
    params
  );
  return rows[0].total;
}

/** Get a single ticket with messages from DB */
export async function dbGetTicketById(id) {
  const [ticketRes, messagesRes] = await Promise.all([
    query(
      `SELECT st.*, t.institution_name, u.name AS user_name
       FROM support_tickets st
       JOIN tenants t ON t.id = st.tenant_id
       LEFT JOIN saas_users u ON u.id = st.user_id
       WHERE st.id = $1`,
      [id]
    ),
    query(
      `SELECT sm.*, u.name AS sender_name, u.role AS sender_role
       FROM support_messages sm
       LEFT JOIN saas_users u ON u.id = sm.sender_id
       WHERE sm.ticket_id = $1
       ORDER BY sm.created_at ASC`,
      [id]
    ),
  ]);
  if (!ticketRes.rows[0]) return null;
  return { ...ticketRes.rows[0], messages: messagesRes.rows };
}

/** Insert a new ticket */
export async function insertTicket({ tenantId, userId, subject, message }) {
  const { rows } = await query(
    `INSERT INTO support_tickets (tenant_id, user_id, subject, message)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [tenantId, userId, subject, message]
  );
  return rows[0];
}

/** Update ticket status */
export async function dbUpdateTicketStatus(id, status) {
  const { rows } = await query(
    `UPDATE support_tickets SET status = $2 WHERE id = $1 RETURNING id, status`,
    [id, status]
  );
  return rows[0] || null;
}

/** Add a message to a ticket thread */
export async function insertTicketMessage({ ticketId, senderId, message, attachments = null }) {
  const { rows } = await query(
    `INSERT INTO support_messages (ticket_id, sender_id, message, attachments)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [ticketId, senderId, message, attachments ? JSON.stringify(attachments) : null]
  );
  return rows[0];
}

/** Get all messages for a ticket */
export async function getTicketMessages(ticketId) {
  const { rows } = await query(
    `SELECT sm.*, u.name AS sender_name, u.role AS sender_role
     FROM support_messages sm
     LEFT JOIN saas_users u ON u.id = sm.sender_id
     WHERE sm.ticket_id = $1
     ORDER BY sm.created_at ASC`,
    [ticketId]
  );
  return rows;
}

/** Insert an audit log entry */
export async function insertAuditLog({ userId, action, entity, entityId, metadata }) {
  await query(
    `INSERT INTO audit_logs (user_id, action, entity, entity_id, metadata)
     VALUES ($1, $2, $3, $4, $5)`,
    [userId, action, entity, entityId, metadata ? JSON.stringify(metadata) : null]
  );
}

/** List audit logs */
export async function listAuditLogs({ userId, entity, limit = 50, offset = 0 }) {
  const conditions = ["1=1"];
  const params = [];
  if (userId) { conditions.push(`al.user_id = $${params.push(userId)}`); }
  if (entity) { conditions.push(`al.entity = $${params.push(entity)}`); }
  params.push(limit, offset);

  const { rows } = await query(
    `SELECT al.*, u.name AS user_name, u.role AS user_role
     FROM audit_logs al
     LEFT JOIN saas_users u ON u.id = al.user_id
     WHERE ${conditions.join(" AND ")}
     ORDER BY al.created_at DESC
     LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params
  );
  return rows;
}

// ==========================================
// 2. SERVICE LOGIC FUNCTIONS
// ==========================================

export async function getTickets(searchParams) {
  const page     = Math.max(1, parseInt(searchParams.get?.("page") || "1", 10));
  const pageSize = parseInt(searchParams.get?.("pageSize") || "20", 10);
  const offset   = (page - 1) * pageSize;
  const tenantId = searchParams.get?.("tenantId") || undefined;
  const status   = searchParams.get?.("status") || undefined;

  const [rows, total] = await Promise.all([
    listTickets({ tenantId, status, limit: pageSize, offset }),
    countTickets({ tenantId, status }),
  ]);
  return { tickets: rows, pagination: { page, pageSize, total } };
}

export async function getTicketById(id) {
  const ticket = await dbGetTicketById(id);
  if (!ticket) throw Object.assign(new Error("Ticket not found"), { status: 404 });
  return ticket;
}

export async function createTicket({ tenantId, userId, subject, message }) {
  const ticket = await insertTicket({ tenantId, userId, subject, message });
  logger.info("Support ticket created", { id: ticket.id, subject });
  return ticket;
}

export async function updateTicketStatus(id, status) {
  const result = await dbUpdateTicketStatus(id, status);
  if (!result) throw Object.assign(new Error("Ticket not found"), { status: 404 });
  return result;
}

export async function addMessage({ ticketId, senderId, message, attachments }) {
  // Auto-progress status to in_progress when support agent responds, or reopen if client replies
  try {
    const { rows: userRows } = await query("SELECT role FROM saas_users WHERE id = $1", [senderId]);
    const role = userRows[0]?.role;
    if (role === "support" || role === "admin" || role === "manager") {
      await dbUpdateTicketStatus(ticketId, "in_progress");
    } else if (role === "client") {
      const { rows: ticketRows } = await query("SELECT status FROM support_tickets WHERE id = $1", [ticketId]);
      const currentStatus = ticketRows[0]?.status;
      if (currentStatus === "resolved" || currentStatus === "closed") {
        await dbUpdateTicketStatus(ticketId, "open");
      }
    }
  } catch (err) {
    logger.warn("Failed to update status on ticket message", { ticketId, senderId, error: err.message });
  }

  const msg = await insertTicketMessage({ ticketId, senderId, message, attachments });
  logger.info("Ticket message added", { ticketId, senderId });
  return msg;
}

export async function getMessages(ticketId) {
  return getTicketMessages(ticketId);
}

export async function logAudit({ userId, action, entity, entityId, metadata }) {
  await insertAuditLog({ userId, action, entity, entityId, metadata });
}

export async function getAuditLogs(searchParams) {
  const page     = Math.max(1, parseInt(searchParams.get?.("page") || "1", 10));
  const pageSize = Math.min(100, parseInt(searchParams.get?.("pageSize") || "50", 10));
  const offset   = (page - 1) * pageSize;
  const userId   = searchParams.get?.("userId") || undefined;
  const entity   = searchParams.get?.("entity") || undefined;
  return listAuditLogs({ userId, entity, limit: pageSize, offset });
}
