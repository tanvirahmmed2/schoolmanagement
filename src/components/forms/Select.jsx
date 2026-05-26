export default function Select({
  label,
  id,
  name,
  options = [],
  value,
  onChange,
  error,
  hint,
  required = false,
  disabled = false,
  placeholder = "Select an option",
  style: customStyle = {},
  ...props
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
      {label && (
        <label
          htmlFor={id}
          style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--text-primary)" }}
        >
          {label}
          {required && <span style={{ color: "#ef4444", marginLeft: "0.25rem" }}>*</span>}
        </label>
      )}
      <div style={{ position: "relative" }}>
        <select
          id={id}
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          disabled={disabled}
          style={{
            width: "100%",
            appearance: "none",
            WebkitAppearance: "none",
            padding: "0.75rem 2.5rem 0.75rem 0.875rem",
            border: error ? "1.5px solid #f87171" : "1.5px solid var(--border-base)",
            borderRadius: "var(--radius-md)",
            fontSize: "0.9rem",
            color: value ? "var(--text-primary)" : "var(--text-muted)",
            background: disabled ? "var(--bg-muted)" : "#fff",
            outline: "none",
            cursor: disabled ? "not-allowed" : "pointer",
            transition: "border-color 0.15s ease, box-shadow 0.15s ease",
            fontFamily: "var(--font-sans)",
            ...customStyle,
          }}
          onFocus={(e) => {
            e.target.style.borderColor = "var(--color-primary-400)";
            e.target.style.boxShadow = "0 0 0 3px rgba(99,102,241,0.12)";
          }}
          onBlur={(e) => {
            e.target.style.borderColor = error ? "#f87171" : "var(--border-base)";
            e.target.style.boxShadow = "none";
          }}
          {...props}
        >
          <option value="" disabled hidden>{placeholder}</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <span
          style={{
            position: "absolute",
            right: "0.875rem",
            top: "50%",
            transform: "translateY(-50%)",
            pointerEvents: "none",
            color: "var(--text-muted)",
          }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </div>
      {error && (
        <span style={{ fontSize: "0.8125rem", color: "#ef4444" }}>⚠ {error}</span>
      )}
      {hint && !error && (
        <span style={{ fontSize: "0.8125rem", color: "var(--text-muted)" }}>{hint}</span>
      )}
    </div>
  );
}
