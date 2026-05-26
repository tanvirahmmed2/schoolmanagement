"use client";

export default function SupportChatPage() {
  return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", minHeight:"60vh", flexDirection:"column", gap:"1rem", textAlign:"center" }}>
      <div style={{ fontSize:"3.5rem" }}>💬</div>
      <h1 style={{ fontSize:"1.75rem", fontWeight:900, color:"#0f172a", letterSpacing:"-0.03em" }}>Live Chat</h1>
      <p style={{ color:"#64748b", fontSize:"0.9375rem", maxWidth:"420px", lineHeight:1.7 }}>
        Real-time live chat with institution clients.<br />
        Integrate with Crisp, Intercom, or Tawk.to via the API for live sessions.
      </p>
      <div style={{ padding:"1rem 1.5rem", borderRadius:"10px", background:"#f8fafc", border:"1px solid #e2e8f0", fontSize:"0.875rem", color:"#64748b", fontFamily:"monospace" }}>
        Coming soon — WebSocket or third-party chat integration
      </div>
    </div>
  );
}
