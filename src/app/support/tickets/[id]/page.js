"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { formatDate } from "@/utils/helpers";

const STATUS_COLORS = { open:"#f59e0b", in_progress:"#3b82f6", resolved:"#10b981", closed:"#94a3b8" };

export default function TicketDetailPage() {
  const { id } = useParams();
  const [ticket, setTicket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [error, setError] = useState("");

  const chatContainerRef = useRef(null);

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };

  async function loadTicket() {
    try {
      const res = await fetch(`/api/support/${id}`);
      const json = await res.json();
      if (json.success) {
        setTicket(json.data);
        setMessages(json.data?.messages || []);
      } else {
        setError(json.message || "Failed to load ticket details");
      }
    } catch (err) {
      setError("An unexpected error occurred.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTicket();
  }, [id]);

  // Chat Polling
  useEffect(() => {
    if (!id) return;
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/support/${id}`);
        const json = await res.json();
        if (json.success) {
          if (json.data?.messages?.length !== messages.length || json.data?.status !== ticket?.status) {
            setTicket(json.data);
            setMessages(json.data?.messages || []);
          }
        }
      } catch (err) {
        console.error("Error polling ticket details:", err);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [id, messages.length, ticket?.status]);

  // Scroll to bottom when messages list updates
  useEffect(() => {
    scrollToBottom();
  }, [messages, ticket]);

  const sendReply = async () => {
    if (!reply.trim() || sending) return;
    setSending(true);
    try {
      const res = await fetch(`/api/support/${id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: reply }),
      });
      const json = await res.json();
      if (json.success) {
        setReply("");
        await loadTicket();
      } else {
        alert(json.message || "Failed to send message");
      }
    } catch (err) {
      console.error(err);
      alert("Error sending message");
    } finally {
      setSending(false);
    }
  };

  const changeStatus = async (status) => {
    if (updatingStatus) return;
    setUpdatingStatus(true);
    try {
      const res = await fetch(`/api/support/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const json = await res.json();
      if (json.success) {
        await loadTicket();
      } else {
        alert(json.message || "Failed to update status");
      }
    } catch (err) {
      console.error(err);
      alert("Error updating status");
    } finally {
      setUpdatingStatus(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <p style={{ color: "#64748b" }}>Loading ticket details...</p>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <p style={{ color: "#ef4444", fontWeight: 600 }}>{error || "Ticket not found"}</p>
        <Link href="/support/tickets" style={{ color: "#6366f1", marginTop: "1rem", display: "inline-block" }}>Back to Tickets</Link>
      </div>
    );
  }

  const allMessages = [
    {
      id: "initial",
      sender_name: ticket.user_name || "Client",
      sender_role: "client",
      message: ticket.message,
      created_at: ticket.created_at
    },
    ...messages
  ];

  return (
    <div>
      <Link href="/support/tickets" style={{ color:"#64748b", textDecoration:"none", fontSize:"0.875rem", display:"inline-block", marginBottom:"1rem" }}>← All Tickets</Link>

      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"1.5rem", flexWrap:"wrap", gap:"0.75rem" }}>
        <h1 style={{ fontSize:"1.5rem", fontWeight:900, color:"#0f172a", letterSpacing:"-0.02em", flex:1 }}>{ticket.subject}</h1>
        <div style={{ display:"flex", gap:"0.5rem" }}>
          {["in_progress","resolved","closed"].map(s=>(
            <button key={s} 
              disabled={updatingStatus || ticket.status === s}
              onClick={() => changeStatus(s)}
              style={{ padding:"0.4rem 0.875rem", borderRadius:"8px", background:ticket.status === s ? STATUS_COLORS[s] : STATUS_COLORS[s]+"22", color:ticket.status === s ? "#fff" : STATUS_COLORS[s], fontWeight:700, border:`1.5px solid ${STATUS_COLORS[s]}44`, cursor:ticket.status === s ? "default" : "pointer", fontSize:"0.75rem", textTransform:"capitalize", opacity: updatingStatus ? 0.6 : 1 }}>
              {ticket.status === s ? `Is ${s.replace("_"," ")}` : `Mark ${s.replace("_"," ")}`}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 280px", gap:"1.25rem" }}>
        {/* Thread */}
        <div style={{ background:"#fff", borderRadius:"12px", border:"1px solid #e2e8f0", overflow:"hidden", display: "flex", flexDirection: "column" }}>
          <div ref={chatContainerRef} style={{ padding:"1.5rem", display:"flex", flexDirection:"column", gap:"1.25rem", maxHeight:"480px", overflowY:"auto", flex: 1 }}>
            {allMessages.map(m=>{
              const isSupport = m.sender_role === "support" || m.sender_role === "admin";
              const senderInitials = String(m.sender_name || "").split(" ").map(n=>n[0]).join("").slice(0,2);
              return (
                <div key={m.id} style={{ display:"flex", gap:"0.875rem", flexDirection:isSupport?"row-reverse":"row" }}>
                  <div style={{ width:"36px", height:"36px", borderRadius:"50%", background:isSupport?"#6366f1":"#e2e8f0", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"0.875rem", fontWeight:800, color:isSupport?"#fff":"#475569", flexShrink:0 }}>
                    {senderInitials || "?"}
                  </div>
                  <div style={{ maxWidth:"70%" }}>
                    <div style={{ display:"flex", gap:"0.5rem", alignItems:"center", marginBottom:"0.375rem", flexDirection:isSupport?"row-reverse":"row" }}>
                      <span style={{ fontSize:"0.8125rem", fontWeight:700, color:"#0f172a" }}>{m.sender_name}</span>
                      <span style={{ fontSize:"0.75rem", color:"#94a3b8" }}>{formatDate(m.created_at)}</span>
                    </div>
                    <div style={{ background:isSupport?"#6366f1":"#f8fafc", color:isSupport?"#fff":"#334155", padding:"0.75rem 1rem", borderRadius:isSupport?"12px 4px 12px 12px":"4px 12px 12px 12px", fontSize:"0.9rem", lineHeight:1.6 }}>
                      {m.message}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          {/* Reply */}
          <div style={{ borderTop:"1px solid #f1f5f9", padding:"1rem 1.5rem", display:"flex", gap:"0.75rem" }}>
            <textarea value={reply} onChange={e=>setReply(e.target.value)} placeholder="Type your reply..." rows={2}
              style={{ flex:1, padding:"0.75rem", borderRadius:"8px", border:"1.5px solid #e2e8f0", fontSize:"0.875rem", fontFamily:"inherit", resize:"none", outline:"none", color:"#334155" }}/>
            <button onClick={sendReply} disabled={sending}
              style={{ padding:"0.75rem 1.25rem", borderRadius:"8px", background:"#6366f1", color:"#fff", fontWeight:700, border:"none", cursor:sending ? "default" : "pointer", fontSize:"0.875rem", alignSelf:"flex-end", opacity: sending ? 0.7 : 1 }}>
              {sending ? "Sending..." : "Send"}
            </button>
          </div>
        </div>

        {/* Info panel */}
        <div style={{ background:"#fff", borderRadius:"12px", border:"1px solid #e2e8f0", padding:"1.25rem", height:"fit-content" }}>
          <h3 style={{ fontWeight:800, color:"#0f172a", fontSize:"0.9375rem", marginBottom:"1rem" }}>Ticket Info</h3>
          {[
            ["Status", <span key="status" style={{color:STATUS_COLORS[ticket.status] || "#94a3b8",fontWeight:700,textTransform:"capitalize"}}>{String(ticket.status || "").replace("_", " ")}</span>],
            ["Institution", ticket.institution_name],
            ["Submitted by", ticket.user_name],
            ["Created", formatDate(ticket.created_at)]
          ].map(([k,v])=>(
            <div key={k} style={{ padding:"0.625rem 0", borderBottom:"1px solid #f8fafc", fontSize:"0.875rem" }}>
              <div style={{ color:"#64748b", fontWeight:600, marginBottom:"0.25rem" }}>{k}</div>
              <div style={{ color:"#0f172a", fontWeight:500 }}>{v}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
