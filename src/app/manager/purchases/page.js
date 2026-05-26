"use client";

import { useState, useEffect } from "react";
import DataTable from "@/components/tables/DataTable";
import Badge from "@/components/ui/Badge";
import { formatDate, formatBDT } from "@/utils/helpers";

export default function ManagerPurchasesPage() {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actioning, setActioning] = useState(null);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  async function loadPurchases() {
    try {
      const res = await fetch("/api/manager/purchases");
      const json = await res.json();
      if (json.success) {
        setPurchases(json.data || []);
      } else {
        setError(json.message || "Failed to load purchases.");
      }
    } catch (err) {
      setError("Failed to communicate with API.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPurchases();
  }, []);

  const handleAction = async (id, action) => {
    setActioning(id);
    setError("");
    setSuccessMsg("");
    try {
      const res = await fetch(`/api/manager/purchases/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action })
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMsg(`Purchase successfully ${action === "approve" ? "approved and activated" : "rejected"}!`);
        // Remove from UI list
        setPurchases(prev => prev.filter(p => p.id !== id));
        setTimeout(() => setSuccessMsg(""), 4000);
      } else {
        setError(data.message || "Failed to perform action.");
      }
    } catch (err) {
      setError("An unexpected error occurred.");
    } finally {
      setActioning(null);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this purchase request?")) return;
    setActioning(id);
    setError("");
    setSuccessMsg("");
    try {
      const res = await fetch(`/api/manager/purchases/${id}`, {
        method: "DELETE"
      });
      if (res.status === 204 || res.status === 200) {
        setSuccessMsg("Purchase request deleted successfully.");
        setPurchases(prev => prev.filter(p => p.id !== id));
        setTimeout(() => setSuccessMsg(""), 4000);
      } else {
        setError("Failed to delete purchase request.");
      }
    } catch (err) {
      setError("An unexpected error occurred.");
    } finally {
      setActioning(null);
    }
  };

  const cols = [
    {
      key: "institution_name",
      label: "Institution Details",
      render: (v, r) => (
        <div>
          <strong style={{ color: "#0f172a", fontSize: "0.9375rem" }}>{r.institution_name}</strong>
          <div style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "0.125rem", textTransform: "capitalize" }}>
            {r.institution_type} · {r.tenant_phone || "No phone"}
          </div>
        </div>
      )
    },
    {
      key: "plan_name",
      label: "Plan",
      render: (v, r) => (
        <div>
          <Badge status="info">{r.plan_name || "Custom"}</Badge>
          <div style={{ fontSize: "0.75rem", color: "#94a3b8", marginTop: "0.125rem", textTransform: "capitalize" }}>
            {r.billing_cycle || "monthly"} cycle
          </div>
        </div>
      )
    },
    {
      key: "amount",
      label: "Payment Due",
      render: (v) => <strong style={{ color: "#4f46e5" }}>{formatBDT(v)}</strong>
    },
    {
      key: "transaction_id",
      label: "bKash TxID",
      render: (v) => (
        <code style={{ background: "#f1f5f9", padding: "0.25rem 0.5rem", borderRadius: "6px", color: "#dc2626", fontWeight: 700, fontSize: "0.875rem" }}>
          {v}
        </code>
      )
    },
    {
      key: "created_at",
      label: "Submitted",
      render: (v) => formatDate(v)
    },
    {
      key: "actions",
      label: "Verification Decisions",
      render: (v, r) => (
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button
            onClick={() => handleAction(r.id, "approve")}
            disabled={actioning !== null}
            style={{
              padding: "0.4rem 0.875rem",
              borderRadius: "6px",
              background: "#10b981",
              color: "#fff",
              border: "none",
              fontWeight: 700,
              fontSize: "0.8125rem",
              cursor: "pointer",
              transition: "opacity 0.15s ease"
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = 0.85}
            onMouseLeave={e => e.currentTarget.style.opacity = 1}
          >
            Approve
          </button>
          <button
            onClick={() => handleAction(r.id, "reject")}
            disabled={actioning !== null}
            style={{
              padding: "0.4rem 0.875rem",
              borderRadius: "6px",
              background: "#f59e0b",
              color: "#fff",
              border: "none",
              fontWeight: 700,
              fontSize: "0.8125rem",
              cursor: "pointer",
              transition: "opacity 0.15s ease"
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = 0.85}
            onMouseLeave={e => e.currentTarget.style.opacity = 1}
          >
            Reject
          </button>
          <button
            onClick={() => handleDelete(r.id)}
            disabled={actioning !== null}
            style={{
              padding: "0.4rem 0.875rem",
              borderRadius: "6px",
              background: "#ef4444",
              color: "#fff",
              border: "none",
              fontWeight: 700,
              fontSize: "0.8125rem",
              cursor: "pointer",
              transition: "opacity 0.15s ease"
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = 0.85}
            onMouseLeave={e => e.currentTarget.style.opacity = 1}
          >
            Delete
          </button>
        </div>
      )
    }
  ];

  return (
    <div>
      <h1 style={{ fontSize: "1.75rem", fontWeight: 900, color: "#0f172a", letterSpacing: "-0.03em", marginBottom: "0.25rem" }}>
        Purchase Approvals
      </h1>
      <p style={{ color: "#64748b", fontSize: "0.875rem", marginBottom: "2rem" }}>
        Verify client bKash transactions and activate portals with auto-created support channels
      </p>

      {error && (
        <div style={{ padding: "0.875rem 1rem", borderRadius: "10px", background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", fontSize: "0.875rem", marginBottom: "1.5rem" }}>
          ⚠ {error}
        </div>
      )}

      {successMsg && (
        <div style={{ padding: "0.875rem 1rem", borderRadius: "10px", background: "#ecfdf5", border: "1px solid #a7f3d0", color: "#047857", fontSize: "0.875rem", marginBottom: "1.5rem" }}>
          ✓ {successMsg}
        </div>
      )}

      <div style={{ background: "#fff", borderRadius: "12px", border: "1px solid #e2e8f0", padding: "1.5rem" }}>
        {loading ? (
          <p style={{ color: "#64748b", fontSize: "0.875rem" }}>Loading verification queue...</p>
        ) : purchases.length === 0 ? (
          <p style={{ color: "#64748b", fontSize: "0.875rem", textAlign: "center", padding: "3rem 0" }}>
            No pending purchase requests awaiting verification.
          </p>
        ) : (
          <DataTable columns={cols} data={purchases} searchKey="institution_name" />
        )}
      </div>
    </div>
  );
}
