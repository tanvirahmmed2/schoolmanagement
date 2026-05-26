"use client";

const VARIANTS = {
  primary: {
    background: "var(--gradient-brand)",
    color: "#fff",
    border: "none",
    boxShadow: "0 4px 14px rgba(79,70,229,0.35)",
    hoverShadow: "0 8px 24px rgba(79,70,229,0.45)",
    hoverTransform: "translateY(-2px)",
  },
  secondary: {
    background: "var(--color-primary-50)",
    color: "var(--color-primary-700)",
    border: "1.5px solid var(--color-primary-200)",
    boxShadow: "none",
    hoverBg: "var(--color-primary-100)",
  },
  outline: {
    background: "transparent",
    color: "var(--text-secondary)",
    border: "1.5px solid var(--border-base)",
    boxShadow: "none",
    hoverBg: "var(--bg-subtle)",
    hoverColor: "var(--text-primary)",
  },
  ghost: {
    background: "transparent",
    color: "var(--color-primary-600)",
    border: "none",
    boxShadow: "none",
    hoverBg: "var(--color-primary-50)",
  },
  danger: {
    background: "#fef2f2",
    color: "#dc2626",
    border: "1.5px solid #fecaca",
    boxShadow: "none",
    hoverBg: "#fee2e2",
  },
};

const SIZES = {
  sm: { padding: "0.4375rem 1rem", fontSize: "0.8125rem", borderRadius: "var(--radius-md)" },
  md: { padding: "0.625rem 1.375rem", fontSize: "0.9rem", borderRadius: "var(--radius-full)" },
  lg: { padding: "0.8125rem 2rem", fontSize: "1rem", borderRadius: "var(--radius-full)" },
  xl: { padding: "1rem 2.5rem", fontSize: "1.0625rem", borderRadius: "var(--radius-full)" },
};

export default function Button({
  children,
  variant = "primary",
  size = "md",
  fullWidth = false,
  disabled = false,
  loading = false,
  icon,
  iconRight,
  onClick,
  type = "button",
  style: customStyle = {},
  ...props
}) {
  const v = VARIANTS[variant] || VARIANTS.primary;
  const s = SIZES[size] || SIZES.md;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "0.5rem",
        fontFamily: "var(--font-sans)",
        fontWeight: 600,
        cursor: disabled || loading ? "not-allowed" : "pointer",
        opacity: disabled ? 0.55 : 1,
        transition: "all 0.2s ease",
        whiteSpace: "nowrap",
        width: fullWidth ? "100%" : "auto",
        letterSpacing: "-0.01em",
        textDecoration: "none",
        ...s,
        background: v.background,
        color: v.color,
        border: v.border || "none",
        boxShadow: v.boxShadow,
        ...customStyle,
      }}
      onMouseEnter={(e) => {
        if (disabled || loading) return;
        if (v.hoverShadow) e.currentTarget.style.boxShadow = v.hoverShadow;
        if (v.hoverTransform) e.currentTarget.style.transform = v.hoverTransform;
        if (v.hoverBg) e.currentTarget.style.background = v.hoverBg;
        if (v.hoverColor) e.currentTarget.style.color = v.hoverColor;
      }}
      onMouseLeave={(e) => {
        if (disabled || loading) return;
        e.currentTarget.style.boxShadow = v.boxShadow || "none";
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.background = v.background;
        e.currentTarget.style.color = v.color;
      }}
      {...props}
    >
      {loading ? (
        <span
          style={{
            width: "1em",
            height: "1em",
            border: "2px solid currentColor",
            borderTopColor: "transparent",
            borderRadius: "50%",
            display: "inline-block",
            animation: "spin 0.7s linear infinite",
          }}
        />
      ) : icon ? (
        <span style={{ display: "flex" }}>{icon}</span>
      ) : null}
      {children}
      {iconRight && !loading && (
        <span style={{ display: "flex" }}>{iconRight}</span>
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </button>
  );
}
