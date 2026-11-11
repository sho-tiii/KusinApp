import React, { useState } from "react";
import { registerUser } from "../../services/authService";
import PasswordInput from "../common/PasswordInput";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * US-01: User Registration Screen (Register.jsx)
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

    if (!password) next.password = "Password is required.";
    else if (password.length < 6) next.password = "Password must be at least 6 characters.";

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
            Password <span className="k-hint">min. 6 characters</span>
          </label>
          <PasswordInput
            id="register-password"
            placeholder="Create a password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isSubmitting}
            autoComplete="new-password"
            invalid={!!warnings.password}
          />
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
