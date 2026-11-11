import React, { useState } from "react";
import { loginUser, loginWithGoogle } from "../../services/authService";
import PasswordInput from "../common/PasswordInput";
import ForgotPassword from "./ForgotPassword";

/**
 * User Authentication Screen (Login.jsx)
 * Clean, production-grade form matching the official prototype.
 * Displays the official KusinApp emblem atop the card.
 */
export default function Login({ onLoginSuccess, onNavigateToRegister, onNavigateToForgot }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [errorAlert, setErrorAlert] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);

  const handleOpenForgot = () => {
    if (typeof onNavigateToForgot === "function") {
      onNavigateToForgot();
    } else {
      setIsForgotPassword(true);
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

  const handleGoogleSignIn = async () => {
    setErrorAlert("");
    setIsSubmitting(true);
    try {
      const user = await loginWithGoogle();
      if (typeof onLoginSuccess === "function") onLoginSuccess(user);
    } catch (err) {
      setErrorAlert(err.message || "Failed to sign in with Google.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isForgotPassword) {
    return <ForgotPassword onBackToLogin={() => setIsForgotPassword(false)} />;
  }

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

      <button
        type="button"
        className="k-btn k-btn--google k-btn--block"
        onClick={handleGoogleSignIn}
        disabled={isSubmitting}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
        </svg>
        Continue with Google
      </button>

      <div className="k-or-divider">
        <span>or sign in with email</span>
      </div>

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
            onClick={handleOpenForgot}
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
    </div>
  );
}
