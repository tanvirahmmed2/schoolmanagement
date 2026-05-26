import { ROLES } from "@/lib/constants";

/**
 * All roles in priority order (highest first).
 * Used to determine if a role can access content meant for a lower role.
 */
export const ROLE_HIERARCHY = [
  ROLES.ADMIN,
  ROLES.MANAGER,
  ROLES.SUPPORT,
  ROLES.CLIENT,
];

/**
 * Human-readable labels for each role
 */
export const ROLE_LABELS = {
  [ROLES.ADMIN]:   "Super Admin",
  [ROLES.MANAGER]: "Manager",
  [ROLES.SUPPORT]: "Support Agent",
  [ROLES.CLIENT]:  "Institution Owner",
};

/**
 * Default redirect paths after login, by role
 */
export const ROLE_HOME = {
  [ROLES.ADMIN]:   "/admin/dashboard",
  [ROLES.MANAGER]: "/manager/dashboard",
  [ROLES.SUPPORT]: "/support/dashboard",
  [ROLES.CLIENT]:  "/client/dashboard",
};

/**
 * Panel prefixes protected per role (used in middleware)
 */
export const ROLE_PROTECTED_PATHS = {
  [ROLES.ADMIN]:   ["/admin"],
  [ROLES.MANAGER]: ["/manager"],
  [ROLES.SUPPORT]: ["/support"],
  [ROLES.CLIENT]:  ["/client"],
};

/**
 * Check if a given role has at least the level of the required role.
 * @param {string} userRole
 * @param {string} requiredRole
 */
export function hasMinRole(userRole, requiredRole) {
  const userIdx = ROLE_HIERARCHY.indexOf(userRole);
  const reqIdx  = ROLE_HIERARCHY.indexOf(requiredRole);
  if (userIdx === -1 || reqIdx === -1) return false;
  return userIdx <= reqIdx; // lower index = higher privilege
}
