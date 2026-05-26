"use client";

import Link from "next/link";

const FEATURE_CATEGORIES = [
  {
    id: "school",
    label: "Student Management",
    icon: "🎓",
    color: "indigo",
    features: [
      { title: "Student Profiles", desc: "Complete digital records — personal info, guardian contacts, medical notes, and academic history." },
      { title: "Admission Workflow", desc: "Online admission forms, document uploads, approval queue, and automated ID generation." },
      { title: "Class & Section Management", desc: "Organise students into classes, sections, and roll-based lists. Easy batch promotions." },
      { title: "Performance Tracking", desc: "Subject-wise marks, grade history, and performance charts over multiple terms." },
    ],
  },
  {
    id: "college",
    label: "Teacher & Staff",
    icon: "👨‍🏫",
    color: "violet",
    features: [
      { title: "Staff Directory", desc: "Centrally manage all teaching and non-teaching staff with role-based profiles." },
      { title: "Salary Management", desc: "Define salary structures, process monthly payroll, and generate pay slips." },
      { title: "Leave Management", desc: "Staff can apply for leave online. Admins approve with one click." },
      { title: "Timetable Builder", desc: "Drag-and-drop timetable builder with conflict detection for classes and teachers." },
    ],
  },
  {
    id: "madrasah",
    label: "Fee Collection",
    icon: "💳",
    color: "emerald",
    features: [
      { title: "Online Fee Payment", desc: "Students pay via bKash, Nagad, card, or bank transfer. No cash handling needed." },
      { title: "Automated Invoicing", desc: "Auto-generate monthly/semester invoices and send them to parents by SMS." },
      { title: "Due Tracking", desc: "Real-time view of paid, unpaid, and overdue fees across all students." },
      { title: "Payment Reports", desc: "Export income reports by date range, class, or payment method." },
    ],
  },
  {
    id: "coaching",
    label: "Exams & Results",
    icon: "📋",
    color: "sky",
    features: [
      { title: "Exam Scheduling", desc: "Create exams with subjects, dates, and seat plans. Auto-notify students." },
      { title: "Mark Entry", desc: "Teachers enter marks subject-by-subject. System auto-calculates totals and grades." },
      { title: "Result Sheets", desc: "One-click result sheet generation with merit position and GPA calculation." },
      { title: "Report Cards", desc: "Print or email beautiful result cards to parents in seconds." },
    ],
  },
  {
    id: "attendance",
    label: "Attendance",
    icon: "📅",
    color: "amber",
    features: [
      { title: "Daily Attendance", desc: "Mark attendance class by class. Supports present, absent, late, and leave states." },
      { title: "SMS Alerts", desc: "Auto-send SMS to parents when a student is marked absent." },
      { title: "Monthly Reports", desc: "Attendance percentages per student and class, exportable to PDF." },
      { title: "Staff Attendance", desc: "Track teacher and staff daily attendance separately." },
    ],
  },
  {
    id: "notices",
    label: "Notices & Communication",
    icon: "📢",
    color: "rose",
    features: [
      { title: "Notice Board", desc: "Post announcements visible to students, parents, and teachers instantly." },
      { title: "Event Calendar", desc: "School events, holidays, and exam dates visible on a shared calendar." },
      { title: "SMS Broadcasting", desc: "Send bulk SMS to any group — all parents, a specific class, or all staff." },
      { title: "Circular Management", desc: "Upload and share official circulars in PDF format with tracking." },
    ],
  },
];

const COLOR_MAP = {
  indigo: { bg: "#eef2ff", border: "#c7d2fe", accent: "#4f46e5", tag: "#818cf8" },
  violet: { bg: "#f5f3ff", border: "#ddd6fe", accent: "#7c3aed", tag: "#a78bfa" },
  emerald: { bg: "#ecfdf5", border: "#a7f3d0", accent: "#059669", tag: "#34d399" },
  sky:    { bg: "#f0f9ff", border: "#bae6fd", accent: "#0284c7", tag: "#38bdf8" },
  amber:  { bg: "#fffbeb", border: "#fde68a", accent: "#d97706", tag: "#fbbf24" },
  rose:   { bg: "#fff1f2", border: "#fecdd3", accent: "#e11d48", tag: "#fb7185" },
};

