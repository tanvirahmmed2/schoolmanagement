"use client";

import { useState } from "react";
import Link from "next/link";
import Input from "@/components/forms/Input";
import Select from "@/components/forms/Select";
import Button from "@/components/ui/Button";

export default function RegisterPage() {
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "", institution: "", type: "" });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "3.5rem", marginBottom: "1rem" }}>🎉</div>
        <h1 style={{ fontSize: "1.875rem", fontWeight: 900, color: "var(--text-primary)", marginBottom: "0.5rem" }}>Account Created!</h1>
        <p style={{ color: "var(--text-secondary)", marginBottom: "2rem", lineHeight: 1.7 }}>
          We've sent a verification email to <strong>{form.email}</strong>. Click the link to activate your account.
        </p>
        <Link href="/login" style={{ display: "inline-block", padding: "0.875rem 2rem", borderRadius: "9999px", background: "var(--gradient-brand)", color: "#fff", fontWeight: 700, textDecoration: "none", boxShadow: "var(--shadow-brand)" }}>
          Go to Sign In
        </Link>
      </div>
    );
  }

  return (
    <>
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "1.875rem", fontWeight: 900, color: "var(--text-primary)", letterSpacing: "-0.03em", marginBottom: "0.5rem" }}>
          Create your account
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.9375rem" }}>
          Start your 14-day free trial. No credit card required.
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.125rem" }}>
        <Input id="reg-name" label="Full Name" name="name" placeholder="Md. Rafiqul Islam" value={form.name} onChange={handleChange} required />
        <Input id="reg-email" label="Email Address" name="email" type="email" placeholder="you@school.edu.bd" value={form.email} onChange={handleChange} required />
        <Input id="reg-institution" label="Institution Name" name="institution" placeholder="Your school or college name" value={form.institution} onChange={handleChange} required />
        <Select id="reg-type" label="Institution Type" name="type" value={form.type} onChange={handleChange} required
          options={[
            { value: "school", label: "School" },
            { value: "college", label: "College" },
            { value: "madrasah", label: "Madrasah" },
            { value: "coaching", label: "Coaching Centre" },
          ]}
          placeholder="Select institution type"
          hint="This helps us tailor the platform for you."
        />
        <Input id="reg-password" label="Password" name="password" type="password" placeholder="At least 8 characters" value={form.password} onChange={handleChange} required
          hint="Use a mix of letters, numbers, and symbols."
        />
        <Input id="reg-confirm" label="Confirm Password" name="confirm" type="password" placeholder="Re-enter your password" value={form.confirm} onChange={handleChange} required
          error={form.confirm && form.password !== form.confirm ? "Passwords do not match" : ""}
        />

        <p style={{ fontSize: "0.8125rem", color: "var(--text-muted)", lineHeight: 1.65 }}>
          By signing up, you agree to our{" "}
          <Link href="/terms" style={{ color: "var(--color-primary-600)", fontWeight: 600, textDecoration: "none" }}>Terms of Service</Link>{" "}
          and{" "}
          <Link href="/privacy" style={{ color: "var(--color-primary-600)", fontWeight: 600, textDecoration: "none" }}>Privacy Policy</Link>.
        </p>

        <Button type="submit" fullWidth loading={loading} size="lg" style={{ marginTop: "0.25rem" }}>
          Create Free Account →
        </Button>
      </form>

      <p style={{ textAlign: "center", marginTop: "2rem", fontSize: "0.9rem", color: "var(--text-secondary)" }}>
        Already have an account?{" "}
        <Link href="/login" style={{ color: "var(--color-primary-600)", fontWeight: 700, textDecoration: "none" }}>
          Sign in
        </Link>
      </p>
    </>
  );
}
