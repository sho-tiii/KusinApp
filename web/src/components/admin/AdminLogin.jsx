import React, { useState } from "react";
import { loginAdmin } from "../../services/adminService";
import PasswordInput from "../common/PasswordInput";
import ForgotPassword from "../auth/ForgotPassword";

/**
 * Unified Admin & Super Admin Login (Split-Screen) — Cohesive with KusinApp Design System.
 * Zero floating pills, clean typography, warm illustrations, and email link password reset.
 */
export default function AdminLogin({ onLoginSuccess, onSwitchToUserPortal }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorAlert, setErrorAlert] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);

  const handleAdminSubmit = async (e) => {
    e.preventDefault();
    setErrorAlert("");

    if (!email.trim() || !password) {
      setErrorAlert("Please enter both your administrator email and password.");
      return;
    }

    setIsSubmitting(true);
    try {
      const { user, profile } = await loginAdmin(email, password);
      if (typeof onLoginSuccess === "function") {
        onLoginSuccess(user, profile);
      }
    } catch (err) {
      setErrorAlert(err.message || "Authentication failed. Please check your credentials.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-white">
      {/* LEFT: Brand & Purpose Showcase */}
      <div className="lg:flex-[1.1] flex flex-col justify-between px-6 py-8 sm:px-12 lg:py-12 lg:px-16 bg-slate-50 border-b lg:border-b-0 lg:border-r border-slate-200">
        {/* Top-anchored logo */}
        <div className="max-w-[520px] w-full mx-auto flex items-center min-h-[48px]">
          <img
            src="/assets/kusinapp-logo-horizontal.png"
            alt="KusinApp"
            className="h-11 w-auto max-w-[200px] object-contain"
          />
        </div>

        {/* Vertically centered illustration + headline block */}
        <div className="flex flex-col justify-center flex-1 max-w-[520px] w-full mx-auto py-6 lg:py-8">
          <div className="relative w-52 h-52 mx-auto lg:mx-0 mb-6 grid place-items-center">
            <div className="absolute inset-2 rounded-full bg-amber-100/70" />
            <img
              src="/assets/onboard-cooking.png"
              alt="KusinApp Kitchen Administration"
              className="relative w-44 h-44 object-contain"
            />
          </div>
          <div className="text-xs font-extrabold tracking-widest uppercase text-amber-700 mb-2">
            KusinApp Governance & Operations
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 leading-tight tracking-tight m-0">
            Keep every recipe, ingredient, and price in order.
          </h1>
          <p className="mt-3.5 text-sm sm:text-base text-slate-600 leading-relaxed m-0">
            Sign in with your administrative credentials to manage root system infrastructure,
            administrative roles, recipe moderation, and platform-wide configurations.
          </p>
        </div>

        {/* Bottom copyright footer */}
        <footer className="text-xs text-slate-400 max-w-[520px] mx-auto w-full min-h-[36px] flex items-center">
          © 2026 KusinApp · Recipe & Cost Management Platform
        </footer>
      </div>

      {/* RIGHT: Unified Administrative Sign-In or Forgot Password Link */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 lg:p-16 bg-white">
        <div className="w-full max-w-[420px]">
          {isForgotPassword ? (
            <ForgotPassword
              isAdminPortal={true}
              onBackToLogin={() => setIsForgotPassword(false)}
            />
          ) : (
            <div>
              <div className="mb-7">
                <div className="text-xs font-extrabold tracking-widest uppercase text-amber-700 mb-1.5">
                  Administrative Portal
                </div>
                <h2 className="text-2xl sm:text-[1.75rem] font-extrabold text-slate-900 tracking-tight leading-tight">
                  Admin & Super Admin Sign In
                </h2>
                <p className="mt-1.5 text-sm text-slate-600">
                  Use your authorized KusinApp administration account to continue.
                </p>
              </div>

              {errorAlert && (
                <div
                  role="alert"
                  className="px-3.5 py-3 mb-4 rounded-xl border border-red-200 bg-red-50 text-red-700 text-xs font-semibold text-center leading-relaxed"
                >
                  {errorAlert}
                </div>
              )}

              <form onSubmit={handleAdminSubmit} noValidate className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="admin-email"
                    className="text-xs font-bold tracking-wider uppercase text-slate-800"
                  >
                    Email Address
                  </label>
                  <input
                    id="admin-email"
                    type="email"
                    className="w-full h-12 px-3.5 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-[0.95rem] text-slate-900 placeholder:text-slate-400 outline-none hover:border-slate-300 focus:border-amber-500 focus:shadow-amber-ring transition-all disabled:opacity-60"
                    placeholder="Enter your administrative email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isSubmitting}
                    autoComplete="email"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between items-baseline">
                    <label
                      htmlFor="admin-password"
                      className="text-xs font-bold tracking-wider uppercase text-slate-800"
                    >
                      Password
                    </label>
                    <button
                      type="button"
                      className="border-0 bg-transparent p-0 text-xs font-bold text-amber-700 hover:underline cursor-pointer"
                      onClick={() => setIsForgotPassword(true)}
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <PasswordInput
                    id="admin-password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isSubmitting}
                    autoComplete="current-password"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full h-14 py-3.5 px-6 bg-amber-500 hover:bg-amber-600 rounded-full text-base font-extrabold text-white shadow-[0_8px_20px_-4px_rgba(245,158,11,0.45)] inline-flex items-center justify-center gap-2 transition-all disabled:opacity-55 cursor-pointer"
                  style={{ minHeight: "54px" }}
                  disabled={isSubmitting}
                >
                  {isSubmitting && (
                    <span
                      className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"
                      aria-hidden="true"
                    />
                  )}
                  {isSubmitting ? "Verifying administrative access..." : "Sign In →"}
                </button>
              </form>

              <div className="flex gap-3 items-start mt-6 p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-600 leading-relaxed">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                  className="shrink-0 text-amber-600 mt-0.5"
                >
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <div>
                  <strong className="font-bold text-slate-900">Root governance session.</strong>{" "}
                  Role-based access control strictly enforced.
                  <div className="mt-0.5 text-slate-400 text-[11.5px]">
                    Unauthorized attempts are audited in administrative activity logs.
                  </div>
                </div>
              </div>

              {typeof onSwitchToUserPortal === "function" && (
                <p className="flex items-center justify-center gap-1.5 mt-7 text-xs font-medium text-slate-600">
                  Looking for the user kitchen app?
                  <button
                    type="button"
                    className="border-0 bg-transparent p-0 font-bold text-amber-700 hover:underline cursor-pointer"
                    onClick={onSwitchToUserPortal}
                  >
                    Return to KusinApp Web
                  </button>
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
