import React, { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";
import { loginUser, logoutUser } from "./authService";

/**
 * US-02: User Authentication Screen (Login.jsx)
 * Provides email/password inputs, descriptive error alerts, and active session/redirect handling.
 */
export default function Login({
  onLoginSuccess,
  onLogoutSuccess,
  onNavigateToRegister,
  redirectUrl = "/dashboard",
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorAlert, setErrorAlert] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user || null);
    });
    return () => unsubscribe();
  }, []);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorAlert("");

    if (!email.trim() || !password) {
      setErrorAlert("Please enter both your email address and password.");
      return;
    }

    setIsSubmitting(true);
    try {
      const user = await loginUser(email, password);
      setCurrentUser(user);
      setPassword("");

      if (typeof onLoginSuccess === "function") {
        onLoginSuccess(user, redirectUrl);
      } else if (
        typeof window !== "undefined" &&
        redirectUrl &&
        window.location.pathname !== redirectUrl
      ) {
        window.history.pushState({}, "", redirectUrl);
      }
    } catch (err) {
      setErrorAlert(
        err.message ||
          "Invalid email or password. Please check your credentials and try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    setErrorAlert("");
    try {
      await logoutUser();
      setCurrentUser(null);
      if (typeof onLogoutSuccess === "function") {
        onLogoutSuccess();
      }
    } catch (err) {
      setErrorAlert(err.message || "Failed to log out. Please try again.");
    }
  };

  if (currentUser) {
    return (
      <div className="auth-container" style={styles.container}>
        <div className="auth-card" style={styles.card}>
          <h2 style={styles.title}>Active KusinApp Session</h2>
          <p style={styles.subtitle}>
            Signed in as{" "}
            <strong>{currentUser.displayName || currentUser.email}</strong>
          </p>

          {errorAlert && (
            <div role="alert" className="alert-error" style={styles.errorAlert}>
              {errorAlert}
            </div>
          )}

          <div style={styles.sessionActions}>
            <button
              type="button"
              onClick={handleLogout}
              style={styles.logoutButton}
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container" style={styles.container}>
      <div className="auth-card" style={styles.card}>
        <h2 style={styles.title}>Sign In to KusinApp</h2>
        <p style={styles.subtitle}>
          Access your Filipino meal plans, pantry inventory, and admin portal.
        </p>

        {errorAlert && (
          <div role="alert" className="alert-error" style={styles.errorAlert}>
            {errorAlert}
          </div>
        )}

        <form onSubmit={handleLoginSubmit} noValidate style={styles.form}>
          <div style={styles.fieldGroup}>
            <label htmlFor="login-email" style={styles.label}>
              Email Address
            </label>
            <input
              id="login-email"
              type="email"
              name="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSubmitting}
              style={styles.input}
              required
            />
          </div>

          <div style={styles.fieldGroup}>
            <label htmlFor="login-password" style={styles.label}>
              Password
            </label>
            <input
              id="login-password"
              type="password"
              name="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isSubmitting}
              style={styles.input}
              required
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              ...styles.submitButton,
              opacity: isSubmitting ? 0.7 : 1,
            }}
          >
            {isSubmitting ? "Signing In..." : "Sign In"}
          </button>
        </form>

        {typeof onNavigateToRegister === "function" && (
          <p style={styles.footerText}>
            Don&apos;t have an account?{" "}
            <button
              type="button"
              onClick={onNavigateToRegister}
              style={styles.linkButton}
            >
              Create Account
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
  sessionActions: {
    display: "flex",
    justifyContent: "center",
    marginTop: "1rem",
  },
  logoutButton: {
    padding: "0.65rem 1.25rem",
    backgroundColor: "#dc2626",
    color: "#ffffff",
    fontWeight: 600,
    fontSize: "0.95rem",
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
