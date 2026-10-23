import { useId } from "react";

export default function Dropdown({
  options = [],
  value,
  defaultValue,
  onChange,
  label,
  placeholder = "Select an option",
  name,
  id,
  disabled = false,
  required = false,
  error = "",
  helperText = "",
  size = "md",
  fullWidth = true,
  className = "",
  style = {},
  ...rest
}) {
  const generatedId = useId();
  const selectId = id || generatedId;
  const errorId = `${selectId}-error`;
  const helperId = `${selectId}-help`;

  const sizes = {
    sm: {
      minHeight: "34px",
      padding: "6px 10px",
      fontSize: "13px",
    },
    md: {
      minHeight: "40px",
      padding: "9px 12px",
      fontSize: "14px",
    },
    lg: {
      minHeight: "48px",
      padding: "12px 14px",
      fontSize: "16px",
    },
  };

  const selectStyle = {
    width: fullWidth ? "100%" : "auto",
    minWidth: 0,
    boxSizing: "border-box",
    border: error
      ? "1px solid #dc2626"
      : "1px solid var(--border-color, #3f3f46)",
    borderRadius: "10px",
    backgroundColor: "var(--input-background, #18181b)",
    color: "var(--text-color, #fafafa)",
    fontFamily: "inherit",
    outline: "none",
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.6 : 1,
    ...sizes[size] || sizes.md,
    ...style,
  };

  const describedBy = [
    helperText ? helperId : null,
    error ? errorId : null,
  ]
    .filter(Boolean)
    .join(" ") || undefined;

  return (
    <div
      className={`omaxas-dropdown ${className}`.trim()}
      style={{ width: fullWidth ? "100%" : "auto" }}
    >
      {label && (
        <label
          htmlFor={selectId}
          style={{
            display: "block",
            marginBottom: "6px",
            fontSize: "14px",
            fontWeight: 500,
          }}
        >
          {label}
          {required && (
            <span aria-hidden="true"> *</span>
          )}
        </label>
      )}

      <select
        id={selectId}
        name={name}
        value={value}
        defaultValue={defaultValue}
        onChange={onChange}
        disabled={disabled}
        required={required}
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy}
        style={selectStyle}
        {...rest}
      >
        {placeholder !== null && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}

        {options.map((option) => {
          const normalized =
            typeof option === "string"
              ? { label: option, value: option }
              : option;

          if (
            normalized?.value === undefined ||
            normalized?.value === null
          ) {
            return null;
          }

          return (
            <option
              key={String(normalized.value)}
              value={normalized.value}
              disabled={Boolean(normalized.disabled)}
            >
              {normalized.label ?? String(normalized.value)}
            </option>
          );
        })}
      </select>

      {helperText && !error && (
        <p
          id={helperId}
          style={{
            margin: "6px 0 0",
            fontSize: "12px",
            color: "var(--muted-color, #a1a1aa)",
          }}
        >
          {helperText}
        </p>
      )}

      {error && (
        <p
          id={errorId}
          role="alert"
          style={{
            margin: "6px 0 0",
            fontSize: "12px",
            color: "#ef4444",
          }}
        >
          {error}
        </p>
      )}
    </div>
  );
}