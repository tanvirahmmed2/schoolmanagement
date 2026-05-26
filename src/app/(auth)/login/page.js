"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Input from "@/components/forms/Input";
import Button from "@/components/ui/Button";

function LoginForm() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();

  const verified = searchParams.get("verified");
  const errorParam = searchParams.get("error");

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, password: form.password }),
      });
      const data = await res.json();
      if (data.success) {
        const role = data.data.user.role;
        const ROLE_HOME = {
          admin: "/admin/dashboard",
          manager: "/manager/dashboard",
          support: "/support/dashboard",
          client: "/client/dashboard",
        };
        router.push(ROLE_HOME[role] || "/login");
      } else {
        setError(data.message || "Invalid credentials. Please try again.");
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
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

      {verified === "true" && (
        <div style={{ padding: "0.875rem 1rem", borderRadius: "var(--radius-md)", background: "#ecfdf5", border: "1px solid #a7f3d0", color: "#065f46", fontSize: "0.875rem", marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          ✓ Your account has been verified successfully! You can now log in.
        </div>
      )}

      {errorParam && (
        <div style={{ padding: "0.875rem 1rem", borderRadius: "var(--radius-md)", background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", fontSize: "0.875rem", marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          ⚠ {errorParam === "token-expired" ? "Verification link has expired. Please register again." : "Invalid or expired verification link."}
        </div>
      )}

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

      <p style={{ textAlign: "center", marginTop: "2rem", fontSize: "0.9rem", color: "var(--text-secondary)" }}>
        Don't have an account?{" "}
        <Link href="/register" style={{ color: "var(--color-primary-600)", fontWeight: 700, textDecoration: "none" }}>
          Sign up free →
        </Link>
      </p>
    </>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div style={{ display: "flex", justifyContent: "center", padding: "2rem 0" }}>
        <span style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>Loading...</span>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
