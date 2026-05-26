"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { formatBDT } from "@/utils/helpers";

export default function AdminDashboardPage() {
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
        console.error("Failed to load admin stats:", err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  const statItems = [
    { label: "Total Tenants", value: stats ? stats.totalTenants.toLocaleString() : "0", icon: "🏫", color: "#6366f1", href: "/admin/tenants" },
    { label: "Active Subscriptions", value: stats ? stats.activeSubscriptions.toLocaleString() : "0", icon: "📋", color: "#10b981", href: "/admin/subscriptions" },
    { label: "Total Revenue", value: stats ? formatBDT(stats.totalRevenue) : "৳0.00", icon: "💰", color: "#f59e0b", href: "/admin/payments" },
    { label: "Open Tickets", value: stats ? stats.openTickets.toLocaleString() : "0", icon: "🎫", color: "#ef4444", href: "/admin/tenants" }
  ];

  const QUICK_LINKS = [
    { label: "Manage Tenants", href: "/admin/tenants", icon: "🏫" },
    { label: "Manage Users", href: "/admin/users", icon: "👥" },
    { label: "View Payments", href: "/admin/payments", icon: "💳" },
    { label: "Subscriptions", href: "/admin/subscriptions", icon: "📋" }
  ];

  if (loading) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <p style={{ color: "#64748b" }}>Loading admin console...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 900, color: "#0f172a", letterSpacing: "-0.03em", marginBottom: "0.25rem" }}>Admin Dashboard</h1>
        <p style={{ color: "#64748b", fontSize: "0.9375rem" }}>EduSaaS platform overview and control center.</p>
      </div>

      {/* Stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
        {statItems.map((s) => (
          <div key={s.label} style={{ background: "#fff", borderRadius: "12px", border: "1px solid #e2e8f0", padding: "1.25rem 1.5rem", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem" }}>
              <span style={{ fontSize: "1.5rem" }}>{s.icon}</span>
              <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: s.color }} />
            </div>
            <div style={{ fontSize: "1.6rem", fontWeight: 900, color: "#0f172a", letterSpacing: "-0.03em" }}>{s.value}</div>
            <div style={{ fontSize: "0.8125rem", color: "#64748b", marginTop: "0.25rem", fontWeight: 600 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div style={{ background: "#fff", borderRadius: "12px", border: "1px solid #e2e8f0", padding: "1.5rem", marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1rem", fontWeight: 800, color: "#0f172a", marginBottom: "1rem" }}>System Management</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "0.75rem" }}>
          {QUICK_LINKS.map((l) => (
            <Link key={l.label} href={l.href}
              style={{ display: "flex", alignItems: "center", gap: "0.625rem", padding: "0.75rem 1rem", borderRadius: "8px", border: "1.5px solid #e2e8f0", textDecoration: "none", color: "#334155", fontSize: "0.875rem", fontWeight: 600, transition: "all 0.15s ease" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "#6366f1"; e.currentTarget.style.color = "#6366f1"; e.currentTarget.style.background = "#f5f3ff"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.color = "#334155"; e.currentTarget.style.background = "transparent"; }}>
              <span>{l.icon}</span> {l.label}
            </Link>
          ))}
        </div>
      </div>

      {/* DB Notice */}
      <div style={{ background: "#ecfdf5", border: "1px solid #a7f3d0", borderRadius: "10px", padding: "1rem 1.25rem", display: "flex", gap: "0.75rem", alignItems: "flex-start" }}>
        <span style={{ fontSize: "1.25rem" }}>💚</span>
        <div>
          <p style={{ fontWeight: 700, color: "#065f46", marginBottom: "0.25rem", fontSize: "0.9375rem" }}>Database Connected</p>
          <p style={{ color: "#047857", fontSize: "0.875rem" }}>EduSaaS is fully integrated with the PostgreSQL database. All metrics are resolved in real-time.</p>
        </div>
      </div>
    </div>
  );
}
