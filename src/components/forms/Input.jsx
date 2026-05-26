export default function Input({
  label,
  id,
  name,
  type = "text",
  placeholder,
  value,
  onChange,
  error,
  hint,
  required = false,
  disabled = false,
  icon,
  iconRight,
  style: customStyle = {},
  ...props
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
      {label && (
        <label
          htmlFor={id}
          style={{
            fontSize: "0.875rem",
            fontWeight: 600,
            color: "var(--text-primary)",
          }}
        >
          {label}
          {required && (
            <span style={{ color: "#ef4444", marginLeft: "0.25rem" }}>*</span>
          )}
        </label>
      )}
      <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
        {icon && (
          <span
            style={{
              position: "absolute",
              left: "0.875rem",
              display: "flex",
              alignItems: "center",
              color: "var(--text-muted)",
              pointerEvents: "none",
            }}
          >
            {icon}
          </span>
        )}
        <input
          id={id}
          name={name}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required={required}
          disabled={disabled}
          style={{
            width: "100%",
            padding: icon
              ? "0.75rem 0.875rem 0.75rem 2.75rem"
              : iconRight
              ? "0.75rem 2.75rem 0.75rem 0.875rem"
              : "0.75rem 0.875rem",
            border: error
              ? "1.5px solid #f87171"
              : "1.5px solid var(--border-base)",
            borderRadius: "var(--radius-md)",
            fontSize: "0.9rem",
            color: "var(--text-primary)",
            background: disabled ? "var(--bg-muted)" : "#fff",
            outline: "none",
            transition: "border-color 0.15s ease, box-shadow 0.15s ease",
            fontFamily: "var(--font-sans)",
            cursor: disabled ? "not-allowed" : "text",
            ...customStyle,
          }}
          onFocus={(e) => {
            if (!error) {
              e.target.style.borderColor = "var(--color-primary-400)";
              e.target.style.boxShadow = "0 0 0 3px rgba(99,102,241,0.12)";
            }
          }}
          onBlur={(e) => {
            if (!error) {
              e.target.style.borderColor = "var(--border-base)";
              e.target.style.boxShadow = "none";
            }
          }}
          {...props}
        />
        {iconRight && (
          <span
            style={{
              position: "absolute",
              right: "0.875rem",
              display: "flex",
              alignItems: "center",
              color: "var(--text-muted)",
            }}
          >
            {iconRight}
          </span>
        )}
      </div>
      {error && (
        <span style={{ fontSize: "0.8125rem", color: "#ef4444", display: "flex", alignItems: "center", gap: "0.25rem" }}>
          ⚠ {error}
        </span>
      )}
      {hint && !error && (
        <span style={{ fontSize: "0.8125rem", color: "var(--text-muted)" }}>
          {hint}
        </span>
      )}
    </div>
  );
}
