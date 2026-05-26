import { SignJWT, jwtVerify } from "jose";
import { query } from "@/lib/db";
import { hashPassword, comparePassword } from "@/lib/hash";
import { sanitiseUser } from "@/utils/helpers";
import { logger } from "@/utils/logger";
import crypto from "crypto";

const ACCESS_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "change-me-in-production-please"
);
const REFRESH_SECRET = new TextEncoder().encode(
  process.env.JWT_REFRESH_SECRET || "refresh-change-me-in-production"
);

const ACCESS_EXPIRY = process.env.JWT_EXPIRY || "15m";
const REFRESH_EXPIRY = process.env.JWT_REFRESH_EXPIRY || "7d";

// ==========================================
// 1. JWT TOKEN OPERATIONS
// ==========================================

/**
 * Sign an access token (short-lived, 15 min default)
 * @param {{ id: string, role: string, email: string }} payload
 */
export async function signAccessToken(payload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(ACCESS_EXPIRY)
    .setIssuer("edusaas")
    .setAudience("edusaas-client")
    .sign(ACCESS_SECRET);
}

/**
 * Sign a refresh token (long-lived, 7 days default)
 * @param {{ id: string }} payload
 */
export async function signRefreshToken(payload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(REFRESH_EXPIRY)
    .setIssuer("edusaas")
    .sign(REFRESH_SECRET);
}

/**
 * Verify an access token. Returns the decoded payload or throws.
 * @param {string} token
 */
export async function verifyAccessToken(token) {
  const { payload } = await jwtVerify(token, ACCESS_SECRET, {
    issuer: "edusaas",
    audience: "edusaas-client",
  });
  return payload;
}

/**
 * Verify a refresh token. Returns the decoded payload or throws.
 * @param {string} token
 */
export async function verifyRefreshToken(token) {
  const { payload } = await jwtVerify(token, REFRESH_SECRET, {
    issuer: "edusaas",
  });
  return payload;
}

/**
 * Extract Bearer token from Authorization header.
 * @param {Request} request
 * @returns {string | null}
 */
export function extractBearerToken(request) {
  const auth = request.headers.get("authorization") || "";
  if (!auth.startsWith("Bearer ")) return null;
  return auth.slice(7).trim();
}

/**
 * Extract the access token from cookies (httpOnly cookie auth flow).
 * @param {Request} request
 * @returns {string | null}
 */
export function extractCookieToken(request) {
  const cookies = request.headers.get("cookie") || "";
  const match = cookies.match(/(?:^|;\s*)access_token=([^;]+)/);
  return match ? match[1] : null;
}

/**
 * Get the current user from a request (tries Bearer then cookie).
 * Returns null if no valid token found.
 * @param {Request} request
 */
export async function getCurrentUser(request) {
  const token =
    extractBearerToken(request) || extractCookieToken(request);
  if (!token) return null;
  try {
    return await verifyAccessToken(token);
  } catch {
    return null;
  }
}

// ==========================================
// 2. DATABASE QUERIES
// ==========================================

/** Find a user by email (for login) */
export async function findUserByEmail(email) {
  const { rows } = await query(
    `SELECT id, name, email, password, role, is_active, is_verified, verification_token, verification_expires, created_at
     FROM saas_users
     WHERE email = $1`,
    [email]
  );
  return rows[0] || null;
}

/** Find user by ID (for token refresh / me endpoint) */
export async function findUserById(id) {
  const { rows } = await query(
    `SELECT id, name, email, role, is_active, is_verified, created_at, updated_at
     FROM saas_users
     WHERE id = $1`,
    [id]
  );
  return rows[0] || null;
}

/** Insert a new user (registration) */
export async function insertUser({ name, email, hashedPassword, role = "client", isVerified = false, verificationToken = null, verificationExpires = null }) {
  const { rows } = await query(
    `INSERT INTO saas_users (name, email, password, role, is_verified, verification_token, verification_expires)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING id, name, email, role, is_active, is_verified, created_at`,
    [name, email, hashedPassword, role, isVerified, verificationToken, verificationExpires]
  );
  return rows[0];
}

/** Update last login timestamp (stored in updated_at via trigger) */
export async function touchUserLogin(id) {
  await query(
    `UPDATE saas_users SET updated_at = NOW() WHERE id = $1`,
    [id]
  );
}

/** Find user by verification token */
export async function findUserByVerificationToken(token) {
  const { rows } = await query(
    `SELECT id, email, is_verified, verification_expires
     FROM saas_users
     WHERE verification_token = $1`,
    [token]
  );
  return rows[0] || null;
}

/** Mark user as verified and clear verification tokens */
export async function markUserAsVerified(id) {
  const { rows } = await query(
    `UPDATE saas_users
     SET is_verified = TRUE,
         verification_token = NULL,
         verification_expires = NULL
     WHERE id = $1
     RETURNING id, email, is_verified`,
    [id]
  );
  return rows[0] || null;
}

// ==========================================
// 3. SERVICE LOGIC
// ==========================================

/**
 * Register a new client user and create their tenant record.
 */
export async function registerUser({ name, email, password, role = "client" }) {
  // Check duplicate
  const existing = await findUserByEmail(email);
  if (existing) throw Object.assign(new Error("Email already registered"), { status: 409 });

  const hashedPassword = await hashPassword(password);
  
  // Generate verification token (expires in 24 hours)
  const verificationToken = crypto.randomUUID();
  const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

  const user = await insertUser({
    name,
    email,
    hashedPassword,
    role,
    isVerified: false,
    verificationToken,
    verificationExpires,
  });

  logger.info("User registered, pending verification", { id: user.id, role });
  
  // Return user with verification details so the router can send the email
  return {
    ...sanitiseUser(user),
    verification_token: verificationToken,
  };
}

/**
 * Authenticate a user and return access + refresh tokens.
 */
export async function loginUser({ email, password }) {
  const user = await findUserByEmail(email);
  if (!user) throw Object.assign(new Error("Invalid credentials"), { status: 401 });
  if (!user.is_active) throw Object.assign(new Error("Account suspended"), { status: 403 });
  
  // Enforce account email verification
  if (!user.is_verified) {
    throw Object.assign(
      new Error("Please verify your email address before logging in."),
      { status: 403 }
    );
  }

  const valid = await comparePassword(password, user.password);
  if (!valid) throw Object.assign(new Error("Invalid credentials"), { status: 401 });

  await touchUserLogin(user.id);

  const tokenPayload = { id: user.id, email: user.email, role: user.role };
  const [accessToken, refreshToken] = await Promise.all([
    signAccessToken(tokenPayload),
    signRefreshToken({ id: user.id }),
  ]);

  logger.info("User logged in", { id: user.id, role: user.role });
  return { user: sanitiseUser(user), accessToken, refreshToken };
}

/**
 * Refresh an access token using a valid refresh token.
 */
export async function refreshTokens(refreshToken) {
  let payload;
  try {
    payload = await verifyRefreshToken(refreshToken);
  } catch {
    throw Object.assign(new Error("Invalid or expired refresh token"), { status: 401 });
  }

  const user = await findUserById(payload.id);
  if (!user || !user.is_active) {
    throw Object.assign(new Error("User not found or inactive"), { status: 401 });
  }

  const tokenPayload = { id: user.id, email: user.email, role: user.role };
  const newAccessToken = await signAccessToken(tokenPayload);

  return { accessToken: newAccessToken, user: sanitiseUser(user) };
}
