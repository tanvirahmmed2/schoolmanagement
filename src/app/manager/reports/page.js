"use client";

import { useState, useEffect } from "react";
import { formatBDT } from "@/utils/helpers";

export default function ManagerReportsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  async function loadAnalytics() {
    try {
      const res = await fetch("/api/admin/analytics");
      const json = await res.json();
      if (json.success && json.data) {
        setData(json.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAnalytics();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <p style={{ color: "#64748b" }}>Loading analytical reporting...</p>
      </div>
    );
  }

  const trend = data?.monthlyTrend || [];
  const MAX = Math.max(...trend.map(m => m.revenue), 1000);

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 900, color: "#0f172a", letterSpacing: "-0.03em" }}>Reports</h1>
          <p style={{ color: "#64748b", fontSize: "0.875rem" }}>Platform analytical trends and growth performance indicators</p>
        </div>
      </div>

      {/* Overview Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", marginBottom: "1.5rem" }}>
        <div style={{ background: "#fff", borderRadius: "12px", border: "1px solid #e2e8f0", padding: "1.25rem 1.5rem" }}>
          <div style={{ fontSize: "1.5rem", fontWeight: 900, color: "#10b981" }}>{formatBDT(data?.totalRevenue || 0)}</div>
          <div style={{ fontSize: "0.8125rem", color: "#64748b", fontWeight: 600, marginTop: "0.25rem" }}>Aggregated Revenue</div>
        </div>
        <div style={{ background: "#fff", borderRadius: "12px", border: "1px solid #e2e8f0", padding: "1.25rem 1.5rem" }}>
          <div style={{ fontSize: "1.5rem", fontWeight: 900, color: "#6366f1" }}>{data?.totalTenants || 0}</div>
          <div style={{ fontSize: "0.8125rem", color: "#64748b", fontWeight: 600, marginTop: "0.25rem" }}>Total Onboarded Institutions</div>
        </div>
        <div style={{ background: "#fff", borderRadius: "12px", border: "1px solid #e2e8f0", padding: "1.25rem 1.5rem" }}>
          <div style={{ fontSize: "1.5rem", fontWeight: 900, color: "#f59e0b" }}>{data?.activeSubs || 0}</div>
          <div style={{ fontSize: "0.8125rem", color: "#64748b", fontWeight: 600, marginTop: "0.25rem" }}>Active Subscriptions</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "1.5rem", marginBottom: "1.5rem" }}>
        {/* Monthly Revenue Chart */}
        <div style={{ background: "#fff", borderRadius: "12px", border: "1px solid #e2e8f0", padding: "1.5rem" }}>
          <h2 style={{ fontWeight: 800, color: "#0f172a", fontSize: "1rem", marginBottom: "1.5rem" }}>Revenue Performance Trend</h2>
          <div style={{ display: "flex", alignItems: "flex-end", gap: "1rem", height: "200px", marginBottom: "1rem" }}>
            {trend.map(m => (
              <div key={m.month} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" }}>
                <span style={{ fontSize: "0.6875rem", color: "#64748b", fontWeight: 700 }}>{(m.revenue / 1000).toFixed(0)}K</span>
                <div style={{ width: "100%", height: `${(m.revenue / MAX) * 140}px`, background: "linear-gradient(180deg,#6366f1,#a78bfa)", borderRadius: "6px 6px 0 0", minHeight: "8px" }} />
                <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>{m.month}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Institution Type Breakdown */}
        <div style={{ background: "#fff", borderRadius: "12px", border: "1px solid #e2e8f0", padding: "1.5rem" }}>
          <h2 style={{ fontWeight: 800, color: "#0f172a", fontSize: "1rem", marginBottom: "1.5rem" }}>Institution Breakdown</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            {(data?.typeBreakdown || []).map(tb => (
              <div key={tb.type}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.875rem", fontWeight: 700, color: "#334155", marginBottom: "0.375rem" }}>
                  <span>{tb.type}</span>
                  <span style={{ color: "#6366f1" }}>{tb.count} ({tb.pct}%)</span>
                </div>
                <div style={{ height: "6px", background: "#f1f5f9", borderRadius: "9999px", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${tb.pct}%`, background: "#6366f1", borderRadius: "9999px" }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ background: "#fff", borderRadius: "12px", border: "1px solid #e2e8f0", padding: "1.5rem" }}>
        <h2 style={{ fontWeight: 800, color: "#0f172a", fontSize: "1rem", marginBottom: "1rem" }}>Monthly Analytical Summary</h2>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
          <thead>
            <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
              {["Month Period", "Successful Revenue", "Onboarded Users", "Actionable Performance"].map(h => (
                <th key={h} style={{ padding: "0.75rem 1rem", textAlign: "left", fontWeight: 700, color: "#475569", fontSize: "0.8125rem", textTransform: "uppercase", letterSpacing: "0.04em" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {trend.map((m, i) => {
              const prev = trend[i - 1];
              const growth = prev && prev.revenue > 0 ? ((m.revenue - prev.revenue) / prev.revenue * 100).toFixed(1) : null;
              return (
                <tr key={m.month} style={{ borderBottom: "1px solid #f1f5f9" }}>
                  <td style={{ padding: "0.75rem 1rem", fontWeight: 700, color: "#0f172a" }}>{m.month}</td>
                  <td style={{ padding: "0.75rem 1rem", fontWeight: 700, color: "#10b981" }}>{formatBDT(m.revenue)}</td>
                  <td style={{ padding: "0.75rem 1rem", color: "#475569" }}>{m.tenants} institutions</td>
                  <td style={{ padding: "0.75rem 1rem" }}>
                    {growth ? (
                      <span style={{ color: parseFloat(growth) >= 0 ? "#10b981" : "#ef4444", fontWeight: 700 }}>
                        {parseFloat(growth) > 0 ? "+" : ""}
                        {growth}%
                      </span>
                    ) : (
                      <span style={{ color: "#94a3b8" }}>— Baseline</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
