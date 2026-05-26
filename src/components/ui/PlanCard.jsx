"use client";

import Link from "next/link";

const CHECK_ICON = (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <circle cx="8" cy="8" r="8" fill="#d1fae5" />
    <path d="M5 8l2 2 4-4" stroke="#059669" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const X_ICON = (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <circle cx="8" cy="8" r="8" fill="#f1f5f9" />
    <path d="M6 6l4 4M10 6l-4 4" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

export default function PlanCard({ plan, popular = false, billingCycle = "monthly" }) {
  const { name, price, yearlyPrice, description, features, cta, href, color = "indigo" } = plan;

  const displayPrice = billingCycle === "yearly" ? yearlyPrice : price;
  const savings = billingCycle === "yearly"
    ? Math.round(((price * 12 - yearlyPrice * 12) / (price * 12)) * 100)
    : 0;

  const COLORS = {
    indigo: {
      accent: "var(--color-primary-600)",
      bg: "var(--color-primary-50)",
      border: "var(--color-primary-300)",
      badge: { bg: "var(--color-primary-600)", color: "#fff" },
    },
    violet: {
      accent: "var(--color-accent-600)",
      bg: "#f5f3ff",
      border: "#c4b5fd",
      badge: { bg: "var(--color-accent-600)", color: "#fff" },
    },
    slate: {
      accent: "#334155",
      bg: "#f8fafc",
      border: "#cbd5e1",
      badge: { bg: "#334155", color: "#fff" },
    },
  };

  const c = COLORS[color] || COLORS.indigo;

  return (
    <div
      style={{
        position: "relative",
        background: popular
          ? "linear-gradient(145deg, #1e1b4b, #312e81)"
          : "#ffffff",
        border: popular
          ? "1.5px solid rgba(165,180,252,0.3)"
          : `1.5px solid ${popular ? c.border : "var(--border-base)"}`,
        borderRadius: "var(--radius-2xl)",
        padding: "2rem",
        display: "flex",
        flexDirection: "column",
        gap: "1.5rem",
        boxShadow: popular ? "var(--shadow-glow)" : "var(--shadow-md)",
        transition: "all 0.25s ease",
        transform: popular ? "scale(1.03)" : "scale(1)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = popular ? "scale(1.04) translateY(-4px)" : "translateY(-4px)";
        e.currentTarget.style.boxShadow = popular
          ? "0 0 60px rgba(99,102,241,0.35)"
          : "var(--shadow-xl)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = popular ? "scale(1.03)" : "scale(1)";
        e.currentTarget.style.boxShadow = popular ? "var(--shadow-glow)" : "var(--shadow-md)";
      }}
    >
      {/* Popular badge */}
      {popular && (
        <span
          style={{
            position: "absolute",
            top: "-0.875rem",
            left: "50%",
            transform: "translateX(-50%)",
            background: "var(--gradient-brand)",
            color: "#fff",
            fontSize: "0.75rem",
            fontWeight: 700,
            padding: "0.25rem 1rem",
            borderRadius: "9999px",
            whiteSpace: "nowrap",
            boxShadow: "0 4px 12px rgba(79,70,229,0.4)",
            letterSpacing: "0.04em",
          }}
        >
          ✦ Most Popular
        </span>
      )}

      {/* Header */}
      <div>
        <p
          style={{
            fontSize: "0.8125rem",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            color: popular ? "#a5b4fc" : c.accent,
            marginBottom: "0.5rem",
          }}
        >
          {name}
        </p>
        <div style={{ display: "flex", alignItems: "flex-end", gap: "0.375rem", marginBottom: "0.5rem" }}>
          <span
            style={{
              fontSize: "0.875rem",
              fontWeight: 600,
              color: popular ? "#94a3b8" : "var(--text-muted)",
              marginBottom: "0.375rem",
            }}
          >
            ৳
          </span>
          <span
            style={{
              fontSize: "3rem",
              fontWeight: 800,
              lineHeight: 1,
              color: popular ? "#f1f5f9" : "var(--text-primary)",
              letterSpacing: "-0.04em",
            }}
          >
            {displayPrice?.toLocaleString()}
          </span>
          <span
            style={{
              fontSize: "0.875rem",
              color: popular ? "#94a3b8" : "var(--text-muted)",
              marginBottom: "0.375rem",
            }}
          >
            /{billingCycle === "yearly" ? "yr" : "mo"}
          </span>
        </div>
        {savings > 0 && (
          <span
            style={{
              display: "inline-block",
              background: "#d1fae5",
              color: "#065f46",
              fontSize: "0.75rem",
              fontWeight: 700,
              padding: "0.125rem 0.5rem",
              borderRadius: "9999px",
              marginBottom: "0.5rem",
            }}
          >
            Save {savings}%
          </span>
        )}
        <p style={{ fontSize: "0.875rem", color: popular ? "#94a3b8" : "var(--text-secondary)" }}>
          {description}
        </p>
      </div>

      {/* Features */}
      <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.75rem", flex: 1 }}>
        {features.map((feature, i) => (
          <li
            key={i}
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "0.625rem",
              fontSize: "0.875rem",
              color: popular ? (feature.included ? "#e2e8f0" : "#475569") : (feature.included ? "var(--text-primary)" : "var(--text-muted)"),
              textDecoration: feature.included ? "none" : "none",
            }}
          >
            <span style={{ flexShrink: 0, marginTop: "0.1rem" }}>
              {feature.included ? CHECK_ICON : X_ICON}
            </span>
            {feature.label}
          </li>
        ))}
      </ul>

      {/* CTA */}
      <Link
        href={href || "/register"}
        style={{
          display: "block",
          textAlign: "center",
          padding: "0.8125rem",
          borderRadius: "var(--radius-full)",
          background: popular ? "var(--gradient-brand)" : c.bg,
          color: popular ? "#fff" : c.accent,
          fontWeight: 700,
          fontSize: "0.9rem",
          textDecoration: "none",
          border: popular ? "none" : `1.5px solid ${c.border}`,
          boxShadow: popular ? "0 4px 14px rgba(79,70,229,0.35)" : "none",
          transition: "all 0.2s ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "translateY(-1px)";
          e.currentTarget.style.boxShadow = popular
            ? "0 8px 24px rgba(79,70,229,0.45)"
            : "var(--shadow-md)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = popular ? "0 4px 14px rgba(79,70,229,0.35)" : "none";
        }}
      >
        {cta || "Get Started"}
      </Link>
    </div>
  );
}
