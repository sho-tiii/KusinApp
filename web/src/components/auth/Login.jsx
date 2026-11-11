import React, { useState } from "react";
import { loginUser, loginWithGoogle } from "../../services/authService";
import PasswordInput from "../common/PasswordInput";
import ForgotPassword from "./ForgotPassword";

/**
 * User Authentication Screen (Login.jsx) styled with Tailwind CSS.
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
      <div className="text-center mb-6">
        <img
          src="/assets/kusinapp-logo-stacked.png"
          alt="KusinApp emblem"
          className="h-16 w-auto max-w-[120px] object-contain mx-auto mb-3 block"
        />
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight leading-tight">
          Welcome Back
        </h1>
        <p className="mt-1.5 text-sm text-slate-600 leading-relaxed">
          Log in to save your favorite recipes and continue them in KusinApp.
        </p>
      </div>

      {errorAlert && (
        <div
          role="alert"
          className="px-3.5 py-3 mb-4 rounded-lg border border-red-200 bg-red-50 text-red-700 text-sm leading-relaxed"
        >
          {errorAlert}
        </div>
      )}

      <button
        type="button"
        className="w-full h-11 px-4 bg-white hover:bg-slate-50 text-slate-900 border border-slate-300 rounded-lg text-[0.92rem] font-semibold shadow-sm flex items-center justify-center gap-2.5 transition-all disabled:opacity-55 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:shadow-amber-ring"
        onClick={handleGoogleSignIn}
        disabled={isSubmitting}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
          />
        </svg>
        Continue with Google
      </button>

      <div className="flex items-center my-4 text-center before:flex-1 before:border-b before:border-slate-200 after:flex-1 after:border-b after:border-slate-200">
        <span className="px-3 text-xs text-slate-400 font-semibold uppercase tracking-wider">
          or sign in with email
        </span>
      </div>

      <form onSubmit={handleLoginSubmit} noValidate className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="login-email"
            className="flex justify-between items-baseline text-[0.83rem] font-semibold text-slate-900"
          >
            Email
          </label>
          <input
            id="login-email"
            type="email"
            className="w-full h-11 px-3.5 bg-white border border-slate-300 rounded-lg text-[0.92rem] text-slate-900 placeholder:text-slate-400 outline-none hover:border-slate-400 focus:border-amber-500 focus:shadow-amber-ring transition-all disabled:opacity-60"
            placeholder="juan@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isSubmitting}
            autoComplete="email"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="login-password"
            className="flex justify-between items-baseline text-[0.83rem] font-semibold text-slate-900"
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

        <div className="flex justify-between items-center mb-1">
          <label className="inline-flex items-center gap-2 text-sm text-slate-700 cursor-pointer select-none">
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
            className="border-0 bg-transparent p-0 text-sm font-semibold text-amber-700 hover:underline cursor-pointer"
            onClick={handleOpenForgot}
          >
            Forgot password?
          </button>
        </div>

        <button
          type="submit"
          className="w-full h-11 px-4 bg-amber-500 hover:bg-amber-600 border border-amber-600 rounded-lg text-[0.92rem] font-semibold text-white shadow-sm inline-flex items-center justify-center gap-2 transition-all disabled:opacity-55 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:shadow-amber-ring"
          disabled={isSubmitting}
        >
          {isSubmitting && (
            <span
              className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin"
              aria-hidden="true"
            />
          )}
          {isSubmitting ? "Signing in..." : "Log In"}
        </button>
      </form>

      {typeof onNavigateToRegister === "function" && (
        <p className="flex items-center justify-center gap-1.5 mt-5 text-sm text-slate-600">
          Don&apos;t have an account?
          <button
            type="button"
            className="border-0 bg-transparent p-0 font-semibold text-amber-700 hover:underline cursor-pointer"
            onClick={onNavigateToRegister}
          >
            Sign Up
          </button>
        </p>
      )}
    </div>
  );
}
