import { query } from "@/lib/db";

/**
 * Creates a new contact submission in the database.
 */
export async function createContactSubmission({ name, email, phone, institution, type, message }) {
  const sql = `
    INSERT INTO contact_submissions (name, email, phone, institution, type, message)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *;
  `;
  const result = await query(sql, [name, email, phone || null, institution, type, message]);
  return result.rows[0];
}

/**
 * Gets all contact submissions sorted by creation date (newest first).
 */
export async function getContactSubmissions() {
  const sql = `
    SELECT * FROM contact_submissions
    ORDER BY created_at DESC;
  `;
  const result = await query(sql);
  return result.rows;
}

/**
 * Gets a single contact submission by ID.
 */
export async function getContactSubmissionById(id) {
  const sql = `
    SELECT * FROM contact_submissions
    WHERE id = $1;
  `;
  const result = await query(sql, [id]);
  if (result.rowCount === 0) {
    const error = new Error("Contact submission not found");
    error.status = 404;
    throw error;
  }
  return result.rows[0];
}

/**
 * Updates status of a contact submission.
 */
export async function updateContactSubmissionStatus(id, status) {
  const sql = `
    UPDATE contact_submissions
    SET status = $1
    WHERE id = $2
    RETURNING *;
  `;
  const result = await query(sql, [status, id]);
  if (result.rowCount === 0) {
    const error = new Error("Contact submission not found");
    error.status = 404;
    throw error;
  }
  return result.rows[0];
}

/**
 * Creates a new contact reply in the database.
 */
export async function createContactReply({ contactSubmissionId, senderId, message }) {
  const sql = `
    INSERT INTO contact_replies (contact_submission_id, sender_id, message)
    VALUES ($1, $2, $3)
    RETURNING *;
  `;
  const result = await query(sql, [contactSubmissionId, senderId, message]);
  return result.rows[0];
}

/**
 * Gets all replies for a contact submission.
 */
export async function getContactReplies(contactSubmissionId) {
  const sql = `
    SELECT cr.*, u.name as sender_name, u.role as sender_role
    FROM contact_replies cr
    LEFT JOIN saas_users u ON cr.sender_id = u.id
    WHERE cr.contact_submission_id = $1
    ORDER BY cr.created_at ASC;
  `;
  const result = await query(sql, [contactSubmissionId]);
  return result.rows;
}
