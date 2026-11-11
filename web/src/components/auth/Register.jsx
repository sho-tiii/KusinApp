import React, { useState } from "react";
import { registerUser, loginWithGoogle } from "../../services/authService";
import PasswordInput from "../common/PasswordInput";
import PasswordStrengthMeter, { evaluatePasswordStrength } from "../common/PasswordStrengthMeter";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * User Registration Screen (Register.jsx)
 * Clean, production-grade form using the official KusinApp emblem.
 */
export default function Register({ onRegisterSuccess, onNavigateToLogin }) {
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [warnings, setWarnings] = useState({});
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateFields = () => {
    const next = {};
    const name = displayName.trim();
    const mail = email.trim();

    if (!name) next.displayName = "Please enter your full name.";
    else if (name.length < 2) next.displayName = "Name must be at least 2 characters.";

    if (!mail) next.email = "Email address is required.";
    else if (!EMAIL_REGEX.test(mail)) next.email = "Please enter a valid email address.";

    if (!password) {
      next.password = "Password is required.";
    } else {
      const strength = evaluatePasswordStrength(password);
      if (!strength.isValid) {
        next.password = "Password must meet at least 3 strength criteria (minimum 8 characters).";
      }
    }

    if (confirmPassword !== password) next.confirmPassword = "Passwords do not match.";

    setWarnings(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    if (!validateFields()) return;

    setIsSubmitting(true);
    try {
      const user = await registerUser(email, password, displayName);
      if (typeof onRegisterSuccess === "function") onRegisterSuccess(user);
    } catch (err) {
      setFormError(err.message || "Registration failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setFormError("");
    setIsSubmitting(true);
    try {
      const user = await loginWithGoogle();
      if (typeof onRegisterSuccess === "function") onRegisterSuccess(user);
    } catch (err) {
      setFormError(err.message || "Failed to sign up with Google.");
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
        <h1 className="k-title">Create an Account</h1>
        <p className="k-subtitle">Plan balanced, affordable Filipino meals and manage your pantry.</p>
      </div>

      {formError && (
        <div role="alert" className="k-alert k-alert--error">
          {formError}
        </div>
      )}

      <button
        type="button"
        className="k-btn k-btn--google k-btn--block"
        onClick={handleGoogleSignUp}
        disabled={isSubmitting}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
        </svg>
        Sign up with Google
      </button>

      <div className="k-or-divider">
        <span>or sign up with email</span>
      </div>

      <form onSubmit={handleSubmit} noValidate className="k-form">
        <div className="k-field">
          <label htmlFor="register-name" className="k-label">Full Name</label>
          <input
            id="register-name"
            type="text"
            className="k-input"
            placeholder="Juan Dela Cruz"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            disabled={isSubmitting}
            autoComplete="name"
            aria-invalid={!!warnings.displayName || undefined}
          />
          {warnings.displayName && <span className="k-field-error">{warnings.displayName}</span>}
        </div>

        <div className="k-field">
          <label htmlFor="register-email" className="k-label">Email</label>
          <input
            id="register-email"
            type="email"
            className="k-input"
            placeholder="juan@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isSubmitting}
            autoComplete="email"
            aria-invalid={!!warnings.email || undefined}
          />
          {warnings.email && <span className="k-field-error">{warnings.email}</span>}
        </div>

        <div className="k-field">
          <label htmlFor="register-password" className="k-label">
            Password <span className="k-hint">min. 8 characters</span>
          </label>
          <PasswordInput
            id="register-password"
            placeholder="Create a strong password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isSubmitting}
            autoComplete="new-password"
            invalid={!!warnings.password}
          />
          <PasswordStrengthMeter password={password} />
          {warnings.password && <span className="k-field-error">{warnings.password}</span>}
        </div>

        <div className="k-field">
          <label htmlFor="register-confirm" className="k-label">Confirm Password</label>
          <PasswordInput
            id="register-confirm"
            placeholder="Re-enter your password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={isSubmitting}
            autoComplete="new-password"
            invalid={!!warnings.confirmPassword}
          />
          {warnings.confirmPassword && <span className="k-field-error">{warnings.confirmPassword}</span>}
        </div>

        <button type="submit" className="k-btn k-btn--primary k-btn--block" disabled={isSubmitting}>
          {isSubmitting && <span className="k-spinner" aria-hidden="true" />}
          {isSubmitting ? "Creating account..." : "Sign Up"}
        </button>
      </form>

      {typeof onNavigateToLogin === "function" && (
        <p className="k-divider">
          Already have an account?
          <button type="button" className="k-link" onClick={onNavigateToLogin}>Log In</button>
        </p>
      )}
    </div>
  );
}
