"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import Badge from "@/components/ui/Badge";
import { formatDate, formatBDT } from "@/utils/helpers";

const STATUS_ACTIONS = {
  active:    [{ label: "Suspend", status: "suspended", color: "#f59e0b" }, { label: "Expire", status: "expired", color: "#ef4444" }],
  pending:   [{ label: "Activate", status: "active", color: "#10b981" }, { label: "Suspend", status: "suspended", color: "#f59e0b" }],
  suspended: [{ label: "Reactivate", status: "active", color: "#10b981" }],
  expired:   [{ label: "Reactivate", status: "active", color: "#10b981" }],
};

export default function TenantDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [tenant, setTenant] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  async function loadTenantDetails() {
    try {
      const res = await fetch(`/api/tenants/${id}`);
      const json = await res.json();
      if (json.success) {
        setTenant(json.data);
      } else {
        router.push("/admin/tenants");
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function loadTenantPayments() {
    try {
      const res = await fetch(`/api/payments?tenantId=${id}&pageSize=100`);
      const json = await res.json();
      if (json.success) {
        setPayments(json.data || []);
      }
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    if (id) {
      Promise.all([loadTenantDetails(), loadTenantPayments()]).finally(() => {
        setLoading(false);
      });
    }
  }, [id]);

  async function handleStatusChange(status) {
    if (actionLoading) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/tenants/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      const json = await res.json();
      if (json.success) {
        setTenant(prev => ({ ...prev, status }));
      } else {
        alert(json.message || "Failed to update tenant status");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this tenant? This action is permanent.")) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/tenants/${id}`, {
        method: "DELETE"
      });
      const json = await res.json();
      if (json.success) {
        router.push("/admin/tenants");
      } else {
        alert(json.message || "Failed to delete tenant");
        setActionLoading(false);
      }
    } catch (err) {
      console.error(err);
      setActionLoading(false);
    }
  }

  if (loading) {
    return <p style={{ padding: "2rem", color: "#64748b", textAlign: "center" }}>Loading details...</p>;
  }

  if (!tenant) {
    return <p style={{ padding: "2rem", color: "#ef4444", textAlign: "center" }}>Tenant not found</p>;
  }

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.75rem", flexWrap: "wrap" }}>
        <Link href="/admin/tenants" style={{ color: "#64748b", textDecoration: "none", fontSize: "0.875rem" }}>← Tenants</Link>
        <h1 style={{ fontSize: "1.625rem", fontWeight: 900, color: "#0f172a", letterSpacing: "-0.03em", flex: 1 }}>{tenant.institution_name}</h1>
        <Badge status={tenant.status}>{tenant.status}</Badge>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          {(STATUS_ACTIONS[tenant.status] || []).map(a => (
            <button key={a.status} onClick={() => handleStatusChange(a.status)} disabled={actionLoading}
              style={{ padding: "0.5rem 1rem", borderRadius: "8px", background: a.color, color: "#fff", fontWeight: 700, border: "none", cursor: actionLoading ? "default" : "pointer", fontSize: "0.8125rem", opacity: actionLoading ? 0.7 : 1 }}>
              {a.label}
            </button>
          ))}
          <button onClick={handleDelete} disabled={actionLoading}
            style={{ padding: "0.5rem 1rem", borderRadius: "8px", background: "#ef4444", color: "#fff", fontWeight: 700, border: "none", cursor: actionLoading ? "default" : "pointer", fontSize: "0.8125rem", opacity: actionLoading ? 0.7 : 1 }}>
            Delete Tenant
          </button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "1.25rem", marginBottom: "1.25rem" }}>
        {/* Institution Info */}
        <div style={{ background: "#fff", borderRadius: "12px", border: "1px solid #e2e8f0", padding: "1.5rem" }}>
          <h2 style={{ fontWeight: 800, color: "#0f172a", marginBottom: "1.25rem", fontSize: "1rem" }}>Institution Details</h2>
          {[
            ["Type",    tenant.institution_type],
            ["Email",   tenant.email],
            ["Phone",   tenant.phone],
            ["Country", tenant.country],
            ["Created", formatDate(tenant.created_at)],
          ].map(([k,v]) => (
            <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "0.625rem 0", borderBottom: "1px solid #f8fafc", fontSize: "0.9rem" }}>
              <span style={{ color: "#64748b", fontWeight: 600 }}>{k}</span>
              <span style={{ color: "#0f172a", textTransform: "capitalize" }}>{v || "—"}</span>
            </div>
          ))}
        </div>

        {/* Owner & Subscription */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <div style={{ background: "#fff", borderRadius: "12px", border: "1px solid #e2e8f0", padding: "1.5rem" }}>
            <h2 style={{ fontWeight: 800, color: "#0f172a", marginBottom: "1rem", fontSize: "1rem" }}>Owner</h2>
            <p style={{ fontWeight: 700, color: "#0f172a", fontSize: "0.9375rem" }}>{tenant.owner_name || "—"}</p>
            <p style={{ color: "#64748b", fontSize: "0.875rem" }}>{tenant.owner_email || "—"}</p>
          </div>
          <div style={{ background: "#fff", borderRadius: "12px", border: "1px solid #e2e8f0", padding: "1.5rem" }}>
            <h2 style={{ fontWeight: 800, color: "#0f172a", marginBottom: "1rem", fontSize: "1rem" }}>Subscription</h2>
            <p style={{ fontWeight: 700, color: "#6366f1", fontSize: "1.125rem" }}>{tenant.plan_name || "No Active Plan"}</p>
            {tenant.sub_end && <p style={{ color: "#64748b", fontSize: "0.8125rem", marginTop: "0.25rem" }}>Expires: {formatDate(tenant.sub_end)}</p>}
            {tenant.sub_status && <Badge status={tenant.sub_status} style={{ marginTop: "0.5rem" }}>{tenant.sub_status}</Badge>}
          </div>
        </div>
      </div>

      {/* Payment history */}
      <div style={{ background: "#fff", borderRadius: "12px", border: "1px solid #e2e8f0", padding: "1.5rem" }}>
        <h2 style={{ fontWeight: 800, color: "#0f172a", marginBottom: "1.25rem", fontSize: "1rem" }}>Payment History</h2>
        {payments.length === 0 ? (
          <p style={{ fontStyle: "italic", color: "#94a3b8", fontSize: "0.875rem" }}>No payment records found.</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
            <thead>
              <tr style={{ background: "#f8fafc" }}>
                {["Amount","Method","Status","Date"].map(h => (
                  <th key={h} style={{ padding: "0.625rem 1rem", textAlign: "left", fontWeight: 700, color: "#475569", fontSize: "0.8125rem", textTransform: "uppercase", letterSpacing: "0.04em" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {payments.map(p => (
                <tr key={p.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                  <td style={{ padding: "0.75rem 1rem", fontWeight: 700, color: "#0f172a" }}>{formatBDT(p.amount)}</td>
                  <td style={{ padding: "0.75rem 1rem", textTransform: "capitalize", color: "#475569" }}>{p.payment_method}</td>
                  <td style={{ padding: "0.75rem 1rem" }}><Badge status={p.status}>{p.status}</Badge></td>
                  <td style={{ padding: "0.75rem 1rem", color: "#64748b" }}>{formatDate(p.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
