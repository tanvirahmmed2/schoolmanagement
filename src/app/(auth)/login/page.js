"use client";

import { useState } from "react";
import Link from "next/link";
import Input from "@/components/forms/Input";
import Button from "@/components/ui/Button";

export default function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    setLoading(false);
    setError("Invalid credentials. Please try again.");
  };

  return (
    <>
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "1.875rem", fontWeight: 900, color: "var(--text-primary)", letterSpacing: "-0.03em", marginBottom: "0.5rem" }}>
          Welcome back
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.9375rem" }}>
          Sign in to your institution dashboard.
        </p>
      </div>

      {error && (
        <div style={{ padding: "0.875rem 1rem", borderRadius: "var(--radius-md)", background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", fontSize: "0.875rem", marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          ⚠ {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
        <Input id="login-email" label="Email Address" name="email" type="email" placeholder="you@school.edu.bd" value={form.email} onChange={handleChange} required
          icon={<svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" /></svg>}
        />
        <Input id="login-password" label="Password" name="password" type="password" placeholder="Enter your password" value={form.password} onChange={handleChange} required
          icon={<svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>}
        />

        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <Link href="/forgot-password" style={{ fontSize: "0.875rem", color: "var(--color-primary-600)", fontWeight: 600, textDecoration: "none" }}>
            Forgot password?
          </Link>
        </div>

        <Button type="submit" fullWidth loading={loading} size="lg">
          Sign In
        </Button>
      </form>

      <div style={{ position: "relative", margin: "1.5rem 0", display: "flex", alignItems: "center", gap: "1rem" }}>
        <div style={{ flex: 1, height: "1px", background: "var(--border-base)" }} />
        <span style={{ fontSize: "0.8125rem", color: "var(--text-muted)", whiteSpace: "nowrap" }}>or continue with</span>
        <div style={{ flex: 1, height: "1px", background: "var(--border-base)" }} />
      </div>

      <button style={{ width: "100%", padding: "0.75rem", borderRadius: "var(--radius-md)", border: "1.5px solid var(--border-base)", background: "#fff", color: "var(--text-primary)", fontWeight: 600, fontSize: "0.9rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.625rem", fontFamily: "var(--font-sans)", transition: "all 0.15s ease" }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--color-primary-300)"; e.currentTarget.style.background = "var(--color-primary-50)"; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border-base)"; e.currentTarget.style.background = "#fff"; }}>
        <svg width="18" height="18" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
        Continue with Google
      </button>

      <p style={{ textAlign: "center", marginTop: "2rem", fontSize: "0.9rem", color: "var(--text-secondary)" }}>
        Don't have an account?{" "}
        <Link href="/register" style={{ color: "var(--color-primary-600)", fontWeight: 700, textDecoration: "none" }}>
          Sign up free →
        </Link>
      </p>
    </>
  );
}
