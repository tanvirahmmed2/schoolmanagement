"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import PlanCard from "@/components/ui/PlanCard";

// ─── Data ───────────────────────────────────────────────────────────────────

const FEATURES = [
  {
    icon: "🎓",
    title: "Student Management",
    desc: "Full student profiles, admission workflows, class assignments, and performance tracking in one place.",
    color: "indigo",
  },
  {
    icon: "👨‍🏫",
    title: "Teacher & Staff",
    desc: "Manage payroll, attendance, schedules, and leave requests for all teaching and non-teaching staff.",
    color: "violet",
  },
  {
    icon: "📋",
    title: "Exam & Results",
    desc: "Create exams, record marks, auto-generate result sheets and report cards with a single click.",
    color: "sky",
  },
  {
    icon: "💳",
    title: "Fee Collection",
    desc: "Online fee collection via bKash, Nagad, cards, and bank transfer with automated invoicing.",
    color: "emerald",
  },
  {
    icon: "📅",
    title: "Attendance System",
    desc: "Daily student and teacher attendance with instant parent notifications via SMS.",
    color: "amber",
  },
  {
    icon: "📢",
    title: "Notices & Events",
    desc: "Broadcast announcements, circulars and events to parents, students, and staff instantly.",
    color: "rose",
  },
];

const STATS = [
  { value: "500+", label: "Institutions", icon: "🏫" },
  { value: "1.2L+", label: "Students Managed", icon: "🎓" },
  { value: "৳2Cr+", label: "Fees Collected", icon: "💳" },
  { value: "99.9%", label: "Uptime", icon: "⚡" },
];

const INSTITUTION_TYPES = [
  { label: "Schools", emoji: "🏫", desc: "Classes 1–10" },
  { label: "Colleges", emoji: "🎓", desc: "HSC & Degree" },
  { label: "Madrasahs", emoji: "🕌", desc: "Dakhil & Alim" },
  { label: "Coaching", emoji: "📚", desc: "All levels" },
];

const TESTIMONIALS = [
  {
    name: "Md. Rafiqul Islam",
    role: "Principal, Dhaka Model High School",
    avatar: "RI",
    quote:
      "EduSaaS has transformed how we run our school. Fee collection via bKash alone saved us hours every week.",
    rating: 5,
  },
  {
    name: "Nasrin Akter",
    role: "Director, Chittagong Coaching Centre",
    avatar: "NA",
    quote:
      "Managing 800 students used to be chaos. Now with EduSaaS, everything from attendance to results is automated.",
    rating: 5,
  },
  {
    name: "Sheikh Arif Billah",
    role: "Admin, Al-Amin Madrasah",
    avatar: "SA",
    quote:
      "The Bangla-friendly interface and local payment support made adoption seamless for our entire staff.",
    rating: 5,
  },
];

const STARTER_PLAN = {
  name: "Starter",
  price: 1499,
  yearlyPrice: 1199,
  description: "Perfect for small schools and coaching centres.",
  color: "slate",
  features: [
    { label: "Up to 200 students", included: true },
    { label: "Up to 10 teachers", included: true },
    { label: "Fee collection (bKash/Nagad)", included: true },
    { label: "Attendance & notices", included: true },
    { label: "Exam & result management", included: false },
    { label: "Custom subdomain", included: false },
    { label: "Priority support", included: false },
  ],
  cta: "Start Free Trial",
};

const PRO_PLAN = {
  name: "Pro",
  price: 2999,
  yearlyPrice: 2399,
  description: "For growing institutions that need the full suite.",
  color: "indigo",
  features: [
    { label: "Up to 1,000 students", included: true },
    { label: "Up to 50 teachers", included: true },
    { label: "Fee collection (all methods)", included: true },
    { label: "Attendance, notices & SMS", included: true },
    { label: "Exam & result management", included: true },
    { label: "Custom subdomain", included: true },
    { label: "Priority support", included: false },
  ],
  cta: "Get Started",
};

