"use client";

import { useState } from "react";
import Input from "@/components/forms/Input";
import Select from "@/components/forms/Select";
import Button from "@/components/ui/Button";

export default function DemoPage() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", institution: "", type: "", students: "", date: "" });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false);
    setSubmitted(true);
  };

  return (
    <>
      <section style={{ padding: "6rem 0 5rem", background: "var(--gradient-hero)", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 50%, rgba(99,102,241,0.15) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div className="section-container" style={{ position: "relative", zIndex: 1, textAlign: "center" }}>
          <span className="tag-pill" style={{ marginBottom: "1.5rem", display: "inline-flex", background: "rgba(99,102,241,0.15)", color: "#a5b4fc", border: "1px solid rgba(165,180,252,0.3)" }}>
            Live Demo
          </span>
          <h1 style={{ fontSize: "clamp(2.25rem, 5vw, 3.5rem)", fontWeight: 900, color: "#f1f5f9", letterSpacing: "-0.04em", marginBottom: "1.25rem" }}>
            See EduSaaS live —{" "}
            <span style={{ background: "linear-gradient(135deg, #818cf8, #a78bfa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              no pressure
            </span>
          </h1>
          <p style={{ fontSize: "1.125rem", color: "#94a3b8", maxWidth: "540px", margin: "0 auto", lineHeight: 1.8 }}>
            Book a personalised 30-minute demo with our team. We'll show you how EduSaaS works for your institution type.
          </p>
        </div>
      </section>

      <section style={{ padding: "5rem 0", background: "var(--bg-subtle)" }}>
        <div className="section-container">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: "4rem", alignItems: "start" }}>
            {/* What to expect */}
            <div>
              <h2 style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--text-primary)", marginBottom: "1.5rem", letterSpacing: "-0.02em" }}>
                What to expect
              </h2>
              {[
                { icon: "🎯", title: "Tailored walkthrough", desc: "We demo features relevant to your institution type — school, college, madrasah, or coaching." },
                { icon: "❓", title: "Ask anything", desc: "Bring your questions. Our team will answer them live, no gatekeeping." },
                { icon: "⚡", title: "Quick setup", desc: "See how fast you can go from registration to a fully configured institution." },
                { icon: "🆓", title: "No commitment", desc: "The demo is completely free. We'll set you up with a 14-day trial afterwards." },
              ].map((item) => (
                <div key={item.title} style={{ display: "flex", gap: "1rem", marginBottom: "1.25rem" }}>
                  <span style={{ fontSize: "1.5rem", flexShrink: 0 }}>{item.icon}</span>
                  <div>
                    <div style={{ fontWeight: 700, color: "var(--text-primary)", marginBottom: "0.25rem" }}>{item.title}</div>
                    <div style={{ fontSize: "0.875rem", color: "var(--text-secondary)", lineHeight: 1.65 }}>{item.desc}</div>
                  </div>
                </div>
              ))}
              <div style={{ marginTop: "2rem", padding: "1.25rem", borderRadius: "var(--radius-lg)", background: "var(--color-primary-50)", border: "1px solid var(--color-primary-100)" }}>
                <div style={{ fontWeight: 700, color: "var(--color-primary-700)", marginBottom: "0.375rem" }}>⏱ 30-minute session</div>
                <div style={{ fontSize: "0.875rem", color: "var(--color-primary-600)" }}>Via Google Meet or Zoom. We'll send you the link after confirming your slot.</div>
              </div>
            </div>

            {/* Form */}
            <div style={{ background: "#fff", borderRadius: "var(--radius-2xl)", border: "1px solid var(--border-base)", padding: "2.5rem", boxShadow: "var(--shadow-lg)" }}>
              {submitted ? (
                <div style={{ textAlign: "center", padding: "3rem 0" }}>
                  <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🎉</div>
                  <h3 style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--text-primary)", marginBottom: "0.5rem" }}>You're booked!</h3>
                  <p style={{ color: "var(--text-secondary)", lineHeight: 1.7 }}>We'll confirm your demo slot and send a calendar invite within 1 business hour.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                  <h3 style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--text-primary)", marginBottom: "0.25rem" }}>Request your free demo</h3>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
                    <Input id="demo-name" label="Your Name" name="name" placeholder="Md. Rafiqul Islam" value={form.name} onChange={handleChange} required />
                    <Input id="demo-email" label="Email Address" name="email" type="email" placeholder="you@school.edu.bd" value={form.email} onChange={handleChange} required />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
                    <Input id="demo-phone" label="Phone Number" name="phone" placeholder="01700-000000" value={form.phone} onChange={handleChange} required />
                    <Select id="demo-type" label="Institution Type" name="type" value={form.type} onChange={handleChange} required
                      options={[
                        { value: "school", label: "School" },
                        { value: "college", label: "College" },
                        { value: "madrasah", label: "Madrasah" },
                        { value: "coaching", label: "Coaching Centre" },
                      ]}
                      placeholder="Select type"
                    />
                  </div>
                  <Input id="demo-institution" label="Institution Name" name="institution" placeholder="Your school or college name" value={form.institution} onChange={handleChange} required />
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
                    <Select id="demo-students" label="No. of Students" name="students" value={form.students} onChange={handleChange} required
                      options={[
                        { value: "lt100", label: "Less than 100" },
                        { value: "100-500", label: "100 – 500" },
                        { value: "500-1000", label: "500 – 1,000" },
                        { value: "gt1000", label: "1,000+" },
                      ]}
                      placeholder="Select range"
                    />
                    <Input id="demo-date" label="Preferred Date" name="date" type="date" value={form.date} onChange={handleChange} required />
                  </div>
                  <Button type="submit" fullWidth loading={loading} size="lg">
                    Book My Free Demo →
                  </Button>
                  <p style={{ fontSize: "0.8125rem", color: "var(--text-muted)", textAlign: "center" }}>
                    We'll confirm your slot within 1 business hour.
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
