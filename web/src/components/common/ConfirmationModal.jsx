import React, { useEffect, useRef } from "react";

/**
 * Reusable Confirmation Modal
 * Formatted cleanly according to the approved KusinApp UI prototype (POPUP style):
 * - Large rounded container (border-radius: 24px)
 * - Clean title with an integrated top-right close '×' button
 * - Clean descriptive body copy
 * - Two bottom-right pill action buttons:
 *     Cancel: rounded pill with light border
 *     Confirm: solid warm amber / vibrant pill button with subtle shadow
 *
 * @param {object} props
 * @param {boolean} props.isOpen - Controls visibility
 * @param {() => void} props.onClose - Action when cancelled or closed
 * @param {() => void} props.onConfirm - Action when confirmed
 * @param {string} props.title - Modal title (e.g., "Sign out of KusinApp", "Remove from collection")
 * @param {React.ReactNode} props.message - Descriptive text or node
 * @param {string} [props.confirmText="Confirm"] - Text for confirm action
 * @param {string} [props.cancelText="Cancel"] - Text for cancel action
 * @param {"primary"|"danger"|"warning"} [props.variant="primary"] - Button theme
 * @param {boolean} [props.isLoading=false] - Disables buttons and shows spinner while async action runs
 */
export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "primary",
  isLoading = false,
}) {
  const confirmButtonRef = useRef(null);

  // Close on Escape & trap focus
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape" && !isLoading) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    confirmButtonRef.current?.focus();

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, isLoading, onClose]);

  if (!isOpen) return null;

  const getConfirmButtonClass = () => {
    switch (variant) {
      case "danger":
        return "k-popup-btn-confirm k-popup-btn-confirm--danger";
      case "warning":
        return "k-popup-btn-confirm k-popup-btn-confirm--warning";
      default:
        return "k-popup-btn-confirm";
    }
  };

  return (
    <div
      className="k-popup-backdrop"
      onClick={() => {
        if (!isLoading) onClose();
      }}
      role="presentation"
    >
      <div
        className="k-popup-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="k-popup-title"
        aria-describedby="k-popup-description"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Title and '×' Close Button */}
        <div className="k-popup-header">
          <h2 id="k-popup-title" className="k-popup-title">
            {title}
          </h2>
          <button
            type="button"
            className="k-popup-close-btn"
            onClick={onClose}
            disabled={isLoading}
            aria-label="Close dialog"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Message body */}
        <div id="k-popup-description" className="k-popup-desc">
          {message}
        </div>

        {/* Bottom pill actions */}
        <div className="k-popup-actions">
          <button
            type="button"
            className="k-popup-btn-cancel"
            onClick={onClose}
            disabled={isLoading}
          >
            {cancelText}
          </button>
          <button
            ref={confirmButtonRef}
            type="button"
            className={getConfirmButtonClass()}
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading && <span className="k-spinner" aria-hidden="true" style={{ width: 14, height: 14 }} />}
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
