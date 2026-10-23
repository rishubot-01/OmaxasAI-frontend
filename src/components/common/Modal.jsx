import { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";

const MODAL_SIZES = {
  sm: "400px",
  md: "560px",
  lg: "760px",
  xl: "960px",
  full: "100%",
};

export default function Modal({
  open,
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  size = "md",
  closeOnBackdrop = true,
  closeOnEscape = true,
  showCloseButton = true,
  className = "",
  overlayStyle = {},
  contentStyle = {},
  ariaLabel,
}) {
  const visible = isOpen ?? open ?? false;

  const dialogRef = useRef(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    if (!visible || typeof document === "undefined") {
      return undefined;
    }

    const previousActiveElement = document.activeElement;
    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    dialogRef.current?.focus();

    const handleKeyDown = (event) => {
      if (event.key === "Escape" && closeOnEscape) {
        event.preventDefault();
        onClose?.();
        return;
      }

      if (event.key !== "Tab") {
        return;
      }

      const dialog = dialogRef.current;

      if (!dialog) {
        return;
      }

      const focusableElements = dialog.querySelectorAll(
        [
          'a[href]',
          'button:not([disabled])',
          'input:not([disabled])',
          'select:not([disabled])',
          'textarea:not([disabled])',
          '[tabindex]:not([tabindex="-1"])',
        ].join(",")
      );

      const elements = Array.from(focusableElements).filter(
        (element) => element.getAttribute("aria-hidden") !== "true"
      );

      if (elements.length === 0) {
        event.preventDefault();
        dialog.focus();
        return;
      }

      const first = elements[0];
      const last = elements[elements.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (
        !event.shiftKey &&
        document.activeElement === last
      ) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;

      if (previousActiveElement?.isConnected) {
        previousActiveElement.focus();
      }
    };
  }, [visible, closeOnEscape, onClose]);

  if (!visible || typeof document === "undefined") {
    return null;
  }

  const modalWidth = MODAL_SIZES[size] || MODAL_SIZES.md;

  const handleBackdropMouseDown = (event) => {
    if (
      closeOnBackdrop &&
      event.target === event.currentTarget
    ) {
      onClose?.();
    }
  };

  return createPortal(
    <div
      className={`omaxas-modal-overlay ${className}`.trim()}
      onMouseDown={handleBackdropMouseDown}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        overflowY: "auto",
        background: "rgba(0, 0, 0, 0.65)",
        backdropFilter: "blur(4px)",
        ...overlayStyle,
      }}
    >
      <section
        ref={dialogRef}
        className="omaxas-modal"
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel || (!title ? "Dialog" : undefined)}
        aria-labelledby={title ? titleId : undefined}
        aria-describedby={description ? descriptionId : undefined}
        tabIndex={-1}
        style={{
          position: "relative",
          width: "100%",
          maxWidth: modalWidth,
          maxHeight: "calc(100dvh - 40px)",
          overflowY: "auto",
          boxSizing: "border-box",
          border: "1px solid var(--border-color, #3f3f46)",
          borderRadius: "16px",
          background: "var(--modal-background, #18181b)",
          color: "var(--text-color, #fafafa)",
          boxShadow: "0 24px 80px rgba(0, 0, 0, 0.35)",
          outline: "none",
          ...contentStyle,
        }}
      >
        {(title || description || showCloseButton) && (
          <header
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: "16px",
              padding: "20px 24px",
              borderBottom: "1px solid var(--border-color, #3f3f46)",
            }}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              {title && (
                <h2
                  id={titleId}
                  style={{
                    margin: 0,
                    fontSize: "18px",
                    fontWeight: 600,
                    lineHeight: 1.4,
                  }}
                >
                  {title}
                </h2>
              )}

              {description && (
                <p
                  id={descriptionId}
                  style={{
                    margin: "6px 0 0",
                    fontSize: "14px",
                    lineHeight: 1.5,
                    color: "var(--muted-color, #a1a1aa)",
                  }}
                >
                  {description}
                </p>
              )}
            </div>

            {showCloseButton && (
              <button
                type="button"
                onClick={onClose}
                aria-label="Close dialog"
                title="Close"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  width: "32px",
                  height: "32px",
                  border: "none",
                  borderRadius: "8px",
                  background: "transparent",
                  color: "inherit",
                  fontSize: "24px",
                  lineHeight: 1,
                  cursor: "pointer",
                }}
              >
                ×
              </button>
            )}
          </header>
        )}

        <div style={{ padding: "24px" }}>
          {children}
        </div>

        {footer && (
          <footer
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              flexWrap: "wrap",
              gap: "10px",
              padding: "16px 24px",
              borderTop: "1px solid var(--border-color, #3f3f46)",
            }}
          >
            {footer}
          </footer>
        )}
      </section>
    </div>,
    document.body
  );
}