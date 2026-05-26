"use client";

import { useState, useEffect } from "react";
import Input from "@/components/forms/Input";
import Select from "@/components/forms/Select";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [generalLoading, setGeneralLoading] = useState(false);
  const [appName, setAppName] = useState("EduSaaS");
  const [supportEmail, setSupportEmail] = useState("hello@edusaas.app");

  // Plans state
  const [plans, setPlans] = useState([]);
  const [plansLoading, setPlansLoading] = useState(true);

  // Plan Modal state
  const [planModalOpen, setPlanModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null); // null means "create new"
  const [planData, setPlanData] = useState({
    name: "",
    price: "",
    billingCycle: "monthly",
    maxStudents: "",
    maxTeachers: "",
    sms: false,
    customDomain: false,
    dedicatedSupport: false
  });
  const [planSubmitLoading, setPlanSubmitLoading] = useState(false);
  const [planError, setPlanError] = useState("");

  async function loadGeneralSettings() {
    try {
      const res = await fetch("/api/admin/settings");
      const json = await res.json();
      if (json.success) {
        setAppName(json.data.platformName || "EduSaaS");
        setSupportEmail(json.data.supportEmail || "hello@edusaas.app");
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function loadPlans() {
    setPlansLoading(true);
    try {
      const res = await fetch("/api/subscriptions/plans?all=true");
      const json = await res.json();
      if (json.success) {
        setPlans(json.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setPlansLoading(false);
    }
  }

  useEffect(() => {
    Promise.all([loadGeneralSettings(), loadPlans()]).finally(() => {
      setLoading(false);
    });
  }, []);

  const handleSaveGeneral = async (e) => {
    e.preventDefault();
    setGeneralLoading(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platformName: appName, supportEmail })
      });
      const json = await res.json();
      if (json.success) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setGeneralLoading(false);
    }
  };

  function openCreatePlan() {
    setEditingPlan(null);
    setPlanData({
      name: "",
      price: "",
      billingCycle: "monthly",
      maxStudents: "",
      maxTeachers: "",
      sms: false,
      customDomain: false,
      dedicatedSupport: false
    });
    setPlanError("");
    setPlanModalOpen(true);
  }

  function openEditPlan(plan) {
    setEditingPlan(plan);
    const feats = typeof plan.features === "string" ? JSON.parse(plan.features) : (plan.features || {});
    setPlanData({
      name: plan.name,
      price: plan.price.toString(),
      billingCycle: plan.billing_cycle,
      maxStudents: plan.max_students ? plan.max_students.toString() : "",
      maxTeachers: plan.max_teachers ? plan.max_teachers.toString() : "",
      sms: !!feats.sms,
      customDomain: !!feats.customDomain,
      dedicatedSupport: !!feats.dedicatedSupport
    });
    setPlanError("");
    setPlanModalOpen(true);
  }

  async function handlePlanSubmit(e) {
    e.preventDefault();
    setPlanSubmitLoading(true);
    setPlanError("");
    
    const payload = {
      name: planData.name,
      price: parseFloat(planData.price),
      billingCycle: planData.billingCycle,
      maxStudents: planData.maxStudents ? parseInt(planData.maxStudents, 10) : null,
      maxTeachers: planData.maxTeachers ? parseInt(planData.maxTeachers, 10) : null,
      features: {
        sms: planData.sms,
        customDomain: planData.customDomain,
        dedicatedSupport: planData.dedicatedSupport
      }
    };

    try {
      const url = editingPlan ? `/api/subscriptions/plans/${editingPlan.id}` : "/api/subscriptions/plans";
      const method = editingPlan ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const json = await res.json();
      if (json.success) {
        setPlanModalOpen(false);
        loadPlans();
      } else {
        setPlanError(json.message || "Failed to save plan");
      }
    } catch (err) {
      console.error(err);
      setPlanError("An error occurred");
    } finally {
      setPlanSubmitLoading(false);
    }
  }

  async function togglePlanActive(plan) {
    const nextActive = !plan.is_active;
    const confirmMsg = nextActive
      ? `Are you sure you want to reactivate the ${plan.name} plan?`
      : `Are you sure you want to deactivate the ${plan.name} plan?`;
    if (!confirm(confirmMsg)) return;

    try {
      const res = await fetch(`/api/subscriptions/plans/${plan.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: nextActive })
      });
      const json = await res.json();
      if (json.success) {
        setPlans(prev => prev.map(p => p.id === plan.id ? { ...p, is_active: nextActive } : p));
      } else {
        alert(json.message || "Failed to toggle plan status");
      }
    } catch (err) {
      console.error(err);
    }
  }

  if (loading) {
    return <p style={{ padding: "2rem", color: "#64748b", textAlign: "center" }}>Loading settings...</p>;
  }

  return (
    <div>
      <h1 style={{ fontSize:"1.75rem", fontWeight:900, color:"#0f172a", letterSpacing:"-0.03em", marginBottom:"0.25rem" }}>Settings</h1>
      <p style={{ color:"#64748b", fontSize:"0.875rem", marginBottom:"2rem" }}>Platform-wide configuration</p>

      {/* General Settings */}
      <form onSubmit={handleSaveGeneral} style={{ background:"#fff", borderRadius:"12px", border:"1px solid #e2e8f0", padding:"1.5rem", marginBottom:"1.25rem" }}>
        <h2 style={{ fontWeight:800, color:"#0f172a", fontSize:"1rem", marginBottom:"1.25rem" }}>General</h2>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"1rem", marginBottom:"1.25rem" }}>
          <Input id="app-name" label="Platform Name" required value={appName} onChange={e=>setAppName(e.target.value)} />
          <Input id="support-email" label="Support Email" type="email" required value={supportEmail} onChange={e=>setSupportEmail(e.target.value)} />
        </div>
        <Button type="submit" loading={generalLoading}>{saved ? "✓ Saved!" : "Save Changes"}</Button>
      </form>

      {/* Subscription Plans Settings */}
      <div style={{ background:"#fff", borderRadius:"12px", border:"1px solid #e2e8f0", padding:"1.5rem", marginBottom:"1.25rem" }}>
        <div style={{ display:"flex", alignItems:"center", justifySelf: "stretch", justifyContent:"space-between", marginBottom:"1.25rem" }}>
          <h2 style={{ fontWeight:800, color:"#0f172a", fontSize:"1rem" }}>Subscription Plans</h2>
          <button onClick={openCreatePlan} style={{ padding:"0.5rem 1rem", borderRadius:"8px", background:"#6366f1", color:"#fff", fontWeight:700, border:"none", cursor:"pointer", fontSize:"0.8125rem" }}>+ New Plan</button>
        </div>
        
        {plansLoading ? (
          <p style={{ color: "#94a3b8", fontSize: "0.875rem" }}>Loading plans...</p>
        ) : plans.length === 0 ? (
          <p style={{ color: "#94a3b8", fontSize: "0.875rem", fontStyle: "italic" }}>No plans defined.</p>
        ) : (
          <div style={{ display:"flex", flexDirection:"column", gap:"0.75rem" }}>
            {plans.map(p=>(
              <div key={p.id} style={{ display:"flex", alignItems:"center", justifySelf: "stretch", justifyContent:"space-between", padding:"1rem 1.25rem", borderRadius:"8px", border:"1px solid #f1f5f9", background: p.is_active ? "#fafafa" : "#f8fafc", opacity: p.is_active ? 1 : 0.6 }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <span style={{ fontWeight:800, color:"#0f172a", fontSize:"0.9375rem" }}>{p.name}</span>
                    {!p.is_active && <span style={{ fontSize: "0.6875rem", fontWeight: 700, padding: "0.1rem 0.375rem", background: "#ef444422", color: "#ef4444", borderRadius: "9999px" }}>Inactive</span>}
                  </div>
                  <div style={{ fontSize:"0.8125rem", color:"#64748b" }}>
                    ৳{p.price.toLocaleString()}/{p.billing_cycle === "yearly" ? "yr":"mo"} · {p.max_students ? `${p.max_students} students`:  "Unlimited students"} · {p.max_teachers ? `${p.max_teachers} teachers`:"Unlimited teachers"}
                  </div>
                </div>
                <div style={{ display:"flex", gap:"0.5rem" }}>
                  <button onClick={() => openEditPlan(p)} style={{ padding:"0.375rem 0.875rem", borderRadius:"6px", border:"1.5px solid #e2e8f0", background:"#fff", cursor:"pointer", fontSize:"0.8125rem", fontWeight:600, color:"#475569" }}>Edit</button>
                  <button onClick={() => togglePlanActive(p)} style={{ padding:"0.375rem 0.875rem", borderRadius:"6px", border: `1.5px solid ${p.is_active ? "#fecaca" : "#bbf7d0"}`, background:"#fff", cursor:"pointer", fontSize:"0.8125rem", fontWeight:600, color: p.is_active ? "#ef4444" : "#059669" }}>
                    {p.is_active ? "Deactivate" : "Activate"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Danger zone */}
      <div style={{ background:"#fff", borderRadius:"12px", border:"1.5px solid #fecaca", padding:"1.5rem" }}>
        <h2 style={{ fontWeight:800, color:"#dc2626", fontSize:"1rem", marginBottom:"0.75rem" }}>Danger Zone</h2>
        <p style={{ color:"#64748b", fontSize:"0.875rem", marginBottom:"1rem" }}>Irreversible actions. Proceed with caution.</p>
        <button style={{ padding:"0.625rem 1.25rem", borderRadius:"8px", background:"#ef4444", color:"#fff", fontWeight:700, border:"none", cursor:"pointer", fontSize:"0.875rem" }}>
          Purge All Expired Data
        </button>
      </div>

      {/* Plan Create / Edit Modal */}
      <Modal open={planModalOpen} onClose={() => setPlanModalOpen(false)} title={editingPlan ? `Edit Plan: ${editingPlan.name}` : "Create Subscription Plan"}>
        <form onSubmit={handlePlanSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <Input label="Plan Name" required value={planData.name} onChange={e => setPlanData(p => ({ ...p, name: e.target.value }))} />
          
          <Input label="Price (BDT)" type="number" required value={planData.price} onChange={e => setPlanData(p => ({ ...p, price: e.target.value }))} />
          
          <Select label="Billing Cycle" required value={planData.billingCycle} onChange={e => setPlanData(p => ({ ...p, billingCycle: e.target.value }))}
            options={[
              { value: "monthly", label: "Monthly" },
              { value: "yearly", label: "Yearly" }
            ]}
          />

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <Input label="Max Students" type="number" placeholder="Leave empty for unlimited" value={planData.maxStudents} onChange={e => setPlanData(p => ({ ...p, maxStudents: e.target.value }))} />
            <Input label="Max Teachers" type="number" placeholder="Leave empty for unlimited" value={planData.maxTeachers} onChange={e => setPlanData(p => ({ ...p, maxTeachers: e.target.value }))} />
          </div>

          <div>
            <label style={{ fontSize: "0.875rem", fontWeight: 700, color: "#475569", display: "block", marginBottom: "0.5rem" }}>Features</label>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.875rem", fontWeight: 600, color: "#334155" }}>
                <input type="checkbox" checked={planData.sms} onChange={e => setPlanData(p => ({ ...p, sms: e.target.checked }))} />
                SMS Integration
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.875rem", fontWeight: 600, color: "#334155" }}>
                <input type="checkbox" checked={planData.customDomain} onChange={e => setPlanData(p => ({ ...p, customDomain: e.target.checked }))} />
                Custom Domain Subdomain
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.875rem", fontWeight: 600, color: "#334155" }}>
                <input type="checkbox" checked={planData.dedicatedSupport} onChange={e => setPlanData(p => ({ ...p, dedicatedSupport: e.target.checked }))} />
                Dedicated Support
              </label>
            </div>
          </div>

          {planError && <p style={{ color: "#ef4444", fontSize: "0.8125rem" }}>{planError}</p>}

          <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.5rem" }}>
            <Button type="submit" loading={planSubmitLoading}>{editingPlan ? "Save Plan" : "Create Plan"}</Button>
            <Button type="button" variant="secondary" onClick={() => setPlanModalOpen(false)}>Cancel</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
