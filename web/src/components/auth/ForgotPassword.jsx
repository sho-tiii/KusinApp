import React, { useState, useEffect, useRef } from "react";
import PasswordInput from "../common/PasswordInput";
import PasswordStrengthMeter, { evaluatePasswordStrength } from "../common/PasswordStrengthMeter";
import {
  requestPasswordResetOtp,
  verifyPasswordResetOtp,
  completePasswordReset,
} from "../../services/authService";

/**
 * Unified 4-Step Forgot Password Wizard styled with Tailwind CSS (Shared between User and Admin)
 * 1. Request (Email input -> Send OTP)
 * 2. Verify (6-digit OTP inputs + live 30s countdown resend timer)
 * 3. Password (New password + live strength meter + confirmation)
 * 4. Done (Success confirmation + Back to Log In)
 */
export default function ForgotPassword({ onBackToLogin, isAdminPortal = false }) {
  const [step, setStep] = useState(1); // 1, 2, 3, 4
  const [email, setEmail] = useState("");
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
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
      setErrorMsg(
        isAdminPortal
          ? "Please enter your administrator work email address."
          : "Please enter your registered email address."
      );
      return;
    }

    setIsLoading(true);
    try {
      await requestPasswordResetOtp(email);
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
      await requestPasswordResetOtp(email);
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
    } catch (err) {
      setErrorMsg(err.message || "Invalid verification code. Please check and try again.");
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
      setErrorMsg(
        "Please ensure your password satisfies at least 3 strength criteria (minimum 8 characters)."
      );
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

  const steps = [
    { id: 1, label: "1. Request" },
    { id: 2, label: "2. Verify" },
    { id: 3, label: "3. Password" },
    { id: 4, label: "4. Done" },
  ];

  return (
    <div className="w-full">
      {/* 4-Step Pill Stepper */}
      <div
        className="flex bg-slate-100 rounded-xl p-1 mb-6 gap-1"
        role="navigation"
        aria-label="Password Reset Progress"
      >
        {steps.map((s) => (
          <div
            key={s.id}
            className={`flex-1 text-center py-2 px-1.5 rounded-lg text-xs transition-all duration-200 ${
              step === s.id
                ? "bg-white text-amber-700 font-bold shadow-sm"
                : "text-slate-400 font-semibold"
            }`}
          >
            {s.label}
          </div>
        ))}
      </div>

      {/* STEP 1: REQUEST */}
      {step === 1 && (
        <div>
          <div className="text-center mb-6">
            <div className="w-14 h-14 rounded-full bg-amber-100 text-amber-700 grid place-items-center mx-auto mb-4">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                <path d="M3 3v5h5" />
                <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
                <path d="M16 16h5v5" />
                <rect x="10" y="9" width="4" height="6" rx="1" />
              </svg>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Forgot Your Password?
            </h1>
            <p className="mt-1.5 text-sm text-slate-600 leading-relaxed">
              Enter the email address linked to your KusinApp account and we&apos;ll send you a
              verification code.
            </p>
          </div>

          {errorMsg && (
            <div
              role="alert"
              className="px-3.5 py-3 mb-4 rounded-lg border border-red-200 bg-red-50 text-red-700 text-sm leading-relaxed"
            >
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleRequestOtp} noValidate className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="reset-email"
                className="flex justify-between items-baseline text-[0.83rem] font-semibold text-slate-900"
              >
                Email Address
              </label>
              <input
                id="reset-email"
                type="email"
                className="w-full h-11 px-3.5 bg-white border border-slate-300 rounded-lg text-[0.92rem] text-slate-900 placeholder:text-slate-400 outline-none hover:border-slate-400 focus:border-amber-500 focus:shadow-amber-ring transition-all disabled:opacity-60"
                placeholder={isAdminPortal ? "admin@kusinapp.ph" : "juan@email.com"}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                autoComplete="email"
              />
            </div>

            <button
              type="submit"
              className="w-full h-11 px-4 bg-amber-500 hover:bg-amber-600 border border-amber-600 rounded-lg text-[0.92rem] font-semibold text-white shadow-sm inline-flex items-center justify-center gap-2 transition-all disabled:opacity-55 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:shadow-amber-ring"
              disabled={isLoading}
            >
              {isLoading && (
                <span
                  className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin"
                  aria-hidden="true"
                />
              )}
              {isLoading ? "Sending verification..." : "Send OTP →"}
            </button>
          </form>

          <p className="flex items-center justify-center mt-5 text-sm text-slate-600">
            <button
              type="button"
              className="border-0 bg-transparent p-0 font-semibold text-amber-700 hover:underline cursor-pointer"
              onClick={onBackToLogin}
            >
              {isAdminPortal ? "← Back to Administrative Sign In" : "← Back to Log In"}
            </button>
          </p>
        </div>
      )}

      {/* STEP 2: VERIFY CODE */}
      {step === 2 && (
        <div>
          <div className="text-center mb-6">
            <div className="w-14 h-14 rounded-full bg-amber-100 text-amber-700 grid place-items-center mx-auto mb-4">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Verify Your Email
            </h1>
            <p className="mt-1.5 text-sm text-slate-600 leading-relaxed">
              We sent a 6-digit verification code to:
              <br />
              <strong className="text-slate-900 font-bold">{email}</strong>
            </p>
          </div>

          {errorMsg && (
            <div
              role="alert"
              className="px-3.5 py-3 mb-4 rounded-lg border border-red-200 bg-red-50 text-red-700 text-sm leading-relaxed"
            >
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleVerifyOtp} noValidate className="flex flex-col gap-4">
            <div className="flex justify-center gap-2 my-3">
              {otpDigits.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => {
                    otpInputRefs.current[idx] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  className="w-11 sm:w-12 h-13 sm:h-14 text-center text-xl font-bold text-slate-900 bg-slate-50 border border-slate-300 rounded-xl outline-none focus:bg-white focus:border-amber-500 focus:shadow-amber-ring transition-all"
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
              className="w-full h-11 px-4 bg-amber-500 hover:bg-amber-600 border border-amber-600 rounded-lg text-[0.92rem] font-semibold text-white shadow-sm inline-flex items-center justify-center gap-2 transition-all disabled:opacity-55 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:shadow-amber-ring"
              disabled={isLoading}
            >
              Verify Code →
            </button>
          </form>

          <div className="text-center mt-5">
            <p className="mb-2.5 text-sm text-slate-600">
              Didn&apos;t receive the code?{" "}
              {resendTimer > 0 ? (
                <span>
                  Resend code in <strong className="text-slate-900">{formattedTimer}</strong>
                </span>
              ) : (
                <button
                  type="button"
                  className="border-0 bg-transparent p-0 font-bold text-amber-700 hover:underline cursor-pointer"
                  onClick={handleResendOtp}
                  disabled={isLoading}
                >
                  Resend code
                </button>
              )}
            </p>

            <button
              type="button"
              className="border-0 bg-transparent p-0 text-xs font-semibold text-slate-400 hover:text-slate-700 hover:underline cursor-pointer"
              onClick={() => {
                setStep(1);
                setErrorMsg("");
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
          <div className="text-center mb-6">
            <div className="w-14 h-14 rounded-full bg-amber-100 text-amber-700 grid place-items-center mx-auto mb-4">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 2l-2 2m-1.5 1.5L14 9l-1.5-1.5-3 3L11 12l-5 5H2v4h4l5-5 1.5 1.5 3-3-1.5-1.5 3.5-3.5" />
                <circle cx="17.5" cy="6.5" r="2.5" />
              </svg>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Create New Password
            </h1>
            <p className="mt-1.5 text-sm text-slate-600 leading-relaxed">
              {isAdminPortal
                ? "Choose a new password for your administrative account."
                : "Choose a new password for your KusinApp account."}
            </p>
          </div>

          {errorMsg && (
            <div
              role="alert"
              className="px-3.5 py-3 mb-4 rounded-lg border border-red-200 bg-red-50 text-red-700 text-sm leading-relaxed"
            >
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleResetPassword} noValidate className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="new-pwd"
                className="flex justify-between items-baseline text-[0.83rem] font-semibold text-slate-900"
              >
                New Password
                <span className="text-xs font-medium text-slate-500">min. 8 characters</span>
              </label>
              <PasswordInput
                id="new-pwd"
                placeholder="Enter new strong password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={isLoading}
                autoComplete="new-password"
              />
              <PasswordStrengthMeter password={newPassword} />
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="confirm-new-pwd"
                className="flex justify-between items-baseline text-[0.83rem] font-semibold text-slate-900"
              >
                Confirm New Password
              </label>
              <PasswordInput
                id="confirm-new-pwd"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isLoading}
                autoComplete="new-password"
              />
            </div>

            <button
              type="submit"
              className="w-full h-11 px-4 bg-amber-500 hover:bg-amber-600 border border-amber-600 rounded-lg text-[0.92rem] font-semibold text-white shadow-sm inline-flex items-center justify-center gap-2 transition-all disabled:opacity-55 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:shadow-amber-ring"
              disabled={isLoading}
            >
              {isLoading && (
                <span
                  className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin"
                  aria-hidden="true"
                />
              )}
              {isLoading ? "Updating password..." : "Reset Password →"}
            </button>
          </form>
        </div>
      )}

      {/* STEP 4: SUCCESS / DONE */}
      {step === 4 && (
        <div>
          <div className="text-center mb-6">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 grid place-items-center mx-auto mb-4">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Password Reset Successful
            </h1>
            <p className="mt-1.5 text-sm text-slate-600 leading-relaxed">
              Your password has been updated successfully. You can now log in using your new
              password.
            </p>
          </div>

          <div className="px-4 py-3.5 my-5 rounded-xl border border-amber-200 bg-amber-50 text-amber-900 text-sm">
            <strong className="font-bold block">Ready to cook</strong>
            <p className="mt-0.5 text-xs text-amber-800">
              Your saved recipes and regional notes are fully synced.
            </p>
          </div>

          <button
            type="button"
            className="w-full h-11 px-4 bg-amber-500 hover:bg-amber-600 border border-amber-600 rounded-lg text-[0.92rem] font-semibold text-white shadow-sm inline-flex items-center justify-center gap-2 transition-all focus-visible:outline-none focus-visible:shadow-amber-ring"
            onClick={onBackToLogin}
          >
            {isAdminPortal ? "Back to Administrative Sign In →" : "Back to Log In →"}
          </button>
        </div>
      )}
    </div>
  );
}