const ENTERPRISE_PLAN = {
  name: "Enterprise",
  price: 5999,
  yearlyPrice: 4799,
  description: "Unlimited scale with dedicated support.",
  color: "violet",
  features: [
    { label: "Unlimited students", included: true },
    { label: "Unlimited teachers", included: true },
    { label: "Fee collection (all methods)", included: true },
    { label: "Attendance, notices & SMS", included: true },
    { label: "Exam & result management", included: true },
    { label: "Custom domain + branding", included: true },
    { label: "Dedicated support manager", included: true },
  ],
  cta: "Contact Sales",
  href: "/contact",
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

const COLOR_MAP = {
  indigo: { bg: "#eef2ff", color: "#4f46e5" },
  violet: { bg: "#f5f3ff", color: "#7c3aed" },
  sky:    { bg: "#f0f9ff", color: "#0284c7" },
  emerald:{ bg: "#ecfdf5", color: "#059669" },
  amber:  { bg: "#fffbeb", color: "#d97706" },
  rose:   { bg: "#fff1f2", color: "#e11d48" },
};

// ─── Page ────────────────────────────────────────────────────────────────────

export default function HomePage() {
  const [testimonials, setTestimonials] = useState(TESTIMONIALS);

  useEffect(() => {
    async function fetchReviews() {
      try {
        const res = await fetch("/api/reviews");
        const json = await res.json();
        if (json.success && json.data) {
          const dbReviews = json.data.map((r) => ({
            name: r.user_name || "School Owner",
            role: `Owner, ${r.institution_name}`,
            avatar: r.user_name
              ? r.user_name.split(" ").map((x) => x[0]).join("").slice(0, 2).toUpperCase()
              : "SO",
            quote: r.comment,
            rating: r.rating
          }));
          setTestimonials([...dbReviews, ...TESTIMONIALS]);
        }
      } catch (err) {
        console.error("Failed to load reviews:", err);
      }
    }
    fetchReviews();
  }, []);

  return (
    <>
      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="hero-bg noise-overlay" style={{ padding: "7rem 0 6rem", minHeight: "92vh", display: "flex", alignItems: "center" }}>
        {/* Decorative blobs */}
        <div style={{ position: "absolute", top: "10%", left: "5%", width: "20rem", height: "20rem", borderRadius: "50%", background: "rgba(99,102,241,0.12)", filter: "blur(60px)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: "15%", right: "8%", width: "16rem", height: "16rem", borderRadius: "50%", background: "rgba(167,139,250,0.1)", filter: "blur(50px)", pointerEvents: "none" }} />
        <div className="dot-pattern" style={{ position: "absolute", inset: 0, opacity: 0.4, pointerEvents: "none" }} />

        <div className="section-container" style={{ position: "relative", zIndex: 1, textAlign: "center" }}>
          {/* Eyebrow */}
          <div className="animate-fadeInUp" style={{ display: "flex", justifyContent: "center", marginBottom: "1.5rem" }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", padding: "0.375rem 1rem", borderRadius: "9999px", background: "rgba(99,102,241,0.15)", border: "1px solid rgba(165,180,252,0.3)", color: "#a5b4fc", fontSize: "0.8125rem", fontWeight: 600, letterSpacing: "0.04em" }}>
              🇧🇩 Built for Bangladesh's Educational Institutions
            </span>
          </div>

          {/* Headline */}
          <h1 className="animate-fadeInUp delay-100" style={{ fontSize: "clamp(2.5rem, 6vw, 4.5rem)", fontWeight: 900, lineHeight: 1.08, letterSpacing: "-0.04em", color: "#f1f5f9", marginBottom: "1.5rem", maxWidth: "900px", margin: "0 auto 1.5rem" }}>
            The Smarter Way to{" "}
            <span style={{ background: "linear-gradient(135deg, #818cf8, #a78bfa, #c084fc)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              Run Your School
            </span>
          </h1>

          {/* Sub */}
          <p className="animate-fadeInUp delay-200" style={{ fontSize: "clamp(1rem, 2vw, 1.25rem)", color: "#94a3b8", maxWidth: "640px", margin: "0 auto 2.5rem", lineHeight: 1.75 }}>
            Students, teachers, fees, exams, attendance — all managed from one beautifully simple platform. Trusted by 500+ institutions across Bangladesh.
          </p>

          {/* CTAs */}
          <div className="animate-fadeInUp delay-300" style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap", marginBottom: "4rem" }}>
            <Link href="/demo" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", padding: "0.9375rem 2.25rem", borderRadius: "9999px", background: "var(--gradient-brand)", color: "#fff", fontWeight: 700, fontSize: "1rem", textDecoration: "none", boxShadow: "0 8px 32px rgba(79,70,229,0.4)", letterSpacing: "-0.01em", transition: "all 0.2s ease" }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 12px 40px rgba(79,70,229,0.5)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 8px 32px rgba(79,70,229,0.4)"; }}>
              Start Free Trial →
            </Link>
            <Link href="/features" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", padding: "0.9375rem 2.25rem", borderRadius: "9999px", background: "rgba(255,255,255,0.08)", border: "1.5px solid rgba(255,255,255,0.15)", color: "#e2e8f0", fontWeight: 600, fontSize: "1rem", textDecoration: "none", backdropFilter: "blur(8px)", transition: "all 0.2s ease" }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.14)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.08)"; }}>
              Explore Features
            </Link>
          </div>

          {/* Social proof */}
          <div className="animate-fadeInUp delay-400" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "2rem", flexWrap: "wrap" }}>
            {STATS.map((s) => (
              <div key={s.label} style={{ textAlign: "center" }}>
                <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "#f1f5f9", letterSpacing: "-0.04em" }}>{s.value}</div>
                <div style={{ fontSize: "0.8125rem", color: "#64748b" }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── INSTITUTION TYPES ─────────────────────────────────────────────── */}
      <section style={{ padding: "4rem 0", background: "var(--bg-subtle)", borderBottom: "1px solid var(--border-base)" }}>
        <div className="section-container">
          <p style={{ textAlign: "center", fontSize: "0.8125rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--text-muted)", marginBottom: "2rem" }}>
            Designed for every type of institution
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem" }}>
            {INSTITUTION_TYPES.map((t) => (
              <div key={t.label} style={{ textAlign: "center", padding: "1.5rem", borderRadius: "var(--radius-xl)", background: "#fff", border: "1px solid var(--border-base)", boxShadow: "var(--shadow-sm)", transition: "all 0.2s ease" }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "var(--shadow-lg)"; e.currentTarget.style.borderColor = "var(--color-primary-200)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "var(--shadow-sm)"; e.currentTarget.style.borderColor = "var(--border-base)"; }}>
                <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>{t.emoji}</div>
                <div style={{ fontWeight: 700, color: "var(--text-primary)", marginBottom: "0.25rem" }}>{t.label}</div>
                <div style={{ fontSize: "0.8125rem", color: "var(--text-muted)" }}>{t.desc}</div>
              </div>
            ))}
          </div>
        </div>
        <style>{`@media (max-width: 640px) { .inst-grid { grid-template-columns: 1fr 1fr !important; } }`}</style>
      </section>

      {/* ── FEATURES ─────────────────────────────────────────────────────── */}
      <section className="section-padding">
        <div className="section-container">
          {/* Section header */}
          <div style={{ textAlign: "center", marginBottom: "4rem" }}>
            <span className="tag-pill" style={{ marginBottom: "1rem", display: "inline-flex" }}>✦ Features</span>
            <h2 style={{ fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 800, letterSpacing: "-0.03em", color: "var(--text-primary)", marginBottom: "1rem" }}>
              Everything you need,{" "}
              <span className="gradient-text">nothing you don't</span>
            </h2>
            <p style={{ fontSize: "1.0625rem", color: "var(--text-secondary)", maxWidth: "560px", margin: "0 auto", lineHeight: 1.75 }}>
              A complete school management suite built specifically for Bangladeshi institutions.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1.5rem" }}>
            {FEATURES.map((f) => {
              const c = COLOR_MAP[f.color] || COLOR_MAP.indigo;
              return (
                <div key={f.title}
                  style={{ padding: "1.75rem", borderRadius: "var(--radius-xl)", border: "1px solid var(--border-base)", background: "#fff", boxShadow: "var(--shadow-sm)", transition: "all 0.25s ease", cursor: "default" }}
                  onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "var(--shadow-xl)"; e.currentTarget.style.borderColor = "var(--color-primary-200)"; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "var(--shadow-sm)"; e.currentTarget.style.borderColor = "var(--border-base)"; }}>
                  <div style={{ width: "3.25rem", height: "3.25rem", borderRadius: "var(--radius-lg)", background: c.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.375rem", marginBottom: "1rem", border: `1px solid ${c.bg}` }}>
                    {f.icon}
                  </div>
                  <h3 style={{ fontSize: "1.0625rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "0.5rem" }}>{f.title}</h3>
                  <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", lineHeight: 1.7 }}>{f.desc}</p>
                </div>
              );
            })}
          </div>

          <div style={{ textAlign: "center", marginTop: "2.5rem" }}>
            <Link href="/features" style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem", color: "var(--color-primary-600)", fontWeight: 600, fontSize: "0.9375rem", textDecoration: "none" }}
              onMouseEnter={e => { e.currentTarget.style.gap = "0.625rem"; }}
              onMouseLeave={e => { e.currentTarget.style.gap = "0.375rem"; }}>
              View all features →
            </Link>
          </div>
        </div>
        <style>{`@media (max-width: 900px) { .feat-grid { grid-template-columns: 1fr 1fr !important; } } @media (max-width: 600px) { .feat-grid { grid-template-columns: 1fr !important; } }`}</style>
      </section>

      {/* ── PRICING TEASER ───────────────────────────────────────────────── */}
      <section className="section-padding" style={{ background: "var(--bg-subtle)", borderTop: "1px solid var(--border-base)" }}>
        <div className="section-container">
          <div style={{ textAlign: "center", marginBottom: "4rem" }}>
            <span className="tag-pill" style={{ marginBottom: "1rem", display: "inline-flex" }}>✦ Pricing</span>
            <h2 style={{ fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 800, letterSpacing: "-0.03em", color: "var(--text-primary)", marginBottom: "1rem" }}>
              Simple, transparent pricing
            </h2>
            <p style={{ fontSize: "1.0625rem", color: "var(--text-secondary)", lineHeight: 1.75 }}>
              No hidden fees. Cancel anytime. Start with a 14-day free trial.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1.5rem", alignItems: "center" }}>
            <PlanCard plan={STARTER_PLAN} />
            <PlanCard plan={PRO_PLAN} popular />
            <PlanCard plan={ENTERPRISE_PLAN} />
          </div>

          <p style={{ textAlign: "center", marginTop: "2rem", fontSize: "0.9rem", color: "var(--text-muted)" }}>
            All prices in BDT (Bangladeshi Taka). Yearly billing saves up to 20%.{" "}
            <Link href="/pricing" style={{ color: "var(--color-primary-600)", fontWeight: 600, textDecoration: "none" }}>
              See full pricing →
            </Link>
          </p>
        </div>
      </section>

      {/* ── TESTIMONIALS ─────────────────────────────────────────────────── */}
      <section className="section-padding">
        <div className="section-container">
          <div style={{ textAlign: "center", marginBottom: "4rem" }}>
            <span className="tag-pill" style={{ marginBottom: "1rem", display: "inline-flex" }}>✦ Testimonials</span>
            <h2 style={{ fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 800, letterSpacing: "-0.03em", color: "var(--text-primary)", marginBottom: "1rem" }}>
              Trusted by educators across Bangladesh
            </h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1.5rem" }}>
            {testimonials.map((t) => (
              <div key={t.name}
                style={{ padding: "1.75rem", borderRadius: "var(--radius-xl)", border: "1px solid var(--border-base)", background: "#fff", boxShadow: "var(--shadow-sm)", transition: "all 0.25s ease" }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "var(--shadow-xl)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "var(--shadow-sm)"; }}>
                <div style={{ display: "flex", gap: "0.25rem", marginBottom: "1rem" }}>
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <span key={i} style={{ color: "#f59e0b", fontSize: "0.9rem" }}>★</span>
                  ))}
                </div>
                <p style={{ fontSize: "0.9375rem", color: "var(--text-secondary)", lineHeight: 1.75, marginBottom: "1.25rem", fontStyle: "italic" }}>
                  "{t.quote}"
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <div style={{ width: "2.5rem", height: "2.5rem", borderRadius: "50%", background: "var(--gradient-brand)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "0.8125rem", fontWeight: 700, flexShrink: 0 }}>
                    {t.avatar}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: "0.875rem", color: "var(--text-primary)" }}>{t.name}</div>
                    <div style={{ fontSize: "0.8125rem", color: "var(--text-muted)" }}>{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ───────────────────────────────────────────────────── */}
      <section style={{ padding: "6rem 0", background: "linear-gradient(135deg, #1e1b4b, #312e81, #4c1d95)", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "-30%", right: "-10%", width: "30rem", height: "30rem", borderRadius: "50%", background: "rgba(167,139,250,0.1)", filter: "blur(80px)", pointerEvents: "none" }} />
        <div className="section-container" style={{ position: "relative", zIndex: 1, textAlign: "center" }}>
          <h2 style={{ fontSize: "clamp(2rem, 4vw, 3.25rem)", fontWeight: 900, color: "#f1f5f9", letterSpacing: "-0.04em", marginBottom: "1rem" }}>
            Ready to modernise your institution?
          </h2>
          <p style={{ fontSize: "1.125rem", color: "#94a3b8", marginBottom: "2.5rem", lineHeight: 1.75, maxWidth: "500px", margin: "0 auto 2.5rem" }}>
            Join 500+ schools already using EduSaaS. Start your 14-day free trial — no credit card required.
          </p>
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/register" style={{ padding: "0.9375rem 2.25rem", borderRadius: "9999px", background: "#fff", color: "var(--color-primary-700)", fontWeight: 700, fontSize: "1rem", textDecoration: "none", boxShadow: "0 8px 24px rgba(0,0,0,0.2)", transition: "all 0.2s ease" }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 12px 32px rgba(0,0,0,0.25)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.2)"; }}>
              Get Started Free
            </Link>
            <Link href="/demo" style={{ padding: "0.9375rem 2.25rem", borderRadius: "9999px", background: "rgba(255,255,255,0.1)", border: "1.5px solid rgba(255,255,255,0.2)", color: "#e2e8f0", fontWeight: 600, fontSize: "1rem", textDecoration: "none", backdropFilter: "blur(8px)", transition: "all 0.2s ease" }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.16)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.1)"; }}>
              Schedule a Demo
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
