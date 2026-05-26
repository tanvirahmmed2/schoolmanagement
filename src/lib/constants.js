// ─── Roles ────────────────────────────────────────────────────────────────
export const ROLES = {
  ADMIN:   "admin",
  MANAGER: "manager",
  SUPPORT: "support",
  CLIENT:  "client",
};

// ─── Tenant Statuses ──────────────────────────────────────────────────────
export const TENANT_STATUS = {
  PENDING:   "pending",
  ACTIVE:    "active",
  SUSPENDED: "suspended",
  EXPIRED:   "expired",
};

// ─── Subscription Statuses ────────────────────────────────────────────────
export const SUBSCRIPTION_STATUS = {
  ACTIVE:    "active",
  EXPIRED:   "expired",
  CANCELLED: "cancelled",
};

// ─── Payment Statuses ─────────────────────────────────────────────────────
export const PAYMENT_STATUS = {
  PENDING:  "pending",
  SUCCESS:  "success",
  FAILED:   "failed",
  REFUNDED: "refunded",
};

// ─── Payment Methods ──────────────────────────────────────────────────────
export const PAYMENT_METHODS = {
  BKASH:         "bkash",
  NAGAD:         "nagad",
  CARD:          "card",
  STRIPE:        "stripe",
  BANK_TRANSFER: "bank_transfer",
};

// ─── Institution Types ────────────────────────────────────────────────────
export const INSTITUTION_TYPES = {
  SCHOOL:   "school",
  COLLEGE:  "college",
  MADRASAH: "madrasah",
  COACHING: "coaching",
};

// ─── Billing Cycles ───────────────────────────────────────────────────────
export const BILLING_CYCLES = {
  MONTHLY: "monthly",
  YEARLY:  "yearly",
};

// ─── Invoice Statuses ─────────────────────────────────────────────────────
export const INVOICE_STATUS = {
  UNPAID:    "unpaid",
  PAID:      "paid",
  OVERDUE:   "overdue",
  CANCELLED: "cancelled",
};

// ─── Support Ticket Statuses ──────────────────────────────────────────────
export const TICKET_STATUS = {
  OPEN:        "open",
  IN_PROGRESS: "in_progress",
  RESOLVED:    "resolved",
  CLOSED:      "closed",
};

// ─── Pagination ───────────────────────────────────────────────────────────
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE     = 100;

// ─── Cookie names ─────────────────────────────────────────────────────────
export const COOKIE_ACCESS_TOKEN  = "access_token";
export const COOKIE_REFRESH_TOKEN = "refresh_token";

// ─── Route prefixes ───────────────────────────────────────────────────────
export const ROUTE_PREFIX = {
  ADMIN:   "/admin",
  MANAGER: "/manager",
  SUPPORT: "/support",
  CLIENT:  "/client",
  AUTH:    "/(auth)",
  API:     "/api",
};
