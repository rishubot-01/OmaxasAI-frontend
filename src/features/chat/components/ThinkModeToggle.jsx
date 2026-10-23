import { useState } from "react";

const MODES = [
  {
    value: "auto",
    label: "Auto",
    description: "Let OMAXAS AI choose the response strategy.",
  },
  {
    value: "think",
    label: "Think",
    description: "Use the configured Think mode.",
  },
];

export default function ThinkModeToggle({
  mode,
  defaultMode = "auto",
  onChange,
  disabled = false,
  className = "",
}) {
  const [internalMode, setInternalMode] = useState(
    defaultMode === "think" ? "think" : "auto",
  );

  // Supports both controlled and standalone usage.
  const isControlled = mode !== undefined;

  const selectedMode = isControlled
    ? mode === "think"
      ? "think"
      : "auto"
    : internalMode;

  function handleModeChange(nextMode) {
    if (disabled || nextMode === selectedMode) {
      return;
    }

    if (!isControlled) {
      setInternalMode(nextMode);
    }

    onChange?.(nextMode);
  }

  return (
    <div
      className={`think-mode-toggle ${className}`.trim()}
      role="group"
      aria-label="AI response mode"
    >
      <span className="think-mode-label">Mode</span>

      <div className="think-mode-options">
        {MODES.map((option) => {
          const isActive = selectedMode === option.value;

          return (
            <button
              key={option.value}
              type="button"
              className={[
                "think-mode-option",
                isActive ? "think-mode-option-active" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              aria-pressed={isActive}
              aria-label={option.description}
              title={option.description}
              disabled={disabled}
              onClick={() => handleModeChange(option.value)}
            >
              {option.value === "think" && (
                <span
                  className="think-mode-icon"
                  aria-hidden="true"
                >
                  ◈
                </span>
              )}

              <span>{option.label}</span>

              {isActive && (
                <span
                  className="think-mode-selected-indicator"
                  aria-hidden="true"
                >
                  ✓
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}