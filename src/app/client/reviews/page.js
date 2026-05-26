"use client";

import { useState, useEffect } from "react";
import Button from "@/components/ui/Button";
import { formatDate } from "@/utils/helpers";

const STATUS_COLORS = {
  pending: { bg: "#fffbeb", text: "#b45309", label: "Pending Approval" },
  approved: { bg: "#ecfdf5", text: "#047857", label: "Approved" },
  rejected: { bg: "#fef2f2", text: "#b91c1c", label: "Rejected" }
};

export default function ClientReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [form, setForm] = useState({ rating: 5, comment: "" });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  async function loadMyReviews() {
    try {
      const res = await fetch("/api/reviews?myReviews=true");
      const json = await res.json();
      if (json.success) {
        setReviews(json.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMyReviews();
  }, []);

  const selectRating = (stars) => {
    setForm((p) => ({ ...p, rating: stars }));
  };

  const submitReview = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess(false);

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(true);
        setForm({ rating: 5, comment: "" });
        loadMyReviews();
        setTimeout(() => setSuccess(false), 4000);
      } else {
        setError(data.message || "Failed to submit review.");
      }
    } catch (err) {
      setError("An unexpected error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h1 style={{ fontSize: "1.75rem", fontWeight: 900, color: "#0f172a", letterSpacing: "-0.03em", marginBottom: "0.25rem" }}>Institution Reviews</h1>
      <p style={{ color: "#64748b", fontSize: "0.875rem", marginBottom: "2rem" }}>Share your experience with EduSaaS and help us improve</p>

      {error && (
        <div style={{ padding: "0.875rem 1rem", borderRadius: "10px", background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", fontSize: "0.875rem", marginBottom: "1.5rem" }}>
          ⚠ {error}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
        {/* Create Review Form */}
        <div style={{ background: "#fff", borderRadius: "12px", border: "1px solid #e2e8f0", padding: "1.75rem" }}>
          <h2 style={{ fontWeight: 800, color: "#0f172a", fontSize: "1rem", marginBottom: "1.25rem" }}>Write a Review</h2>
          {success && (
            <div style={{ padding: "0.75rem 1rem", borderRadius: "8px", background: "#ecfdf5", border: "1px solid #a7f3d0", color: "#059669", fontWeight: 600, fontSize: "0.875rem", marginBottom: "1.25rem" }}>
              ✓ Review submitted! It is currently pending manager approval before displaying on the landing page.
            </div>
          )}
          <form onSubmit={submitReview} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 700, color: "#374151", marginBottom: "0.5rem" }}>Rating</label>
              <div style={{ display: "flex", gap: "0.375rem" }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button key={star} type="button" onClick={() => selectRating(star)}
                    style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1.75rem", color: star <= form.rating ? "#f59e0b" : "#cbd5e1", padding: 0, outline: "none", transition: "transform 0.1s ease" }}
                    onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.15)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; }}>
                    ★
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 700, color: "#374151", marginBottom: "0.5rem" }}>Your Comments</label>
              <textarea name="comment" value={form.comment} onChange={(e) => setForm(p => ({ ...p, comment: e.target.value }))} required
                placeholder="What do you think of EduSaaS? How has it helped your school?" rows={5}
                style={{ width: "100%", padding: "0.75rem", borderRadius: "8px", border: "1.5px solid #e2e8f0", fontSize: "0.875rem", fontFamily: "inherit", resize: "vertical", outline: "none", color: "#334155", boxSizing: "border-box" }} />
            </div>

            <Button type="submit" loading={submitting}>Submit Review</Button>
          </form>
        </div>

        {/* History of Reviews */}
        <div style={{ background: "#fff", borderRadius: "12px", border: "1px solid #e2e8f0", padding: "1.75rem" }}>
          <h2 style={{ fontWeight: 800, color: "#0f172a", fontSize: "1rem", marginBottom: "1.25rem" }}>Your Feedback History</h2>
          {loading ? (
            <p style={{ color: "#64748b", fontSize: "0.875rem" }}>Loading history...</p>
          ) : reviews.length === 0 ? (
            <p style={{ color: "#64748b", fontSize: "0.875rem" }}>You haven't submitted any reviews yet.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem", maxHeight: "420px", overflowY: "auto" }}>
              {reviews.map((r) => {
                const badge = STATUS_COLORS[r.status] || { bg: "#f1f5f9", text: "#64748b", label: r.status };
                return (
                  <div key={r.id} style={{ padding: "1rem", borderRadius: "8px", border: "1px solid #f1f5f9", background: "#fafafa" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" }}>
                      <div style={{ display: "flex", gap: "0.125rem" }}>
                        {Array.from({ length: 5 }).map((_, idx) => (
                          <span key={idx} style={{ color: idx < r.rating ? "#f59e0b" : "#cbd5e1", fontSize: "0.9rem" }}>★</span>
                        ))}
                      </div>
                      <span style={{ fontSize: "0.75rem", padding: "0.15rem 0.5rem", borderRadius: "6px", fontWeight: 700, textTransform: "capitalize", background: badge.bg, color: badge.text }}>
                        {badge.label}
                      </span>
                    </div>
                    <p style={{ fontSize: "0.875rem", color: "#334155", lineHeight: 1.5, margin: "0.5rem 0" }}>
                      "{r.comment}"
                    </p>
                    <p style={{ fontSize: "0.75rem", color: "#94a3b8" }}>
                      Submitted on {formatDate(r.created_at)}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
