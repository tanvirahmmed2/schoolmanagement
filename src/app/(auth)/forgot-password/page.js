"use client";

import { useState } from "react";
import Link from "next/link";
import Input from "@/components/forms/Input";
import Button from "@/components/ui/Button";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false);
    setSubmitted(true);
  };

  return (
    <>
      <div style={{ marginBottom: "2rem" }}>
        <Link href="/login" style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem", fontSize: "0.875rem", color: "var(--text-muted)", textDecoration: "none", marginBottom: "1.5rem", transition: "color 0.15s ease" }}
          onMouseEnter={e => { e.currentTarget.style.color = "var(--color-primary-600)"; }}
          onMouseLeave={e => { e.currentTarget.style.color = "var(--text-muted)"; }}>
          ← Back to Sign In
        </Link>
        <h1 style={{ fontSize: "1.875rem", fontWeight: 900, color: "var(--text-primary)", letterSpacing: "-0.03em", marginBottom: "0.5rem" }}>
          Forgot your password?
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.9375rem", lineHeight: 1.65 }}>
          Enter your email and we'll send you a secure link to reset your password.
        </p>
      </div>

      {submitted ? (
        <div style={{ padding: "2rem", borderRadius: "var(--radius-xl)", background: "#ecfdf5", border: "1px solid #a7f3d0", textAlign: "center" }}>
          <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>📧</div>
          <h3 style={{ fontWeight: 800, color: "#065f46", marginBottom: "0.5rem" }}>Check your inbox</h3>
          <p style={{ fontSize: "0.875rem", color: "#059669", lineHeight: 1.65 }}>
            We've sent a password reset link to <strong>{email}</strong>. It expires in 30 minutes.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <Input id="forgot-email" label="Email Address" name="email" type="email" placeholder="you@school.edu.bd" value={email} onChange={(e) => setEmail(e.target.value)} required hint="Enter the email associated with your EduSaaS account."
            icon={<svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>}
          />
          <Button type="submit" fullWidth loading={loading} size="lg">
            Send Reset Link
          </Button>
        </form>
      )}

      <p style={{ textAlign: "center", marginTop: "2rem", fontSize: "0.875rem", color: "var(--text-muted)" }}>
        Remember your password?{" "}
        <Link href="/login" style={{ color: "var(--color-primary-600)", fontWeight: 600, textDecoration: "none" }}>Sign in</Link>
      </p>
    </>
  );
}
