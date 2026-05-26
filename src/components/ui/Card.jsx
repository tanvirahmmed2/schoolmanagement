"use client";

export default function Card({
  children,
  glass = false,
  hoverable = false,
  padding = "lg",
  style: customStyle = {},
  className = "",
  ...props
}) {
  const PADDING = {
    none: "0",
    sm:   "1rem",
    md:   "1.5rem",
    lg:   "2rem",
    xl:   "2.5rem",
  };

  return (
    <div
      className={className}
      style={{
        background: glass
          ? "rgba(255,255,255,0.75)"
          : "#ffffff",
        backdropFilter: glass ? "blur(16px)" : "none",
        WebkitBackdropFilter: glass ? "blur(16px)" : "none",
        border: glass
          ? "1px solid rgba(255,255,255,0.5)"
          : "1px solid var(--border-base)",
        borderRadius: "var(--radius-xl)",
        boxShadow: glass ? "var(--shadow-lg)" : "var(--shadow-sm)",
        padding: PADDING[padding] || PADDING.lg,
        transition: hoverable ? "all 0.25s ease" : "none",
        cursor: hoverable ? "pointer" : "default",
        ...customStyle,
      }}
      onMouseEnter={
        hoverable
          ? (e) => {
              e.currentTarget.style.transform = "translateY(-4px)";
              e.currentTarget.style.boxShadow = "var(--shadow-xl)";
              e.currentTarget.style.borderColor = "var(--color-primary-200)";
            }
          : undefined
      }
      onMouseLeave={
        hoverable
          ? (e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = glass
                ? "var(--shadow-lg)"
                : "var(--shadow-sm)";
              e.currentTarget.style.borderColor = glass
                ? "rgba(255,255,255,0.5)"
                : "var(--border-base)";
            }
          : undefined
      }
      {...props}
    >
      {children}
    </div>
  );
}
