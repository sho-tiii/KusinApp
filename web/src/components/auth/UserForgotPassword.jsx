import React, { useState, useEffect, useRef } from "react";
import PasswordInput from "../common/PasswordInput";
import PasswordStrengthMeter, { evaluatePasswordStrength } from "../common/PasswordStrengthMeter";
import { requestPasswordResetOtp, verifyPasswordResetOtp, completePasswordReset } from "../../services/authService";

/**
 * User Forgot Password Flow (4-Step Wizard)
 * Strictly matches the approved prototype:
 * 1. Request (Email input -> Send OTP)
 * 2. Verify (6-digit OTP inputs + live 30s countdown resend timer)
 * 3. Password (New password + strength meter + confirm)
 * 4. Done (Success message + Back to Log In)
 */
export default function UserForgotPassword({ onBackToLogin }) {
  const [step, setStep] = useState(1); // 1, 2, 3, 4
  const [email, setEmail] = useState("");
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [demoHint, setDemoHint] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Live 30-second countdown for resend
  const [resendTimer, setResendTimer] = useState(30);
  const otpInputRefs = useRef([]);

  useEffect(() => {
    let interval = null;
    if (step === 2 && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [step, resendTimer]);

  // Focus first OTP box on entering step 2
  useEffect(() => {
    if (step === 2) {
      otpInputRefs.current[0]?.focus();
    }
  }, [step]);

  // Step 1: Request OTP
  const handleRequestOtp = async (e) => {
    if (e) e.preventDefault();
    setErrorMsg("");

    if (!email.trim()) {
      setErrorMsg("Please enter your email address.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await requestPasswordResetOtp(email);
      setDemoHint(`Verification code generated: ${res.code}`);
      setStep(2);
      setResendTimer(30);
      setOtpDigits(["", "", "", "", "", ""]);
    } catch (err) {
      setErrorMsg(err.message || "Failed to send verification code. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Resend OTP in Step 2
  const handleResendOtp = async () => {
    if (resendTimer > 0 || isLoading) return;
    setErrorMsg("");
    setIsLoading(true);
    try {
      const res = await requestPasswordResetOtp(email);
      setDemoHint(`New verification code generated: ${res.code}`);
      setResendTimer(30);
      setOtpDigits(["", "", "", "", "", ""]);
    } catch (err) {
      setErrorMsg(err.message || "Failed to resend code.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle individual OTP digit change
  const handleOtpChange = (index, value) => {
    // Only accept numeric digits
    const cleaned = value.replace(/\D/g, "");

    // Handle paste of 6 digits
    if (cleaned.length > 1) {
      const pasteDigits = cleaned.slice(0, 6).split("");
      const updated = [...otpDigits];
      pasteDigits.forEach((digit, i) => {
        if (index + i < 6) updated[index + i] = digit;
      });
      setOtpDigits(updated);
      const nextIndex = Math.min(index + pasteDigits.length, 5);
      otpInputRefs.current[nextIndex]?.focus();
      return;
    }

    const updated = [...otpDigits];
    updated[index] = cleaned ? cleaned.charAt(cleaned.length - 1) : "";
    setOtpDigits(updated);

    // Auto-advance to next input
    if (cleaned && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  // Step 2: Verify Code
  const handleVerifyOtp = (e) => {
    e.preventDefault();
    setErrorMsg("");

    const fullCode = otpDigits.join("");
    if (fullCode.length !== 6) {
      setErrorMsg("Please enter all 6 digits of your verification code.");
      return;
    }

    try {
      verifyPasswordResetOtp(email, fullCode);
      setStep(3);
      setErrorMsg("");
      setDemoHint("");
    } catch (err) {
      setErrorMsg(err.message || "Invalid verification code. Please try again.");
    }
  };

  // Step 3: Set New Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!newPassword) {
      setErrorMsg("Please enter a new password.");
      return;
    }

    const strength = evaluatePasswordStrength(newPassword);
    if (!strength.isValid) {
      setErrorMsg("Please ensure your password satisfies at least 3 strength criteria (min. 8 characters).");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg("Passwords do not match. Please re-enter.");
      return;
    }

    setIsLoading(true);
    try {
      await completePasswordReset(email, newPassword);
      setStep(4);
      setErrorMsg("");
    } catch (err) {
      setErrorMsg(err.message || "Failed to update password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const formattedTimer = `00:${resendTimer.toString().padStart(2, "0")}`;

  return (
    <div className="k-auth-flow">
      {/* 4-Step Pill Stepper */}
      <div className="k-pill-stepper" role="navigation" aria-label="Password Reset Progress">
        <div className={`k-pill-step ${step === 1 ? "k-pill-step--active" : ""}`}>
          1. Request
        </div>
        <div className={`k-pill-step ${step === 2 ? "k-pill-step--active" : ""}`}>
          2. Verify
        </div>
        <div className={`k-pill-step ${step === 3 ? "k-pill-step--active" : ""}`}>
          3. Password
        </div>
        <div className={`k-pill-step ${step === 4 ? "k-pill-step--active" : ""}`}>
          4. Done
        </div>
      </div>

      {/* STEP 1: REQUEST */}
      {step === 1 && (
        <div>
          <div className="k-card-head">
            <div className="k-avatar-emblem">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                <path d="M3 3v5h5" />
                <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
                <path d="M16 16h5v5" />
                <rect x="10" y="9" width="4" height="6" rx="1" />
              </svg>
            </div>
            <h1 className="k-title">Forgot Your Password?</h1>
            <p className="k-subtitle">
              Enter the email address linked to your KusinApp account and we&apos;ll send you a verification code.
            </p>
          </div>

          {errorMsg && <div role="alert" className="k-alert k-alert--error">{errorMsg}</div>}

          <form onSubmit={handleRequestOtp} noValidate className="k-form">
            <div className="k-field">
              <label htmlFor="user-reset-email" className="k-label">
                Email Address
              </label>
              <input
                id="user-reset-email"
                type="email"
                className="k-input"
                placeholder="juan@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                autoComplete="email"
              />
            </div>

            <button
              type="submit"
              className="k-btn k-btn--primary k-btn--block"
              disabled={isLoading}
            >
              {isLoading && <span className="k-spinner" aria-hidden="true" />}
              {isLoading ? "Sending verification..." : "Send OTP →"}
            </button>
          </form>

          <p className="k-divider">
            <button
              type="button"
              className="k-link"
              onClick={onBackToLogin}
            >
              ← Back to Log In
            </button>
          </p>
        </div>
      )}

      {/* STEP 2: VERIFY CODE */}
      {step === 2 && (
        <div>
          <div className="k-card-head">
            <div className="k-avatar-emblem">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
            </div>
            <h1 className="k-title">Verify Your Email</h1>
            <p className="k-subtitle">
              We sent a 6-digit verification code to:<br />
              <strong style={{ color: "var(--k-ink)" }}>{email}</strong>
            </p>
          </div>

          {demoHint && (
            <div role="status" className="k-alert k-alert--info" style={{ marginBottom: "16px" }}>
              {demoHint}
            </div>
          )}

          {errorMsg && <div role="alert" className="k-alert k-alert--error">{errorMsg}</div>}

          <form onSubmit={handleVerifyOtp} noValidate className="k-form">
            <div className="k-otp-group">
              {otpDigits.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => (otpInputRefs.current[idx] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  className="k-otp-input"
                  value={digit}
                  onChange={(e) => handleOtpChange(idx, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                  autoComplete="one-time-code"
                  aria-label={`Digit ${idx + 1}`}
                />
              ))}
            </div>

            <button
              type="submit"
              className="k-btn k-btn--primary k-btn--block"
              disabled={isLoading}
            >
              Verify Code →
            </button>
          </form>

          <div style={{ textAlign: "center", marginTop: "20px" }}>
            <p style={{ margin: "0 0 10px", fontSize: "0.88rem", color: "var(--k-muted)" }}>
              Didn&apos;t receive the code?{" "}
              {resendTimer > 0 ? (
                <span>
                  Resend code in <strong>{formattedTimer}</strong>
                </span>
              ) : (
                <button
                  type="button"
                  className="k-link"
                  style={{ fontWeight: 700 }}
                  onClick={handleResendOtp}
                  disabled={isLoading}
                >
                  Resend code
                </button>
              )}
            </p>

            <button
              type="button"
              className="k-link"
              style={{ fontSize: "0.85rem", color: "var(--k-subtle)" }}
              onClick={() => {
                setStep(1);
                setErrorMsg("");
                setDemoHint("");
              }}
            >
              Use a different email
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: CREATE NEW PASSWORD */}
      {step === 3 && (
        <div>
          <div className="k-card-head">
            <div className="k-avatar-emblem">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 2l-2 2m-1.5 1.5L14 9l-1.5-1.5-3 3L11 12l-5 5H2v4h4l5-5 1.5 1.5 3-3-1.5-1.5 3.5-3.5" />
                <circle cx="17.5" cy="6.5" r="2.5" />
              </svg>
            </div>
            <h1 className="k-title">Create New Password</h1>
            <p className="k-subtitle">Choose a new password for your KusinApp account.</p>
          </div>

          {errorMsg && <div role="alert" className="k-alert k-alert--error">{errorMsg}</div>}

          <form onSubmit={handleResetPassword} noValidate className="k-form">
            <div className="k-field">
              <label htmlFor="user-new-pwd" className="k-label">
                New Password
              </label>
              <PasswordInput
                id="user-new-pwd"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={isLoading}
                autoComplete="new-password"
              />
              <span className="k-hint">Use at least 8 characters.</span>
              <PasswordStrengthMeter password={newPassword} />
            </div>

            <div className="k-field">
              <label htmlFor="user-confirm-pwd" className="k-label">
                Confirm New Password
              </label>
              <PasswordInput
                id="user-confirm-pwd"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isLoading}
                autoComplete="new-password"
              />
            </div>

            <button
              type="submit"
              className="k-btn k-btn--primary k-btn--block"
              disabled={isLoading}
            >
              {isLoading && <span className="k-spinner" aria-hidden="true" />}
              {isLoading ? "Updating password..." : "Reset Password →"}
            </button>
          </form>
        </div>
      )}

      {/* STEP 4: SUCCESS / DONE */}
      {step === 4 && (
        <div>
          <div className="k-card-head">
            <div className="k-avatar-emblem" style={{ background: "#d1fadf", color: "#039855" }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h1 className="k-title">Password Reset Successful</h1>
            <p className="k-subtitle">
              Your password has been updated successfully. You can now log in using your new password.
            </p>
          </div>

          <div className="k-alert k-alert--info" style={{ marginTop: "16px", marginBottom: "24px" }}>
            <strong>Ready to cook</strong>
            <div style={{ marginTop: "2px", fontSize: "0.85rem" }}>
              Your saved recipes and regional notes are fully synced.
            </div>
          </div>

          <button
            type="button"
            className="k-btn k-btn--primary k-btn--block"
            onClick={onBackToLogin}
          >
            Back to Log In →
          </button>
        </div>
      )}
    </div>
  );
}
