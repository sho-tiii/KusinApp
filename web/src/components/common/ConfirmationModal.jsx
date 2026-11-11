import React, { useEffect, useRef } from "react";

/**
 * Reusable Confirmation Modal styled with Tailwind CSS matching the official KusinApp popup prototype.
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
    if (!isOpen) return undefined;

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

  const getConfirmButtonClasses = () => {
    switch (variant) {
      case "danger":
        return "bg-chili-500 hover:bg-chili-600 border-chili-600 shadow-sm shadow-red-600/30";
      case "warning":
        return "bg-amber-600 hover:bg-amber-700 border-amber-700 shadow-sm shadow-amber-600/30";
      default:
        return "bg-orange-600 hover:bg-orange-700 border-orange-700 shadow-sm shadow-orange-600/30";
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/45 backdrop-blur-sm animate-fade-in"
      onClick={() => {
        if (!isLoading) onClose();
      }}
      role="presentation"
    >
      <div
        className="w-full max-w-[480px] bg-white border border-slate-200 rounded-3xl shadow-modal p-6 sm:p-8 flex flex-col gap-3 animate-scale-in"
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
            className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight m-0"
          >
            {title}
          </h2>
          <button
            type="button"
            className="grid place-items-center w-8 h-8 -mr-1 rounded-full bg-transparent text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors disabled:opacity-50"
            onClick={onClose}
            disabled={isLoading}
            aria-label="Close dialog"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Message body */}
        <div id="k-popup-description" className="text-[0.95rem] text-slate-600 leading-relaxed mt-1">
          {message}
        </div>

        {/* Bottom pill actions */}
        <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5 sm:gap-3 mt-5">
          <button
            type="button"
            className="w-full sm:w-auto inline-flex items-center justify-center h-11 px-6 bg-white border border-slate-300 rounded-full text-sm font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-400 hover:text-slate-900 transition-all disabled:opacity-50"
            onClick={onClose}
            disabled={isLoading}
          >
            {cancelText}
          </button>
          <button
            ref={confirmButtonRef}
            type="button"
            className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 h-11 px-6 border rounded-full text-sm font-bold text-white transition-all disabled:opacity-55 ${getConfirmButtonClasses()}`}
            onClick={onConfirm}
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
