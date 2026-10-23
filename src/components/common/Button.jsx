import React from "react";

const VARIANTS = {
  primary: {
    background: "#2563eb",
    color: "#ffffff",
    border: "1px solid transparent",
  },
  secondary: {
    background: "#27272a",
    color: "#ffffff",
    border: "1px solid #3f3f46",
  },
  outline: {
    background: "transparent",
    color: "inherit",
    border: "1px solid #52525b",
  },
  ghost: {
    background: "transparent",
    color: "inherit",
    border: "1px solid transparent",
  },
  danger: {
    background: "#dc2626",
    color: "#ffffff",
    border: "1px solid transparent",
  },
};

const SIZES = {
  sm: {
    minHeight: "32px",
    padding: "6px 10px",
    fontSize: "13px",
  },
  md: {
    minHeight: "40px",
    padding: "9px 16px",
    fontSize: "14px",
  },
  lg: {
    minHeight: "48px",
    padding: "12px 20px",
    fontSize: "16px",
  },
};

export default function Button({
  children,
  type = "button",
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  fullWidth = false,
  leftIcon = null,
  rightIcon = null,
  className = "",
  style = {},
  onClick,
  title,
  name,
  value,
  ...rest
}) {
  const variantStyle = VARIANTS[variant] || VARIANTS.primary;
  const sizeStyle = SIZES[size] || SIZES.md;

  const isDisabled = disabled || loading;

  const buttonStyle = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    minWidth: 0,
    width: fullWidth ? "100%" : "auto",
    borderRadius: "10px",
    fontFamily: "inherit",
    fontWeight: 600,
    lineHeight: 1.4,
    textAlign: "center",
    cursor: isDisabled ? "not-allowed" : "pointer",
    opacity: isDisabled ? 0.6 : 1,
    transition:
      "background-color 150ms ease, border-color 150ms ease, opacity 150ms ease",
    whiteSpace: "normal",
    ...variantStyle,
    ...sizeStyle,
    ...style,
  };

  return (
    <button
      type={type}
      name={name}
      value={value}
      title={title}
      className={`omaxas-button omaxas-button--${variant} ${className}`.trim()}
      style={buttonStyle}
      disabled={isDisabled}
      aria-busy={loading}
      onClick={onClick}
      {...rest}
    >
      {loading ? (
        <span
          role="status"
          aria-label="Loading"
          style={{ display: "inline-flex", alignItems: "center" }}
        >
          <span aria-hidden="true">⏳</span>
        </span>
      ) : (
        leftIcon && (
          <span
            aria-hidden="true"
            style={{ display: "inline-flex", alignItems: "center" }}
          >
            {leftIcon}
          </span>
        )
      )}

      <span>{children}</span>

      {!loading && rightIcon && (
        <span
          aria-hidden="true"
          style={{ display: "inline-flex", alignItems: "center" }}
        >
          {rightIcon}
        </span>
      )}
    </button>
  );
}