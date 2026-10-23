import React from "react";

export default function Spinner({
  size = 24,
  color = "currentColor",
  label = "Loading...",
  className = "",
  style = {},
  fullScreen = false,
}) {
  const dimension =
    typeof size === "number" ? `${size}px` : size;

  const spinner = (
    <>
      <style>
        {`
          @keyframes omaxas-spinner-rotate {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }

          .omaxas-spinner-circle {
            animation: omaxas-spinner-rotate 0.8s linear infinite;
          }

          @media (prefers-reduced-motion: reduce) {
            .omaxas-spinner-circle {
              animation-duration: 2s;
            }
          }
        `}
      </style>

      <span
        className={`omaxas-spinner ${className}`.trim()}
        role="status"
        aria-label={label}
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          color,
          ...style,
        }}
      >
        <svg
          width={dimension}
          height={dimension}
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <circle
            cx="12"
            cy="12"
            r="9"
            stroke="currentColor"
            strokeWidth="3"
            opacity="0.2"
          />

          <path
            className="omaxas-spinner-circle"
            d="M12 3a9 9 0 0 1 9 9"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            transform="rotate(0 12 12)"
          />
        </svg>

        <span
          style={{
            position: "absolute",
            width: "1px",
            height: "1px",
            padding: 0,
            margin: "-1px",
            overflow: "hidden",
            clip: "rect(0, 0, 0, 0)",
            whiteSpace: "nowrap",
            border: 0,
          }}
        >
          {label}
        </span>
      </span>
    </>
  );

  if (fullScreen) {
    return (
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 9999,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--app-background, #09090b)",
          color: "var(--text-color, #fafafa)",
        }}
      >
        {spinner}
      </div>
    );
  }

  return spinner;
}