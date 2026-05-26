"use client";

export default function StatCard({ stat }) {
  const { value, label, icon, trend, trendLabel, color = "indigo" } = stat;

  const COLORS = {
    indigo: { bg: "var(--color-primary-50)", icon: "var(--color-primary-600)", border: "var(--color-primary-100)" },
    violet: { bg: "#f5f3ff", icon: "#7c3aed", border: "#ede9fe" },
    emerald: { bg: "#ecfdf5", icon: "#059669", border: "#d1fae5" },
    amber:   { bg: "#fffbeb", icon: "#d97706", border: "#fde68a" },
    sky:     { bg: "#f0f9ff", icon: "#0284c7", border: "#bae6fd" },
  };
  const c = COLORS[color] || COLORS.indigo;

  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid var(--border-base)",
        borderRadius: "var(--radius-xl)",
        padding: "1.5rem",
        display: "flex",
        flexDirection: "column",
        gap: "0.75rem",
        transition: "all 0.25s ease",
        boxShadow: "var(--shadow-sm)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-3px)";
        e.currentTarget.style.boxShadow = "var(--shadow-lg)";
        e.currentTarget.style.borderColor = c.border;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "var(--shadow-sm)";
        e.currentTarget.style.borderColor = "var(--border-base)";
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        {icon && (
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: "2.75rem",
              height: "2.75rem",
              borderRadius: "var(--radius-lg)",
              background: c.bg,
              color: c.icon,
              fontSize: "1.25rem",
              border: `1px solid ${c.border}`,
            }}
          >
            {icon}
          </span>
        )}
        {trend !== undefined && (
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.25rem",
              fontSize: "0.75rem",
              fontWeight: 700,
              color: trend >= 0 ? "#059669" : "#dc2626",
              background: trend >= 0 ? "#ecfdf5" : "#fef2f2",
              padding: "0.25rem 0.5rem",
              borderRadius: "9999px",
            }}
          >
            {trend >= 0 ? "↑" : "↓"} {Math.abs(trend)}%
          </span>
        )}
      </div>

      <div>
        <div
          style={{
            fontSize: "2rem",
            fontWeight: 800,
            color: "var(--text-primary)",
            letterSpacing: "-0.04em",
            lineHeight: 1,
          }}
        >
          {value}
        </div>
        <div style={{ fontSize: "0.875rem", color: "var(--text-secondary)", marginTop: "0.25rem" }}>
          {label}
        </div>
        {trendLabel && (
          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
            {trendLabel}
          </div>
        )}
      </div>
    </div>
  );
}
