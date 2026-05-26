"use client";

import DashboardSidebar from "@/components/layout/DashboardSidebar";

const ADMIN_NAV = [
  { href: "/admin/dashboard",     icon: "📊", label: "Dashboard" },
  { href: "/admin/tenants",       icon: "🏫", label: "Tenants" },
  { href: "/admin/users",         icon: "👥", label: "Users" },
  { href: "/admin/subscriptions", icon: "📋", label: "Subscriptions" },
  { href: "/admin/payments",      icon: "💳", label: "Payments" },
  { href: "/admin/analytics",     icon: "📈", label: "Analytics" },
  { href: "/admin/settings",      icon: "⚙️", label: "Settings" },
];

export default function AdminLayout({ children }) {
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f8fafc", fontFamily: "var(--font-sans, Inter, sans-serif)" }}>
      <DashboardSidebar role="Super Admin" nav={ADMIN_NAV} />
      <main style={{ flex: 1, overflow: "auto", minWidth: 0 }}>
        <div style={{ padding: "2rem", maxWidth: "1400px", margin: "0 auto" }}>
          {children}
        </div>
      </main>
    </div>
  );
}
