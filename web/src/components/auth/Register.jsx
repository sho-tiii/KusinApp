import React, { useState } from "react";
import {
  registerUser,
  loginWithGoogle,
  getPasswordChecks,
  isValidEmail,
} from "../../services/authService";
import PasswordInput from "../common/PasswordInput";
import Select from "../common/Select";

const RULES = [
  ["length", "8+ characters"],
  ["upper", "Uppercase letter"],
  ["lower", "Lowercase letter"],
  ["number", "A number"],
  ["symbol", "A symbol"],
];

const GENDER_OPTIONS = [
  { value: "female", label: "Female", description: "Used for baseline BMR & calorie calculations" },
  { value: "male", label: "Male", description: "Used for baseline BMR & calorie calculations" },
  { value: "other", label: "Prefer not to say", description: "Standard average calorie baseline" },
];

/**
 * User Registration Screen (Register.jsx) — Cohesive with KusinApp Mobile SignupScreen.
 */
export default function Register({ onRegisterSuccess, onNavigateToLogin }) {
  const [displayName, setDisplayName] = useState("");
  const [gender, setGender] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const checks = getPasswordChecks(password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    const name = displayName.trim();
    const mail = email.trim();

    if (name.length < 2) {
      setFormError("Please enter your full name.");
      return;
    }
    if (!isValidEmail(mail)) {
      setFormError("Please enter a valid email address.");
      return;
    }
    if (!Object.values(checks).every(Boolean)) {
      setFormError("Your password doesn't meet all the requirements yet.");
      return;
    }
    if (confirmPassword !== password) {
      setFormError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    try {
      const user = await registerUser(mail, password, name, gender);
      if (typeof onRegisterSuccess === "function") onRegisterSuccess(user, mail);
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
      if (typeof onRegisterSuccess === "function") onRegisterSuccess(user, user?.email, true);
    } catch (err) {
      setFormError(err.message || "Failed to sign up with Google.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-[1.65rem] font-extrabold text-slate-900 tracking-tight leading-tight">
          Create Your Account
        </h1>
        <p className="mt-1.5 text-sm text-slate-600 leading-relaxed">
          Begin your culinary journey with homestyle Filipino meal plans tailored for your table.
        </p>
      </div>

      {formError && (
        <div
          role="alert"
          className="px-3.5 py-3 mb-4 rounded-xl border border-red-200 bg-red-50 text-red-700 text-xs font-semibold text-center leading-relaxed"
        >
          {formError}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-3.5">
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="register-name"
            className="text-xs font-bold tracking-wider uppercase text-slate-800"
          >
            Full Name
          </label>
          <input
            id="register-name"
            type="text"
            className="w-full h-12 px-3.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-[0.95rem] text-slate-900 placeholder:text-slate-400 outline-none hover:border-slate-300 focus:border-amber-500 focus:shadow-amber-ring transition-all disabled:opacity-60"
            placeholder="Juan Dela Cruz"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            disabled={isSubmitting}
            autoComplete="name"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <span
            id="register-gender-label"
            className="text-xs font-bold tracking-wider uppercase text-slate-800"
          >
            Biological Sex (Optional)
          </span>
          <Select
            id="register-gender"
            ariaLabelledBy="register-gender-label"
            value={gender}
            onChange={setGender}
            options={GENDER_OPTIONS}
            placeholder="Select biological sex"
            disabled={isSubmitting}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="register-email"
            className="text-xs font-bold tracking-wider uppercase text-slate-800"
          >
            Email Address
          </label>
          <input
            id="register-email"
            type="email"
            className="w-full h-12 px-3.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-[0.95rem] text-slate-900 placeholder:text-slate-400 outline-none hover:border-slate-300 focus:border-amber-500 focus:shadow-amber-ring transition-all disabled:opacity-60"
            placeholder="juan@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isSubmitting}
            autoComplete="email"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="register-password"
            className="text-xs font-bold tracking-wider uppercase text-slate-800"
          >
            New Password
          </label>
          <PasswordInput
            id="register-password"
            placeholder="Enter new password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isSubmitting}
            autoComplete="new-password"
          />
        </div>

        {/* Password requirements box matching mobile SignupScreen */}
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
          <div className="text-xs font-bold text-slate-700 mb-2">
            Password requirements:
          </div>
          <div className="grid grid-cols-2 gap-y-1.5 gap-x-2">
            {RULES.map(([key, label]) => {
              const ok = checks[key];
              return (
                <div key={key} className="flex items-center gap-2">
                  <span
                    className={`w-3.5 h-3.5 rounded-full grid place-items-center text-[9px] font-extrabold transition-colors ${
                      ok
                        ? "bg-emerald-600 text-white"
                        : "bg-slate-200 text-transparent"
                    }`}
                  >
                    ✓
                  </span>
                  <span
                    className={`text-xs transition-colors ${
                      ok ? "text-emerald-700 font-semibold" : "text-slate-500"
                    }`}
                  >
                    {label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="register-confirm"
            className="text-xs font-bold tracking-wider uppercase text-slate-800"
          >
            Confirm Password
          </label>
          <PasswordInput
            id="register-confirm"
            placeholder="Re-enter password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={isSubmitting}
            autoComplete="new-password"
            invalid={confirmPassword.length > 0 && confirmPassword !== password}
          />
        </div>

        <button
          type="submit"
          className="w-full h-13 mt-1 px-4 bg-amber-500 hover:bg-amber-600 rounded-2xl text-base font-bold text-white shadow-sm inline-flex items-center justify-center gap-2 transition-all disabled:opacity-55 cursor-pointer"
          disabled={isSubmitting}
        >
          {isSubmitting && (
            <span
              className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"
              aria-hidden="true"
            />
          )}
          {isSubmitting ? "Creating account..." : "Create Account & Send Link"}
        </button>
      </form>

      <div className="flex items-center my-5 text-center before:flex-1 before:border-b before:border-slate-200 after:flex-1 after:border-b after:border-slate-200">
        <span className="px-3 text-[11px] text-slate-400 font-bold uppercase tracking-widest">
          or continue with
        </span>
      </div>

      <button
        type="button"
        className="w-full h-13 px-4 bg-white hover:bg-slate-50 text-slate-900 border border-slate-200 rounded-2xl text-[0.95rem] font-semibold flex items-center justify-center gap-2.5 transition-all disabled:opacity-55 cursor-pointer"
        onClick={handleGoogleSignUp}
        disabled={isSubmitting}
      >
        <img
          src="/assets/google-g.png"
          alt=""
          className="w-5 h-5 object-contain"
          aria-hidden="true"
        />
        Sign up with Google
      </button>

      {typeof onNavigateToLogin === "function" && (
        <p className="flex items-center justify-center gap-1.5 mt-5 text-xs font-medium text-slate-600">
          Already have an account?
          <button
            type="button"
            className="border-0 bg-transparent p-0 font-bold text-amber-700 hover:underline cursor-pointer"
            onClick={onNavigateToLogin}
          >
            Log in
          </button>
        </p>
      )}
    </div>
  );
}
