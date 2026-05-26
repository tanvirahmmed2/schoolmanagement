"use client";

import { useState, useEffect } from "react";
import DataTable from "@/components/tables/DataTable";
import Badge from "@/components/ui/Badge";
import { formatDate, formatBDT } from "@/utils/helpers";

const METHOD_ICONS = { bkash:"🟣", nagad:"🟠", card:"💳", stripe:"⚡", bank_transfer:"🏦" };

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  async function loadPayments() {
    setLoading(true);
    try {
      const res = await fetch("/api/payments?pageSize=100");
      const json = await res.json();
      if (json.success) {
        setPayments(json.data || []);
      }
    } catch (err) {
      console.error("Failed to load payments:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPayments();
  }, []);

  async function handleAction(id, action) {
    if (!confirm(`Are you sure you want to ${action} this payment?`)) return;
    try {
      const res = await fetch(`/api/payments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action })
      });
      const json = await res.json();
      if (json.success) {
        const nextStatus = action === "confirm" ? "success" : "refunded";
        setPayments(prev => prev.map(p => p.id === id ? { ...p, status: nextStatus } : p));
      } else {
        alert(json.message || `Failed to ${action} payment`);
      }
    } catch (err) {
      console.error(err);
    }
  }

  const columns = [
    { key:"institution_name",label:"Institution",sortable:true },
    { key:"amount",          label:"Amount",     sortable:true, render:v=><span style={{fontWeight:700,color:"#0f172a"}}>{formatBDT(v)}</span> },
    { key:"payment_method",  label:"Method",     render:v=><span style={{display:"flex",alignItems:"center",gap:"0.375rem",textTransform:"capitalize",fontWeight:600}}>{METHOD_ICONS[v]||"💰"} {v.replace("_"," ")}</span> },
    { key:"status",          label:"Status",     sortable:true, render:v=><Badge status={v}>{v}</Badge> },
    { key:"transaction_id",  label:"Txn ID",     render:v=><code style={{fontSize:"0.75rem",color:"#64748b",background:"#f8fafc",padding:"0.1rem 0.375rem",borderRadius:"4px"}}>{v}</code> },
    { key:"created_at",      label:"Date",       sortable:true, render:v=>formatDate(v) },
    { key:"actions",         label:"",           render:(_,r)=>r.status==="pending"?<button onClick={() => handleAction(r.id, "confirm")} style={{padding:"0.3rem 0.75rem",borderRadius:"6px",border:"1.5px solid #bbf7d0",background:"#fff",color:"#059669",cursor:"pointer",fontSize:"0.75rem",fontWeight:600}}>Confirm</button>:r.status==="success"?<button onClick={() => handleAction(r.id, "refund")} style={{padding:"0.3rem 0.75rem",borderRadius:"6px",border:"1.5px solid #fecaca",background:"#fff",color:"#ef4444",cursor:"pointer",fontSize:"0.75rem",fontWeight:600}}>Refund</button>:null },
  ];

  const totalRevenue = payments.filter(p=>p.status==="success").reduce((s,p)=>s+p.amount,0);
  const pendingCount = payments.filter(p=>p.status==="pending").length;
  const failedCount = payments.filter(p=>p.status==="failed").length;
  const refundedCount = payments.filter(p=>p.status==="refunded").length;

  return (
    <div>
      <div style={{ marginBottom:"1.5rem" }}>
        <h1 style={{ fontSize:"1.75rem", fontWeight:900, color:"#0f172a", letterSpacing:"-0.03em" }}>Payments</h1>
        <p style={{ color:"#64748b", fontSize:"0.875rem" }}>All BDT payment records with transaction IDs</p>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(160px,1fr))", gap:"1rem", marginBottom:"1.5rem" }}>
        {[
          ["Total Revenue", formatBDT(totalRevenue), "#10b981"],
          ["Pending", pendingCount+" txns", "#f59e0b"],
          ["Failed", failedCount+" txns", "#ef4444"],
          ["Refunded", refundedCount+" txns", "#6366f1"]
        ].map(([l,v,c])=>(
          <div key={l} style={{background:"#fff",borderRadius:"10px",border:"1px solid #e2e8f0",padding:"1rem 1.25rem"}}>
            <div style={{fontSize:"1.25rem",fontWeight:900,color:c}}>{v}</div>
            <div style={{fontSize:"0.8125rem",color:"#64748b",fontWeight:600,marginTop:"0.25rem"}}>{l}</div>
          </div>
        ))}
      </div>

      <DataTable columns={columns} data={payments} searchKey="institution_name" loading={loading} />
    </div>
  );
}
