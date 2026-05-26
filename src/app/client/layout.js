"use client";

import DashboardSidebar from "@/components/layout/DashboardSidebar";

const CLIENT_NAV = [
  { href: "/client/dashboard",  icon: "🏠", label: "Dashboard" },
  { href: "/client/billing",    icon: "💳", label: "Billing" },
  { href: "/client/settings",   icon: "⚙️", label: "Settings" },
  { href: "/client/profile",    icon: "👤", label: "Profile" },
  { href: "/client/support",    icon: "🎫", label: "Support" },
  { href: "/client/reviews",    icon: "⭐", label: "Reviews" },
];

export default function ClientLayout({ children }) {
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f8fafc", fontFamily: "var(--font-sans, Inter, sans-serif)" }}>
      <DashboardSidebar role="Institution Owner" nav={CLIENT_NAV} />
      <main style={{ flex: 1, overflow: "auto", minWidth: 0 }}>
        <div style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
          {children}
        </div>
      </main>
    </div>
  );
}
