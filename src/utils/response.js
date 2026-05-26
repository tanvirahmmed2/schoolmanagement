import { NextResponse } from "next/server";

/**
 * 200 OK
 */
export function sendOk(data, meta = {}) {
  return NextResponse.json({ success: true, data, ...meta }, { status: 200 });
}

/**
 * 201 Created
 */
export function sendCreated(data) {
  return NextResponse.json({ success: true, data }, { status: 201 });
}

/**
 * 204 No Content
 */
export function sendNoContent() {
  return new NextResponse(null, { status: 204 });
}

/**
 * 400 Bad Request
 */
export function sendBadRequest(message = "Bad request", errors = null) {
  return NextResponse.json(
    { success: false, message, ...(errors ? { errors } : {}) },
    { status: 400 }
  );
}

/**
 * 401 Unauthorized
 */
export function sendUnauthorized(message = "Authentication required") {
  return NextResponse.json({ success: false, message }, { status: 401 });
}

/**
 * 403 Forbidden
 */
export function sendForbidden(message = "Forbidden") {
  return NextResponse.json({ success: false, message }, { status: 403 });
}

/**
 * 404 Not Found
 */
export function sendNotFound(resource = "Resource") {
  return NextResponse.json(
    { success: false, message: `${resource} not found` },
    { status: 404 }
  );
}

/**
 * 409 Conflict
 */
export function sendConflict(message = "Resource already exists") {
  return NextResponse.json({ success: false, message }, { status: 409 });
}

/**
 * 422 Unprocessable Entity
 */
export function sendValidationError(errors) {
  return NextResponse.json(
    { success: false, message: "Validation failed", errors },
    { status: 422 }
  );
}

/**
 * 500 Internal Server Error
 */
export function sendServerError(err) {
  const message =
    process.env.NODE_ENV === "production"
      ? "Internal server error"
      : err?.message || "Internal server error";

  console.error("[API Error]", err);

  return NextResponse.json({ success: false, message }, { status: 500 });
}

/**
 * Paginated list response helper
 */
export function sendPaginated(data, { page, pageSize, total }) {
  return NextResponse.json({
    success: true,
    data,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
      hasNextPage: page * pageSize < total,
      hasPrevPage: page > 1,
    },
  });
}
