"use client";

import Link from "next/link";

const FOOTER_LINKS = {
  Product: [
    { href: "/features", label: "Features" },
    { href: "/pricing", label: "Pricing" },
    { href: "/demo", label: "Request Demo" },
    { href: "/faq", label: "FAQ" },
  ],
  Company: [
    { href: "/about", label: "About Us" },
    { href: "/contact", label: "Contact" },
    { href: "/blog", label: "Blog" },
  ],
  "Institution Types": [
    { href: "/features#school", label: "Schools" },
    { href: "/features#college", label: "Colleges" },
    { href: "/features#madrasah", label: "Madrasahs" },
    { href: "/features#coaching", label: "Coaching Centres" },
  ],
  Legal: [
    { href: "/privacy", label: "Privacy Policy" },
    { href: "/terms", label: "Terms of Service" },
    { href: "/refund", label: "Refund Policy" },
  ],
};

export default function Footer() {
  return (
    <footer
      style={{
        background: "#0f172a",
        color: "#94a3b8",
        borderTop: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      {/* Main Footer */}
      <div
        className="section-container"
        style={{ padding: "5rem 1.5rem 3rem" }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr",
            gap: "3rem",
          }}
          className="footer-grid"
        >
          {/* Brand column */}
          <div>
            <Link
              href="/"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                marginBottom: "1.25rem",
                textDecoration: "none",
              }}
            >
              <span
                style={{
                  width: "2.25rem",
                  height: "2.25rem",
                  borderRadius: "0.625rem",
                  background: "var(--gradient-brand)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1rem",
                  fontWeight: 800,
                  color: "#fff",
                  boxShadow: "0 4px 12px rgba(79,70,229,0.4)",
                }}
              >
                E
              </span>
              <span
                style={{
                  fontSize: "1.25rem",
                  fontWeight: 800,
                  color: "#f1f5f9",
                  letterSpacing: "-0.02em",
                }}
              >
                EduSaaS
              </span>
            </Link>
            <p
              style={{
                fontSize: "0.9rem",
                lineHeight: 1.7,
                maxWidth: "22rem",
                marginBottom: "1.5rem",
              }}
            >
              The all-in-one school management platform trusted by 500+
              institutions across Bangladesh. Manage students, fees, exams, and
              everything in between.
            </p>
            {/* Payment badges */}
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
              {["bKash", "Nagad", "Card", "Bank"].map((method) => (
                <span
                  key={method}
                  style={{
                    padding: "0.25rem 0.625rem",
                    borderRadius: "0.375rem",
                    background: "rgba(255,255,255,0.07)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    fontSize: "0.7rem",
                    fontWeight: 600,
                    color: "#cbd5e1",
                    letterSpacing: "0.03em",
                  }}
                >
                  {method}
                </span>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(FOOTER_LINKS).map(([category, links]) => (
            <div key={category}>
              <h3
                style={{
                  fontSize: "0.8125rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  color: "#e2e8f0",
                  marginBottom: "1rem",
                }}
              >
                {category}
              </h3>
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {links.map((link) => (
                  <li key={link.href} style={{ marginBottom: "0.625rem" }}>
                    <Link
                      href={link.href}
                      style={{
                        fontSize: "0.875rem",
                        color: "#94a3b8",
                        textDecoration: "none",
                        transition: "color 0.15s ease",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.color = "#e2e8f0")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.color = "#94a3b8")
                      }
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div
        style={{
          borderTop: "1px solid rgba(255,255,255,0.06)",
          padding: "1.5rem",
        }}
      >
        <div
          className="section-container"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "1rem",
          }}
        >
          <p style={{ fontSize: "0.8125rem" }}>
            © {new Date().getFullYear()} EduSaaS. All rights reserved. Made
            with ♥ in Bangladesh.
          </p>
          <div style={{ display: "flex", gap: "1.25rem" }}>
            {[
              { label: "🐦 Twitter", href: "#" },
              { label: "💼 LinkedIn", href: "#" },
              { label: "📘 Facebook", href: "#" },
            ].map((s) => (
              <a
                key={s.label}
                href={s.href}
                style={{
                  fontSize: "0.8125rem",
                  color: "#64748b",
                  textDecoration: "none",
                  transition: "color 0.15s ease",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.color = "#e2e8f0")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color = "#64748b")
                }
              >
                {s.label}
              </a>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 1024px) {
          .footer-grid {
            grid-template-columns: 1fr 1fr 1fr !important;
          }
        }
        @media (max-width: 640px) {
          .footer-grid {
            grid-template-columns: 1fr 1fr !important;
          }
        }
      `}</style>
    </footer>
  );
}
