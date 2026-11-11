import React, { useState } from "react";
import { loginUser } from "./authService";
import PasswordInput from "./PasswordInput";
import { IconLock } from "./Icons";

/**
 * US-02: User Authentication Screen (Login.jsx)
 * Clean, production-grade form matching the official prototype.
 * Uses official SVG icons and responsive mobile-first tokens.
 */
export default function Login({ onLoginSuccess, onNavigateToRegister }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [errorAlert, setErrorAlert] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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
        <div className="k-card-icon" aria-hidden="true">
          <IconLock size={24} />
        </div>
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

        <label className="k-check">
          <input
            type="checkbox"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
          />
          Remember me
        </label>

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
