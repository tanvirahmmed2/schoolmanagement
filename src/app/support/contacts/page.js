"use client";

import { useState, useEffect } from "react";
import { formatDate } from "@/utils/helpers";

const STATUS_COLORS = {
  pending: "#f59e0b",
  read: "#3b82f6",
  replied: "#10b981"
};

export default function SupportContactsPage() {
  const [submissions, setSubmissions] = useState([]);
  const [selectedSub, setSelectedSub] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Reply state
  const [replies, setReplies] = useState([]);
  const [loadingReplies, setLoadingReplies] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [sendingReply, setSendingReply] = useState(false);

  async function loadSubmissions() {
    try {
      const res = await fetch("/api/contact");
      const json = await res.json();
      if (json.success) {
        setSubmissions(json.data || []);
      }
    } catch (err) {
      console.error("Failed to load contact submissions:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSubmissions();
  }, []);

  // Fetch replies when selected submission changes
  useEffect(() => {
    if (selectedSub) {
      async function loadReplies() {
        setLoadingReplies(true);
        try {
          const res = await fetch(`/api/contact/${selectedSub.id}/replies`);
          const json = await res.json();
          if (json.success) {
            setReplies(json.data || []);
          }
        } catch (err) {
          console.error("Failed to load replies:", err);
        } finally {
          setLoadingReplies(false);
        }
      }
      loadReplies();
      setReplyText("");
    } else {
      setReplies([]);
    }
  }, [selectedSub]);

  const changeStatus = async (status) => {
    if (!selectedSub || updatingStatus) return;
    setUpdatingStatus(true);
    try {
      const res = await fetch(`/api/contact/${selectedSub.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      const json = await res.json();
      if (json.success) {
        // Update local state
        setSubmissions(prev => prev.map(s => s.id === selectedSub.id ? { ...s, status } : s));
        setSelectedSub(prev => ({ ...prev, status }));
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

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || sendingReply || !selectedSub) return;
    setSendingReply(true);
    try {
      const res = await fetch(`/api/contact/${selectedSub.id}/replies`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: replyText })
      });
      const json = await res.json();
      if (json.success) {
        // Append newly created reply to list
        setReplies(prev => [...prev, {
          ...json.data,
          sender_name: "You",
          sender_role: "Support"
        }]);
        setReplyText("");
        // Update status of submission to replied
        setSubmissions(prev => prev.map(s => s.id === selectedSub.id ? { ...s, status: "replied" } : s));
        setSelectedSub(prev => ({ ...prev, status: "replied" }));
      } else {
        alert(json.message || "Failed to send reply email");
      }
    } catch (err) {
      console.error(err);
      alert("Error sending reply");
    } finally {
      setSendingReply(false);
    }
  };

  const filtered = submissions.filter(s => {
    const matchesSearch = 
      s.name.toLowerCase().includes(search.toLowerCase()) || 
      s.email.toLowerCase().includes(search.toLowerCase()) || 
      s.institution.toLowerCase().includes(search.toLowerCase()) || 
      s.message.toLowerCase().includes(search.toLowerCase());
    
    if (filter === "all") return matchesSearch;
    return matchesSearch && s.status === filter;
  });

  return (
    <div>
      <div style={{ marginBottom: "1.5rem" }}>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 900, color: "#0f172a", letterSpacing: "-0.03em", marginBottom: "0.25rem" }}>Contact Messages</h1>
        <p style={{ color: "#64748b", fontSize: "0.875rem" }}>Review and manage queries submitted through the public contact page</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "380px 1fr", gap: "1.5rem", alignItems: "start" }}>
        {/* Left Side: Contact List */}
        <div style={{ background: "#fff", borderRadius: "12px", border: "1px solid #e2e8f0", padding: "1.25rem", minHeight: "560px", display: "flex", flexDirection: "column" }}>
          
          {/* Search */}
          <input type="text" placeholder="Search messages..." value={search} onChange={e => setSearch(e.target.value)}
            style={{ width: "100%", padding: "0.625rem 0.875rem", borderRadius: "8px", border: "1.5px solid #e2e8f0", fontSize: "0.875rem", outline: "none", color: "#334155", marginBottom: "1rem", transition: "border-color 0.15s ease" }}
            onFocus={e => e.target.style.borderColor = "#6366f1"}
            onBlur={e => e.target.style.borderColor = "#e2e8f0"}
          />

          {/* Status Filters */}
          <div style={{ display: "flex", gap: "0.375rem", marginBottom: "1rem", flexWrap: "wrap" }}>
            {["all", "pending", "read", "replied"].map(s => (
              <button key={s} onClick={() => setFilter(s)}
                style={{ padding: "0.3rem 0.75rem", borderRadius: "9999px", border: `1.5px solid ${filter === s ? "#6366f1" : "#e2e8f0"}`, background: filter === s ? "#6366f1" : "#fff", color: filter === s ? "#fff" : "#475569", fontSize: "0.75rem", fontWeight: 600, cursor: "pointer", textTransform: "capitalize", transition: "all 0.15s ease" }}>
                {s}
              </button>
            ))}
          </div>

          {/* Scrollable List */}
          <div style={{ flex: 1, overflowY: "auto", maxHeight: "450px", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {loading ? (
              <p style={{ textAlign: "center", color: "#94a3b8", fontSize: "0.875rem", padding: "2rem 0" }}>Loading messages...</p>
            ) : filtered.length === 0 ? (
              <p style={{ textAlign: "center", color: "#94a3b8", fontSize: "0.875rem", padding: "2rem 0" }}>No messages found</p>
            ) : (
              filtered.map(s => {
                const isSelected = selectedSub?.id === s.id;
                return (
                  <div key={s.id} onClick={() => setSelectedSub(s)}
                    style={{ padding: "0.875rem 1rem", borderRadius: "8px", border: isSelected ? "1.5px solid #6366f1" : "1px solid #f1f5f9", background: isSelected ? "#f5f7ff" : "#fafafa", display: "flex", flexDirection: "column", gap: "0.375rem", cursor: "pointer", transition: "all 0.15s ease" }}>
                    <div style={{ display: "flex", justifySelf: "stretch", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontWeight: 700, color: "#0f172a", fontSize: "0.875rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "180px" }}>{s.name}</span>
                      <span style={{ padding: "0.15rem 0.5rem", borderRadius: "9999px", background: (STATUS_COLORS[s.status] || "#94a3b8") + "22", color: STATUS_COLORS[s.status] || "#94a3b8", fontWeight: 700, fontSize: "0.6875rem", textTransform: "capitalize" }}>
                        {s.status}
                      </span>
                    </div>
                    <div style={{ fontSize: "0.8125rem", color: "#475569", fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.institution}</div>
                    <div style={{ fontSize: "0.75rem", color: "#94a3b8" }}>{formatDate(s.created_at)}</div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Side: Message Details */}
        <div style={{ background: "#fff", borderRadius: "12px", border: "1px solid #e2e8f0", padding: "1.5rem", minHeight: "560px", display: "flex", flexDirection: "column" }}>
          {!selectedSub ? (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", color: "#94a3b8", padding: "2rem" }}>
              <span style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>📬</span>
              <p style={{ fontSize: "0.9375rem", fontWeight: 600, color: "#475569" }}>Select a message</p>
              <p style={{ fontSize: "0.8125rem", maxWidth: "260px", marginTop: "0.25rem" }}>Click on any contact message on the left to read details and manage reply status.</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", height: "100%", flex: 1 }}>
              {/* Header */}
              <div style={{ display: "flex", justifySelf: "stretch", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "1px solid #f1f5f9", paddingBottom: "1rem", marginBottom: "1.5rem" }}>
                <div>
                  <h3 style={{ fontWeight: 800, color: "#0f172a", fontSize: "1.1rem", marginBottom: "0.25rem" }}>{selectedSub.name}</h3>
                  <a href={`mailto:${selectedSub.email}`} style={{ fontSize: "0.875rem", color: "#6366f1", textDecoration: "none", fontWeight: 600 }}>{selectedSub.email}</a>
                  {selectedSub.phone && <p style={{ fontSize: "0.8125rem", color: "#64748b", marginTop: "0.125rem" }}>Phone: {selectedSub.phone}</p>}
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.5rem" }}>
                  <span style={{ padding: "0.25rem 0.75rem", borderRadius: "9999px", background: (STATUS_COLORS[selectedSub.status] || "#94a3b8") + "22", color: STATUS_COLORS[selectedSub.status] || "#94a3b8", fontWeight: 700, fontSize: "0.75rem", textTransform: "capitalize" }}>
                    {selectedSub.status}
                  </span>
                  
                  {/* Status Actions */}
                  <div style={{ display: "flex", gap: "0.375rem" }}>
                    <button onClick={() => changeStatus("read")} disabled={updatingStatus || selectedSub.status === "read"}
                      style={{ padding: "0.25rem 0.5rem", borderRadius: "6px", background: selectedSub.status === "read" ? "#3b82f6" : "#3b82f622", color: selectedSub.status === "read" ? "#fff" : "#3b82f6", fontWeight: 700, border: "1px solid #3b82f644", cursor: selectedSub.status === "read" ? "default" : "pointer", fontSize: "0.6875rem" }}>
                      Mark Read
                    </button>
                    <button onClick={() => changeStatus("replied")} disabled={updatingStatus || selectedSub.status === "replied"}
                      style={{ padding: "0.25rem 0.5rem", borderRadius: "6px", background: selectedSub.status === "replied" ? "#10b981" : "#10b98122", color: selectedSub.status === "replied" ? "#fff" : "#10b981", fontWeight: 700, border: "1px solid #10b98144", cursor: selectedSub.status === "replied" ? "default" : "pointer", fontSize: "0.6875rem" }}>
                      Mark Replied
                    </button>
                  </div>
                </div>
              </div>

              {/* Institution details info cards */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.5rem" }}>
                <div style={{ background: "#f8fafc", padding: "0.75rem 1rem", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                  <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "#64748b", textTransform: "uppercase", marginBottom: "0.125rem" }}>Institution Name</div>
                  <div style={{ fontSize: "0.875rem", fontWeight: 700, color: "#0f172a" }}>{selectedSub.institution}</div>
                </div>
                <div style={{ background: "#f8fafc", padding: "0.75rem 1rem", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                  <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "#64748b", textTransform: "uppercase", marginBottom: "0.125rem" }}>Type</div>
                  <div style={{ fontSize: "0.875rem", fontWeight: 700, color: "#0f172a", textTransform: "capitalize" }}>{selectedSub.type}</div>
                </div>
              </div>

              {/* Message content */}
              <div style={{ flexShrink: 0 }}>
                <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "#64748b", textTransform: "uppercase", marginBottom: "0.5rem" }}>Message</div>
                <div style={{ background: "#f8fafc", padding: "1.25rem", borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "0.9rem", color: "#334155", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
                  {selectedSub.message}
                </div>
              </div>

              {/* Reply History Thread */}
              <div style={{ marginTop: "1.5rem", borderTop: "1px solid #f1f5f9", paddingTop: "1rem", flex: 1, overflowY: "auto", maxHeight: "250px" }}>
                <h4 style={{ fontSize: "0.8125rem", fontWeight: 700, color: "#475569", marginBottom: "0.75rem" }}>Reply History</h4>
                {loadingReplies ? (
                  <p style={{ fontSize: "0.8125rem", color: "#94a3b8" }}>Loading replies...</p>
                ) : replies.length === 0 ? (
                  <p style={{ fontSize: "0.8125rem", color: "#94a3b8", fontStyle: "italic" }}>No replies sent yet.</p>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                    {replies.map(r => (
                      <div key={r.id} style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "8px", padding: "0.75rem 1rem" }}>
                        <div style={{ display: "flex", justifySelf: "stretch", justifyContent: "space-between", alignItems: "center", marginBottom: "0.375rem" }}>
                          <span style={{ fontWeight: 700, fontSize: "0.8125rem", color: "#334155" }}>
                            {r.sender_name} <span style={{ fontWeight: 500, fontSize: "0.7125rem", color: "#64748b", textTransform: "capitalize" }}>({r.sender_role})</span>
                          </span>
                          <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>{formatDate(r.created_at)}</span>
                        </div>
                        <p style={{ fontSize: "0.875rem", color: "#334155", margin: 0, whiteSpace: "pre-wrap" }}>{r.message}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Reply compose form */}
              <form onSubmit={handleSendReply} style={{ marginTop: "1.5rem", borderTop: "1px solid #f1f5f9", paddingTop: "1rem" }}>
                <h4 style={{ fontSize: "0.8125rem", fontWeight: 700, color: "#475569", marginBottom: "0.5rem" }}>Send Email Reply (via Brevo)</h4>
                <textarea rows={3} placeholder="Type your reply email message here..." value={replyText} onChange={e => setReplyText(e.target.value)} required
                  style={{ width: "100%", padding: "0.625rem 0.875rem", border: "1.5px solid #e2e8f0", borderRadius: "8px", fontSize: "0.875rem", color: "#334155", fontFamily: "inherit", resize: "none", outline: "none", transition: "border-color 0.15s ease", marginBottom: "0.5rem" }}
                  onFocus={e => e.target.style.borderColor = "#6366f1"}
                  onBlur={e => e.target.style.borderColor = "#e2e8f0"}
                />
                <div style={{ display: "flex", justifySelf: "stretch", justifyContent: "space-between", alignItems: "center" }}>
                  <a href={`mailto:${selectedSub.email}?subject=Reply to inquiry: ${selectedSub.institution}`}
                    style={{ fontSize: "0.75rem", color: "#64748b", textDecoration: "underline", fontWeight: 600 }}>
                    Or open default email client
                  </a>
                  <button type="submit" disabled={sendingReply || !replyText.trim()}
                    style={{ padding: "0.45rem 1rem", borderRadius: "6px", background: "#6366f1", color: "#fff", fontWeight: 700, border: "none", cursor: (sendingReply || !replyText.trim()) ? "default" : "pointer", fontSize: "0.8125rem", opacity: (sendingReply || !replyText.trim()) ? 0.6 : 1, transition: "opacity 0.15s ease" }}>
                    {sendingReply ? "Sending..." : "✉️ Send Reply"}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
