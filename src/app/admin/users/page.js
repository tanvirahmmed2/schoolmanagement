"use client";

import { useState, useEffect } from "react";
import DataTable from "@/components/tables/DataTable";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import Input from "@/components/forms/Input";
import Select from "@/components/forms/Select";
import Button from "@/components/ui/Button";
import { formatDate } from "@/utils/helpers";

const ROLE_COLORS = { admin: "#6366f1", manager: "#0ea5e9", support: "#f59e0b", client: "#10b981" };
const ROLES_ORDER = ["client", "support", "manager", "admin"];

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState("all");
  
  // Invite state
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteData, setInviteData] = useState({ name: "", email: "", password: "", role: "client" });
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteError, setInviteError] = useState("");

  async function loadUsers() {
    setLoading(true);
    try {
      const filterParam = roleFilter !== "all" ? `?role=${roleFilter}&pageSize=100` : "?pageSize=100";
      const res = await fetch(`/api/users${filterParam}`);
      const json = await res.json();
      if (json.success) {
        setUsers(json.data || []);
      }
    } catch (err) {
      console.error("Failed to load users:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, [roleFilter]);

  async function toggleActive(user) {
    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !user.is_active })
      });
      const json = await res.json();
      if (json.success) {
        setUsers(prev => prev.map(u => u.id === user.id ? { ...u, is_active: !user.is_active } : u));
      } else {
        alert(json.message || "Failed to update user status");
      }
    } catch (err) {
      console.error("Error updating user active status:", err);
    }
  }

  async function changeUserRole(user, newRole) {
    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole })
      });
      const json = await res.json();
      if (json.success) {
        setUsers(prev => prev.map(u => u.id === user.id ? { ...u, role: newRole } : u));
      } else {
        alert(json.message || "Failed to update user role");
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function handleInvite(e) {
    e.preventDefault();
    setInviteLoading(true);
    setInviteError("");
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(inviteData)
      });
      const json = await res.json();
      if (json.success) {
        setInviteOpen(false);
        setInviteData({ name: "", email: "", password: "", role: "client" });
        loadUsers();
      } else {
        setInviteError(json.message || "Failed to invite user");
      }
    } catch (err) {
      console.error(err);
      setInviteError("An error occurred");
    } finally {
      setInviteLoading(false);
    }
  }

  const columns = [
    { key: "name",       label: "Name",     sortable: true },
    { key: "email",      label: "Email" },
    { key: "role",       label: "Role",     sortable: true, render: (v) => <span style={{ padding: "0.2rem 0.625rem", borderRadius: "9999px", background: ROLE_COLORS[v]+"22", color: ROLE_COLORS[v], fontWeight: 700, fontSize: "0.75rem", textTransform: "capitalize" }}>{v}</span> },
    { key: "is_active",  label: "Status",   sortable: true, render: (v) => <Badge status={v ? "active" : "suspended"}>{v ? "Active" : "Inactive"}</Badge> },
    { key: "created_at", label: "Joined",   sortable: true, render: (v) => formatDate(v) },
    { key: "actions",    label: "Promotion / Status Demotion",         render: (_, row) => {
      const roleIndex = ROLES_ORDER.indexOf(row.role);
      return (
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button
            onClick={(e) => { e.stopPropagation(); toggleActive(row); }}
            style={{ padding: "0.3rem 0.75rem", borderRadius: "6px", border: `1.5px solid ${row.is_active ? "#fecaca" : "#bbf7d0"}`, background: "#fff", color: row.is_active ? "#ef4444" : "#059669", cursor: "pointer", fontSize: "0.75rem", fontWeight: 600 }}
          >
            {row.is_active ? "Deactivate" : "Activate"}
          </button>
          
          {roleIndex < 3 && (
            <button
              onClick={(e) => { e.stopPropagation(); changeUserRole(row, ROLES_ORDER[roleIndex + 1]); }}
              style={{ padding: "0.3rem 0.75rem", borderRadius: "6px", border: "1.5px solid #bbf7d0", background: "#f0fdf4", color: "#16a34a", cursor: "pointer", fontSize: "0.75rem", fontWeight: 700 }}
            >
              Promote ↑
            </button>
          )}

          {roleIndex > 0 && (
            <button
              onClick={(e) => { e.stopPropagation(); changeUserRole(row, ROLES_ORDER[roleIndex - 1]); }}
              style={{ padding: "0.3rem 0.75rem", borderRadius: "6px", border: "1.5px solid #fed7aa", background: "#fff7ed", color: "#ea580c", cursor: "pointer", fontSize: "0.75rem", fontWeight: 700 }}
            >
              Demote ↓
            </button>
          )}
        </div>
      );
    }},
  ];

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 900, color: "#0f172a", letterSpacing: "-0.03em" }}>Users</h1>
          <p style={{ color: "#64748b", fontSize: "0.875rem" }}>All SaaS platform users — admins, managers, support agents, and clients</p>
        </div>
        <button onClick={() => setInviteOpen(true)} style={{ padding: "0.625rem 1.25rem", borderRadius: "8px", background: "linear-gradient(135deg,#6366f1,#a78bfa)", color: "#fff", fontWeight: 700, border: "none", cursor: "pointer", fontSize: "0.875rem" }}>
          + Invite User
        </button>
      </div>

      {/* Role filter */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.25rem" }}>
        {["all", "admin", "manager", "support", "client"].map(r => (
          <button key={r} onClick={() => setRoleFilter(r)}
            style={{ padding: "0.375rem 0.875rem", borderRadius: "9999px", border: `1.5px solid ${roleFilter === r ? "#6366f1" : "#e2e8f0"}`, background: roleFilter === r ? "#6366f1" : "#fff", color: roleFilter === r ? "#fff" : "#475569", fontSize: "0.8125rem", fontWeight: 600, cursor: "pointer", textTransform: "capitalize" }}>
            {r}
          </button>
        ))}
      </div>

      <DataTable columns={columns} data={users} searchKey="name" emptyText="No users found" loading={loading} />

      {/* Invite Modal */}
      <Modal open={inviteOpen} onClose={() => setInviteOpen(false)} title="Invite User">
        <form onSubmit={handleInvite} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <Input label="Name" required value={inviteData.name} onChange={e => setInviteData(p => ({ ...p, name: e.target.value }))} />
          <Input label="Email" type="email" required value={inviteData.email} onChange={e => setInviteData(p => ({ ...p, email: e.target.value }))} />
          <Input label="Password" type="password" required value={inviteData.password} onChange={e => setInviteData(p => ({ ...p, password: e.target.value }))} />
          <Select label="Role" value={inviteData.role} onChange={e => setInviteData(p => ({ ...p, role: e.target.value }))}
            options={[
              { value: "admin", label: "Admin" },
              { value: "manager", label: "Manager" },
              { value: "support", label: "Support" },
              { value: "client", label: "Client" },
            ]}
          />
          {inviteError && <p style={{ color: "#ef4444", fontSize: "0.8125rem" }}>{inviteError}</p>}
          <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.5rem" }}>
            <Button type="submit" loading={inviteLoading} style={{ flex: 1 }}>Invite</Button>
            <Button type="button" variant="secondary" onClick={() => setInviteOpen(false)} style={{ flex: 1 }}>Cancel</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
