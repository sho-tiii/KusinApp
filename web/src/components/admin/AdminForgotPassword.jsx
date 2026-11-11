import React, { useState, useEffect, useRef } from "react";
import PasswordInput from "../common/PasswordInput";
import PasswordStrengthMeter, { evaluatePasswordStrength } from "../common/PasswordStrengthMeter";
import { requestPasswordResetOtp, verifyPasswordResetOtp, completePasswordReset } from "../../services/authService";

/**
 * Admin Split-Screen Forgot Password Flow (3-Step Stepper)
 * Formatted cleanly according to image_4.png and image_5.png:
 * - Left Pane: KusinApp Brand Showcase
 * - Right Pane: Numbered Stepper (1 Email, 2 Verify code, 3 New password)
 * - 6-digit individual OTP input boxes
 * - Real live countdown timer (e.g. 30s)
 */
export default function AdminForgotPassword({ onBackToLogin }) {
  const [step, setStep] = useState(1); // 1: Email, 2: Verify code, 3: New password, 4: Done
  const [email, setEmail] = useState("");
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [demoHint, setDemoHint] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Live countdown timer for code resend
  const [countdown, setCountdown] = useState(30);
  const otpInputRefs = useRef([]);

  useEffect(() => {
    let timer = null;
    if (step === 2 && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [step, countdown]);

  useEffect(() => {
    if (step === 2) {
      otpInputRefs.current[0]?.focus();
    }
  }, [step]);

  // Helper to mask email (e.g. a•••••@gmail.com)
  const getMaskedEmail = (raw) => {
    if (!raw || !raw.includes("@")) return raw;
    const [userPart, domain] = raw.split("@");
    if (userPart.length <= 2) return `${userPart[0]}••••@${domain}`;
    return `${userPart[0]}•••••@${domain}`;
  };

  // Step 1: Send Code
  const handleSendCode = async (e) => {
    if (e) e.preventDefault();
    setErrorMsg("");

    if (!email.trim()) {
      setErrorMsg("Please enter your administrator work email.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await requestPasswordResetOtp(email);
      setDemoHint(`Verification code generated: ${res.code}`);
      setStep(2);
      setCountdown(30);
      setOtpDigits(["", "", "", "", "", ""]);
    } catch (err) {
      setErrorMsg(err.message || "Failed to send code. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Resend code in Step 2
  const handleResendCode = async () => {
    if (countdown > 0 || isLoading) return;
    setErrorMsg("");
    setIsLoading(true);
    try {
      const res = await requestPasswordResetOtp(email);
      setDemoHint(`New verification code: ${res.code}`);
      setCountdown(30);
      setOtpDigits(["", "", "", "", "", ""]);
    } catch (err) {
      setErrorMsg(err.message || "Failed to resend verification code.");
    } finally {
      setIsLoading(false);
    }
  };

  // OTP inputs handling
  const handleOtpChange = (index, value) => {
    const cleaned = value.replace(/\D/g, "");

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
  const handleVerifyCode = (e) => {
    e.preventDefault();
    setErrorMsg("");

    const fullCode = otpDigits.join("");
    if (fullCode.length !== 6) {
      setErrorMsg("Please enter all 6 digits of the verification code.");
      return;
    }

    try {
      verifyPasswordResetOtp(email, fullCode);
      setStep(3);
      setErrorMsg("");
      setDemoHint("");
    } catch (err) {
      setErrorMsg(err.message || "Invalid verification code. Please check and try again.");
    }
  };

  // Step 3: Update Password
  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!newPassword) {
      setErrorMsg("Please enter a new password.");
      return;
    }

    const strength = evaluatePasswordStrength(newPassword);
    if (!strength.isValid) {
      setErrorMsg("Password must meet minimum security criteria (min. 8 characters).");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
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

  return (
    <div className="k-admin-layout">
      {/* LEFT: Showcase Pane */}
      <div className="k-admin-showcase">
        <div className="k-admin-topbar">
          <img
            src="/assets/kusinapp-logo-horizontal.png"
            alt="KusinApp"
            className="k-admin-logo"
          />
        </div>

        <div className="k-admin-hero-block">
          <h1 className="k-admin-headline">
            Keep every recipe, ingredient, and price in order.
          </h1>
          <p className="k-admin-subheadline">
            Sign in with your administrator account to manage the recipe database,
            ingredient list, and local price data.
          </p>
        </div>

        <footer className="k-admin-showcase-footer">
          © KusinApp. Recipe & Cost Management Platform.
        </footer>
      </div>

      {/* RIGHT: Admin Forgot Password Form */}
      <div className="k-admin-auth-pane">
        <div className="k-admin-auth-box">
          {/* Numbered Stepper */}
          <div className="k-admin-num-stepper" role="navigation" aria-label="Reset Progress">
            <div className={`k-admin-num-step ${step >= 1 ? "k-admin-num-step--active" : ""}`}>
              <span className="k-admin-num-circle">
                {step > 1 ? (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
                  "1"
                )}
              </span>
              <span className="k-admin-num-text">Email</span>
            </div>

            <div className="k-admin-num-line" />

            <div className={`k-admin-num-step ${step >= 2 ? "k-admin-num-step--active" : ""}`}>
              <span className="k-admin-num-circle">
                {step > 2 ? (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
                  "2"
                )}
              </span>
              <span className="k-admin-num-text">Verify code</span>
            </div>

            <div className="k-admin-num-line" />

            <div className={`k-admin-num-step ${step >= 3 ? "k-admin-num-step--active" : ""}`}>
              <span className="k-admin-num-circle">
                {step > 3 ? (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
                  "3"
                )}
              </span>
              <span className="k-admin-num-text">New password</span>
            </div>
          </div>

          {/* STEP 1: EMAIL */}
          {step === 1 && (
            <div>
              <div className="k-admin-auth-header">
                <h2 className="k-admin-title">Forgot your password?</h2>
                <p className="k-admin-desc">
                  Enter your work email and we&apos;ll send a 6-digit code to verify it&apos;s you.
                </p>
              </div>

              {errorMsg && <div role="alert" className="k-alert k-alert--error">{errorMsg}</div>}

              <form onSubmit={handleSendCode} noValidate className="k-form">
                <div className="k-field">
                  <label htmlFor="admin-reset-email" className="k-label">
                    EMAIL ADDRESS
                  </label>
                  <input
                    id="admin-reset-email"
                    type="email"
                    className="k-input"
                    placeholder="Enter your email address"
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
                  {isLoading ? "Sending code..." : "Send code →"}
                </button>
              </form>

              <div style={{ textAlign: "center", marginTop: "24px" }}>
                <button
                  type="button"
                  className="k-link"
                  onClick={onBackToLogin}
                >
                  ← Back to sign in
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: VERIFY CODE */}
          {step === 2 && (
            <div>
              <div className="k-admin-auth-header">
                <h2 className="k-admin-title">Check your email</h2>
                <p className="k-admin-desc">
                  We sent a 6-digit code to <strong>{getMaskedEmail(email)}</strong>. Enter it to reset your password.
                </p>
              </div>

              {demoHint && (
                <div role="status" className="k-alert k-alert--info" style={{ marginBottom: "16px" }}>
                  {demoHint}
                </div>
              )}

              {errorMsg && <div role="alert" className="k-alert k-alert--error">{errorMsg}</div>}

              <form onSubmit={handleVerifyCode} noValidate className="k-form">
                <div className="k-field">
                  <label className="k-label">ENTER VERIFICATION CODE</label>
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
                </div>

                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", fontSize: "0.85rem", color: "var(--k-muted)", margin: "4px 0 18px" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  {countdown > 0 ? (
                    <span>Resend code in {countdown}s</span>
                  ) : (
                    <button
                      type="button"
                      className="k-link"
                      onClick={handleResendCode}
                      disabled={isLoading}
                    >
                      Resend code
                    </button>
                  )}
                </div>

                <button
                  type="submit"
                  className="k-btn k-btn--primary k-btn--block"
                  disabled={isLoading}
                >
                  Verify code →
                </button>

                <button
                  type="button"
                  className="k-btn k-btn--outline k-btn--block"
                  style={{ marginTop: "10px" }}
                  onClick={() => {
                    setStep(1);
                    setErrorMsg("");
                    setDemoHint("");
                  }}
                >
                  ← Change email
                </button>
              </form>
            </div>
          )}

          {/* STEP 3: CREATE NEW PASSWORD */}
          {step === 3 && (
            <div>
              <div className="k-admin-auth-header">
                <h2 className="k-admin-title">Create new password</h2>
                <p className="k-admin-desc">
                  Choose a new password for your administrative account.
                </p>
              </div>

              {errorMsg && <div role="alert" className="k-alert k-alert--error">{errorMsg}</div>}

              <form onSubmit={handleUpdatePassword} noValidate className="k-form">
                <div className="k-field">
                  <label htmlFor="admin-new-pw" className="k-label">
                    NEW PASSWORD
                  </label>
                  <PasswordInput
                    id="admin-new-pw"
                    placeholder="Enter new strong password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    disabled={isLoading}
                    autoComplete="new-password"
                  />
                  <PasswordStrengthMeter password={newPassword} />
                </div>

                <div className="k-field">
                  <label htmlFor="admin-confirm-pw" className="k-label">
                    CONFIRM NEW PASSWORD
                  </label>
                  <PasswordInput
                    id="admin-confirm-pw"
                    placeholder="Re-enter new password"
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
                  {isLoading ? "Updating password..." : "Update password →"}
                </button>
              </form>
            </div>
          )}

          {/* STEP 4: SUCCESS */}
          {step === 4 && (
            <div>
              <div className="k-admin-auth-header">
                <h2 className="k-admin-title">Password updated!</h2>
                <p className="k-admin-desc">
                  Your administrative password has been securely reset. You may now sign in.
                </p>
              </div>

              <button
                type="button"
                className="k-btn k-btn--primary k-btn--block"
                onClick={onBackToLogin}
              >
                Sign In With New Credentials →
              </button>
            </div>
          )}

          {/* Persistent Footer Note */}
          <div style={{ textAlign: "center", marginTop: "32px", fontSize: "0.82rem", color: "var(--k-subtle)" }}>
            Need access? Ask a Super Admin to create your account.
          </div>
        </div>
      </div>
    </div>
  );
}
