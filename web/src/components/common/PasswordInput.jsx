import React, { useState } from "react";

/**
 * Password input with show/hide toggle, styled with Tailwind CSS matching the KusinApp prototype.
 */
export default function PasswordInput({
  id,
  value,
  onChange,
  placeholder,
  disabled,
  invalid,
  autoComplete,
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative flex items-center">
      <input
        id={id}
        type={visible ? "text" : "password"}
        className={`w-full h-12 pl-4 pr-11 rounded-2xl border text-[0.95rem] text-slate-900 placeholder:text-slate-400 outline-none transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed ${
          invalid
            ? "border-red-600 bg-red-50/40 focus:border-red-600 focus:ring-2 focus:ring-red-500/20"
            : "border-slate-200 bg-slate-50/80 hover:border-slate-300 focus:bg-white focus:border-amber-500 focus:shadow-amber-ring"
        }`}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        autoComplete={autoComplete}
        aria-invalid={invalid || undefined}
      />
      <button
        type="button"
        className="absolute right-2.5 grid place-items-center w-8 h-8 rounded-full bg-transparent text-slate-400 hover:text-slate-700 hover:bg-slate-900/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "Hide password" : "Show password"}
        aria-pressed={visible}
        disabled={disabled}
      >
        {visible ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M3 3l18 18M10.6 10.6a2 2 0 002.8 2.8M9.9 5.1A9.8 9.8 0 0112 5c5 0 9 4.5 10 7-.4 1-1.2 2.3-2.4 3.5M6.6 6.6C4.5 8 3 10 2 12c1 2.5 5 7 10 7 1.8 0 3.4-.5 4.8-1.3"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M2 12c1-2.5 5-7 10-7s9 4.5 10 7c-1 2.5-5 7-10 7S3 14.5 2 12z"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinejoin="round"
            />
            <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8" />
          </svg>
        )}
      </button>
    </div>
  );
}
