import React, { useState } from "react";
import { loginUser, loginWithGoogle } from "../../services/authService";
import PasswordInput from "../common/PasswordInput";
import ForgotPassword from "./ForgotPassword";

/**
 * User Authentication Screen (Login.jsx) — Styled to match the KusinApp Web Login Prototype (image.png)
 * without the extra KusinApp logo inside the card.
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
      {/* Header without redundant KusinApp logo */}
      <div className="text-center mb-7">
        <h1 className="text-[2rem] font-extrabold text-slate-900 tracking-tight leading-tight">
          Welcome!
        </h1>
        <p className="mt-1.5 text-sm text-slate-500 leading-relaxed">
          Plan delicious homestyle Filipino meals every day
        </p>
      </div>

      {errorAlert && (
        <div
          role="alert"
          className="px-4 py-3 mb-4 rounded-2xl border border-red-200 bg-red-50 text-red-700 text-xs font-semibold text-center leading-relaxed"
        >
          {errorAlert}
        </div>
      )}

      <form onSubmit={handleLoginSubmit} noValidate className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="login-email"
            className="text-xs font-extrabold tracking-wider uppercase text-slate-900"
          >
            Username or Email
          </label>
          <input
            id="login-email"
            type="email"
            className="w-full h-12 py-3.5 px-4 bg-slate-50/80 focus:bg-white border border-slate-200 rounded-2xl text-[0.95rem] text-slate-900 placeholder:text-slate-400 outline-none hover:border-slate-300 focus:border-amber-500 focus:shadow-amber-ring transition-all disabled:opacity-60"
            style={{ minHeight: "50px" }}
            placeholder="Enter your email or username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isSubmitting}
            autoComplete="email"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="login-password"
            className="text-xs font-extrabold tracking-wider uppercase text-slate-900"
          >
            Password
          </label>
          <PasswordInput
            id="login-password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isSubmitting}
            autoComplete="current-password"
          />
        </div>

        <div className="flex justify-between items-center mt-0.5 mb-1">
          <label className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 cursor-pointer select-none">
            <input
              type="checkbox"
              className="w-4 h-4 accent-amber-500 cursor-pointer rounded"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
            />
            Remember me
          </label>
          <button
            type="button"
            className="border-0 bg-transparent p-0 text-xs font-extrabold text-amber-700 hover:underline cursor-pointer"
            onClick={handleOpenForgot}
          >
            Forgot Password?
          </button>
        </div>

        <button
          type="submit"
          className="w-full h-14 py-3.5 px-6 bg-amber-500 hover:bg-amber-600 rounded-full text-base font-extrabold text-white shadow-[0_8px_20px_-4px_rgba(245,158,11,0.45)] inline-flex items-center justify-center gap-2.5 transition-all disabled:opacity-55 cursor-pointer"
          style={{ minHeight: "54px" }}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <span
                className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"
                aria-hidden="true"
              />
              <span>Signing in...</span>
            </>
          ) : (
            <>
              <span>Log In</span>
              <span className="text-lg leading-none">→</span>
            </>
          )}
        </button>
      </form>

      <div className="flex items-center my-6 text-center before:flex-1 before:border-b before:border-slate-200 after:flex-1 after:border-b after:border-slate-200">
        <span className="px-4 text-[11px] text-slate-400 font-extrabold uppercase tracking-widest">
          Or Continue With
        </span>
      </div>

      <button
        type="button"
        className="w-full h-14 py-3.5 px-6 bg-white hover:bg-slate-50 text-slate-900 border border-slate-200 hover:border-slate-300 rounded-full text-[0.95rem] font-extrabold flex items-center justify-center gap-3 transition-all disabled:opacity-55 cursor-pointer"
        style={{ minHeight: "54px" }}
        onClick={handleGoogleSignIn}
        disabled={isSubmitting}
      >
        <img
          src="/assets/google-g.png"
          alt=""
          className="w-5 h-5 object-contain"
          aria-hidden="true"
        />
        <span>Continue with Google</span>
      </button>

      {typeof onNavigateToRegister === "function" && (
        <p className="flex items-center justify-center gap-1.5 mt-6 text-xs font-medium text-slate-500">
          Don&apos;t have an account?
          <button
            type="button"
            className="border-0 bg-transparent p-0 font-extrabold text-amber-700 hover:underline cursor-pointer"
            onClick={onNavigateToRegister}
          >
            Sign up
          </button>
        </p>
      )}
    </div>
  );
}
