export default function IconButton({
  icon,
  children,
  label,
  "aria-label": ariaLabel,
  title,
  type = "button",
  variant = "ghost",
  size = "md",
  active = false,
  disabled = false,
  loading = false,
  className = "",
  style = {},
  onClick,
  ...rest
}) {
  const sizes = {
    sm: {
      width: "32px",
      height: "32px",
      fontSize: "14px",
    },
    md: {
      width: "40px",
      height: "40px",
      fontSize: "18px",
    },
    lg: {
      width: "48px",
      height: "48px",
      fontSize: "20px",
    },
  };

  const variants = {
    ghost: {
      background: active
        ? "var(--icon-button-active-bg, #27272a)"
        : "transparent",
      color: "var(--icon-button-color, inherit)",
      border: "1px solid transparent",
    },
    secondary: {
      background: "var(--icon-button-bg, #27272a)",
      color: "var(--icon-button-color, #ffffff)",
      border: "1px solid var(--border-color, #3f3f46)",
    },
    outline: {
      background: "transparent",
      color: "inherit",
      border: "1px solid var(--border-color, #3f3f46)",
    },
    danger: {
      background: active
        ? "var(--danger-active-bg, #7f1d1d)"
        : "transparent",
      color: "var(--danger-color, #f87171)",
      border: "1px solid transparent",
    },
  };

  const selectedSize = sizes[size] || sizes.md;
  const selectedVariant = variants[variant] || variants.ghost;
  const isDisabled = disabled || loading;
  const accessibleLabel = ariaLabel || label || title;

  return (
    <button
      type={type}
      className={`omaxas-icon-button ${className}`.trim()}
      title={title || accessibleLabel}
      aria-label={accessibleLabel}
      aria-pressed={active}
      aria-busy={loading}
      disabled={isDisabled}
      onClick={onClick}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        padding: 0,
        borderRadius: "10px",
        cursor: isDisabled ? "not-allowed" : "pointer",
        opacity: isDisabled ? 0.55 : 1,
        fontFamily: "inherit",
        lineHeight: 1,
        transition:
          "background-color 150ms ease, color 150ms ease",
        ...selectedSize,
        ...selectedVariant,
        ...style,
      }}
      {...rest}
    >
      {loading ? (
        <span role="status" aria-label="Loading">
          ⏳
        </span>
      ) : (
        icon ?? children
      )}
    </button>
  );
}