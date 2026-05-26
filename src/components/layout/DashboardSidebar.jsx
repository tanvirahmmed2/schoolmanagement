"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

export default function DashboardSidebar({ role, nav, user }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (err) {
      console.error("Logout failed:", err);
    }
    window.location.href = "/login";
  };

  return (
    <aside style={{
      width: collapsed ? "64px" : "240px",
      minHeight: "100vh",
      background: "#0f172a",
      display: "flex",
      flexDirection: "column",
      transition: "width 0.25s ease",
      flexShrink: 0,
      position: "relative",
      zIndex: 10,
    }}>
      {/* Logo */}
      <div style={{ padding: collapsed ? "1.25rem 0" : "1.25rem 1.25rem", display: "flex", alignItems: "center", gap: "0.625rem", borderBottom: "1px solid rgba(255,255,255,0.06)", justifyContent: collapsed ? "center" : "flex-start" }}>
        <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "linear-gradient(135deg,#6366f1,#a78bfa)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: "1rem", color: "#fff", flexShrink: 0 }}>E</div>
        {!collapsed && <span style={{ fontWeight: 800, color: "#f1f5f9", fontSize: "1rem", letterSpacing: "-0.02em" }}>EduSaaS</span>}
      </div>

      {/* Role badge */}
      {!collapsed && (
        <div style={{ padding: "0.75rem 1.25rem", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <span style={{ fontSize: "0.6875rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#6366f1", background: "rgba(99,102,241,0.15)", padding: "0.25rem 0.625rem", borderRadius: "9999px" }}>
            {role}
          </span>
          {user?.name && <p style={{ fontSize: "0.8125rem", color: "#94a3b8", marginTop: "0.375rem", fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{user.name}</p>}
        </div>
      )}

      {/* Nav items */}
      <nav style={{ flex: 1, padding: collapsed ? "1rem 0" : "1rem 0.75rem", display: "flex", flexDirection: "column", gap: "0.25rem" }}>
        {nav.map((item) => {
          const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link key={item.href} href={item.href} title={item.label}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                padding: collapsed ? "0.75rem 0" : "0.625rem 0.875rem",
                borderRadius: "8px",
                textDecoration: "none",
                justifyContent: collapsed ? "center" : "flex-start",
                background: active ? "rgba(99,102,241,0.18)" : "transparent",
                color: active ? "#a5b4fc" : "#94a3b8",
                fontWeight: active ? 700 : 500,
                fontSize: "0.875rem",
                transition: "all 0.15s ease",
                borderLeft: active && !collapsed ? "3px solid #6366f1" : "3px solid transparent",
              }}
              onMouseEnter={e => { if (!active) { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.color = "#e2e8f0"; } }}
              onMouseLeave={e => { if (!active) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#94a3b8"; } }}>
              <span style={{ fontSize: "1.125rem", flexShrink: 0 }}>{item.icon}</span>
              {!collapsed && <span style={{ whiteSpace: "nowrap" }}>{item.label}</span>}
              {!collapsed && item.badge && (
                <span style={{ marginLeft: "auto", background: "#6366f1", color: "#fff", fontSize: "0.6875rem", fontWeight: 700, padding: "0.125rem 0.5rem", borderRadius: "9999px" }}>{item.badge}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Collapse toggle */}
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: "0.75rem", display: "flex", justifyContent: collapsed ? "center" : "flex-end" }}>
        <button onClick={() => setCollapsed(!collapsed)}
          style={{ background: "rgba(255,255,255,0.06)", border: "none", borderRadius: "6px", padding: "0.375rem 0.625rem", color: "#64748b", cursor: "pointer", fontSize: "0.875rem", transition: "all 0.15s ease" }}
          title={collapsed ? "Expand" : "Collapse"}>
          {collapsed ? "→" : "←"}
        </button>
      </div>

      {/* Logout button */}
      {!collapsed && (
        <div style={{ padding: "0 0.75rem 1rem" }}>
          <button onClick={handleLogout}
            style={{ display: "flex", alignItems: "center", width: "100%", gap: "0.625rem", padding: "0.625rem 0.875rem", borderRadius: "8px", border: "none", background: "transparent", color: "#64748b", fontSize: "0.875rem", fontWeight: 500, cursor: "pointer", textAlign: "left", fontFamily: "inherit" }}
            onMouseEnter={e => { e.currentTarget.style.color = "#f87171"; e.currentTarget.style.background = "rgba(248,113,113,0.08)"; }}
            onMouseLeave={e => { e.currentTarget.style.color = "#64748b"; e.currentTarget.style.background = "transparent"; }}>
            <span>🚪</span> Sign Out
          </button>
        </div>
      )}
    </aside>
  );
}
