"use client";

import Link from "next/link";

const TEAM = [
  { name: "Tanvir Ahmed", role: "CEO & Co-Founder", avatar: "TA", bio: "Former school administrator turned tech founder. Passionate about EdTech." },
  { name: "Sumaiya Hossain", role: "CTO", avatar: "SH", bio: "Full-stack engineer with 8+ years in SaaS product development." },
  { name: "Fahim Reza", role: "Head of Product", avatar: "FR", bio: "UX researcher dedicated to making complex systems beautifully simple." },
  { name: "Nusrat Jahan", role: "Head of Support", avatar: "NJ", bio: "Ensuring every institution gets the help they need, when they need it." },
];

const VALUES = [
  { icon: "🎯", title: "Simplicity First", desc: "We believe powerful software should be simple enough for a non-technical school clerk to use on day one." },
  { icon: "🇧🇩", title: "Built for Bangladesh", desc: "Bangla-friendly, local payment methods, and support in your language — we understand the local context." },
  { icon: "🔒", title: "Trustworthy & Secure", desc: "Institution data is sacred. We use enterprise-grade security with full audit logs and role-based access." },
  { icon: "🌱", title: "Constantly Improving", desc: "We ship updates every two weeks, driven by feedback from the institutions we serve." },
];

const MILESTONES = [
  { year: "2021", event: "EduSaaS founded in Dhaka by two ex-teachers and a developer." },
  { year: "2022", event: "Launched beta with 12 pilot schools in Dhaka and Chittagong." },
  { year: "2023", event: "Reached 100 institutions. Added bKash & Nagad fee collection." },
  { year: "2024", event: "Expanded to madrasahs and coaching centres. 300+ active tenants." },
  { year: "2025", event: "500+ institutions. Launched multi-role admin panel and mobile app." },
];

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section style={{ padding: "7rem 0 5rem", background: "var(--gradient-hero)", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 60% 40%, rgba(99,102,241,0.15) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div className="section-container" style={{ position: "relative", zIndex: 1, textAlign: "center" }}>
          <span className="tag-pill" style={{ marginBottom: "1.5rem", display: "inline-flex", background: "rgba(99,102,241,0.15)", color: "#a5b4fc", border: "1px solid rgba(165,180,252,0.3)" }}>
            Our Story
          </span>
          <h1 style={{ fontSize: "clamp(2.25rem, 5vw, 3.75rem)", fontWeight: 900, color: "#f1f5f9", letterSpacing: "-0.04em", marginBottom: "1.25rem", maxWidth: "800px", margin: "0 auto 1.25rem" }}>
            We exist to{" "}
            <span style={{ background: "linear-gradient(135deg, #818cf8, #a78bfa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              empower educators
            </span>
          </h1>
          <p style={{ fontSize: "1.125rem", color: "#94a3b8", maxWidth: "600px", margin: "0 auto", lineHeight: 1.8 }}>
            EduSaaS was born from frustration — watching schools drown in paperwork and spreadsheets. We built the platform we wished existed.
          </p>
        </div>
      </section>

      {/* Stats bar */}
      <section style={{ background: "#fff", borderBottom: "1px solid var(--border-base)", padding: "2.5rem 0" }}>
        <div className="section-container" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem", textAlign: "center" }}>
          {[
            { value: "500+", label: "Institutions" },
            { value: "1.2L+", label: "Students" },
            { value: "4+", label: "Years" },
            { value: "4.9★", label: "Avg Rating" },
          ].map((s) => (
            <div key={s.label}>
              <div style={{ fontSize: "2.25rem", fontWeight: 800, color: "var(--color-primary-600)", letterSpacing: "-0.04em" }}>{s.value}</div>
              <div style={{ fontSize: "0.875rem", color: "var(--text-secondary)", marginTop: "0.25rem" }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Mission */}
      <section className="section-padding">
        <div className="section-container" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "5rem", alignItems: "center" }}>
          <div>
            <span className="tag-pill" style={{ marginBottom: "1rem", display: "inline-flex" }}>Our Mission</span>
            <h2 style={{ fontSize: "clamp(1.75rem, 3vw, 2.5rem)", fontWeight: 800, letterSpacing: "-0.03em", color: "var(--text-primary)", marginBottom: "1.25rem" }}>
              Modernising education management in Bangladesh
            </h2>
            <p style={{ fontSize: "1rem", color: "var(--text-secondary)", lineHeight: 1.8, marginBottom: "1rem" }}>
              Millions of students attend institutions that still track records in paper registers. We believe every school — big or small, urban or rural — deserves world-class management tools.
            </p>
            <p style={{ fontSize: "1rem", color: "var(--text-secondary)", lineHeight: 1.8 }}>
              EduSaaS is built to be affordable, intuitive, and tailored to Bangladesh's unique educational landscape — with local payment support, Bangla-first design, and offline-capable features.
            </p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {VALUES.map((v) => (
              <div key={v.title} style={{ display: "flex", gap: "1rem", padding: "1.25rem", borderRadius: "var(--radius-lg)", border: "1px solid var(--border-base)", background: "#fff", boxShadow: "var(--shadow-sm)", transition: "all 0.2s ease" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--color-primary-200)"; e.currentTarget.style.boxShadow = "var(--shadow-md)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border-base)"; e.currentTarget.style.boxShadow = "var(--shadow-sm)"; }}>
                <span style={{ fontSize: "1.5rem", flexShrink: 0 }}>{v.icon}</span>
                <div>
                  <div style={{ fontWeight: 700, color: "var(--text-primary)", marginBottom: "0.25rem" }}>{v.title}</div>
                  <div style={{ fontSize: "0.875rem", color: "var(--text-secondary)", lineHeight: 1.7 }}>{v.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="section-padding" style={{ background: "var(--bg-subtle)", borderTop: "1px solid var(--border-base)" }}>
        <div className="section-container">
          <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
            <span className="tag-pill" style={{ marginBottom: "1rem", display: "inline-flex" }}>Our Journey</span>
            <h2 style={{ fontSize: "clamp(1.75rem, 3vw, 2.5rem)", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.03em" }}>
              How we got here
            </h2>
          </div>
          <div style={{ maxWidth: "640px", margin: "0 auto", position: "relative" }}>
            <div style={{ position: "absolute", left: "4.5rem", top: 0, bottom: 0, width: "2px", background: "linear-gradient(to bottom, var(--color-primary-200), transparent)" }} />
            {MILESTONES.map((m, i) => (
              <div key={m.year} style={{ display: "flex", gap: "2rem", marginBottom: "2rem", position: "relative", alignItems: "flex-start" }}>
                <div style={{ width: "3.5rem", flexShrink: 0, textAlign: "right" }}>
                  <span style={{ fontSize: "0.8125rem", fontWeight: 700, color: "var(--color-primary-600)" }}>{m.year}</span>
                </div>
                <div style={{ width: "0.875rem", height: "0.875rem", borderRadius: "50%", background: "var(--color-primary-500)", border: "2px solid #fff", boxShadow: "0 0 0 3px var(--color-primary-200)", flexShrink: 0, marginTop: "0.125rem" }} />
                <p style={{ fontSize: "0.9375rem", color: "var(--text-secondary)", lineHeight: 1.7, flex: 1 }}>{m.event}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="section-padding">
        <div className="section-container">
          <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
            <span className="tag-pill" style={{ marginBottom: "1rem", display: "inline-flex" }}>The Team</span>
            <h2 style={{ fontSize: "clamp(1.75rem, 3vw, 2.5rem)", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.03em" }}>
              People behind EduSaaS
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1.5rem" }}>
            {TEAM.map((member) => (
              <div key={member.name} style={{ textAlign: "center", padding: "2rem 1.25rem", borderRadius: "var(--radius-xl)", border: "1px solid var(--border-base)", background: "#fff", boxShadow: "var(--shadow-sm)", transition: "all 0.25s ease" }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "var(--shadow-xl)"; e.currentTarget.style.borderColor = "var(--color-primary-200)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "var(--shadow-sm)"; e.currentTarget.style.borderColor = "var(--border-base)"; }}>
                <div style={{ width: "4rem", height: "4rem", borderRadius: "50%", background: "var(--gradient-brand)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "1rem", fontWeight: 800, margin: "0 auto 1rem", boxShadow: "0 4px 14px rgba(79,70,229,0.3)" }}>
                  {member.avatar}
                </div>
                <div style={{ fontWeight: 700, color: "var(--text-primary)", marginBottom: "0.25rem" }}>{member.name}</div>
                <div style={{ fontSize: "0.8125rem", color: "var(--color-primary-600)", fontWeight: 600, marginBottom: "0.75rem" }}>{member.role}</div>
                <div style={{ fontSize: "0.8125rem", color: "var(--text-muted)", lineHeight: 1.6 }}>{member.bio}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: "5rem 0", background: "var(--bg-subtle)", borderTop: "1px solid var(--border-base)" }}>
        <div className="section-container" style={{ textAlign: "center" }}>
          <h2 style={{ fontSize: "clamp(1.75rem, 3vw, 2.5rem)", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.03em", marginBottom: "1rem" }}>
            Want to join our journey?
          </h2>
          <p style={{ color: "var(--text-secondary)", marginBottom: "2rem", fontSize: "1rem" }}>
            We're always looking for passionate people to join our mission.
          </p>
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/contact" style={{ padding: "0.875rem 2rem", borderRadius: "9999px", background: "var(--gradient-brand)", color: "#fff", fontWeight: 700, textDecoration: "none", boxShadow: "var(--shadow-brand)" }}>
              Get in Touch
            </Link>
            <Link href="/demo" style={{ padding: "0.875rem 2rem", borderRadius: "9999px", border: "1.5px solid var(--border-base)", color: "var(--text-primary)", fontWeight: 600, textDecoration: "none" }}>
              See the Platform
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
