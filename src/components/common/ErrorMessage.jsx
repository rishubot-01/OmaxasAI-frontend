export default function ErrorMessage({
  message = "",
  error = "",
  title = "Something went wrong",
  variant = "error",
  onDismiss,
  className = "",
  style = {},
}) {
  const content =
    typeof message === "string"
      ? message
      : typeof error === "string"
        ? error
        : error?.message || "";

  if (!content.trim()) {
    return null;
  }

  const variants = {
    error: {
      background: "var(--error-bg, #2b1717)",
      border: "var(--error-border, #7f1d1d)",
      color: "var(--error-text, #fecaca)",
      icon: "⚠",
    },
    warning: {
      background: "var(--warning-bg, #2a2112)",
      border: "var(--warning-border, #854d0e)",
      color: "var(--warning-text, #fde68a)",
      icon: "!",
    },
    info: {
      background: "var(--info-bg, #172554)",
      border: "var(--info-border, #1d4ed8)",
      color: "var(--info-text, #bfdbfe)",
      icon: "i",
    },
  };

  const selectedVariant =
    variants[variant] || variants.error;

  return (
    <div
      className={`omaxas-error-message ${className}`.trim()}
      role={variant === "error" ? "alert" : "status"}
      aria-live={variant === "error" ? "assertive" : "polite"}
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: "10px",
        width: "100%",
        boxSizing: "border-box",
        padding: "12px 14px",
        border: `1px solid ${selectedVariant.border}`,
        borderRadius: "10px",
        background: selectedVariant.background,
        color: selectedVariant.color,
        fontSize: "14px",
        lineHeight: 1.5,
        ...style,
      }}
    >
      <span
        aria-hidden="true"
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          width: "20px",
          height: "20px",
          borderRadius: "50%",
          fontWeight: 700,
        }}
      >
        {selectedVariant.icon}
      </span>

      <div style={{ flex: 1, minWidth: 0 }}>
        {title && (
          <div
            style={{
              fontWeight: 600,
              marginBottom: "2px",
            }}
          >
            {title}
          </div>
        )}

        <div style={{ overflowWrap: "anywhere" }}>
          {content}
        </div>
      </div>

      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss message"
          title="Dismiss"
          style={{
            flexShrink: 0,
            border: 0,
            background: "transparent",
            color: "inherit",
            fontSize: "20px",
            lineHeight: 1,
            cursor: "pointer",
            padding: "0 2px",
          }}
        >
          ×
        </button>
      )}
    </div>
  );
}