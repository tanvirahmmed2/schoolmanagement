"use client";

import { useState, useEffect } from "react";
import DataTable from "@/components/tables/DataTable";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import Input from "@/components/forms/Input";
import Select from "@/components/forms/Select";
import Button from "@/components/ui/Button";
import { formatDate } from "@/utils/helpers";

export default function ManagerTenantsPage() {
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTenant, setEditingTenant] = useState(null);
  const [form, setForm] = useState({
    institutionName: "",
    type: "school",
    email: "",
    phone: "",
    country: "Bangladesh",
    status: "pending"
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function loadTenants() {
    try {
      const res = await fetch("/api/tenants?pageSize=100");
      const json = await res.json();
      if (json.success) {
        setTenants(json.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTenants();
  }, []);

  const openEdit = (tenant) => {
    setEditingTenant(tenant);
    setForm({
      institutionName: tenant.institution_name || "",
      type: tenant.institution_type || "school",
      email: tenant.email || "",
      phone: tenant.phone || "",
      country: tenant.country || "Bangladesh",
      status: tenant.status || "pending"
    });
    setError("");
    setSuccess("");
    setModalOpen(true);
  };

  const saveTenant = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      // 1. Update basic tenant info
      const res = await fetch(`/api/tenants/${editingTenant.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          institutionName: form.institutionName,
          institutionType: form.type,
          email: form.email,
          phone: form.phone,
          country: form.country
        })
      });
      const data = await res.json();

      if (!data.success) {
        setError(data.message || "Failed to update tenant details");
        setSaving(false);
        return;
      }

      // 2. Update status if changed
      if (form.status !== editingTenant.status) {
        const statusRes = await fetch(`/api/tenants/${editingTenant.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: form.status })
        });
        const statusData = await statusRes.json();
        if (!statusData.success) {
          setError(statusData.message || "Failed to update status");
          setSaving(false);
          return;
        }
      }

      setSuccess("Tenant updated successfully!");
      setModalOpen(false);
      loadTenants();
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setSaving(false);
    }
  };

  const cols = [
    { key: "institution_name", label: "Institution", sortable: true },
    { key: "institution_type", label: "Type", sortable: true, render: (v) => <span style={{ textTransform: "capitalize", fontWeight: 600, color: "#475569" }}>{v}</span> },
    { key: "owner_name", label: "Owner Name", sortable: true, render: (v, r) => r.owner_name || "N/A" },
    { key: "email", label: "Contact Email", render: (v, r) => r.email },
    { key: "status", label: "Status", sortable: true, render: (v) => <Badge status={v}>{v}</Badge> },
    { key: "created_at", label: "Created Date", sortable: true, render: (v) => formatDate(v) },
    {
      key: "actions",
      label: "Actions",
      render: (v, r) => (
        <Button size="sm" onClick={() => openEdit(r)}>
          Edit Details
        </Button>
      )
    }
  ];

  return (
    <div>
      <h1 style={{ fontSize: "1.75rem", fontWeight: 900, color: "#0f172a", letterSpacing: "-0.03em", marginBottom: "0.25rem" }}>Tenants</h1>
      <p style={{ color: "#64748b", fontSize: "0.875rem", marginBottom: "1.5rem" }}>Monitor registered educational institutions and change authorization status</p>

      {success && (
        <div style={{ padding: "0.875rem 1rem", borderRadius: "10px", background: "#ecfdf5", border: "1px solid #a7f3d0", color: "#047857", fontSize: "0.875rem", marginBottom: "1.5rem" }}>
          ✓ {success}
        </div>
      )}

      <div style={{ background: "#fff", borderRadius: "12px", border: "1px solid #e2e8f0", padding: "1.5rem" }}>
        {loading ? (
          <p style={{ color: "#64748b", fontSize: "0.875rem" }}>Loading tenants...</p>
        ) : (
          <DataTable columns={cols} data={tenants} searchKey="institution_name" />
        )}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Modify Institution Details">
        <form onSubmit={saveTenant} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          {error && (
            <div style={{ padding: "0.75rem", borderRadius: "8px", background: "#fef2f2", color: "#dc2626", fontSize: "0.875rem" }}>
              {error}
            </div>
          )}

          <Input id="t-name" label="Institution Name" value={form.institutionName} onChange={e => setForm(f => ({ ...f, institutionName: e.target.value }))} required />
          
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <Select
              id="t-type"
              label="Institution Type"
              value={form.type}
              onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
              options={[
                { value: "school", label: "School" },
                { value: "college", label: "College" },
                { value: "madrasah", label: "Madrasah" },
                { value: "coaching", label: "Coaching Centre" }
              ]}
            />
            <Select
              id="t-status"
              label="Access Status"
              value={form.status}
              onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
              options={[
                { value: "pending", label: "Pending Verification" },
                { value: "active", label: "Active" },
                { value: "suspended", label: "Suspended" },
                { value: "expired", label: "Expired" }
              ]}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <Input id="t-email" label="Contact Email" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
            <Input id="t-phone" label="Phone Number" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
          </div>

          <Input id="t-country" label="Country" value={form.country} onChange={e => setForm(f => ({ ...f, country: e.target.value }))} required />

          <div style={{ display: "flex", gap: "0.75rem", marginTop: "1rem" }}>
            <Button type="submit" loading={saving} style={{ flex: 1 }}>
              Save Details
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
