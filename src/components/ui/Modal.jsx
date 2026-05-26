"use client";

import { useEffect, useRef } from "react";

/**
 * Modal component
 * Props: open, onClose, title, children, size? ('sm'|'md'|'lg'|'xl')
 */
export default function Modal({ open, onClose, title, children, size = "md" }) {
  const overlayRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handleKey = (e) => { if (e.key === "Escape") onClose?.(); };
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", handleKey); document.body.style.overflow = ""; };
  }, [open, onClose]);

  if (!open) return null;

  const widths = { sm: "400px", md: "540px", lg: "720px", xl: "960px" };

  return (
    <div ref={overlayRef} onClick={e => { if (e.target === overlayRef.current) onClose?.(); }}
      style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.55)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem", backdropFilter: "blur(4px)", animation: "fadeIn 0.15s ease" }}>
      <div style={{ background: "#fff", borderRadius: "16px", boxShadow: "0 25px 60px rgba(0,0,0,0.2)", width: "100%", maxWidth: widths[size], maxHeight: "90vh", display: "flex", flexDirection: "column", animation: "slideUp 0.2s ease" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1.25rem 1.5rem", borderBottom: "1px solid #f1f5f9" }}>
          <h2 style={{ fontWeight: 800, color: "#0f172a", fontSize: "1.125rem", margin: 0 }}>{title}</h2>
          <button onClick={onClose}
            style={{ background: "#f1f5f9", border: "none", borderRadius: "8px", width: "32px", height: "32px", cursor: "pointer", fontSize: "1rem", color: "#64748b", display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
        </div>
        {/* Body */}
        <div style={{ padding: "1.5rem", overflowY: "auto", flex: 1 }}>{children}</div>
      </div>
      <style>{`@keyframes fadeIn{from{opacity:0}to{opacity:1}} @keyframes slideUp{from{transform:translateY(16px);opacity:0}to{transform:translateY(0);opacity:1}}`}</style>
    </div>
  );
}
