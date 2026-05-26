"use client";

import { useState, useEffect } from "react";
import { formatBDT } from "@/utils/helpers";

const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444"];

export default function AdminAnalyticsPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  async function loadAnalytics() {
    try {
      const res = await fetch("/api/admin/analytics");
      const json = await res.json();
      if (json.success) {
        setStats(json.data);
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
    return <p style={{ padding: "2rem", color: "#64748b", textAlign: "center" }}>Loading analytics...</p>;
  }

  if (!stats) {
    return <p style={{ padding: "2rem", color: "#ef4444", textAlign: "center" }}>Failed to load analytics</p>;
  }

  const { totalRevenue, totalTenants, activeSubs, avgMrr, monthlyTrend, typeBreakdown } = stats;

  const maxRevenue = Math.max(...monthlyTrend.map(m => m.revenue), 1);

  return (
    <div>
      <div style={{ marginBottom:"1.75rem" }}>
        <h1 style={{ fontSize:"1.75rem", fontWeight:900, color:"#0f172a", letterSpacing:"-0.03em" }}>Analytics</h1>
        <p style={{ color:"#64748b", fontSize:"0.875rem" }}>Platform growth, revenue, and tenant breakdown</p>
      </div>

      {/* Top KPIs */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))", gap:"1rem", marginBottom:"2rem" }}>
        {[
          ["Total Revenue",  formatBDT(totalRevenue), "💰", "#10b981"],
          ["Total Tenants",  totalTenants.toString(), "🏫", "#6366f1"],
          ["Active Subs",    activeSubs.toString(), "📋", "#0ea5e9"],
          ["Avg MRR / Tenant", formatBDT(avgMrr),"📈","#f59e0b"],
        ].map(([l,v,ic,c])=>(
          <div key={l} style={{background:"#fff",borderRadius:"12px",border:"1px solid #e2e8f0",padding:"1.25rem 1.5rem",boxShadow:"0 1px 3px rgba(0,0,0,0.04)"}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"0.75rem"}}>
              <span style={{fontSize:"1.25rem"}}>{ic}</span>
              <div style={{width:"8px",height:"8px",borderRadius:"50%",background:c}}/>
            </div>
            <div style={{fontSize:"1.5rem",fontWeight:900,color:"#0f172a",letterSpacing:"-0.03em"}}>{v}</div>
            <div style={{fontSize:"0.8125rem",color:"#64748b",fontWeight:600,marginTop:"0.25rem"}}>{l}</div>
          </div>
        ))}
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr", gap:"1.25rem" }}>
        {/* Bar chart */}
        <div style={{ background:"#fff", borderRadius:"12px", border:"1px solid #e2e8f0", padding:"1.5rem" }}>
          <h2 style={{ fontWeight:800, color:"#0f172a", marginBottom:"1.5rem", fontSize:"1rem" }}>Monthly Revenue (BDT)</h2>
          <div style={{ display:"flex", alignItems:"flex-end", gap:"0.875rem", height:"180px" }}>
            {monthlyTrend.map(m=>(
              <div key={m.month} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:"0.5rem" }}>
                <span style={{ fontSize:"0.75rem", color:"#64748b", fontWeight:700 }}>{formatBDT(m.revenue).replace("৳","")}</span>
                <div style={{ width:"100%", height:`${(m.revenue/maxRevenue)*140}px`, background:"linear-gradient(180deg,#6366f1,#a78bfa)", borderRadius:"6px 6px 0 0", transition:"height 0.3s ease", minHeight:"8px" }} />
                <span style={{ fontSize:"0.75rem", color:"#94a3b8", fontWeight:600 }}>{m.month}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Institution type breakdown */}
        <div style={{ background:"#fff", borderRadius:"12px", border:"1px solid #e2e8f0", padding:"1.5rem" }}>
          <h2 style={{ fontWeight:800, color:"#0f172a", marginBottom:"1.5rem", fontSize:"1rem" }}>By Institution Type</h2>
          <div style={{ display:"flex", flexDirection:"column", gap:"1rem" }}>
            {typeBreakdown.map((t, idx)=>(
              <div key={t.type}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"0.375rem" }}>
                  <span style={{ fontSize:"0.875rem", fontWeight:700, color:"#334155" }}>{t.type}</span>
                  <span style={{ fontSize:"0.8125rem", color:"#64748b" }}>{t.count} tenants</span>
                </div>
                <div style={{ height:"8px", background:"#f1f5f9", borderRadius:"9999px", overflow:"hidden" }}>
                  <div style={{ height:"100%", width:`${t.pct}%`, background: COLORS[idx % COLORS.length], borderRadius:"9999px", transition:"width 0.5s ease" }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
