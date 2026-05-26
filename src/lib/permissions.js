import { ROLES } from "@/lib/constants";

/**
 * Permission map — what each role can do.
 * Format: { ROLE: { RESOURCE: ['action', ...] } }
 */
export const PERMISSIONS = {
  [ROLES.ADMIN]: {
    users:         ["read", "create", "update", "delete"],
    tenants:       ["read", "create", "update", "delete", "suspend", "activate"],
    subscriptions: ["read", "create", "update", "cancel"],
    payments:      ["read", "refund"],
    invoices:      ["read", "cancel"],
    support:       ["read", "respond", "close", "assign"],
    audit:         ["read"],
    analytics:     ["read"],
    settings:      ["read", "update"],
    plans:         ["read", "create", "update", "delete"],
  },

  [ROLES.MANAGER]: {
    users:         ["read"],
    tenants:       ["read", "update"],
    subscriptions: ["read"],
    payments:      ["read"],
    invoices:      ["read"],
    support:       ["read", "respond"],
    audit:         [],
    analytics:     ["read"],
    settings:      ["read"],
    plans:         ["read"],
  },

  [ROLES.SUPPORT]: {
    users:         [],
    tenants:       ["read"],
    subscriptions: ["read"],
    payments:      [],
    invoices:      [],
    support:       ["read", "respond", "close"],
    audit:         [],
    analytics:     [],
    settings:      [],
    plans:         [],
  },

  [ROLES.CLIENT]: {
    users:         [],
    tenants:       ["read"],   // their own tenant only
    subscriptions: ["read"],   // their own subscription
    payments:      ["read", "create"],
    invoices:      ["read"],
    support:       ["read", "create", "respond"],
    audit:         [],
    analytics:     [],
    settings:      ["read", "update"], // their own institution settings
    plans:         ["read"],
  },
};

/**
 * Check if a role has a specific permission on a resource.
 * @param {string} role
 * @param {string} resource
 * @param {string} action
 * @returns {boolean}
 */
export function can(role, resource, action) {
  const rolePerms = PERMISSIONS[role];
  if (!rolePerms) return false;
  const resourcePerms = rolePerms[resource];
  if (!Array.isArray(resourcePerms)) return false;
  return resourcePerms.includes(action);
}
