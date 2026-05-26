import Link from "next/link";

export default function AuthLayout({ children }) {
  return (
    <div style={{ minHeight: "100vh", display: "flex", background: "var(--bg-subtle)" }}>
      {/* Left panel — branding */}
      <div
        style={{
          flex: "0 0 42%",
          background: "var(--gradient-hero)",
          padding: "3rem",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          position: "relative",
          overflow: "hidden",
        }}
        className="auth-panel"
      >
        {/* Decorative */}
        <div style={{ position: "absolute", top: "-20%", right: "-20%", width: "30rem", height: "30rem", borderRadius: "50%", background: "rgba(99,102,241,0.12)", filter: "blur(60px)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: "-10%", left: "-10%", width: "20rem", height: "20rem", borderRadius: "50%", background: "rgba(167,139,250,0.08)", filter: "blur(50px)", pointerEvents: "none" }} />

        <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", textDecoration: "none", position: "relative", zIndex: 1 }}>
          <span style={{ width: "2.25rem", height: "2.25rem", borderRadius: "0.625rem", background: "var(--gradient-brand)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem", fontWeight: 800, color: "#fff", boxShadow: "0 4px 12px rgba(79,70,229,0.4)" }}>E</span>
          <span style={{ fontSize: "1.25rem", fontWeight: 800, color: "#f1f5f9", letterSpacing: "-0.02em" }}>EduSaaS</span>
        </Link>

        <div style={{ position: "relative", zIndex: 1 }}>
          <blockquote style={{ fontSize: "1.375rem", fontWeight: 700, color: "#e2e8f0", lineHeight: 1.55, marginBottom: "1.5rem", letterSpacing: "-0.02em" }}>
            "Managing 800 students used to be chaos. EduSaaS made everything automated and effortless."
          </blockquote>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div style={{ width: "2.5rem", height: "2.5rem", borderRadius: "50%", background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "#e2e8f0", fontSize: "0.8125rem", fontWeight: 700 }}>NA</div>
            <div>
              <div style={{ fontWeight: 700, color: "#f1f5f9", fontSize: "0.875rem" }}>Nasrin Akter</div>
              <div style={{ color: "#94a3b8", fontSize: "0.8125rem" }}>Director, Chittagong Coaching Centre</div>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: "2rem", position: "relative", zIndex: 1 }}>
          {[["500+", "Institutions"], ["1.2L+", "Students"], ["99.9%", "Uptime"]].map(([val, lbl]) => (
            <div key={lbl}>
              <div style={{ fontSize: "1.25rem", fontWeight: 800, color: "#f1f5f9" }}>{val}</div>
              <div style={{ fontSize: "0.75rem", color: "#64748b" }}>{lbl}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel — form */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
        <div style={{ width: "100%", maxWidth: "440px" }}>
          {children}
        </div>
      </div>

      <style>{`@media (max-width: 900px) { .auth-panel { display: none !important; } }`}</style>
    </div>
  );
}
