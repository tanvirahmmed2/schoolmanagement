"use client";

import { useState } from "react";
import PlanCard from "@/components/ui/PlanCard";
import Accordion from "@/components/ui/Accordion";

const PLANS = [
  {
    name: "Starter", price: 1499, yearlyPrice: 14388,
    description: "Perfect for small schools and coaching centres.",
    color: "slate",
    features: [
      { label: "Up to 200 students", included: true },
      { label: "Up to 10 teachers", included: true },
      { label: "Fee collection (bKash & Nagad)", included: true },
      { label: "Attendance tracking", included: true },
      { label: "Exam & result management", included: false },
      { label: "SMS notifications", included: false },
      { label: "Custom subdomain", included: false },
      { label: "Priority support", included: false },
    ],
    cta: "Start Free Trial",
  },
  {
    name: "Pro", price: 2999, yearlyPrice: 28788,
    description: "For growing institutions that need the full suite.",
    color: "indigo",
    features: [
      { label: "Up to 1,000 students", included: true },
      { label: "Up to 50 teachers", included: true },
      { label: "Fee collection (all methods)", included: true },
      { label: "Attendance tracking", included: true },
      { label: "Exam & result management", included: true },
      { label: "SMS notifications", included: true },
      { label: "Custom subdomain", included: true },
      { label: "Priority support", included: false },
    ],
    cta: "Get Started",
  },
  {
    name: "Enterprise", price: 5999, yearlyPrice: 57588,
    description: "Unlimited scale with dedicated support.",
    color: "violet",
    features: [
      { label: "Unlimited students", included: true },
      { label: "Unlimited teachers", included: true },
      { label: "Fee collection (all methods)", included: true },
      { label: "Attendance & SMS", included: true },
      { label: "Exam & result management", included: true },
      { label: "Custom domain + branding", included: true },
      { label: "API access", included: true },
      { label: "Dedicated support manager", included: true },
    ],
    cta: "Contact Sales", href: "/contact",
  },
];

const FAQ_ITEMS = [
  { question: "Is there a free trial?", answer: "Yes! Every plan comes with a 14-day free trial. No credit card required. You can invite staff, add students, and test all features risk-free." },
  { question: "What payment methods are accepted?", answer: "We accept bKash, Nagad, Visa/Mastercard, and bank transfer (BRAC, Dutch-Bangla, etc.). All payments processed securely in BDT." },
  { question: "Can I switch plans later?", answer: "Absolutely. Upgrade or downgrade anytime. When upgrading, we prorate the cost for the remaining period." },
  { question: "What if I exceed my student limit?", answer: "We'll notify you before you hit the limit. We give a 30-day grace period — we won't suddenly lock your account." },
  { question: "Is there a discount for NGOs or government schools?", answer: "Yes. We offer special pricing for government institutions and registered NGOs. Contact our sales team for details." },
  { question: "Can I cancel anytime?", answer: "Yes. No lock-in contracts. Cancel at any time and retain access until the end of your billing period." },
];

export default function PricingPage() {
  const [billing, setBilling] = useState("monthly");

  return (
    <>
      <section style={{ padding: "6rem 0 4rem", background: "var(--gradient-hero)", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 60%, rgba(99,102,241,0.15) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div className="section-container" style={{ position: "relative", zIndex: 1, textAlign: "center" }}>
          <span className="tag-pill" style={{ marginBottom: "1.5rem", display: "inline-flex", background: "rgba(99,102,241,0.15)", color: "#a5b4fc", border: "1px solid rgba(165,180,252,0.3)" }}>
            Transparent Pricing
          </span>
          <h1 style={{ fontSize: "clamp(2.25rem, 5vw, 3.75rem)", fontWeight: 900, color: "#f1f5f9", letterSpacing: "-0.04em", marginBottom: "1.25rem" }}>
            Choose the right plan for{" "}
            <span style={{ background: "linear-gradient(135deg, #818cf8, #a78bfa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              your institution
            </span>
          </h1>
          <p style={{ fontSize: "1.125rem", color: "#94a3b8", maxWidth: "540px", margin: "0 auto 2.5rem", lineHeight: 1.8 }}>
            No hidden fees. Start free, scale when you're ready.
          </p>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "0.75rem", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "9999px", padding: "0.375rem" }}>
            {["monthly", "yearly"].map((cycle) => (
              <button key={cycle} onClick={() => setBilling(cycle)} style={{ padding: "0.5rem 1.25rem", borderRadius: "9999px", border: "none", cursor: "pointer", fontFamily: "var(--font-sans)", fontWeight: 600, fontSize: "0.875rem", transition: "all 0.2s ease", background: billing === cycle ? "#fff" : "transparent", color: billing === cycle ? "var(--color-primary-700)" : "#94a3b8", boxShadow: billing === cycle ? "0 2px 8px rgba(0,0,0,0.15)" : "none" }}>
                {cycle === "monthly" ? "Monthly" : "Yearly (Save 20%)"}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: "4rem 0 6rem", background: "var(--bg-subtle)" }}>
        <div className="section-container">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1.5rem", alignItems: "center" }}>
            <PlanCard plan={PLANS[0]} billingCycle={billing} />
            <PlanCard plan={PLANS[1]} popular billingCycle={billing} />
            <PlanCard plan={PLANS[2]} billingCycle={billing} />
          </div>
          <p style={{ textAlign: "center", marginTop: "2rem", fontSize: "0.875rem", color: "var(--text-muted)" }}>
            All prices in Bangladeshi Taka (৳). Yearly billing charged upfront.
          </p>
        </div>
      </section>

      <section className="section-padding" style={{ borderTop: "1px solid var(--border-base)" }}>
        <div className="section-container">
          <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
            <h2 style={{ fontSize: "clamp(1.75rem, 3vw, 2.5rem)", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.03em", marginBottom: "0.75rem" }}>
              Frequently asked questions
            </h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "1rem" }}>Everything you need to know about our plans and billing.</p>
          </div>
          <div style={{ maxWidth: "680px", margin: "0 auto" }}>
            <Accordion items={FAQ_ITEMS} />
          </div>
        </div>
      </section>

      <section style={{ padding: "5rem 0", background: "var(--bg-subtle)", borderTop: "1px solid var(--border-base)" }}>
        <div className="section-container" style={{ textAlign: "center" }}>
          <h2 style={{ fontSize: "2rem", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.03em", marginBottom: "1rem" }}>Still have questions?</h2>
          <p style={{ color: "var(--text-secondary)", marginBottom: "2rem" }}>Our team is here to help. Contact us or schedule a personalised demo.</p>
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
            <a href="/contact" style={{ padding: "0.875rem 2rem", borderRadius: "9999px", background: "var(--gradient-brand)", color: "#fff", fontWeight: 700, textDecoration: "none", boxShadow: "var(--shadow-brand)" }}>Contact Sales</a>
            <a href="/demo" style={{ padding: "0.875rem 2rem", borderRadius: "9999px", border: "1.5px solid var(--border-base)", color: "var(--text-primary)", fontWeight: 600, textDecoration: "none" }}>Schedule a Demo</a>
          </div>
        </div>
      </section>
    </>
  );
}
