"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function ManagerDashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await fetch("/api/admin/stats");
        const json = await res.json();
        if (json.success) {
          setStats(json.data);
        }
      } catch (err) {
        console.error("Failed to load manager stats:", err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  const items = [
    { label: "Active Institutions", value: stats ? stats.totalTenants.toLocaleString() : "0", icon: "🏫", color: "#6366f1" },
    { label: "Active Subscriptions", value: stats ? stats.activeSubscriptions.toLocaleString() : "0", icon: "✅", color: "#10b981" },
    { label: "Pending Reviews", value: stats ? Math.max(0, stats.totalTenants - stats.activeSubscriptions).toLocaleString() : "0", icon: "⏳", color: "#f59e0b" },
    { label: "Open Help Tickets", value: stats ? stats.openTickets.toLocaleString() : "0", icon: "🎫", color: "#ef4444" }
  ];

  if (loading) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <p style={{ color: "#64748b" }}>Loading manager dashboard...</p>
      </div>
    );
  }

  return (
    <div>
      <h1 style={{ fontSize: "1.75rem", fontWeight: 900, color: "#0f172a", letterSpacing: "-0.03em", marginBottom: "0.25rem" }}>Manager Dashboard</h1>
      <p style={{ color: "#64748b", marginBottom: "2rem", fontSize: "0.9375rem" }}>Quick overview of tenants and platform billing</p>

      {/* Stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: "1rem", marginBottom: "2rem" }}>
        {items.map((item) => (
          <div key={item.label} style={{ background: "#fff", borderRadius: "12px", border: "1px solid #e2e8f0", padding: "1.25rem 1.5rem" }}>
            <div style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>{item.icon}</div>
            <div style={{ fontSize: "1.75rem", fontWeight: 900, color: item.color }}>{item.value}</div>
            <div style={{ fontSize: "0.8125rem", color: "#64748b", fontWeight: 600 }}>{item.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
        {[
          { label: "Manage Tenants", href: "/manager/tenants", icon: "🏫", desc: "Approve and manage school details" },
          { label: "Billing Reports", href: "/manager/billing", icon: "💳", desc: "Monitor payments and subscriptions" },
          { label: "Reports & Logs", href: "/manager/reports", icon: "📑", desc: "Download system operational reports" },
          { label: "Platform Health", href: "/api/health", icon: "💚", desc: "Check system and DB connectivity" }
        ].map((c) => (
          <Link key={c.href} href={c.href} style={{ display: "flex", gap: "1rem", padding: "1.25rem", borderRadius: "12px", border: "1px solid #e2e8f0", background: "#fff", textDecoration: "none", alignItems: "center", transition: "all 0.15s ease" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "#6366f1"; e.currentTarget.style.boxShadow = "0 4px 12px rgba(99,102,241,0.1)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.boxShadow = "none"; }}>
            <span style={{ fontSize: "1.75rem" }}>{c.icon}</span>
            <div>
              <p style={{ fontWeight: 800, color: "#0f172a", fontSize: "0.9375rem", marginBottom: "0.125rem" }}>{c.label}</p>
              <p style={{ color: "#64748b", fontSize: "0.8125rem" }}>{c.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
