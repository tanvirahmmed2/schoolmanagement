"use client";

import { useState, useEffect } from "react";
import DataTable from "@/components/tables/DataTable";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import Input from "@/components/forms/Input";
import Select from "@/components/forms/Select";
import Button from "@/components/ui/Button";
import { formatBDT } from "@/utils/helpers";

export default function ManagerPlansPage() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [form, setForm] = useState({
    name: "",
    price: "",
    billingCycle: "monthly",
    maxStudents: "1000",
    maxTeachers: "50",
    featuresStr: "Fee Collection, Attendance tracking, SMS notifications",
    isActive: true
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [saving, setSaving] = useState(false);

  async function loadPlans() {
    try {
      const res = await fetch("/api/subscriptions/plans?all=true");
      const json = await res.json();
      if (json.success) {
        setPlans(json.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPlans();
  }, []);

  const openAdd = () => {
    setEditingPlan(null);
    setForm({
      name: "",
      price: "",
      billingCycle: "monthly",
      maxStudents: "1000",
      maxTeachers: "50",
      featuresStr: "Fee Collection, Attendance tracking, SMS notifications",
      isActive: true
    });
    setError("");
    setModalOpen(true);
  };

  const openEdit = (plan) => {
    setEditingPlan(plan);
    const fStr = Array.isArray(plan.features)
      ? plan.features.map(f => (typeof f === 'string' ? f : f.label)).join(", ")
      : "";
    setForm({
      name: plan.name,
      price: plan.price.toString(),
      billingCycle: plan.billing_cycle,
      maxStudents: (plan.max_students || "").toString(),
      maxTeachers: (plan.max_teachers || "").toString(),
      featuresStr: fStr,
      isActive: plan.is_active
    });
    setError("");
    setModalOpen(true);
  };

  const savePlan = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    const featuresArray = form.featuresStr
      .split(",")
      .map(s => s.trim())
      .filter(Boolean)
      .map(f => ({ label: f, included: true }));

    const payload = {
      name: form.name,
      price: parseFloat(form.price),
      billingCycle: form.billingCycle,
      maxStudents: parseInt(form.maxStudents, 10) || null,
      maxTeachers: parseInt(form.maxTeachers, 10) || null,
      features: featuresArray,
      isActive: form.isActive
    };

    try {
      let res;
      if (editingPlan) {
        res = await fetch(`/api/subscriptions/plans/${editingPlan.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
      } else {
        res = await fetch("/api/subscriptions/plans", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
      }

      const json = await res.json();
      if (json.success) {
        setSuccess(`Plan successfully ${editingPlan ? "updated" : "created"}!`);
        setModalOpen(false);
        loadPlans();
      } else {
        setError(json.message || "Failed to save plan");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (plan) => {
    try {
      const res = await fetch(`/api/subscriptions/plans/${plan.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !plan.is_active })
      });
      const json = await res.json();
      if (json.success) {
        loadPlans();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const cols = [
    { key: "name", label: "Plan Name", sortable: true },
    { key: "price", label: "Price", sortable: true, render: (v) => formatBDT(v) },
    { key: "billing_cycle", label: "Cycle", render: (v) => <span style={{ textTransform: "capitalize" }}>{v}</span> },
    { key: "max_students", label: "Max Students", render: (v) => v?.toLocaleString() || "Unlimited" },
    { key: "max_teachers", label: "Max Teachers", render: (v) => v?.toLocaleString() || "Unlimited" },
    {
      key: "is_active",
      label: "Status",
      render: (v, r) => (
        <button
          onClick={() => toggleStatus(r)}
          style={{ background: "none", border: "none", cursor: "pointer" }}
        >
          <Badge status={v ? "success" : "warning"}>{v ? "Active" : "Inactive"}</Badge>
        </button>
      )
    },
    {
      key: "actions",
      label: "Actions",
      render: (v, r) => (
        <Button size="sm" onClick={() => openEdit(r)}>
          Edit
        </Button>
      )
    }
  ];

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 900, color: "#0f172a", letterSpacing: "-0.03em", marginBottom: "0.25rem" }}>
            Plan Management
          </h1>
          <p style={{ color: "#64748b", fontSize: "0.875rem" }}>
            Add, update, and manage pricing tiers displayed on the public landing page
          </p>
        </div>
        <Button onClick={openAdd}>+ Add Custom Plan</Button>
      </div>

      {success && (
        <div style={{ padding: "0.875rem 1rem", borderRadius: "10px", background: "#ecfdf5", border: "1px solid #a7f3d0", color: "#047857", fontSize: "0.875rem", marginBottom: "1.5rem" }}>
          ✓ {success}
        </div>
      )}

      <div style={{ background: "#fff", borderRadius: "12px", border: "1px solid #e2e8f0", padding: "1.5rem" }}>
        {loading ? (
          <p style={{ color: "#64748b", fontSize: "0.875rem" }}>Loading plans...</p>
        ) : (
          <DataTable columns={cols} data={plans} searchKey="name" />
        )}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingPlan ? "Update Plan" : "Create Subscription Plan"}>
        <form onSubmit={savePlan} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          {error && (
            <div style={{ padding: "0.75rem", borderRadius: "8px", background: "#fef2f2", color: "#dc2626", fontSize: "0.875rem" }}>
              {error}
            </div>
          )}
          <Input id="p-name" label="Plan Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
          
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <Input id="p-price" label="Price (BDT)" type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} required />
            <Select
              id="p-cycle"
              label="Billing Cycle"
              value={form.billingCycle}
              onChange={e => setForm(f => ({ ...f, billingCycle: e.target.value }))}
              options={[
                { value: "monthly", label: "Monthly" },
                { value: "yearly", label: "Yearly" }
              ]}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <Input id="p-stud" label="Max Students" type="number" value={form.maxStudents} onChange={e => setForm(f => ({ ...f, maxStudents: e.target.value }))} />
            <Input id="p-teach" label="Max Teachers" type="number" value={form.maxTeachers} onChange={e => setForm(f => ({ ...f, maxTeachers: e.target.value }))} />
          </div>

          <Input
            id="p-feat"
            label="Features (comma separated)"
            value={form.featuresStr}
            onChange={e => setForm(f => ({ ...f, featuresStr: e.target.value }))}
            placeholder="e.g. Attendance tracking, SMS notifications, Fee collection"
          />

          <div style={{ display: "flex", gap: "0.75rem", marginTop: "1rem" }}>
            <Button type="submit" loading={saving} style={{ flex: 1 }}>
              {editingPlan ? "Update Plan" : "Create Plan"}
            </Button>
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
