/**
 * Validate required fields are present and non-empty in a body object.
 * Returns { valid: true } or { valid: false, errors: { field: message } }
 */
export function validateRequired(body, fields) {
  const errors = {};
  for (const field of fields) {
    const val = body[field];
    if (val === undefined || val === null || String(val).trim() === "") {
      errors[field] = `${field} is required`;
    }
  }
  return Object.keys(errors).length === 0
    ? { valid: true }
    : { valid: false, errors };
}

/**
 * Validate email format
 */
export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Validate password strength (min 8 chars, at least 1 letter + 1 number)
 */
export function isValidPassword(password) {
  return (
    typeof password === "string" &&
    password.length >= 8 &&
    /[a-zA-Z]/.test(password) &&
    /[0-9]/.test(password)
  );
}

/**
 * Validate UUID v4
 */
export function isValidUUID(str) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str);
}

/**
 * Validate phone number (Bangladesh mobile: starts with 01, 11 digits)
 */
export function isValidBDPhone(phone) {
  return /^01[3-9]\d{8}$/.test(phone.replace(/[\s-]/g, ""));
}

/**
 * Validate institution type matches schema enum
 */
export function isValidInstitutionType(type) {
  return ["school", "college", "madrasah", "coaching"].includes(type);
}

/**
 * Validate role matches schema enum
 */
export function isValidRole(role) {
  return ["admin", "support", "manager", "client"].includes(role);
}

/**
 * Validate billing cycle
 */
export function isValidBillingCycle(cycle) {
  return ["monthly", "yearly"].includes(cycle);
}

/**
 * Validate payment method
 */
export function isValidPaymentMethod(method) {
  return ["bkash", "nagad", "card", "stripe", "bank_transfer"].includes(method);
}

/**
 * Parse and clamp pagination params from a URL or URLSearchParams.
 * @param {URLSearchParams} params
 * @param {number} defaultPageSize
 * @param {number} maxPageSize
 */
export function parsePagination(params, defaultPageSize = 20, maxPageSize = 100) {
  const page = Math.max(1, parseInt(params.get("page") || "1", 10));
  const pageSize = Math.min(
    maxPageSize,
    Math.max(1, parseInt(params.get("pageSize") || String(defaultPageSize), 10))
  );
  const offset = (page - 1) * pageSize;
  return { page, pageSize, offset };
}

/**
 * Sanitise a string — trim and collapse multiple spaces
 */
export function sanitise(str) {
  if (typeof str !== "string") return str;
  return str.trim().replace(/\s+/g, " ");
}
