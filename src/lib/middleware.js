/**
 * Role-based guard for API routes.
 * Usage: const { user, error } = await requireAuth(request, ['admin', 'manager']);
 */
import { getCurrentUser } from "@/lib/auth";
import { sendUnauthorized, sendForbidden } from "@/utils/response";

/**
 * Verify the request has a valid JWT and the user has one of the allowed roles.
 * @param {Request} request
 * @param {string[]} allowedRoles - e.g. ['admin', 'manager']
 * @returns {{ user: object } | { error: Response }}
 */
export async function requireAuth(request, allowedRoles = []) {
  const user = await getCurrentUser(request);

  if (!user) {
    return { error: sendUnauthorized("Authentication required") };
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return {
      error: sendForbidden(
        `Access denied. Required roles: ${allowedRoles.join(", ")}`
      ),
    };
  }

  return { user };
}

/**
 * Attach user to request context (for server components / RSC use).
 * @param {Request} request
 */
export async function getAuthUser(request) {
  return getCurrentUser(request);
}

/** Helper role guards */
export async function isAdmin(request) {
  return requireAuth(request, ["admin"]);
}

export async function isManager(request) {
  return requireAuth(request, ["manager"]);
}

export async function isSupport(request) {
  return requireAuth(request, ["support"]);
}

export async function isClient(request) {
  return requireAuth(request, ["client"]);
}