export default function FeaturesPage() {
  return (
    <>
      {/* Hero */}
      <section style={{ padding: "6rem 0 5rem", background: "var(--gradient-hero)", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 40% 50%, rgba(99,102,241,0.18) 0%, transparent 65%)", pointerEvents: "none" }} />
        <div className="section-container" style={{ position: "relative", zIndex: 1, textAlign: "center" }}>
          <span className="tag-pill" style={{ marginBottom: "1.5rem", display: "inline-flex", background: "rgba(99,102,241,0.15)", color: "#a5b4fc", border: "1px solid rgba(165,180,252,0.3)" }}>
            Platform Features
          </span>
          <h1 style={{ fontSize: "clamp(2.25rem, 5vw, 3.75rem)", fontWeight: 900, color: "#f1f5f9", letterSpacing: "-0.04em", marginBottom: "1.25rem", maxWidth: "800px", margin: "0 auto 1.25rem" }}>
            Everything your institution needs,{" "}
            <span style={{ background: "linear-gradient(135deg, #818cf8, #a78bfa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              in one place
            </span>
          </h1>
          <p style={{ fontSize: "1.125rem", color: "#94a3b8", maxWidth: "560px", margin: "0 auto", lineHeight: 1.8 }}>
            From student admission to fee collection, exams to results — EduSaaS covers the full lifecycle of school administration.
          </p>
        </div>
      </section>

      {/* Feature categories */}
      <section style={{ background: "var(--bg-subtle)" }}>
        {FEATURE_CATEGORIES.map((cat, idx) => {
          const c = COLOR_MAP[cat.color];
          const isEven = idx % 2 === 0;
          return (
            <div key={cat.id} id={cat.id} style={{ padding: "5rem 0", borderBottom: "1px solid var(--border-base)", background: isEven ? "#fff" : "var(--bg-subtle)" }}>
              <div className="section-container">
                <div style={{ display: "grid", gridTemplateColumns: isEven ? "1fr 2fr" : "2fr 1fr", gap: "4rem", alignItems: "center" }}>
                  {/* Category label — always left on even, right on odd */}
                  {isEven ? (
                    <>
                      <div>
                        <div style={{ width: "4rem", height: "4rem", borderRadius: "var(--radius-xl)", background: c.bg, border: `1px solid ${c.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.75rem", marginBottom: "1.25rem" }}>
                          {cat.icon}
                        </div>
                        <h2 style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.03em", marginBottom: "0.75rem" }}>
                          {cat.label}
                        </h2>
                        <Link href="/demo" style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem", marginTop: "1rem", color: c.accent, fontWeight: 600, fontSize: "0.9375rem", textDecoration: "none" }}>
                          See it in action →
                        </Link>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                        {cat.features.map((f) => (
                          <div key={f.title} style={{ padding: "1.25rem", borderRadius: "var(--radius-lg)", border: `1px solid ${c.border}`, background: c.bg, transition: "all 0.2s ease" }}
                            onMouseEnter={e => { e.currentTarget.style.boxShadow = "var(--shadow-md)"; }}
                            onMouseLeave={e => { e.currentTarget.style.boxShadow = "none"; }}>
                            <div style={{ fontWeight: 700, color: "var(--text-primary)", marginBottom: "0.375rem", fontSize: "0.9375rem" }}>{f.title}</div>
                            <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: 1.65 }}>{f.desc}</div>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                        {cat.features.map((f) => (
                          <div key={f.title} style={{ padding: "1.25rem", borderRadius: "var(--radius-lg)", border: `1px solid ${c.border}`, background: c.bg, transition: "all 0.2s ease" }}
                            onMouseEnter={e => { e.currentTarget.style.boxShadow = "var(--shadow-md)"; }}
                            onMouseLeave={e => { e.currentTarget.style.boxShadow = "none"; }}>
                            <div style={{ fontWeight: 700, color: "var(--text-primary)", marginBottom: "0.375rem", fontSize: "0.9375rem" }}>{f.title}</div>
                            <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: 1.65 }}>{f.desc}</div>
                          </div>
                        ))}
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ width: "4rem", height: "4rem", borderRadius: "var(--radius-xl)", background: c.bg, border: `1px solid ${c.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.75rem", marginBottom: "1.25rem", marginLeft: "auto" }}>
                          {cat.icon}
                        </div>
                        <h2 style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.03em", marginBottom: "0.75rem" }}>
                          {cat.label}
                        </h2>
                        <Link href="/demo" style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem", marginTop: "1rem", color: c.accent, fontWeight: 600, fontSize: "0.9375rem", textDecoration: "none" }}>
                          See it in action →
                        </Link>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </section>

      {/* CTA */}
      <section style={{ padding: "6rem 0", background: "linear-gradient(135deg, #1e1b4b, #312e81)", textAlign: "center" }}>
        <div className="section-container">
          <h2 style={{ fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 900, color: "#f1f5f9", letterSpacing: "-0.04em", marginBottom: "1rem" }}>
            Ready to see it in action?
          </h2>
          <p style={{ fontSize: "1.125rem", color: "#94a3b8", marginBottom: "2.5rem", maxWidth: "480px", margin: "0 auto 2.5rem" }}>
            Book a free live demo with our team and see EduSaaS running for your institution type.
          </p>
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/demo" style={{ padding: "0.9375rem 2.25rem", borderRadius: "9999px", background: "var(--gradient-brand)", color: "#fff", fontWeight: 700, textDecoration: "none", boxShadow: "0 8px 32px rgba(79,70,229,0.4)" }}>
              Book a Demo →
            </Link>
            <Link href="/pricing" style={{ padding: "0.9375rem 2.25rem", borderRadius: "9999px", background: "rgba(255,255,255,0.08)", border: "1.5px solid rgba(255,255,255,0.15)", color: "#e2e8f0", fontWeight: 600, textDecoration: "none" }}>
              View Pricing
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
