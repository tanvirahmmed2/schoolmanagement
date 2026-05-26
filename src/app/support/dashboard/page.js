"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Badge from "@/components/ui/Badge";
import { formatDate } from "@/utils/helpers";

const STATUS_COLORS = {
  open: "#f59e0b",
  in_progress: "#3b82f6",
  resolved: "#10b981",
  closed: "#94a3b8"
};

export default function SupportDashboardPage() {
  const [tickets, setTickets] = useState([]);
  const [statsData, setStatsData] = useState({ open: 0, in_progress: 0, resolved: 0, total: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [ticketsRes, statsRes] = await Promise.all([
          fetch("/api/support?pageSize=5"),
          fetch("/api/support/stats")
        ]);
        const ticketsJson = await ticketsRes.json();
        const statsJson = await statsRes.json();
        
        if (ticketsJson.success) {
          setTickets(ticketsJson.data || []);
        }
        if (statsJson.success) {
          setStatsData(statsJson.data || { open: 0, in_progress: 0, resolved: 0, total: 0 });
        }
      } catch (err) {
        console.error("Failed to load dashboard data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const stats = [
    { label: "Open Tickets", value: (statsData.open ?? 0).toString(), icon: "🟡", color: STATUS_COLORS.open },
    { label: "In Progress", value: (statsData.in_progress ?? 0).toString(), icon: "🔵", color: STATUS_COLORS.in_progress },
    { label: "Resolved", value: (statsData.resolved ?? 0).toString(), icon: "✅", color: STATUS_COLORS.resolved },
    { label: "Total Tickets", value: (statsData.total ?? 0).toString(), icon: "📋", color: "#6366f1" }
  ];

  if (loading) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <p style={{ color: "#64748b" }}>Loading support workspace...</p>
      </div>
    );
  }

  return (
    <div>
      <h1 style={{ fontSize: "1.75rem", fontWeight: 900, color: "#0f172a", letterSpacing: "-0.03em", marginBottom: "0.25rem" }}>Support Dashboard</h1>
      <p style={{ color: "#64748b", marginBottom: "2rem", fontSize: "0.9375rem" }}>Manage all institution support requests</p>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: "1rem", marginBottom: "2rem" }}>
        {stats.map((s) => (
          <div key={s.label} style={{ background: "#fff", borderRadius: "12px", border: "1px solid #e2e8f0", padding: "1.25rem 1.5rem" }}>
            <div style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>{s.icon}</div>
            <div style={{ fontSize: "1.75rem", fontWeight: 900, color: "#0f172a" }}>{s.value}</div>
            <div style={{ fontSize: "0.8125rem", color: "#64748b", fontWeight: 600 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tickets List */}
      <div style={{ background: "#fff", borderRadius: "12px", border: "1px solid #e2e8f0", padding: "1.5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
          <h2 style={{ fontWeight: 800, color: "#0f172a", fontSize: "1rem" }}>Recent Support Tickets</h2>
          <Link href="/support/tickets" style={{ fontSize: "0.875rem", color: "#6366f1", fontWeight: 700, textDecoration: "none" }}>
            View All Tickets →
          </Link>
        </div>

        {tickets.length === 0 ? (
          <p style={{ color: "#64748b", fontSize: "0.875rem", textAlign: "center", padding: "1.5rem" }}>No support tickets filed.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column" }}>
            {tickets.slice(0, 5).map((t) => (
              <div key={t.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.875rem 0", borderBottom: "1px solid #f8fafc" }}>
                <div>
                  <p style={{ fontWeight: 700, color: "#0f172a", fontSize: "0.9rem", marginBottom: "0.125rem" }}>{t.subject}</p>
                  <p style={{ fontSize: "0.8125rem", color: "#64748b" }}>
                    Institution: {t.institution_name || "Unknown"} · Submitted: {formatDate(t.created_at)}
                  </p>
                </div>
                <span style={{ padding: "0.25rem 0.75rem", borderRadius: "9999px", background: (STATUS_COLORS[t.status] || "#94a3b8") + "22", color: STATUS_COLORS[t.status] || "#94a3b8", fontWeight: 700, fontSize: "0.75rem", textTransform: "capitalize", whiteSpace: "nowrap" }}>
                  {t.status.replace("_", " ")}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
