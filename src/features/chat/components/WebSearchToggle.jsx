import { useState } from "react";

export default function WebSearchToggle({
  enabled,
  defaultEnabled = false,
  onChange,
  disabled = false,
  className = "",
}) {
  const [internalEnabled, setInternalEnabled] = useState(
    defaultEnabled,
  );

  // Supports controlled and standalone usage.
  const isControlled = enabled !== undefined;
  const isEnabled = isControlled ? enabled : internalEnabled;

  function handleToggle() {
    if (disabled) return;

    const nextEnabled = !isEnabled;

    if (!isControlled) {
      setInternalEnabled(nextEnabled);
    }

    onChange?.(nextEnabled);
  }

  return (
    <div
      className={`web-search-toggle ${className}`.trim()}
    >
      <button
        type="button"
        className={[
          "web-search-toggle-button",
          isEnabled ? "web-search-toggle-active" : "",
        ]
          .filter(Boolean)
          .join(" ")}
        role="switch"
        aria-checked={isEnabled}
        aria-label="Web search"
        disabled={disabled}
        onClick={handleToggle}
        title={
          isEnabled
            ? "Turn off web search"
            : "Turn on web search"
        }
      >
        <svg
          className="web-search-icon"
          width="17"
          height="17"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
          <path d="M3 11h16" />
          <path d="M11 3a13 13 0 0 1 0 16" />
          <path d="M11 3a13 13 0 0 0 0 16" />
        </svg>

        <span>Web search</span>

        <span
          className="web-search-status"
          aria-hidden="true"
        >
          {isEnabled ? "ON" : "OFF"}
        </span>
      </button>

      <span className="web-search-description">
        {isEnabled
          ? "Search is enabled for your next message."
          : "Search is disabled."}
      </span>
    </div>
  );
}