import React, { useEffect, useRef } from "react";

/**
 * Reusable Confirmation Modal
 * Cohesive, lightweight, accessible dialog for destructive actions
 * (e.g., logging out, resetting onboarding, deleting items) and general confirmations.
 *
 * @param {object} props
 * @param {boolean} props.isOpen - Controls visibility
 * @param {() => void} props.onClose - Action when cancelled or closed
 * @param {() => void} props.onConfirm - Action when confirmed
 * @param {string} props.title - Modal title
 * @param {React.ReactNode} props.message - Descriptive text or node
 * @param {string} [props.confirmText="Confirm"] - Text for confirm button
 * @param {string} [props.cancelText="Cancel"] - Text for cancel button
 * @param {"danger"|"warning"|"primary"} [props.variant="danger"] - Determines button styling & badge icon
 * @param {boolean} [props.isLoading=false] - Disables buttons and shows spinner while async action runs
 * @param {React.ReactNode} [props.icon] - Optional custom icon
 */
export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "danger",
  isLoading = false,
  icon,
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
    // Auto-focus confirm or cancel button for convenience
    confirmButtonRef.current?.focus();

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, isLoading, onClose]);

  if (!isOpen) return null;

  const getVariantStyles = () => {
    switch (variant) {
      case "danger":
        return {
          badgeBg: "#fee4e2",
          badgeColor: "#d92d20",
          confirmBtnClass: "k-btn--danger",
          defaultIcon: (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          ),
        };
      case "warning":
        return {
          badgeBg: "#fef0c7",
          badgeColor: "#b54708",
          confirmBtnClass: "k-btn--warning",
          defaultIcon: (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          ),
        };
      default:
        return {
          badgeBg: "#fef3c7",
          badgeColor: "#b45309",
          confirmBtnClass: "k-btn--primary",
          defaultIcon: (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 16v-4" />
              <path d="M12 8h.01" />
            </svg>
          ),
        };
    }
  };

  const { badgeBg, badgeColor, confirmBtnClass, defaultIcon } = getVariantStyles();

  return (
    <div
      className="k-modal-backdrop"
      onClick={() => {
        if (!isLoading) onClose();
      }}
      role="presentation"
    >
      <div
        className="k-modal-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="k-modal-title"
        aria-describedby="k-modal-description"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="k-modal-icon-badge"
          style={{ backgroundColor: badgeBg, color: badgeColor }}
          aria-hidden="true"
        >
          {icon || defaultIcon}
        </div>

        <div className="k-modal-content">
          <h2 id="k-modal-title" className="k-modal-title">
            {title}
          </h2>
          <div id="k-modal-description" className="k-modal-desc">
            {message}
          </div>
        </div>

        <div className="k-modal-actions">
          <button
            type="button"
            className="k-btn k-btn--outline"
            onClick={onClose}
            disabled={isLoading}
          >
            {cancelText}
          </button>
          <button
            ref={confirmButtonRef}
            type="button"
            className={`k-btn ${confirmBtnClass}`}
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading && <span className="k-spinner" aria-hidden="true" />}
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
