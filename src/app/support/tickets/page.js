"use client";

import { useState, useEffect } from "react";
import DataTable from "@/components/tables/DataTable";
import { formatDate } from "@/utils/helpers";
import Link from "next/link";

const STATUS_COLORS = { open:"#f59e0b", in_progress:"#3b82f6", resolved:"#10b981", closed:"#94a3b8" };

const COLS = [
  { key:"subject",          label:"Subject",      sortable:true },
  { key:"institution_name", label:"Institution",  sortable:true },
  { key:"user_name",        label:"Submitted by" },
  { key:"status",           label:"Status",       sortable:true, render:v=><span style={{ padding:"0.2rem 0.75rem", borderRadius:"9999px", background:(STATUS_COLORS[v] || "#94a3b8")+"22", color:STATUS_COLORS[v] || "#94a3b8", fontWeight:700, fontSize:"0.75rem", textTransform:"capitalize" }}>{String(v || "").replace("_"," ")}</span> },
  { key:"created_at",       label:"Created",      sortable:true, render:v=>formatDate(v) },
  { key:"actions",          label:"",             render:(_,r)=><Link href={`/support/tickets/${r.id}`} style={{ color:"#6366f1", fontWeight:700, fontSize:"0.8125rem", textDecoration:"none" }}>Open →</Link> },
];

export default function SupportTicketsPage() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    async function loadTickets() {
      try {
        const res = await fetch("/api/support?pageSize=100");
        const json = await res.json();
        if (json.success) {
          setTickets(json.data || []);
        }
      } catch (err) {
        console.error("Failed to load tickets:", err);
      } finally {
        setLoading(false);
      }
    }
    loadTickets();
  }, []);

  const filtered = filter === "all" ? tickets : tickets.filter(t => t.status === filter);

  return (
    <div>
      <h1 style={{ fontSize:"1.75rem", fontWeight:900, color:"#0f172a", letterSpacing:"-0.03em", marginBottom:"0.25rem" }}>Tickets</h1>
      <p style={{ color:"#64748b", fontSize:"0.875rem", marginBottom:"1.25rem" }}>All support tickets across institutions</p>
      <div style={{ display:"flex", gap:"0.5rem", marginBottom:"1.25rem", flexWrap:"wrap" }}>
        {["all","open","in_progress","resolved","closed"].map(s=>(
          <button key={s} onClick={()=>setFilter(s)}
            style={{ padding:"0.375rem 0.875rem", borderRadius:"9999px", border:`1.5px solid ${filter===s?"#6366f1":"#e2e8f0"}`, background:filter===s?"#6366f1":"#fff", color:filter===s?"#fff":"#475569", fontSize:"0.8125rem", fontWeight:600, cursor:"pointer", textTransform:"capitalize" }}>
            {s.replace("_"," ")}
          </button>
        ))}
      </div>
      <DataTable columns={COLS} data={filtered} searchKey="subject" loading={loading} />
    </div>
  );
}
