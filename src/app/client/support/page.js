"use client";

import { useState, useEffect, useRef } from "react";
import Input from "@/components/forms/Input";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { formatDate } from "@/utils/helpers";

const STATUS_COLORS = {
  open: "#f59e0b",
  in_progress: "#3b82f6",
  resolved: "#10b981",
  closed: "#94a3b8"
};

export default function ClientSupportPage() {
  const [tickets, setTickets] = useState([]);
  const [form, setForm] = useState({ subject: "", message: "" });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  // Chat thread states
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [replyText, setReplyText] = useState("");
  const [loadingChat, setLoadingChat] = useState(false);
  const [sendingReply, setSendingReply] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const chatContainerRef = useRef(null);

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };

  // Poll active ticket details every 3 seconds
  useEffect(() => {
    if (!selectedTicket) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/support/${selectedTicket.id}`);
        const json = await res.json();
        if (json.success) {
          if (json.data?.messages?.length !== messages.length || json.data?.status !== selectedTicket?.status) {
            setSelectedTicket(json.data);
            setMessages(json.data.messages || []);
          }
        }
      } catch (err) {
        console.error("Error polling client ticket details:", err);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [selectedTicket?.id, messages.length, selectedTicket?.status]);

  // Scroll to bottom when messages list updates
  useEffect(() => {
    scrollToBottom();
  }, [messages, selectedTicket]);

  async function loadTickets() {
    try {
      const res = await fetch("/api/support");
      const json = await res.json();
      if (json.success) {
        setTickets(json.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTickets();
  }, []);

  const change = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSubmitted(false);

    try {
      const res = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: form.subject,
          message: form.message,
        })
      });
      const data = await res.json();
      if (data.success) {
        setSubmitted(true);
        setForm({ subject: "", message: "" });
        loadTickets();
        setTimeout(() => setSubmitted(false), 3000);
      } else {
        setError(data.message || "Failed to submit ticket.");
      }
    } catch (err) {
      setError("An unexpected error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  const selectTicket = async (t) => {
    setLoadingChat(true);
    try {
      const res = await fetch(`/api/support/${t.id}`);
      const json = await res.json();
      if (json.success) {
        setSelectedTicket(json.data);
        setMessages(json.data.messages || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingChat(false);
    }
  };

  const sendReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || sendingReply) return;
    setSendingReply(true);
    try {
      const res = await fetch(`/api/support/${selectedTicket.id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: replyText })
      });
      const json = await res.json();
      if (json.success) {
        setReplyText("");
        // Reload details
        const detailsRes = await fetch(`/api/support/${selectedTicket.id}`);
        const detailsJson = await detailsRes.json();
        if (detailsJson.success) {
          setSelectedTicket(detailsJson.data);
          setMessages(detailsJson.data.messages || []);
        }
        loadTickets();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSendingReply(false);
    }
  };

  const changeStatus = async (status) => {
    if (updatingStatus) return;
    setUpdatingStatus(true);
    try {
      const res = await fetch(`/api/support/${selectedTicket.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      const json = await res.json();
      if (json.success) {
        // Refresh details
        const detailsRes = await fetch(`/api/support/${selectedTicket.id}`);
        const detailsJson = await detailsRes.json();
        if (detailsJson.success) {
          setSelectedTicket(detailsJson.data);
          setMessages(detailsJson.data.messages || []);
        }
        loadTickets();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Combine initial message and thread
  const allMessages = selectedTicket ? [
    {
      id: "initial",
      sender_name: selectedTicket.user_name || "You",
      sender_role: "client",
      message: selectedTicket.message,
      created_at: selectedTicket.created_at
    },
    ...messages
  ] : [];

  return (
    <div>
      <h1 style={{ fontSize: "1.75rem", fontWeight: 900, color: "#0f172a", letterSpacing: "-0.03em", marginBottom: "0.25rem" }}>Support Workspace</h1>
      <p style={{ color: "#64748b", fontSize: "0.875rem", marginBottom: "2rem" }}>Submit support tickets or converse directly with our team</p>

      {error && (
        <div style={{ padding: "0.875rem 1rem", borderRadius: "10px", background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", fontSize: "0.875rem", marginBottom: "1.5rem" }}>
          ⚠ {error}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: "1.5rem" }}>
        {/* Left Side: Submit Form & Tickets list */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {/* New ticket form */}
          <div style={{ background: "#fff", borderRadius: "12px", border: "1px solid #e2e8f0", padding: "1.5rem" }}>
            <h2 style={{ fontWeight: 800, color: "#0f172a", fontSize: "1rem", marginBottom: "1.25rem" }}>Open a New Ticket</h2>
            {submitted && <div style={{ padding: "0.75rem 1rem", borderRadius: "8px", background: "#ecfdf5", border: "1px solid #a7f3d0", color: "#059669", fontWeight: 600, fontSize: "0.875rem", marginBottom: "1rem" }}>✓ Ticket submitted! Our support team will respond shortly.</div>}
            <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <Input id="c-subject" label="Subject" name="subject" value={form.subject} onChange={change} placeholder="Briefly describe your issue" required />
              <div>
                <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 700, color: "#374151", marginBottom: "0.5rem" }}>Message</label>
                <textarea name="message" value={form.message} onChange={change} required placeholder="Describe the issue in detail..." rows={4}
                  style={{ width: "100%", padding: "0.75rem", borderRadius: "8px", border: "1.5px solid #e2e8f0", fontSize: "0.875rem", fontFamily: "inherit", resize: "none", outline: "none", color: "#334155", boxSizing: "border-box" }} />
              </div>
              <Button type="submit" loading={submitting}>Submit Ticket</Button>
            </form>
          </div>

          {/* Existing tickets */}
          <div style={{ background: "#fff", borderRadius: "12px", border: "1px solid #e2e8f0", padding: "1.5rem" }}>
            <h2 style={{ fontWeight: 800, color: "#0f172a", fontSize: "1rem", marginBottom: "1.25rem" }}>My Tickets</h2>
            {loading ? (
              <p style={{ color: "#64748b", fontSize: "0.875rem" }}>Loading tickets...</p>
            ) : tickets.length === 0 ? (
              <p style={{ color: "#64748b", fontSize: "0.875rem" }}>No tickets submitted yet.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", maxHeight: "350px", overflowY: "auto" }}>
                {tickets.map((t) => {
                  const isSelected = selectedTicket?.id === t.id;
                  return (
                    <div key={t.id} 
                      onClick={() => selectTicket(t)}
                      style={{ padding: "0.875rem 1rem", borderRadius: "8px", border: isSelected ? "1.5px solid #6366f1" : "1px solid #f1f5f9", background: isSelected ? "#f5f7ff" : "#fafafa", display: "flex", alignItems: "center", gap: "1rem", cursor: "pointer", transition: "all 0.15s ease" }}>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontWeight: 700, color: "#0f172a", fontSize: "0.875rem", marginBottom: "0.125rem" }}>{t.subject}</p>
                        <p style={{ fontSize: "0.75rem", color: "#94a3b8" }}>{formatDate(t.created_at)}</p>
                      </div>
                      <span style={{ padding: "0.2rem 0.625rem", borderRadius: "9999px", background: (STATUS_COLORS[t.status] || "#94a3b8") + "22", color: STATUS_COLORS[t.status] || "#94a3b8", fontWeight: 700, fontSize: "0.75rem", textTransform: "capitalize", whiteSpace: "nowrap" }}>
                        {t.status.replace("_", " ")}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
            <p style={{ fontSize: "0.8125rem", color: "#94a3b8", marginTop: "1rem", textAlign: "center" }}>
              Need urgent help? Email <a href="mailto:support@edusaas.com" style={{ color: "#6366f1", fontWeight: 600 }}>support@edusaas.com</a>
            </p>
          </div>
        </div>

        {/* Right Side: Conversation Thread */}
        <div style={{ background: "#fff", borderRadius: "12px", border: "1px solid #e2e8f0", padding: "1.5rem", display: "flex", flexDirection: "column", height: "fit-content", minHeight: "560px" }}>
          {!selectedTicket ? (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", color: "#94a3b8", padding: "2rem" }}>
              <span style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>💬</span>
              <p style={{ fontSize: "0.9375rem", fontWeight: 600, color: "#475569" }}>Select a ticket</p>
              <p style={{ fontSize: "0.8125rem", maxWidth: "250px", marginTop: "0.25rem" }}>Click on any ticket on the left to read conversation threads, post replies, and update status.</p>
            </div>
          ) : loadingChat ? (
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b", fontSize: "0.875rem" }}>
              Loading messages...
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", height: "100%", flex: 1 }}>
              {/* Header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "1px solid #f1f5f9", paddingBottom: "1rem", marginBottom: "1rem" }}>
                <div>
                  <h3 style={{ fontWeight: 800, color: "#0f172a", fontSize: "1.05rem", marginBottom: "0.25rem" }}>{selectedTicket.subject}</h3>
                  <p style={{ fontSize: "0.75rem", color: "#94a3b8" }}>Ticket ID: {selectedTicket.id}</p>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.5rem" }}>
                  <Badge status={selectedTicket.status}>{selectedTicket.status}</Badge>
                  {selectedTicket.status !== "resolved" && selectedTicket.status !== "closed" && (
                    <div style={{ display: "flex", gap: "0.375rem" }}>
                      <button onClick={() => changeStatus("resolved")} disabled={updatingStatus}
                        style={{ padding: "0.25rem 0.5rem", borderRadius: "6px", background: "#10b98122", color: "#10b981", fontWeight: 700, border: "1px solid #10b98144", cursor: "pointer", fontSize: "0.6875rem" }}>
                        Resolve
                      </button>
                      <button onClick={() => changeStatus("closed")} disabled={updatingStatus}
                        style={{ padding: "0.25rem 0.5rem", borderRadius: "6px", background: "#94a3b822", color: "#475569", fontWeight: 700, border: "1px solid #94a3b844", cursor: "pointer", fontSize: "0.6875rem" }}>
                        Close
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Chat messages */}
              <div ref={chatContainerRef} style={{ flex: 1, overflowY: "auto", maxHeight: "320px", paddingRight: "0.5rem", display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "1rem" }}>
                {allMessages.map((m) => {
                  const isClient = m.sender_role === "client";
                  const senderInitials = String(m.sender_name || "").split(" ").map(n=>n[0]).join("").slice(0,2);
                  return (
                    <div key={m.id} style={{ display: "flex", gap: "0.75rem", flexDirection: isClient ? "row-reverse" : "row" }}>
                      <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: isClient ? "#6366f1" : "#e2e8f0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", fontWeight: 800, color: isClient ? "#fff" : "#475569", flexShrink: 0 }}>
                        {senderInitials || "?"}
                      </div>
                      <div style={{ maxWidth: "75%" }}>
                        <div style={{ display: "flex", gap: "0.375rem", alignItems: "center", marginBottom: "0.25rem", flexDirection: isClient ? "row-reverse" : "row" }}>
                          <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#1e293b" }}>{m.sender_name}</span>
                          <span style={{ fontSize: "0.6875rem", color: "#94a3b8" }}>{formatDate(m.created_at)}</span>
                        </div>
                        <div style={{ background: isClient ? "#6366f1" : "#f1f5f9", color: isClient ? "#fff" : "#1e293b", padding: "0.625rem 0.875rem", borderRadius: isClient ? "12px 4px 12px 12px" : "4px 12px 12px 12px", fontSize: "0.8125rem", lineHeight: 1.5 }}>
                          {m.message}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Reply form */}
              <form onSubmit={sendReply} style={{ borderTop: "1px solid #f1f5f9", paddingTop: "1rem", display: "flex", gap: "0.75rem", marginTop: "auto" }}>
                <textarea value={replyText} onChange={e => setReplyText(e.target.value)} placeholder="Type a message to reply..." rows={2} required
                  style={{ flex: 1, padding: "0.5rem 0.75rem", borderRadius: "8px", border: "1.5px solid #e2e8f0", fontSize: "0.875rem", fontFamily: "inherit", resize: "none", outline: "none", color: "#334155" }} />
                <button type="submit" disabled={sendingReply}
                  style={{ padding: "0.5rem 1rem", borderRadius: "8px", background: "#6366f1", color: "#fff", fontWeight: 700, border: "none", cursor: sendingReply ? "default" : "pointer", fontSize: "0.875rem", alignSelf: "flex-end", opacity: sendingReply ? 0.7 : 1 }}>
                  {sendingReply ? "Sending..." : "Reply"}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
