"use client";

import { useState } from "react";

export function AccordionItem({ question, answer, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div
      style={{
        border: "1px solid var(--border-base)",
        borderRadius: "var(--radius-lg)",
        overflow: "hidden",
        transition: "border-color 0.2s ease",
        borderColor: open ? "var(--color-primary-200)" : "var(--border-base)",
      }}
    >
      <button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "1rem",
          padding: "1.25rem 1.5rem",
          background: open ? "var(--color-primary-50)" : "#fff",
          border: "none",
          cursor: "pointer",
          textAlign: "left",
          transition: "background 0.2s ease",
          fontFamily: "var(--font-sans)",
        }}
        onMouseEnter={(e) => {
          if (!open) e.currentTarget.style.background = "var(--bg-subtle)";
        }}
        onMouseLeave={(e) => {
          if (!open) e.currentTarget.style.background = "#fff";
        }}
      >
        <span
          style={{
            fontSize: "0.9375rem",
            fontWeight: 600,
            color: open ? "var(--color-primary-700)" : "var(--text-primary)",
            lineHeight: 1.5,
          }}
        >
          {question}
        </span>
        <span
          style={{
            flexShrink: 0,
            width: "1.75rem",
            height: "1.75rem",
            borderRadius: "50%",
            background: open ? "var(--color-primary-100)" : "var(--bg-muted)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: open ? "var(--color-primary-600)" : "var(--text-muted)",
            transition: "all 0.2s ease",
          }}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            style={{
              transform: open ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 0.3s ease",
            }}
          >
            <path d="M2 4.5l5 5 5-5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </button>

      <div
        style={{
          maxHeight: open ? "600px" : "0",
          overflow: "hidden",
          transition: "max-height 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        <div
          style={{
            padding: "0 1.5rem 1.25rem",
            fontSize: "0.9rem",
            color: "var(--text-secondary)",
            lineHeight: 1.75,
            background: open ? "var(--color-primary-50)" : "#fff",
          }}
        >
          {answer}
        </div>
      </div>
    </div>
  );
}

export default function Accordion({ items }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
      {items.map((item, i) => (
        <AccordionItem
          key={i}
          question={item.question}
          answer={item.answer}
          defaultOpen={item.defaultOpen}
        />
      ))}
    </div>
  );
}
