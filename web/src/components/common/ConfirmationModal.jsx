import React, { useEffect, useRef } from "react";

/**
 * Reusable Confirmation Modal styled to match the unified KusinApp mobile & web design system.
 */
export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  children,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "primary",
  isLoading = false,
  maxWidth = "max-w-[480px]",
}) {
  const confirmButtonRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return undefined;

    const handleKeyDown = (e) => {
      if (e.key === "Escape" && !isLoading && onClose) {
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

  const getConfirmButtonClasses = () => {
    switch (variant) {
      case "danger":
        return "bg-red-600 hover:bg-red-700 border-red-600";
      case "warning":
        return "bg-amber-600 hover:bg-amber-700 border-amber-600";
      default:
        return "bg-amber-500 hover:bg-amber-600 border-amber-500";
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/45 backdrop-blur-sm animate-fade-in"
      onClick={() => {
        if (!isLoading && onClose) onClose();
      }}
      role="presentation"
    >
      <div
        className={`w-full ${maxWidth} bg-white border border-slate-200 rounded-3xl shadow-modal p-6 sm:p-7 flex flex-col gap-3 animate-scale-in max-h-[90vh] overflow-y-auto`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="k-popup-title"
        aria-describedby="k-popup-description"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Title and '×' Close Button */}
        <div className="flex items-center justify-between gap-3">
          <h2
            id="k-popup-title"
            className="text-xl font-extrabold text-slate-900 tracking-tight m-0"
          >
            {title}
          </h2>
          {onClose && (
            <button
              type="button"
              className="grid place-items-center w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-900 transition-colors disabled:opacity-50 cursor-pointer"
              onClick={onClose}
              disabled={isLoading}
              aria-label="Close dialog"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>

        {/* Message body */}
        {message && (
          <div
            id="k-popup-description"
            className="text-sm text-slate-600 leading-relaxed mt-0.5"
          >
            {message}
          </div>
        )}

        {children}

        {/* Bottom actions (rounded-xl, no vibe-coded pill buttons) */}
        <div className="flex items-center justify-end gap-2.5 mt-4">
          {cancelText ? (
            <button
              type="button"
              className="flex-1 inline-flex items-center justify-center h-11 px-5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all disabled:opacity-50 cursor-pointer"
              onClick={onClose}
              disabled={isLoading}
            >
              {cancelText}
            </button>
          ) : null}
          <button
            ref={confirmButtonRef}
            type="button"
            className={`flex-1 inline-flex items-center justify-center gap-2 h-11 px-5 border rounded-xl text-sm font-bold text-white transition-all disabled:opacity-55 cursor-pointer ${getConfirmButtonClasses()}`}
            onClick={onConfirm || onClose}
            disabled={isLoading}
          >
            {isLoading && (
              <span
                className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin"
                aria-hidden="true"
              />
            )}
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
