"use client";

import { useState, useEffect } from "react";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Input from "@/components/forms/Input";
import Select from "@/components/forms/Select";
import { formatDate, formatBDT } from "@/utils/helpers";

export default function ClientBillingPage() {
  const [tenant, setTenant] = useState(null);
  const [plans, setPlans] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showPayModal, setShowPayModal] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("bkash");
  const [transactionId, setTransactionId] = useState("");
  const [paying, setPaying] = useState(false);

  async function loadBillingData() {
    try {
      const [tenantRes, plansRes, paymentsRes] = await Promise.all([
        fetch("/api/tenants/me"),
        fetch("/api/subscriptions/plans"),
        fetch("/api/payments")
      ]);
      
      const tenantJson = await tenantRes.json();
      const plansJson = await plansRes.json();
      const paymentsJson = await paymentsRes.json();

      if (tenantJson.success) setTenant(tenantJson.data);
      if (plansJson.success) setPlans(plansJson.data);
      if (paymentsJson.success) setPayments(paymentsJson.data || []);
    } catch (err) {
      console.error(err);
      setError("Could not load billing information.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadBillingData();
  }, []);

  const openUpgrade = (planId) => {
    setSelectedPlanId(planId);
    setShowPayModal(true);
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    if (!tenant || !selectedPlanId) return;

    const plan = plans.find(p => p.id === selectedPlanId);
    if (!plan) return;

    setPaying(true);
    setError("");

    try {
      // 1. Record the payment in database
      const payRes = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenantId: tenant.id,
          amount: parseFloat(plan.price),
          paymentMethod,
          transactionId: transactionId || `TXN${Date.now()}`
        })
      });
      const payData = await payRes.json();
      if (!payData.success) {
        throw new Error(payData.message || "Payment registration failed");
      }

      // 2. Update the subscription in database
      const subRes = await fetch("/api/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenantId: tenant.id,
          planId: plan.id
        })
      });
      const subData = await subRes.json();
      if (!subData.success) {
        throw new Error(subData.message || "Subscription update failed");
      }

      setShowPayModal(false);
      setTransactionId("");
      await loadBillingData();
    } catch (err) {
      setError(err.message || "Failed to process plan checkout.");
    } finally {
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <p style={{ color: "#64748b" }}>Loading billing center...</p>
      </div>
    );
  }

  return (
    <div>
      <h1 style={{ fontSize: "1.75rem", fontWeight: 900, color: "#0f172a", letterSpacing: "-0.03em", marginBottom: "0.25rem" }}>Billing</h1>
      <p style={{ color: "#64748b", fontSize: "0.875rem", marginBottom: "1.75rem" }}>Manage your subscription and view payment logs</p>

      {error && (
        <div style={{ padding: "0.875rem 1rem", borderRadius: "10px", background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", fontSize: "0.875rem", marginBottom: "1.5rem" }}>
          ⚠ {error}
        </div>
      )}

      {/* Active sub */}
      {tenant && tenant.plan_name ? (
        <div style={{ background: "linear-gradient(135deg,#6366f1,#7c3aed)", borderRadius: "14px", padding: "1.5rem 2rem", marginBottom: "1.5rem", color: "#fff" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
            <div>
              <p style={{ opacity: 0.8, fontSize: "0.8125rem", marginBottom: "0.25rem" }}>Active Plan Tier</p>
              <h2 style={{ fontSize: "1.75rem", fontWeight: 900, letterSpacing: "-0.03em" }}>
                {tenant.plan_name}
              </h2>
              <p style={{ opacity: 0.8, fontSize: "0.8125rem", marginTop: "0.375rem" }}>
                Active status: {tenant.sub_status} · Renew date: {formatDate(tenant.sub_end)}
              </p>
            </div>
            <button onClick={() => openUpgrade(plans.find(p => p.name === tenant.plan_name)?.id)} style={{ padding: "0.75rem 1.5rem", borderRadius: "9999px", background: "rgba(255,255,255,0.2)", color: "#fff", fontWeight: 700, border: "1.5px solid rgba(255,255,255,0.3)", cursor: "pointer", fontSize: "0.875rem", backdropFilter: "blur(4px)" }}>
              Renew Subscription
            </button>
          </div>
        </div>
      ) : (
        <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: "10px", padding: "1rem 1.25rem", color: "#b45309", marginBottom: "1.5rem" }}>
          ⚠ No active subscription plan. Select a plan below to activate your school workspace.
        </div>
      )}

      {/* Plan comparison */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px, 1fr))", gap: "1rem", marginBottom: "1.75rem" }}>
        {plans.map((p) => {
          const isCurrent = tenant && tenant.plan_name === p.name;
          return (
            <div key={p.id} style={{ background: "#fff", borderRadius: "12px", border: `2px solid ${isCurrent ? "#6366f1" : "#e2e8f0"}`, padding: "1.25rem", position: "relative" }}>
              {isCurrent && <span style={{ position: "absolute", top: "-1px", right: "1rem", background: "#6366f1", color: "#fff", fontSize: "0.6875rem", fontWeight: 700, padding: "0.25rem 0.625rem", borderRadius: "0 0 6px 6px" }}>Current</span>}
              <h3 style={{ fontWeight: 800, color: "#0f172a", fontSize: "1.0625rem", marginBottom: "0.25rem" }}>{p.name}</h3>
              <p style={{ fontWeight: 900, color: isCurrent ? "#6366f1" : "#0f172a", fontSize: "1.25rem", marginBottom: "0.75rem" }}>
                {formatBDT(p.price)}<span style={{ fontSize: "0.8rem", fontWeight: 500, color: "#64748b" }}>/{p.billing_cycle === "yearly" ? "yr" : "mo"}</span>
              </p>
              <p style={{ fontSize: "0.8125rem", color: "#64748b", margin: "0.25rem 0" }}>👨‍🎓 {p.max_students.toLocaleString()} student limit</p>
              <p style={{ fontSize: "0.8125rem", color: "#64748b", margin: "0.25rem 0" }}>👩‍🏫 {p.max_teachers.toLocaleString()} teacher limit</p>
              
              {!isCurrent && (
                <button onClick={() => openUpgrade(p.id)} style={{ marginTop: "1rem", width: "100%", padding: "0.625rem", borderRadius: "8px", background: "#6366f1", color: "#fff", fontWeight: 700, border: "none", cursor: "pointer", fontSize: "0.8125rem", transition: "background 0.15s" }}
                  onMouseEnter={e => e.currentTarget.style.background = "#4f46e5"}
                  onMouseLeave={e => e.currentTarget.style.background = "#6366f1"}>
                  Upgrade
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Payment history */}
      <div style={{ background: "#fff", borderRadius: "12px", border: "1px solid #e2e8f0", padding: "1.5rem", overflowX: "auto" }}>
        <h2 style={{ fontWeight: 800, color: "#0f172a", fontSize: "1rem", marginBottom: "1.25rem" }}>Payment History</h2>
        {payments.length === 0 ? (
          <p style={{ color: "#64748b", fontSize: "0.875rem", textAlign: "center", padding: "1.5rem" }}>No payments recorded yet.</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem", minWidth: "500px" }}>
            <thead>
              <tr style={{ background: "#f8fafc" }}>
                {["Amount", "Method", "Status", "Transaction ID", "Date"].map((h) => (
                  <th key={h} style={{ padding: "0.625rem 1rem", textAlign: "left", fontWeight: 700, color: "#475569", fontSize: "0.8125rem", textTransform: "uppercase", letterSpacing: "0.04em" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                  <td style={{ padding: "0.75rem 1rem", fontWeight: 700, color: "#0f172a" }}>{formatBDT(p.amount)}</td>
                  <td style={{ padding: "0.75rem 1rem", textTransform: "uppercase", color: "#475569" }}>{p.payment_method}</td>
                  <td style={{ padding: "0.75rem 1rem" }}><Badge status={p.status === "success" ? "success" : p.status === "pending" ? "warning" : "danger"}>{p.status}</Badge></td>
                  <td style={{ padding: "0.75rem 1rem" }}><code style={{ fontSize: "0.75rem", color: "#64748b", background: "#f8fafc", padding: "0.1rem 0.375rem", borderRadius: "4px" }}>{p.transaction_id || "N/A"}</code></td>
                  <td style={{ padding: "0.75rem 1rem", color: "#64748b" }}>{formatDate(p.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Checkout Modal */}
      {showPayModal && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(15,23,42,0.45)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: "#fff", borderRadius: "16px", width: "100%", maxWidth: "450px", padding: "2rem", border: "1px solid #e2e8f0", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <h2 style={{ fontSize: "1.25rem", fontWeight: 900, color: "#0f172a" }}>Confirm Subscription</h2>
              <button onClick={() => setShowPayModal(false)} style={{ background: "none", border: "none", fontSize: "1.5rem", cursor: "pointer", color: "#94a3b8" }}>&times;</button>
            </div>

            <form onSubmit={handlePaymentSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              <div>
                <p style={{ fontSize: "0.875rem", color: "#64748b", marginBottom: "0.25rem" }}>Selected Plan</p>
                <p style={{ fontSize: "1.125rem", fontWeight: 800, color: "#0f172a" }}>
                  {plans.find(p => p.id === selectedPlanId)?.name} — {formatBDT(plans.find(p => p.id === selectedPlanId)?.price)}
                </p>
              </div>

              <Select id="pay-method" label="Payment Gateway" value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)} required
                options={[
                  { value: "bkash", label: "bKash" },
                  { value: "nagad", label: "Nagad" },
                  { value: "card", label: "Credit/Debit Card" },
                  { value: "bank_transfer", label: "Bank Transfer" }
                ]}
              />

              <Input id="pay-txn" label="Transaction ID (Optional)" placeholder="e.g. BK20250115..." value={transactionId} onChange={e => setTransactionId(e.target.value)}
                hint="Leave empty to auto-generate a mock transaction ID for the demo."
              />

              <div style={{ display: "flex", gap: "0.75rem", marginTop: "1rem" }}>
                <button type="button" onClick={() => setShowPayModal(false)} style={{ flex: 1, padding: "0.75rem", borderRadius: "8px", border: "1.5px solid #e2e8f0", background: "#fff", color: "#475569", fontWeight: 700, cursor: "pointer" }}>Cancel</button>
                <Button type="submit" style={{ flex: 1 }} loading={paying}>Complete Payment</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
