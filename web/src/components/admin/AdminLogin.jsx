import React, { useState } from "react";
import { loginAdmin } from "../../services/adminService";
import PasswordInput from "../common/PasswordInput";
import AdminForgotPassword from "./AdminForgotPassword";

/**
 * Unified Admin & Super Admin Login (Split-Screen)
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

  if (isForgotPassword) {
    return <AdminForgotPassword onBackToLogin={() => setIsForgotPassword(false)} />;
  }

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
                  onClick={() => setIsForgotPassword(true)}
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
    </div>
  );
}
