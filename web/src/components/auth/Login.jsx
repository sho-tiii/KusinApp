import React, { useState } from "react";
import { loginUser, resetUserPassword } from "../../services/authService";
import PasswordInput from "../common/PasswordInput";
import ConfirmationModal from "../common/ConfirmationModal";

/**
 * US-02: User Authentication Screen (Login.jsx)
 * Clean, production-grade form matching the official prototype.
 * Displays the official KusinApp emblem atop the card.
 */
export default function Login({ onLoginSuccess, onNavigateToRegister }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [errorAlert, setErrorAlert] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Forgot Password state
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
      setResetError("Please enter your email address.");
      return;
    }
    setIsSendingReset(true);
    try {
      await resetUserPassword(resetEmail);
      setResetSuccess(true);
    } catch (err) {
      setResetError(err.message || "Failed to send reset link. Please try again.");
    } finally {
      setIsSendingReset(false);
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorAlert("");

    if (!email.trim() || !password) {
      setErrorAlert("Please enter both your email address and password.");
      return;
    }

    setIsSubmitting(true);
    try {
      const user = await loginUser(email, password, remember);
      setPassword("");
      if (typeof onLoginSuccess === "function") onLoginSuccess(user);
    } catch (err) {
      setErrorAlert(
        err.message || "Invalid email or password. Please check your credentials and try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div className="k-card-head">
        <img
          src="/assets/kusinapp-logo-stacked.png"
          alt="KusinApp emblem"
          className="k-card-brand-emblem"
        />
        <h1 className="k-title">Welcome Back</h1>
        <p className="k-subtitle">Log in to save your favorite recipes and continue them in KusinApp.</p>
      </div>

      {errorAlert && (
        <div role="alert" className="k-alert k-alert--error">
          {errorAlert}
        </div>
      )}

      <form onSubmit={handleLoginSubmit} noValidate className="k-form">
        <div className="k-field">
          <label htmlFor="login-email" className="k-label">Email</label>
          <input
            id="login-email"
            type="email"
            className="k-input"
            placeholder="juan@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isSubmitting}
            autoComplete="email"
          />
        </div>

        <div className="k-field">
          <label htmlFor="login-password" className="k-label">Password</label>
          <PasswordInput
            id="login-password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isSubmitting}
            autoComplete="current-password"
          />
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
          <label className="k-check" style={{ margin: 0 }}>
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
            />
            Remember me
          </label>
          <button
            type="button"
            className="k-link"
            style={{ fontSize: "0.85rem" }}
            onClick={handleOpenReset}
          >
            Forgot password?
          </button>
        </div>

        <button
          type="submit"
          className="k-btn k-btn--primary k-btn--block"
          disabled={isSubmitting}
        >
          {isSubmitting && <span className="k-spinner" aria-hidden="true" />}
          {isSubmitting ? "Signing in..." : "Log In"}
        </button>
      </form>

      {typeof onNavigateToRegister === "function" && (
        <p className="k-divider">
          Don&apos;t have an account?
          <button type="button" className="k-link" onClick={onNavigateToRegister}>Sign Up</button>
        </p>
      )}

      {/* US-02 Reusable Confirmation / Action Modal for Password Reset */}
      <ConfirmationModal
        isOpen={isResetOpen}
        onClose={() => setIsResetOpen(false)}
        onConfirm={resetSuccess ? () => setIsResetOpen(false) : handleSendReset}
        title={resetSuccess ? "Reset Link Sent" : "Reset Password"}
        confirmText={resetSuccess ? "Done" : "Send Reset Link"}
        cancelText={resetSuccess ? "Close" : "Cancel"}
        variant="primary"
        isLoading={isSendingReset}
        message={
          resetSuccess ? (
            <div>
              <p style={{ margin: "0 0 8px", color: "var(--k-ink)" }}>
                We&apos;ve sent a password reset link to:
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
                Enter your registered account email and we&apos;ll send you a secure link to reset your password.
              </p>
              <div className="k-field" style={{ margin: 0 }}>
                <label htmlFor="reset-email-input" className="k-label">
                  EMAIL ADDRESS
                </label>
                <input
                  id="reset-email-input"
                  type="email"
                  className="k-input"
                  placeholder="juan@example.com"
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
