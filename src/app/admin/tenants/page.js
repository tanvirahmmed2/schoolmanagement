"use client";

import { useState, useEffect } from "react";
import DataTable from "@/components/tables/DataTable";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import Input from "@/components/forms/Input";
import Select from "@/components/forms/Select";
import Button from "@/components/ui/Button";
import Link from "next/link";
import { formatDate } from "@/utils/helpers";

export default function AdminTenantsPage() {
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState(null);

  // Add Tenant Modal state
  const [addOpen, setAddOpen] = useState(false);
  const [addData, setAddData] = useState({ institutionName: "", institutionType: "school", ownerUserId: "", email: "", phone: "", country: "Bangladesh" });
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState("");
  const [clients, setClients] = useState([]);

  async function loadTenants() {
    setLoading(true);
    try {
      const statusParam = filter !== "all" ? `?status=${filter}&pageSize=100` : "?pageSize=100";
      const res = await fetch(`/api/tenants${statusParam}`);
      const json = await res.json();
      if (json.success) {
        setTenants(json.data || []);
      }
    } catch (err) {
      console.error("Failed to load tenants:", err);
    } finally {
      setLoading(false);
    }
  }

  async function loadClients() {
    try {
      const res = await fetch("/api/users?role=client&pageSize=100");
      const json = await res.json();
      if (json.success) {
        setClients(json.data || []);
      }
    } catch (err) {
      console.error("Failed to load clients:", err);
    }
  }

  useEffect(() => {
    loadTenants();
  }, [filter]);

  useEffect(() => {
    if (addOpen) {
      loadClients();
    }
  }, [addOpen]);

  async function handleAddTenant(e) {
    e.preventDefault();
    setAddLoading(true);
    setAddError("");
    try {
      const res = await fetch("/api/tenants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(addData)
      });
      const json = await res.json();
      if (json.success) {
        setAddOpen(false);
        setAddData({ institutionName: "", institutionType: "school", ownerUserId: "", email: "", phone: "", country: "Bangladesh" });
        loadTenants();
      } else {
        setAddError(json.message || "Failed to create tenant");
      }
    } catch (err) {
      console.error(err);
      setAddError("An error occurred");
    } finally {
      setAddLoading(false);
    }
  }

  const columns = [
    { key: "institution_name", label: "Institution",  sortable: true },
    { key: "institution_type", label: "Type",         sortable: true, render: (v) => <span style={{ textTransform: "capitalize", fontSize: "0.8125rem", fontWeight: 600, color: "#475569" }}>{v}</span> },
    { key: "owner_name",       label: "Owner",        sortable: true, render: (_, row) => row.owner_name || row.owner_email || "—" },
    { key: "email",            label: "Email" },
    { key: "status",           label: "Status",       sortable: true, render: (v) => <Badge status={v}>{v}</Badge> },
    { key: "created_at",       label: "Created",      sortable: true, render: (v) => formatDate(v) },
    { key: "actions",          label: "",             render: (_, row) => <Link href={`/admin/tenants/${row.id}`} onClick={e => e.stopPropagation()} style={{ color: "#6366f1", fontSize: "0.8125rem", fontWeight: 700, textDecoration: "none" }}>View →</Link> },
  ];

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifySelf: "stretch", justifyContent: "space-between", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 900, color: "#0f172a", letterSpacing: "-0.03em" }}>Tenants</h1>
          <p style={{ color: "#64748b", fontSize: "0.875rem" }}>Manage all institutions on the platform</p>
        </div>
        <button onClick={() => setAddOpen(true)} style={{ padding: "0.625rem 1.25rem", borderRadius: "8px", background: "linear-gradient(135deg,#6366f1,#a78bfa)", color: "#fff", fontWeight: 700, border: "none", cursor: "pointer", fontSize: "0.875rem" }}>
          + Add Tenant
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.25rem", flexWrap: "wrap" }}>
        {["all", "pending", "active", "suspended", "expired"].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            style={{ padding: "0.375rem 0.875rem", borderRadius: "9999px", border: `1.5px solid ${filter === s ? "#6366f1" : "#e2e8f0"}`, background: filter === s ? "#6366f1" : "#fff", color: filter === s ? "#fff" : "#475569", fontSize: "0.8125rem", fontWeight: 600, cursor: "pointer", textTransform: "capitalize" }}>
            {s}
          </button>
        ))}
      </div>

      <DataTable columns={columns} data={tenants} searchKey="institution_name" onRowClick={setSelected} loading={loading} />

      {/* Quick view Modal */}
      <Modal open={!!selected} onClose={() => setSelected(null)} title={selected?.institution_name || ""}>
        {selected && (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem", fontSize: "0.9375rem" }}>
            {[
              ["Type",    selected.institution_type],
              ["Owner",   selected.owner_name || selected.owner_email || "—"],
              ["Email",   selected.email],
              ["Status",  selected.status],
              ["Created", formatDate(selected.created_at)],
            ].map(([k, v]) => (
              <div key={k} style={{ display: "flex", justifyContent: "space-between", paddingBottom: "0.75rem", borderBottom: "1px solid #f1f5f9" }}>
                <span style={{ color: "#64748b", fontWeight: 600 }}>{k}</span>
                <span style={{ color: "#0f172a", fontWeight: 700, textTransform: "capitalize" }}>{v}</span>
              </div>
            ))}
            <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.5rem" }}>
              <Link href={`/admin/tenants/${selected.id}`} style={{ flex: 1, textAlign: "center", padding: "0.75rem", borderRadius: "8px", background: "#6366f1", color: "#fff", fontWeight: 700, textDecoration: "none", fontSize: "0.875rem" }}>Full Details</Link>
              <button onClick={() => setSelected(null)} style={{ flex: 1, padding: "0.75rem", borderRadius: "8px", border: "1.5px solid #e2e8f0", background: "#fff", color: "#475569", fontWeight: 600, cursor: "pointer", fontSize: "0.875rem" }}>Close</button>
            </div>
          </div>
        )}
      </Modal>

      {/* Add Tenant Modal */}
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add Tenant">
        <form onSubmit={handleAddTenant} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <Input label="Institution Name" required value={addData.institutionName} onChange={e => setAddData(p => ({ ...p, institutionName: e.target.value }))} />
          
          <Select label="Institution Type" value={addData.institutionType} onChange={e => setAddData(p => ({ ...p, institutionType: e.target.value }))}
            options={[
              { value: "school", label: "School" },
              { value: "college", label: "College" },
              { value: "madrasah", label: "Madrasah" },
              { value: "coaching", label: "Coaching" },
            ]}
          />

          <Select label="Owner User" required value={addData.ownerUserId} onChange={e => setAddData(p => ({ ...p, ownerUserId: e.target.value }))}
            options={clients.map(c => ({ value: c.id, label: `${c.name} (${c.email})` }))}
            placeholder={clients.length === 0 ? "No client users found" : "Select an owner"}
            hint={clients.length === 0 ? "You must invite/create a 'client' user first." : undefined}
          />

          <Input label="Email" type="email" required value={addData.email} onChange={e => setAddData(p => ({ ...p, email: e.target.value }))} />
          <Input label="Phone" value={addData.phone} onChange={e => setAddData(p => ({ ...p, phone: e.target.value }))} />
          <Input label="Country" required value={addData.country} onChange={e => setAddData(p => ({ ...p, country: e.target.value }))} />

          {addError && <p style={{ color: "#ef4444", fontSize: "0.8125rem" }}>{addError}</p>}
          
          <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.5rem" }}>
            <Button type="submit" loading={addLoading} style={{ flex: 1 }}>Create Tenant</Button>
            <Button type="button" variant="secondary" onClick={() => setAddOpen(false)} style={{ flex: 1 }}>Cancel</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
