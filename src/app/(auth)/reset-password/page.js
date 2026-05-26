"use client";

import { useState } from "react";
import Link from "next/link";
import Input from "@/components/forms/Input";
import Button from "@/components/ui/Button";

export default function ResetPasswordPage() {
  const [form, setForm] = useState({ password: "", confirm: "" });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false);
    setSubmitted(true);
  };

  return (
    <>
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "1.875rem", fontWeight: 900, color: "var(--text-primary)", letterSpacing: "-0.03em", marginBottom: "0.5rem" }}>
          Set a new password
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.9375rem", lineHeight: 1.65 }}>
          Your new password must be at least 8 characters and different from your previous one.
        </p>
      </div>

      {submitted ? (
        <div style={{ textAlign: "center", padding: "2rem 0" }}>
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🔐</div>
          <h3 style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--text-primary)", marginBottom: "0.5rem" }}>Password Updated!</h3>
          <p style={{ color: "var(--text-secondary)", marginBottom: "2rem", lineHeight: 1.7 }}>
            Your password has been changed successfully. You can now sign in with your new password.
          </p>
          <Link href="/login" style={{ display: "inline-block", padding: "0.875rem 2rem", borderRadius: "9999px", background: "var(--gradient-brand)", color: "#fff", fontWeight: 700, textDecoration: "none", boxShadow: "var(--shadow-brand)" }}>
            Sign In →
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <Input id="reset-password" label="New Password" name="password" type="password" placeholder="At least 8 characters" value={form.password} onChange={handleChange} required
            hint="Use a mix of uppercase, numbers, and symbols."
            icon={<svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>}
          />
          <Input id="reset-confirm" label="Confirm New Password" name="confirm" type="password" placeholder="Re-enter new password" value={form.confirm} onChange={handleChange} required
            error={form.confirm && form.password !== form.confirm ? "Passwords do not match" : ""}
          />

          {/* Password strength indicator */}
          <div>
            <div style={{ display: "flex", gap: "0.375rem", marginBottom: "0.375rem" }}>
              {[1, 2, 3, 4].map((lvl) => {
                const strength = form.password.length >= 12 ? 4 : form.password.length >= 8 ? 3 : form.password.length >= 5 ? 2 : form.password.length > 0 ? 1 : 0;
                const colors = ["#e2e8f0", "#ef4444", "#f59e0b", "#10b981", "#059669"];
                return <div key={lvl} style={{ flex: 1, height: "4px", borderRadius: "9999px", background: lvl <= strength ? colors[strength] : "#e2e8f0", transition: "background 0.3s ease" }} />;
              })}
            </div>
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
              {form.password.length === 0 ? "Enter a password" : form.password.length < 5 ? "Too weak" : form.password.length < 8 ? "Fair" : form.password.length < 12 ? "Good" : "Strong"}
            </span>
          </div>

          <Button type="submit" fullWidth loading={loading} size="lg" style={{ marginTop: "0.25rem" }}
            disabled={form.password !== form.confirm || form.password.length < 8}>
            Reset Password
          </Button>
        </form>
      )}

      <p style={{ textAlign: "center", marginTop: "2rem", fontSize: "0.875rem", color: "var(--text-muted)" }}>
        Remembered your old password?{" "}
        <Link href="/login" style={{ color: "var(--color-primary-600)", fontWeight: 600, textDecoration: "none" }}>Sign in</Link>
      </p>
    </>
  );
}
