"use client";

import DashboardSidebar from "@/components/layout/DashboardSidebar";

const MANAGER_NAV = [
  { href: "/manager/dashboard", icon: "📊", label: "Dashboard" },
  { href: "/manager/purchases", icon: "📥", label: "Purchases" },
  { href: "/manager/tenants",   icon: "🏫", label: "Tenants" },
  { href: "/manager/plans",     icon: "📦", label: "Plans" },
  { href: "/manager/reports",   icon: "📑", label: "Reports" },
  { href: "/manager/billing",   icon: "💳", label: "Billing" },
  { href: "/manager/reviews",   icon: "⭐", label: "Reviews" },
];

export default function ManagerLayout({ children }) {
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f8fafc", fontFamily: "var(--font-sans, Inter, sans-serif)" }}>
      <DashboardSidebar role="Manager" nav={MANAGER_NAV} />
      <main style={{ flex: 1, overflow: "auto", minWidth: 0 }}>
        <div style={{ padding: "2rem", maxWidth: "1400px", margin: "0 auto" }}>
          {children}
        </div>
      </main>
    </div>
  );
}
