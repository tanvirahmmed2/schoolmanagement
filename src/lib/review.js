import { query } from "@/lib/db";

// ==========================================
// 1. DATABASE QUERY FUNCTIONS
// ==========================================

/** Insert a new review */
export async function insertReview({ tenantId, userId, rating, comment }) {
  const { rows } = await query(
    `INSERT INTO reviews (tenant_id, user_id, rating, comment, status)
     VALUES ($1, $2, $3, $4, 'pending')
     RETURNING *`,
    [tenantId, userId, rating, comment]
  );
  return rows[0];
}

/** List reviews with tenant and user info */
export async function listReviews({ status, tenantId, limit = 50, offset = 0 } = {}) {
  const conditions = [];
  const params = [];

  if (status) {
    params.push(status);
    conditions.push(`r.status = $${params.length}`);
  }

  if (tenantId) {
    params.push(tenantId);
    conditions.push(`r.tenant_id = $${params.length}`);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  params.push(limit);
  const limitParam = `$${params.length}`;
  
  params.push(offset);
  const offsetParam = `$${params.length}`;

  const { rows } = await query(
    `SELECT r.*, t.institution_name, t.institution_type, u.name AS user_name, u.email AS user_email
     FROM reviews r
     LEFT JOIN tenants t ON t.id = r.tenant_id
     LEFT JOIN saas_users u ON u.id = r.user_id
     ${whereClause}
     ORDER BY r.created_at DESC
     LIMIT ${limitParam} OFFSET ${offsetParam}`,
    params
  );
  return rows;
}

/** Get a review by ID */
export async function getReviewById(id) {
  const { rows } = await query(
    `SELECT r.*, t.institution_name, t.institution_type, u.name AS user_name
     FROM reviews r
     LEFT JOIN tenants t ON t.id = r.tenant_id
     LEFT JOIN saas_users u ON u.id = r.user_id
     WHERE r.id = $1`,
    [id]
  );
  return rows[0] || null;
}

/** Update review status in DB */
export async function dbUpdateReviewStatus(id, status) {
  const { rows } = await query(
    `UPDATE reviews
     SET status = $2, updated_at = NOW()
     WHERE id = $1
     RETURNING *`,
    [id, status]
  );
  return rows[0] || null;
}

/** Delete a review */
export async function deleteReview(id) {
  await query(`DELETE FROM reviews WHERE id = $1`, [id]);
}

// ==========================================
// 2. SERVICE LOGIC FUNCTIONS
// ==========================================

export async function createReview({ tenantId, userId, rating, comment }) {
  if (rating < 1 || rating > 5) {
    throw Object.assign(new Error("Rating must be between 1 and 5"), { status: 400 });
  }
  if (!comment || comment.trim() === "") {
    throw Object.assign(new Error("Comment cannot be empty"), { status: 400 });
  }
  return insertReview({ tenantId, userId, rating, comment });
}

export async function getReviews(searchParams = {}) {
  const status = searchParams.status || undefined;
  const tenantId = searchParams.tenantId || undefined;
  const limit = Math.max(1, parseInt(searchParams.limit || "50", 10));
  const offset = Math.max(0, parseInt(searchParams.offset || "0", 10));

  return listReviews({ status, tenantId, limit, offset });
}

export async function updateReviewStatus(id, status) {
  const VALID = ["pending", "approved", "rejected"];
  if (!VALID.includes(status)) {
    throw Object.assign(new Error("Invalid status"), { status: 400 });
  }

  const review = await getReviewById(id);
  if (!review) {
    throw Object.assign(new Error("Review not found"), { status: 404 });
  }

  return dbUpdateReviewStatus(id, status);
}
