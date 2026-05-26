const BADGE_VARIANTS = {
  active:    { bg: "#d1fae5", color: "#065f46", dot: "#10b981" },
  pending:   { bg: "#fef3c7", color: "#92400e", dot: "#f59e0b" },
  suspended: { bg: "#fee2e2", color: "#991b1b", dot: "#ef4444" },
  expired:   { bg: "#f1f5f9", color: "#475569", dot: "#94a3b8" },
  cancelled: { bg: "#fef2f2", color: "#dc2626", dot: "#f87171" },
  new:       { bg: "#ede9fe", color: "#5b21b6", dot: "#8b5cf6" },
  pro:       { bg: "#dbeafe", color: "#1d4ed8", dot: "#3b82f6" },
  default:   { bg: "var(--color-primary-100)", color: "var(--color-primary-700)", dot: "var(--color-primary-500)" },
};

export default function Badge({ children, variant = "default", showDot = true, size = "sm" }) {
  const v = BADGE_VARIANTS[variant] || BADGE_VARIANTS.default;
  const isSmall = size === "sm";

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.375rem",
        padding: isSmall ? "0.1875rem 0.625rem" : "0.3125rem 0.875rem",
        borderRadius: "9999px",
        fontSize: isSmall ? "0.75rem" : "0.8125rem",
        fontWeight: 600,
        background: v.bg,
        color: v.color,
        whiteSpace: "nowrap",
      }}
    >
      {showDot && (
        <span
          style={{
            width: isSmall ? "0.375rem" : "0.5rem",
            height: isSmall ? "0.375rem" : "0.5rem",
            borderRadius: "50%",
            background: v.dot,
            flexShrink: 0,
          }}
        />
      )}
      {children}
    </span>
  );
}
