import React, { useState } from "react";
import { registerUser } from "./authService";

/**
 * US-01: User Registration Screen (Register.jsx)
 * Provides display name, email, and password inputs with client-side validation warnings
 * and Firebase registration submission handling.
 */
export default function Register({ onRegisterSuccess, onNavigateToLogin }) {
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [validationWarnings, setValidationWarnings] = useState({});
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateFields = () => {
    const warnings = {};
    const trimmedName = displayName.trim();
    const trimmedEmail = email.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!trimmedName) {
      warnings.displayName = "Please enter your full name or display name.";
    } else if (trimmedName.length < 2) {
      warnings.displayName = "Display name must be at least 2 characters.";
    }

    if (!trimmedEmail) {
      warnings.email = "Email address is required.";
    } else if (!emailRegex.test(trimmedEmail)) {
      warnings.email = "Please enter a valid email address.";
    }

    if (!password) {
      warnings.password = "Password is required.";
    } else if (password.length < 6) {
      warnings.password = "Password must be at least 6 characters long.";
    }

    if (confirmPassword !== password) {
      warnings.confirmPassword = "Passwords do not match.";
    }

    setValidationWarnings(warnings);
    return Object.keys(warnings).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    setSuccessMessage("");

    if (!validateFields()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const user = await registerUser(email, password, displayName);
      setSuccessMessage(
        `Welcome to KusinApp, ${user.displayName || displayName.trim()}! Your account has been created.`
      );
      setDisplayName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setValidationWarnings({});

      if (typeof onRegisterSuccess === "function") {
        onRegisterSuccess(user);
      }
    } catch (err) {
      setFormError(err.message || "Registration failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-container" style={styles.container}>
      <div className="auth-card" style={styles.card}>
        <h2 style={styles.title}>Create Your KusinApp Account</h2>
        <p style={styles.subtitle}>
          Plan Filipino meals and manage your pantry with ease.
        </p>

        {formError && (
          <div role="alert" className="alert-error" style={styles.errorAlert}>
            {formError}
          </div>
        )}

        {successMessage && (
          <div role="status" className="alert-success" style={styles.successAlert}>
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate style={styles.form}>
          <div style={styles.fieldGroup}>
            <label htmlFor="register-display-name" style={styles.label}>
              Full Name / Display Name
            </label>
            <input
              id="register-display-name"
              type="text"
              name="displayName"
              placeholder="e.g., Juan Dela Cruz"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              disabled={isSubmitting}
              style={styles.input}
              required
            />
            {validationWarnings.displayName && (
              <span className="validation-warning" style={styles.warningText}>
                {validationWarnings.displayName}
              </span>
            )}
          </div>

          <div style={styles.fieldGroup}>
            <label htmlFor="register-email" style={styles.label}>
              Email Address
            </label>
            <input
              id="register-email"
              type="email"
              name="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSubmitting}
              style={styles.input}
              required
            />
            {validationWarnings.email && (
              <span className="validation-warning" style={styles.warningText}>
                {validationWarnings.email}
              </span>
            )}
          </div>

          <div style={styles.fieldGroup}>
            <label htmlFor="register-password" style={styles.label}>
              Password
            </label>
            <input
              id="register-password"
              type="password"
              name="password"
              placeholder="At least 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isSubmitting}
              style={styles.input}
              required
            />
            {validationWarnings.password && (
              <span className="validation-warning" style={styles.warningText}>
                {validationWarnings.password}
              </span>
            )}
          </div>

          <div style={styles.fieldGroup}>
            <label htmlFor="register-confirm-password" style={styles.label}>
              Confirm Password
            </label>
            <input
              id="register-confirm-password"
              type="password"
              name="confirmPassword"
              placeholder="Re-enter your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={isSubmitting}
              style={styles.input}
              required
            />
            {validationWarnings.confirmPassword && (
              <span className="validation-warning" style={styles.warningText}>
                {validationWarnings.confirmPassword}
              </span>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              ...styles.submitButton,
              opacity: isSubmitting ? 0.7 : 1,
            }}
          >
            {isSubmitting ? "Creating Account..." : "Register"}
          </button>
        </form>

        {typeof onNavigateToLogin === "function" && (
          <p style={styles.footerText}>
            Already have an account?{" "}
            <button
              type="button"
              onClick={onNavigateToLogin}
              style={styles.linkButton}
            >
              Sign In
            </button>
          </p>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
    backgroundColor: "#f8f9fa",
    padding: "1.5rem",
    fontFamily: "system-ui, -apple-system, sans-serif",
  },
  card: {
    width: "100%",
    maxWidth: "420px",
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    boxShadow: "0 4px 16px rgba(0, 0, 0, 0.08)",
    padding: "2rem",
  },
  title: {
    margin: "0 0 0.5rem 0",
    fontSize: "1.5rem",
    color: "#1f2937",
    textAlign: "center",
  },
  subtitle: {
    margin: "0 0 1.5rem 0",
    fontSize: "0.925rem",
    color: "#6b7280",
    textAlign: "center",
  },
  errorAlert: {
    backgroundColor: "#fef2f2",
    color: "#b91c1c",
    border: "1px solid #f87171",
    borderRadius: "8px",
    padding: "0.75rem 1rem",
    marginBottom: "1rem",
    fontSize: "0.875rem",
  },
  successAlert: {
    backgroundColor: "#ecfdf5",
    color: "#047857",
    border: "1px solid #34d399",
    borderRadius: "8px",
    padding: "0.75rem 1rem",
    marginBottom: "1rem",
    fontSize: "0.875rem",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  },
  fieldGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "0.35rem",
  },
  label: {
    fontSize: "0.875rem",
    fontWeight: 600,
    color: "#374151",
  },
  input: {
    padding: "0.65rem 0.85rem",
    borderRadius: "8px",
    border: "1px solid #d1d5db",
    fontSize: "0.95rem",
    outline: "none",
  },
  warningText: {
    fontSize: "0.8rem",
    color: "#d97706",
  },
  submitButton: {
    marginTop: "0.5rem",
    padding: "0.75rem",
    backgroundColor: "#ea580c",
    color: "#ffffff",
    fontWeight: 600,
    fontSize: "1rem",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
  },
  footerText: {
    marginTop: "1.25rem",
    textAlign: "center",
    fontSize: "0.875rem",
    color: "#4b5563",
  },
  linkButton: {
    background: "none",
    border: "none",
    color: "#ea580c",
    fontWeight: 600,
    cursor: "pointer",
    padding: 0,
  },
};
