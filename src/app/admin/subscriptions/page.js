"use client";

import { useState, useEffect } from "react";
import DataTable from "@/components/tables/DataTable";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import Select from "@/components/forms/Select";
import Button from "@/components/ui/Button";
import { formatDate, formatBDT } from "@/utils/helpers";

export default function AdminSubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Override Modal state
  const [overrideOpen, setOverrideOpen] = useState(false);
  const [overrideData, setOverrideData] = useState({ tenantId: "", planId: "", billingCycle: "monthly" });
  const [overrideLoading, setOverrideLoading] = useState(false);
  const [overrideError, setOverrideError] = useState("");

  const [tenants, setTenants] = useState([]);
  const [plans, setPlans] = useState([]);

  async function loadSubscriptions() {
    setLoading(true);
    try {
      const res = await fetch("/api/subscriptions?pageSize=100");
      const json = await res.json();
      if (json.success) {
        setSubscriptions(json.data || []);
      }
    } catch (err) {
      console.error("Failed to load subscriptions:", err);
    } finally {
      setLoading(false);
    }
  }

  async function loadTenantsAndPlans() {
    try {
      const [tenantsRes, plansRes] = await Promise.all([
        fetch("/api/tenants?pageSize=100"),
        fetch("/api/subscriptions/plans")
      ]);
      const [tenantsJson, plansJson] = await Promise.all([
        tenantsRes.json(),
        plansRes.json()
      ]);
      if (tenantsJson.success) setTenants(tenantsJson.data || []);
      if (plansJson.success) setPlans(plansJson.data || []);
    } catch (err) {
      console.error("Failed to load tenants or plans:", err);
    }
  }

  useEffect(() => {
    loadSubscriptions();
  }, []);

  useEffect(() => {
    if (overrideOpen) {
      loadTenantsAndPlans();
    }
  }, [overrideOpen]);

  async function handleCancel(id) {
    if (!confirm("Are you sure you want to cancel this subscription?")) return;
    try {
      const res = await fetch(`/api/subscriptions/${id}`, {
        method: "DELETE"
      });
      const json = await res.json();
      if (json.success) {
        setSubscriptions(prev => prev.map(s => s.id === id ? { ...s, status: "cancelled" } : s));
      } else {
        alert(json.message || "Failed to cancel subscription");
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function handleOverride(e) {
    e.preventDefault();
    setOverrideLoading(true);
    setOverrideError("");
    try {
      const res = await fetch("/api/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(overrideData)
      });
      const json = await res.json();
      if (json.success) {
        setOverrideOpen(false);
        setOverrideData({ tenantId: "", planId: "", billingCycle: "monthly" });
        loadSubscriptions();
      } else {
        setOverrideError(json.message || "Failed to override subscription");
      }
    } catch (err) {
      console.error(err);
      setOverrideError("An error occurred");
    } finally {
      setOverrideLoading(false);
    }
  }

  const columns = [
    { key: "institution_name", label: "Institution",     sortable: true },
    { key: "plan_name",        label: "Plan",            sortable: true, render: v => <span style={{ fontWeight: 700, color: "#6366f1" }}>{v}</span> },
    { key: "price",            label: "Amount",          sortable: true, render: (v, r) => <span style={{ fontWeight: 700 }}>{formatBDT(v)}<span style={{ color:"#94a3b8", fontWeight:500, fontSize:"0.75rem" }}>/{r.billing_cycle === "yearly" ? "yr" : "mo"}</span></span> },
    { key: "status",           label: "Status",          sortable: true, render: v => <Badge status={v}>{v}</Badge> },
    { key: "start_date",       label: "Start",           sortable: true, render: v => formatDate(v) },
    { key: "end_date",         label: "Expires",         sortable: true, render: (v, r) => { const expired = new Date(v) < new Date(); return <span style={{ color: expired && r.status==="active" ? "#ef4444":"inherit", fontWeight: expired && r.status==="active" ? 700:400 }}>{formatDate(v)}</span>; } },
    { key: "actions",          label: "",                render: (_, r) => r.status === "active" ? <button onClick={() => handleCancel(r.id)} style={{ padding:"0.3rem 0.75rem", borderRadius:"6px", border:"1.5px solid #fecaca", background:"#fff", color:"#ef4444", cursor:"pointer", fontSize:"0.75rem", fontWeight:600 }}>Cancel</button> : null },
  ];

  const activeCount = subscriptions.filter(s => s.status === "active").length;
  const expiredCount = subscriptions.filter(s => s.status === "expired").length;
  const cancelledCount = subscriptions.filter(s => s.status === "cancelled").length;

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifySelf: "stretch", justifyContent: "space-between", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 900, color: "#0f172a", letterSpacing: "-0.03em" }}>Subscriptions</h1>
          <p style={{ color: "#64748b", fontSize: "0.875rem" }}>All tenant subscription records — active, expired, and cancelled</p>
        </div>
        <button onClick={() => setOverrideOpen(true)} style={{ padding: "0.625rem 1.25rem", borderRadius: "8px", background: "linear-gradient(135deg,#6366f1,#a78bfa)", color: "#fff", fontWeight: 700, border: "none", cursor: "pointer", fontSize: "0.875rem" }}>
          Override Subscription
        </button>
      </div>

      {/* Summary cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "1rem", marginBottom: "1.5rem" }}>
        {[["Active", activeCount, "#10b981"], ["Expired", expiredCount, "#f59e0b"], ["Cancelled", cancelledCount, "#ef4444"]].map(([l,v,c]) => (
          <div key={l} style={{ background:"#fff", borderRadius:"10px", border:"1px solid #e2e8f0", padding:"1rem 1.25rem" }}>
            <div style={{ fontSize:"1.5rem", fontWeight:900, color:c }}>{v}</div>
            <div style={{ fontSize:"0.8125rem", color:"#64748b", fontWeight:600 }}>{l} Subscriptions</div>
          </div>
        ))}
      </div>

      <DataTable columns={columns} data={subscriptions} searchKey="institution_name" loading={loading} />

      {/* Override Subscription Modal */}
      <Modal open={overrideOpen} onClose={() => setOverrideOpen(false)} title="Override Subscription">
        <form onSubmit={handleOverride} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <Select label="Tenant" required value={overrideData.tenantId} onChange={e => setOverrideData(p => ({ ...p, tenantId: e.target.value }))}
            options={tenants.map(t => ({ value: t.id, label: t.institution_name }))}
            placeholder="Select a tenant"
          />

          <Select label="Plan" required value={overrideData.planId} onChange={e => setOverrideData(p => ({ ...p, planId: e.target.value }))}
            options={plans.map(p => ({ value: p.id, label: `${p.name} (${formatBDT(p.price)}/${p.billing_cycle})` }))}
            placeholder="Select a subscription plan"
          />

          <Select label="Billing Cycle" required value={overrideData.billingCycle} onChange={e => setOverrideData(p => ({ ...p, billingCycle: e.target.value }))}
            options={[
              { value: "monthly", label: "Monthly" },
              { value: "yearly", label: "Yearly" }
            ]}
          />

          {overrideError && <p style={{ color: "#ef4444", fontSize: "0.8125rem" }}>{overrideError}</p>}
          
          <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.5rem" }}>
            <Button type="submit" loading={overrideLoading} style={{ flex: 1 }}>Apply Override Plan</Button>
            <Button type="button" variant="secondary" onClick={() => setOverrideOpen(false)} style={{ flex: 1 }}>Cancel</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
