"use client";

import DashboardSidebar from "@/components/layout/DashboardSidebar";

const SUPPORT_NAV = [
  { href: "/support/dashboard", icon: "🏠", label: "Dashboard" },
  { href: "/support/tickets",   icon: "🎫", label: "Tickets" },
  { href: "/support/contacts",  icon: "📬", label: "Contact Messages" },
  { href: "/support/chat",      icon: "💬", label: "Live Chat" },
];

export default function SupportLayout({ children }) {
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f8fafc", fontFamily: "var(--font-sans, Inter, sans-serif)" }}>
      <DashboardSidebar role="Support" nav={SUPPORT_NAV} />
      <main style={{ flex: 1, overflow: "auto", minWidth: 0 }}>
        <div style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
          {children}
        </div>
      </main>
    </div>
  );
}
