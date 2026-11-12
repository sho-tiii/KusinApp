import React, { useState } from "react";
import { sendPasswordResetLink } from "../../services/authService";

/**
 * Clean Email Link Password Reset Component (Shared between User and Admin portals).
 * Sends a standard password reset link directly to the user's email without OTP.
 */
export default function ForgotPassword({ onBackToLogin, isAdminPortal = false }) {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendNotice, setResendNotice] = useState("");

  const handleRequestLink = async (e) => {
    if (e) e.preventDefault();
    setErrorMsg("");
    setResendNotice("");

    if (!email.trim()) {
      setErrorMsg(
        isAdminPortal
          ? "Please enter your administrator work email address."
          : "Please enter your registered email address."
      );
      return;
    }

    setIsLoading(true);
    try {
      await sendPasswordResetLink(email);
      setSent(true);
    } catch (err) {
      setErrorMsg(err.message || "Failed to send password reset link. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendLink = async () => {
    if (resending) return;
    setErrorMsg("");
    setResendNotice("");
    setResending(true);
    try {
      await sendPasswordResetLink(email);
      setResendNotice("A fresh password reset link has been sent to your inbox.");
    } catch (err) {
      setErrorMsg(err.message || "Failed to resend link.");
    } finally {
      setResending(false);
    }
  };

  if (sent) {
    return (
      <div className="w-full">
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-700 grid place-items-center mx-auto mb-4 border border-amber-200">
            <svg
              width="26"
              height="26"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Check Your Email
          </h1>
          <p className="mt-2 text-sm text-slate-600 leading-relaxed">
            We sent a password reset link to:
            <br />
            <strong className="text-slate-900 font-extrabold text-[0.95rem]">{email}</strong>
          </p>
        </div>

        <div className="p-4 mb-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-600 leading-relaxed space-y-2.5">
          <div className="flex items-start gap-3">
            <span className="w-5 h-5 rounded-full bg-amber-100 border border-amber-300 text-amber-800 font-bold text-[11px] grid place-items-center shrink-0 mt-0.5">
              1
            </span>
            <span>Open the password reset email from KusinApp in your inbox or spam folder.</span>
          </div>
          <div className="flex items-start gap-3">
            <span className="w-5 h-5 rounded-full bg-amber-100 border border-amber-300 text-amber-800 font-bold text-[11px] grid place-items-center shrink-0 mt-0.5">
              2
            </span>
            <span>Click the secure reset link inside the email to choose your new password.</span>
          </div>
        </div>

        {resendNotice && (
          <div
            role="status"
            className="px-3.5 py-2.5 mb-4 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-800 text-xs font-semibold text-center"
          >
            {resendNotice}
          </div>
        )}

        {errorMsg && (
          <div
            role="alert"
            className="px-3.5 py-3 mb-4 rounded-xl border border-red-200 bg-red-50 text-red-700 text-sm text-center"
          >
            {errorMsg}
          </div>
        )}

        <button
          type="button"
          className="w-full h-12 px-4 bg-amber-500 hover:bg-amber-600 rounded-2xl text-[0.95rem] font-bold text-white shadow-sm inline-flex items-center justify-center transition-all cursor-pointer"
          onClick={onBackToLogin}
        >
          {isAdminPortal ? "Back to Administrative Sign In" : "Back to Log In"}
        </button>

        <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500">
          <button
            type="button"
            onClick={handleResendLink}
            disabled={resending}
            className="border-0 bg-transparent p-0 font-bold text-amber-700 hover:underline cursor-pointer disabled:opacity-50"
          >
            {resending ? "Sending link..." : "Resend reset link"}
          </button>
          <button
            type="button"
            onClick={() => {
              setSent(false);
              setErrorMsg("");
              setResendNotice("");
            }}
            className="border-0 bg-transparent p-0 font-semibold text-slate-500 hover:text-slate-800 hover:underline cursor-pointer"
          >
            Use a different email
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="text-center mb-6">
        <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-700 grid place-items-center mx-auto mb-4 border border-amber-200">
          <svg
            width="26"
            height="26"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight leading-tight">
          Forgot Your Password?
        </h1>
        <p className="mt-1.5 text-sm text-slate-600 leading-relaxed">
          Enter the email address linked to your KusinApp account and we&apos;ll send you a password reset link.
        </p>
      </div>

      {errorMsg && (
        <div
          role="alert"
          className="px-3.5 py-3 mb-4 rounded-xl border border-red-200 bg-red-50 text-red-700 text-sm leading-relaxed text-center font-medium"
        >
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleRequestLink} noValidate className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="reset-email"
            className="text-xs font-bold tracking-wider uppercase text-slate-800"
          >
            Email Address
          </label>
          <input
            id="reset-email"
            type="email"
            className="w-full h-12 py-3.5 px-4 bg-slate-50/80 focus:bg-white border border-slate-200 rounded-2xl text-[0.95rem] text-slate-900 placeholder:text-slate-400 outline-none hover:border-slate-300 focus:border-amber-500 focus:shadow-amber-ring transition-all disabled:opacity-60"
            style={{ minHeight: "50px" }}
            placeholder={isAdminPortal ? "admin@kusinapp.ph" : "juan@example.com"}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
            autoComplete="email"
          />
        </div>

        <button
          type="submit"
          className="w-full h-14 py-3.5 px-6 bg-amber-500 hover:bg-amber-600 rounded-full text-base font-extrabold text-white shadow-[0_8px_20px_-4px_rgba(245,158,11,0.45)] inline-flex items-center justify-center gap-2 transition-all disabled:opacity-55 cursor-pointer"
          style={{ minHeight: "54px" }}
          disabled={isLoading}
        >
          {isLoading && (
            <span
              className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"
              aria-hidden="true"
            />
          )}
          {isLoading ? "Sending link..." : "Send Reset Link →"}
        </button>
      </form>

      <p className="flex items-center justify-center mt-5 text-sm text-slate-600">
        <button
          type="button"
          className="border-0 bg-transparent p-0 font-bold text-amber-700 hover:underline cursor-pointer"
          onClick={onBackToLogin}
        >
          {isAdminPortal ? "← Back to Administrative Sign In" : "← Back to Log In"}
        </button>
      </p>
    </div>
  );
}
