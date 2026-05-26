"use client";

import { useState, useEffect } from "react";
import { formatDate } from "@/utils/helpers";

export default function ManagerReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("pending");
  const [actioning, setActioning] = useState(null);
  const [error, setError] = useState("");

  async function loadAllReviews() {
    try {
      // Fetching all reviews of the activeTab status
      const res = await fetch(`/api/reviews?status=${activeTab}`);
      const json = await res.json();
      if (json.success) {
        setReviews(json.data || []);
      } else {
        setError(json.message || "Failed to load reviews.");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to communicate with database.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    setLoading(true);
    loadAllReviews();
  }, [activeTab]);

  const updateStatus = async (reviewId, newStatus) => {
    setActioning(reviewId);
    setError("");
    try {
      const res = await fetch(`/api/reviews/${reviewId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        // Remove from list or refresh
        setReviews((prev) => prev.filter((r) => r.id !== reviewId));
      } else {
        setError(data.message || "Failed to update review status.");
      }
    } catch (err) {
      setError("An unexpected error occurred.");
    } finally {
      setActioning(null);
    }
  };

  const tabs = [
    { key: "pending", label: "Pending Review", count: reviews.filter((r) => r.status === "pending").length },
    { key: "approved", label: "Approved Testimonials", count: reviews.filter((r) => r.status === "approved").length },
    { key: "rejected", label: "Rejected Reviews", count: reviews.filter((r) => r.status === "rejected").length }
  ];

  return (
    <div>
      <h1 style={{ fontSize: "1.75rem", fontWeight: 900, color: "#0f172a", letterSpacing: "-0.03em", marginBottom: "0.25rem" }}>Review Moderation</h1>
      <p style={{ color: "#64748b", fontSize: "0.875rem", marginBottom: "2rem" }}>Approve client testimonials to display them on the homepage</p>

      {error && (
        <div style={{ padding: "0.875rem 1rem", borderRadius: "10px", background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", fontSize: "0.875rem", marginBottom: "1.5rem" }}>
          ⚠ {error}
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: "flex", gap: "0.5rem", borderBottom: "2px solid #e2e8f0", marginBottom: "1.5rem" }}>
        {["pending", "approved", "rejected"].map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            style={{
              padding: "0.75rem 1.25rem",
              background: "none",
              border: "none",
              borderBottom: activeTab === tab ? "3px solid #6366f1" : "3px solid transparent",
              color: activeTab === tab ? "#6366f1" : "#64748b",
              fontWeight: 700,
              fontSize: "0.9375rem",
              cursor: "pointer",
              transition: "all 0.15s ease",
              textTransform: "capitalize",
              marginBottom: "-2px"
            }}>
            {tab}
          </button>
        ))}
      </div>

      {/* Reviews Queue */}
      <div style={{ background: "#fff", borderRadius: "12px", border: "1px solid #e2e8f0", padding: "1.5rem" }}>
        {loading ? (
          <p style={{ color: "#64748b", fontSize: "0.875rem" }}>Loading queue...</p>
        ) : reviews.length === 0 ? (
          <p style={{ color: "#64748b", fontSize: "0.875rem", textAlign: "center", padding: "2rem 0" }}>
            No {activeTab} reviews found.
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            {reviews.map((r) => (
              <div key={r.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1.25rem", borderRadius: "10px", border: "1px solid #f1f5f9", background: "#fafafa" }}>
                <div style={{ flex: 1, paddingRight: "1.5rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
                    <div style={{ display: "flex", gap: "0.125rem" }}>
                      {Array.from({ length: 5 }).map((_, idx) => (
                        <span key={idx} style={{ color: idx < r.rating ? "#f59e0b" : "#cbd5e1", fontSize: "0.9rem" }}>★</span>
                      ))}
                    </div>
                    <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>·</span>
                    <span style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 700 }}>
                      {r.institution_name} ({r.institution_type})
                    </span>
                  </div>
                  <p style={{ fontSize: "0.9375rem", color: "#1e293b", fontStyle: "italic", lineHeight: 1.5, marginBottom: "0.5rem" }}>
                    "{r.comment}"
                  </p>
                  <p style={{ fontSize: "0.75rem", color: "#94a3b8" }}>
                    Submitted by: <strong style={{ color: "#64748b" }}>{r.user_name}</strong> ({r.user_email}) on {formatDate(r.created_at)}
                  </p>
                </div>

                <div style={{ display: "flex", gap: "0.5rem", flexShrink: 0 }}>
                  {activeTab !== "approved" && (
                    <button onClick={() => updateStatus(r.id, "approved")} disabled={actioning === r.id}
                      style={{ padding: "0.5rem 1rem", borderRadius: "6px", background: "#10b981", color: "#fff", border: "none", fontWeight: 700, fontSize: "0.8125rem", cursor: "pointer", transition: "opacity 0.15s ease" }}
                      onMouseEnter={(e) => { e.currentTarget.style.opacity = 0.85; }}
                      onMouseLeave={(e) => { e.currentTarget.style.opacity = 1; }}>
                      Approve
                    </button>
                  )}
                  {activeTab !== "rejected" && (
                    <button onClick={() => updateStatus(r.id, "rejected")} disabled={actioning === r.id}
                      style={{ padding: "0.5rem 1rem", borderRadius: "6px", background: "#ef4444", color: "#fff", border: "none", fontWeight: 700, fontSize: "0.8125rem", cursor: "pointer", transition: "opacity 0.15s ease" }}
                      onMouseEnter={(e) => { e.currentTarget.style.opacity = 0.85; }}
                      onMouseLeave={(e) => { e.currentTarget.style.opacity = 1; }}>
                      Reject
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
