import React, { useState } from "react";
import { loginAdmin } from "../../services/adminService";
import { resetUserPassword } from "../../services/authService";
import PasswordInput from "../common/PasswordInput";
import ConfirmationModal from "../common/ConfirmationModal";

/**
 * US-14 & US-22: Unified Admin & Super Admin Login (Split-Screen)
 * Accurately aligned with the prototype layout:
 * - Top-left anchored KusinApp logo (matching user navbar height & placement)
 * - Vertically centered headline & subheadline that aligns level with the right login card
 * - Fixed bottom copyright footer
 * - Right side: Authentication card with role validation and security notice
 */
export default function AdminLogin({ onLoginSuccess, onSwitchToUserPortal }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorAlert, setErrorAlert] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Forgot Password modal state
  const [isResetOpen, setIsResetOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetError, setResetError] = useState("");
  const [resetSuccess, setResetSuccess] = useState(false);
  const [isSendingReset, setIsSendingReset] = useState(false);

  const handleOpenReset = () => {
    setResetEmail(email.trim());
    setResetError("");
    setResetSuccess(false);
    setIsResetOpen(true);
  };

  const handleSendReset = async () => {
    setResetError("");
    if (!resetEmail.trim()) {
      setResetError("Please enter your administrator email address.");
      return;
    }
    setIsSendingReset(true);
    try {
      await resetUserPassword(resetEmail);
      setResetSuccess(true);
    } catch (err) {
      setResetError(err.message || "Failed to send reset email. Please try again.");
    } finally {
      setIsSendingReset(false);
    }
  };

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
    <div className="k-admin-layout">
      {/* LEFT: Brand & Purpose Showcase */}
      <div className="k-admin-showcase">
        {/* Top-anchored logo (similar to navbar) */}
        <div className="k-admin-topbar">
          <img
            src="/assets/kusinapp-logo-horizontal.png"
            alt="KusinApp"
            className="k-admin-logo"
          />
        </div>

        {/* Vertically centered headline block (perfectly aligned with the login card) */}
        <div className="k-admin-hero-block">
          <h1 className="k-admin-headline">
            Keep every recipe, ingredient, and price in order.
          </h1>
          <p className="k-admin-subheadline">
            Sign in with your administrative credentials to manage root system infrastructure,
            administrative roles, recipe moderation, and platform-wide configurations.
          </p>
        </div>

        {/* Bottom copyright footer */}
        <footer className="k-admin-showcase-footer">
          © 2026 KusinApp. Recipe & Cost Management Platform.
        </footer>
      </div>

      {/* RIGHT: Unified Administrative Sign-In */}
      <div className="k-admin-auth-pane">
        <div className="k-admin-auth-box">
          <div className="k-admin-auth-header">
            <span className="k-admin-badge">Administrative Portal</span>
            <h2 className="k-admin-title">Admin & Super Admin Sign In</h2>
            <p className="k-admin-desc">
              Use your authorized KusinApp administration account to continue.
            </p>
          </div>

          {errorAlert && (
            <div role="alert" className="k-alert k-alert--error">
              {errorAlert}
            </div>
          )}

          <form onSubmit={handleAdminSubmit} noValidate className="k-form">
            <div className="k-field">
              <label htmlFor="admin-email" className="k-label">
                EMAIL ADDRESS
              </label>
              <input
                id="admin-email"
                type="email"
                className="k-input"
                placeholder="Enter your administrative email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubmitting}
                autoComplete="email"
              />
            </div>

            <div className="k-field">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <label htmlFor="admin-password" className="k-label">
                  PASSWORD
                </label>
                <button
                  type="button"
                  className="k-link"
                  style={{ fontSize: "0.78rem" }}
                  onClick={handleOpenReset}
                >
                  Forgot password?
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
              className="k-btn k-btn--primary k-btn--block"
              disabled={isSubmitting}
            >
              {isSubmitting && <span className="k-spinner" aria-hidden="true" />}
              {isSubmitting ? "Verifying administrative access..." : "Sign in →"}
            </button>
          </form>

          <div className="k-admin-security-note">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <div>
              <strong>Root governance session.</strong> Role-based access control strictly enforced.
              <div style={{ marginTop: "2px", color: "var(--k-subtle)", fontSize: "0.75rem" }}>
                Unauthorized attempts are audited in administrative activity logs.
              </div>
            </div>
          </div>

          {typeof onSwitchToUserPortal === "function" && (
            <p className="k-divider" style={{ marginTop: "28px" }}>
              Looking for the user kitchen app?
              <button
                type="button"
                className="k-link"
                onClick={onSwitchToUserPortal}
              >
                Return to Web Viewer
              </button>
            </p>
          )}
        </div>
      </div>

      {/* US-14/US-22 Admin Password Recovery Modal */}
      <ConfirmationModal
        isOpen={isResetOpen}
        onClose={() => setIsResetOpen(false)}
        onConfirm={resetSuccess ? () => setIsResetOpen(false) : handleSendReset}
        title={resetSuccess ? "Reset Link Sent" : "Reset Administrative Password"}
        confirmText={resetSuccess ? "Done" : "Send Reset Link"}
        cancelText={resetSuccess ? "Close" : "Cancel"}
        variant="primary"
        isLoading={isSendingReset}
        message={
          resetSuccess ? (
            <div>
              <p style={{ margin: "0 0 8px", color: "var(--k-ink)" }}>
                We&apos;ve sent an administrative password reset link to:
              </p>
              <p style={{ fontWeight: 700, color: "var(--k-ink)", margin: "0 0 12px" }}>
                {resetEmail}
              </p>
              <p style={{ margin: 0, fontSize: "0.88rem", color: "var(--k-muted)" }}>
                Please check your inbox (and spam folder) and follow the instructions to set your new password.
              </p>
            </div>
          ) : (
            <div>
              <p style={{ margin: "0 0 16px", color: "var(--k-muted)", fontSize: "0.92rem", lineHeight: 1.5 }}>
                Enter your authorized administrator email address to receive a secure recovery link.
              </p>
              <div className="k-field" style={{ margin: 0 }}>
                <label htmlFor="admin-reset-email" className="k-label">
                  ADMINISTRATIVE EMAIL
                </label>
                <input
                  id="admin-reset-email"
                  type="email"
                  className="k-input"
                  placeholder="admin@kusinapp.ph"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  disabled={isSendingReset}
                  autoComplete="email"
                />
              </div>
              {resetError && (
                <div role="alert" className="k-alert k-alert--error" style={{ marginTop: 12 }}>
                  {resetError}
                </div>
              )}
            </div>
          )
        }
      />
    </div>
  );
}
