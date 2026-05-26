"use client";

import { useState, useEffect } from "react";
import DataTable from "@/components/tables/DataTable";
import Badge from "@/components/ui/Badge";
import { formatDate, formatBDT } from "@/utils/helpers";

const COLS = [
  { key: "institution_name", label: "Institution", sortable: true },
  { key: "amount",           label: "Amount",       sortable: true, render: v => <span style={{ fontWeight: 700 }}>{formatBDT(v)}</span> },
  { key: "payment_method",   label: "Method",       render: v => <span style={{ textTransform: "capitalize", fontWeight: 600, color: "#475569" }}>{v ? v.replace("_", " ") : "N/A"}</span> },
  { key: "transaction_id",   label: "Transaction ID", render: v => <code style={{ color: "#e11d48", fontWeight: 600 }}>{v || "N/A"}</code> },
  { key: "status",           label: "Status",       sortable: true, render: v => <Badge status={v}>{v}</Badge> },
  { key: "created_at",       label: "Date",         sortable: true, render: v => formatDate(v) },
];

export default function ManagerBillingPage() {
  const [payments, setPayments] = useState([]);
  const [summary, setSummary] = useState({ total_revenue: 0, pending_revenue: 0 });
  const [loading, setLoading] = useState(true);

  async function loadBillingData() {
    try {
      const [paymentsRes, summaryRes] = await Promise.all([
        fetch("/api/payments?pageSize=100"),
        fetch("/api/payments?summary=true")
      ]);
      const paymentsJson = await paymentsRes.json();
      const summaryJson = await summaryRes.json();

      if (paymentsJson.success) {
        setPayments(paymentsJson.data || []);
      }
      if (summaryJson.success && summaryJson.data) {
        setSummary(summaryJson.data);
      }
    } catch (err) {
      console.error("Failed to load billing:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadBillingData();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <p style={{ color: "#64748b" }}>Loading billing history...</p>
      </div>
    );
  }

  return (
    <div>
      <h1 style={{ fontSize: "1.75rem", fontWeight: 900, color: "#0f172a", letterSpacing: "-0.03em", marginBottom: "0.25rem" }}>Billing</h1>
      <p style={{ color: "#64748b", fontSize: "0.875rem", marginBottom: "1.5rem" }}>Platform payment monitoring and transaction logs</p>

      <div style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem" }}>
        <div style={{ background: "#fff", borderRadius: "10px", border: "1px solid #e2e8f0", padding: "1rem 1.25rem", flex: 1 }}>
          <div style={{ fontSize: "1.375rem", fontWeight: 900, color: "#10b981" }}>{formatBDT(summary.total_revenue || 0)}</div>
          <div style={{ fontSize: "0.8125rem", color: "#64748b", fontWeight: 600 }}>Total Collected (Successful)</div>
        </div>
        <div style={{ background: "#fff", borderRadius: "10px", border: "1px solid #e2e8f0", padding: "1rem 1.25rem", flex: 1 }}>
          <div style={{ fontSize: "1.375rem", fontWeight: 900, color: "#f59e0b" }}>{formatBDT(summary.pending_revenue || 0)}</div>
          <div style={{ fontSize: "0.8125rem", color: "#64748b", fontWeight: 600 }}>Pending Revenue (In Verification)</div>
        </div>
      </div>

      <div style={{ background: "#fff", borderRadius: "12px", border: "1px solid #e2e8f0", padding: "1.5rem" }}>
        <DataTable columns={COLS} data={payments} searchKey="institution_name" />
      </div>
    </div>
  );
}
