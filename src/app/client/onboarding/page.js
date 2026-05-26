"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Input from "@/components/forms/Input";
import Select from "@/components/forms/Select";
import Button from "@/components/ui/Button";

const STEPS = ["Institution Info", "Contact Details", "Choose Plan", "bKash Payment", "Review"];

export default function ClientOnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const [tenant, setTenant] = useState(null);
  const [plans, setPlans] = useState([]);
  const [form, setForm] = useState({
    institutionName: "",
    type: "school",
    email: "",
    phone: "",
    country: "Bangladesh",
    planId: "",
    transactionId: ""
  });

  // Fetch initial data
  useEffect(() => {
    async function init() {
      try {
        const [tenantRes, plansRes] = await Promise.all([
          fetch("/api/tenants/me"),
          fetch("/api/subscriptions/plans")
        ]);
        const tenantJson = await tenantRes.json();
        const plansJson = await plansRes.json();

        if (tenantJson.success && tenantJson.data) {
          const t = tenantJson.data;
          setTenant(t);
          setForm(prev => ({
            ...prev,
            institutionName: t.institution_name || "",
            type: t.institution_type || "school",
            email: t.email || "",
            phone: t.phone || "",
            country: t.country || "Bangladesh"
          }));

          // If they already have an active subscription, redirect to dashboard
          if (t.status === "active" && t.plan_name) {
            router.push("/client/dashboard");
            return;
          }
        }
        if (plansJson.success && plansJson.data) {
          setPlans(plansJson.data);
          if (plansJson.data.length > 0) {
            setForm(p => ({ ...p, planId: plansJson.data[0].id }));
          }
        }
      } catch (err) {
        console.error("Failed to load onboarding info:", err);
        setError("Could not load setup configuration. Please reload.");
      } finally {
        setInitialLoading(false);
      }
    }
    init();
  }, [router]);

  const change = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  
  const next = () => {
    if (step === 0 && !form.institutionName) {
      setError("Institution Name is required");
      return;
    }
    if (step === 1 && !form.email) {
      setError("Institution Email is required");
      return;
    }
    if (step === 3 && !form.transactionId) {
      setError("bKash Transaction ID is required to proceed");
      return;
    }
    setError("");
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const prev = () => {
    setError("");
    setStep((s) => Math.max(s - 1, 0));
  };

  const selectedPlan = plans.find(p => p.id === form.planId);

  const submit = async () => {
    if (!tenant) return;
    setError("");
    setLoading(true);

    try {
      // 1. Update tenant info
      const tenantPatch = await fetch(`/api/tenants/${tenant.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          institutionName: form.institutionName,
          institutionType: form.type,
          email: form.email,
          phone: form.phone,
          country: form.country,
        })
      });
      const tenantData = await tenantPatch.json();
      if (!tenantData.success) {
        throw new Error(tenantData.message || "Failed to update school details");
      }

      // 2. Create subscription in inactive (cancelled) state pending verification
      const subPost = await fetch("/api/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenantId: tenant.id,
          planId: form.planId,
          status: "cancelled"
        })
      });
      const subData = await subPost.json();
      if (!subData.success) {
        throw new Error(subData.message || "Failed to subscribe to the selected plan");
      }

      // 3. Record pending payment request
      const payPost = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenantId: tenant.id,
          subscriptionId: subData.data.id,
          amount: parseFloat(selectedPlan.price),
          paymentMethod: "bkash",
          transactionId: form.transactionId
        })
      });
      const payData = await payPost.json();
      if (!payData.success) {
        throw new Error(payData.message || "Failed to record payment transaction details");
      }

      setDone(true);
    } catch (err) {
      setError(err.message || "Something went wrong during setup.");
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div style={{ textAlign: "center", padding: "4rem 0" }}>
        <p style={{ color: "#64748b" }}>Loading configuration...</p>
      </div>
    );
  }

  if (done) {
    return (
      <div style={{ textAlign: "center", padding: "4rem 0" }}>
        <div style={{ fontSize: "3.5rem", marginBottom: "1rem" }}>⏳</div>
        <h1 style={{ fontSize: "2rem", fontWeight: 900, color: "#0f172a", marginBottom: "0.5rem" }}>Verification Pending</h1>
        <p style={{ color: "#64748b", marginBottom: "2rem", lineHeight: 1.7 }}>
          Your purchase has been submitted successfully.<br />Our manager will review the bKash Transaction ID and activate your system.
        </p>
        <Link href="/client/dashboard" style={{ padding: "0.875rem 2.5rem", borderRadius: "9999px", background: "linear-gradient(135deg,#6366f1,#a78bfa)", color: "#fff", fontWeight: 800, textDecoration: "none", boxShadow: "0 8px 20px rgba(99,102,241,0.35)" }}>
          Go to Dashboard →
        </Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "560px", margin: "0 auto" }}>
      <h1 style={{ fontSize: "1.75rem", fontWeight: 900, color: "#0f172a", marginBottom: "0.375rem" }}>Welcome to EduSaaS</h1>
      <p style={{ color: "#64748b", marginBottom: "2rem", fontSize: "0.9375rem" }}>Let's set up your school workspace in quick steps.</p>

      {/* Progress */}
      <div style={{ display: "flex", gap: "0", marginBottom: "2.5rem" }}>
        {STEPS.map((s, i) => (
          <div key={s} style={{ flex: 1, textAlign: "center" }}>
            <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: i <= step ? "#6366f1" : "#e2e8f0", color: i <= step ? "#fff" : "#94a3b8", fontWeight: 700, fontSize: "0.875rem", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 0.5rem" }}>
              {i < step ? "✓" : i + 1}
            </div>
            <p style={{ fontSize: "0.6875rem", color: i === step ? "#6366f1" : "#94a3b8", fontWeight: 700 }}>{s}</p>
          </div>
        ))}
      </div>

      {error && (
        <div style={{ padding: "0.875rem 1rem", borderRadius: "var(--radius-md)", background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", fontSize: "0.875rem", marginBottom: "1.25rem" }}>
          ⚠ {error}
        </div>
      )}

      <div style={{ background: "#fff", borderRadius: "14px", border: "1px solid #e2e8f0", padding: "2rem" }}>
        {step === 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <Input id="inst-name" label="Institution Name" name="institutionName" value={form.institutionName} onChange={change} placeholder="e.g. Dhaka Model School" required />
            <Select id="inst-type" label="Institution Type" name="type" value={form.type} onChange={change} required
              options={[
                { value: "school", label: "School" },
                { value: "college", label: "College" },
                { value: "madrasah", label: "Madrasah" },
                { value: "coaching", label: "Coaching Centre" }
              ]}
              placeholder="Select type" />
          </div>
        )}
        {step === 1 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <Input id="inst-email" label="Institution Email" name="email" type="email" value={form.email} onChange={change} placeholder="admin@school.edu.bd" required />
            <Input id="inst-phone" label="Phone Number" name="phone" value={form.phone} onChange={change} placeholder="01711XXXXXX" />
          </div>
        )}
        {step === 2 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {plans.map((p) => (
              <label key={p.id} style={{ display: "flex", alignItems: "center", gap: "1rem", padding: "1rem 1.25rem", borderRadius: "10px", border: `2px solid ${form.planId === p.id ? "#6366f1" : "#e2e8f0"}`, background: form.planId === p.id ? "#f5f3ff" : "#fff", cursor: "pointer" }}>
                <input type="radio" name="planId" value={p.id} checked={form.planId === p.id} onChange={change} style={{ accentColor: "#6366f1" }} />
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 800, color: "#0f172a", fontSize: "0.9375rem" }}>{p.name}</p>
                  <p style={{ color: "#64748b", fontSize: "0.8125rem" }}>Limit: {p.max_students?.toLocaleString() || "Unlimited"} students</p>
                </div>
                <span style={{ fontWeight: 800, color: "#6366f1", fontSize: "0.9375rem" }}>৳{parseInt(p.price).toLocaleString()}/{p.billing_cycle === "yearly" ? "yr" : "mo"}</span>
              </label>
            ))}
          </div>
        )}
        {step === 3 && selectedPlan && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <div style={{ padding: "1rem", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "10px", textAlign: "center" }}>
              <p style={{ color: "#991b1b", fontSize: "0.875rem", fontWeight: 700 }}>bKash Payment Method Instructions</p>
              <h2 style={{ fontSize: "1.5rem", fontWeight: 900, color: "#dc2626", margin: "0.5rem 0" }}>
                ৳{parseInt(selectedPlan.price).toLocaleString()} BDT
              </h2>
              <p style={{ fontSize: "0.8125rem", color: "#7f1d1d" }}>
                Please Send Money or Pay to merchant number: <strong style={{ textDecoration: "underline" }}>01711223344</strong>
              </p>
            </div>
            <Input id="inst-txid" label="bKash Transaction ID (10-characters)" name="transactionId" value={form.transactionId} onChange={change} placeholder="e.g. BK8392JS8A" required />
          </div>
        )}
        {step === 4 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
            <h3 style={{ fontWeight: 800, color: "#0f172a", marginBottom: "0.5rem" }}>Review & Confirm Purchase</h3>
            {[
              ["Institution", form.institutionName || "—"],
              ["Type", form.type || "—"],
              ["Email", form.email || "—"],
              ["Phone", form.phone || "—"],
              ["Plan", selectedPlan ? `${selectedPlan.name} (৳${parseInt(selectedPlan.price).toLocaleString()}/${selectedPlan.billing_cycle === "yearly" ? "yr" : "mo"})` : "—"],
              ["bKash TxID", form.transactionId || "—"]
            ].map(([k, v]) => (
              <div key={k} style={{ display: "flex", justifyContext: "space-between", justifyContent: "space-between", padding: "0.625rem 0", borderBottom: "1px solid #f8fafc", fontSize: "0.9rem" }}>
                <span style={{ color: "#64748b", fontWeight: 600 }}>{k}</span>
                <span style={{ fontWeight: 700, color: "#0f172a", textTransform: "capitalize" }}>{v}</span>
              </div>
            ))}
          </div>
        )}

        <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.75rem" }}>
          {step > 0 && <button onClick={prev} style={{ flex: 1, padding: "0.75rem", borderRadius: "8px", border: "1.5px solid #e2e8f0", background: "#fff", color: "#475569", fontWeight: 700, cursor: "pointer", fontSize: "0.875rem" }}>← Back</button>}
          {step < STEPS.length - 1
            ? <Button style={{ flex: 1 }} onClick={next}>Continue →</Button>
            : <Button style={{ flex: 1 }} onClick={submit} loading={loading}>Complete Setup</Button>
          }
        </div>
      </div>
    </div>
  );
}
