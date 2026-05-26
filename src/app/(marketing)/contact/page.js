"use client";

import { useState } from "react";
import Input from "@/components/forms/Input";
import Select from "@/components/forms/Select";
import Button from "@/components/ui/Button";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", institution: "", type: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const json = await res.json();
      if (json.success) {
        setSubmitted(true);
      } else {
        alert(json.message || "Failed to send message. Please try again.");
      }
    } catch (err) {
      console.error(err);
      alert("An unexpected error occurred. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <section style={{ padding: "6rem 0 5rem", background: "var(--gradient-hero)", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 60%, rgba(99,102,241,0.15) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div className="section-container" style={{ position: "relative", zIndex: 1, textAlign: "center" }}>
          <span className="tag-pill" style={{ marginBottom: "1.5rem", display: "inline-flex", background: "rgba(99,102,241,0.15)", color: "#a5b4fc", border: "1px solid rgba(165,180,252,0.3)" }}>
            Get in Touch
          </span>
          <h1 style={{ fontSize: "clamp(2.25rem, 5vw, 3.5rem)", fontWeight: 900, color: "#f1f5f9", letterSpacing: "-0.04em", marginBottom: "1.25rem" }}>
            We'd love to hear from you
          </h1>
          <p style={{ fontSize: "1.125rem", color: "#94a3b8", maxWidth: "480px", margin: "0 auto", lineHeight: 1.8 }}>
            Have questions about EduSaaS? Our team typically responds within 2 business hours.
          </p>
        </div>
      </section>

      <section style={{ padding: "5rem 0", background: "var(--bg-subtle)" }}>
        <div className="section-container">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1.6fr", gap: "4rem", alignItems: "start" }}>
            {/* Contact info */}
            <div>
              <h2 style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--text-primary)", marginBottom: "1.5rem", letterSpacing: "-0.02em" }}>
                Contact Information
              </h2>
              {[
                { icon: "📍", label: "Address", value: "Level 5, Rupayan Trade Centre\nDhaka 1215, Bangladesh" },
                { icon: "📧", label: "Email", value: "hello@edusaas.app" },
                { icon: "📞", label: "Phone", value: "+880 1700-000000" },
                { icon: "🕐", label: "Support Hours", value: "Sun – Thu: 9AM – 6PM BST" },
              ].map((item) => (
                <div key={item.label} style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem", padding: "1.25rem", borderRadius: "var(--radius-lg)", background: "#fff", border: "1px solid var(--border-base)", boxShadow: "var(--shadow-sm)" }}>
                  <span style={{ fontSize: "1.5rem", flexShrink: 0 }}>{item.icon}</span>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: "0.875rem", color: "var(--color-primary-600)", marginBottom: "0.25rem" }}>{item.label}</div>
                    <div style={{ fontSize: "0.9rem", color: "var(--text-secondary)", whiteSpace: "pre-line", lineHeight: 1.6 }}>{item.value}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Form */}
            <div style={{ background: "#fff", borderRadius: "var(--radius-2xl)", border: "1px solid var(--border-base)", padding: "2.5rem", boxShadow: "var(--shadow-lg)" }}>
              {submitted ? (
                <div style={{ textAlign: "center", padding: "3rem 0" }}>
                  <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>✅</div>
                  <h3 style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--text-primary)", marginBottom: "0.5rem" }}>Message Sent!</h3>
                  <p style={{ color: "var(--text-secondary)" }}>We'll get back to you within 2 business hours.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
                    <Input id="contact-name" label="Full Name" name="name" placeholder="Md. Rafiqul Islam" value={form.name} onChange={handleChange} required />
                    <Input id="contact-email" label="Email Address" name="email" type="email" placeholder="you@school.edu.bd" value={form.email} onChange={handleChange} required />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
                    <Input id="contact-phone" label="Phone (optional)" name="phone" placeholder="01700-000000" value={form.phone} onChange={handleChange} />
                    <Select id="contact-type" label="Institution Type" name="type" value={form.type} onChange={handleChange} required
                      options={[
                        { value: "school", label: "School" },
                        { value: "college", label: "College" },
                        { value: "madrasah", label: "Madrasah" },
                        { value: "coaching", label: "Coaching Centre" },
                      ]}
                      placeholder="Select type"
                    />
                  </div>
                  <Input id="contact-institution" label="Institution Name" name="institution" placeholder="Your school or college name" value={form.institution} onChange={handleChange} required />
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
                    <label htmlFor="contact-message" style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--text-primary)" }}>
                      Message <span style={{ color: "#ef4444" }}>*</span>
                    </label>
                    <textarea id="contact-message" name="message" rows={5} placeholder="Tell us how we can help..." value={form.message} onChange={handleChange} required
                      style={{ padding: "0.75rem 0.875rem", border: "1.5px solid var(--border-base)", borderRadius: "var(--radius-md)", fontSize: "0.9rem", color: "var(--text-primary)", fontFamily: "var(--font-sans)", resize: "vertical", outline: "none", transition: "border-color 0.15s ease, box-shadow 0.15s ease" }}
                      onFocus={e => { e.target.style.borderColor = "var(--color-primary-400)"; e.target.style.boxShadow = "0 0 0 3px rgba(99,102,241,0.12)"; }}
                      onBlur={e => { e.target.style.borderColor = "var(--border-base)"; e.target.style.boxShadow = "none"; }}
                    />
                  </div>
                  <Button type="submit" fullWidth loading={loading} size="lg">
                    Send Message
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
