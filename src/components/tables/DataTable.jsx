"use client";

import { useState, useMemo } from "react";

/**
 * DataTable — generic sortable/searchable table
 * Props:
 *   columns: [{ key, label, render?, sortable? }]
 *   data: array of row objects
 *   searchKey?: string (key to search on)
 *   loading?: bool
 *   emptyText?: string
 *   onRowClick?: (row) => void
 */
export default function DataTable({ columns = [], data = [], searchKey, loading = false, emptyText = "No records found", onRowClick }) {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState("asc");

  const toggleSort = (key) => {
    if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("asc"); }
  };

  const filtered = useMemo(() => {
    let rows = [...data];
    if (searchKey && search.trim()) {
      const q = search.toLowerCase();
      rows = rows.filter(r => String(r[searchKey] || "").toLowerCase().includes(q));
    }
    if (sortKey) {
      rows.sort((a, b) => {
        const av = a[sortKey] ?? ""; const bv = b[sortKey] ?? "";
        const cmp = String(av).localeCompare(String(bv), undefined, { numeric: true });
        return sortDir === "asc" ? cmp : -cmp;
      });
    }
    return rows;
  }, [data, search, searchKey, sortKey, sortDir]);

  return (
    <div style={{ background: "#fff", borderRadius: "12px", border: "1px solid #e2e8f0", overflow: "hidden" }}>
      {searchKey && (
        <div style={{ padding: "1rem 1.25rem", borderBottom: "1px solid #f1f5f9" }}>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..."
            style={{ width: "240px", padding: "0.5rem 0.875rem", borderRadius: "8px", border: "1.5px solid #e2e8f0", fontSize: "0.875rem", outline: "none", fontFamily: "inherit", color: "#1e293b" }} />
        </div>
      )}
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
          <thead>
            <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
              {columns.map(col => (
                <th key={col.key}
                  onClick={() => col.sortable && toggleSort(col.key)}
                  style={{ padding: "0.75rem 1rem", textAlign: "left", fontWeight: 700, color: "#475569", fontSize: "0.8125rem", textTransform: "uppercase", letterSpacing: "0.04em", whiteSpace: "nowrap", cursor: col.sortable ? "pointer" : "default", userSelect: "none" }}>
                  {col.label}
                  {col.sortable && sortKey === col.key && (
                    <span style={{ marginLeft: "0.375rem" }}>{sortDir === "asc" ? "↑" : "↓"}</span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i} style={{ borderBottom: "1px solid #f1f5f9" }}>
                  {columns.map(col => (
                    <td key={col.key} style={{ padding: "0.875rem 1rem" }}>
                      <div style={{ height: "14px", borderRadius: "4px", background: `linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%)`, backgroundSize: "400% 100%", animation: "shimmer 1.4s infinite" }} />
                    </td>
                  ))}
                </tr>
              ))
            ) : filtered.length === 0 ? (
              <tr><td colSpan={columns.length} style={{ padding: "3rem", textAlign: "center", color: "#94a3b8", fontSize: "0.9375rem" }}>{emptyText}</td></tr>
            ) : (
              filtered.map((row, i) => (
                <tr key={row.id || i}
                  onClick={() => onRowClick?.(row)}
                  style={{ borderBottom: "1px solid #f1f5f9", cursor: onRowClick ? "pointer" : "default", transition: "background 0.1s ease" }}
                  onMouseEnter={e => { if (onRowClick) e.currentTarget.style.background = "#f8fafc"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}>
                  {columns.map(col => (
                    <td key={col.key} style={{ padding: "0.875rem 1rem", color: "#334155", verticalAlign: "middle" }}>
                      {col.render ? col.render(row[col.key], row) : (row[col.key] ?? "—")}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <style>{`@keyframes shimmer { 0%{background-position:100% 0} 100%{background-position:-100% 0} }`}</style>
    </div>
  );
}
