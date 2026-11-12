import React, { useMemo, useState } from "react";
import { registerUser, loginWithGoogle } from "../../services/authService";
import PasswordInput from "../common/PasswordInput";
import Select from "../common/Select";
import ConfirmationModal from "../common/ConfirmationModal";

const GENDER_OPTIONS = [
  { value: "female", label: "Female", description: "Used for baseline BMR & calorie calculations" },
  { value: "male", label: "Male", description: "Used for baseline BMR & calorie calculations" },
  { value: "other", label: "Prefer not to say", description: "Standard average calorie baseline" },
];

const RULES = [
  ["length", "8+ characters"],
  ["upper", "Uppercase letter"],
  ["lower", "Lowercase letter"],
  ["number", "A number"],
  ["symbol", "A symbol"],
];

function getPasswordChecks(pw = "") {
  return {
    length: pw.length >= 8,
    upper: /[A-Z]/.test(pw),
    lower: /[a-z]/.test(pw),
    number: /\d/.test(pw),
    symbol: /[^A-Za-z0-9]/.test(pw),
  };
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || "").trim());
}

/**
 * User Registration Screen (Register.jsx) — Matches KusinApp Web & Mobile UI
 * without extra inner KusinApp logo, with tall rounded-full buttons and mandatory
 * Terms & Conditions + Privacy Policy dual-agreement check.
 */
export default function Register({ onRegisterSuccess, onNavigateToLogin }) {
  const [displayName, setDisplayName] = useState("");
  const [gender, setGender] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Require reading & agreeing to BOTH Terms & Conditions and Privacy Policy
  const [agreedTermsDoc, setAgreedTermsDoc] = useState(false);
  const [agreedPrivacyDoc, setAgreedPrivacyDoc] = useState(false);
  const [activeDocModal, setActiveDocModal] = useState(null); // "terms" | "privacy" | null

  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const checks = useMemo(() => getPasswordChecks(password), [password]);
  const agreedBoth = agreedTermsDoc && agreedPrivacyDoc;

  const handleCheckboxClick = (e) => {
    e.preventDefault();
    if (agreedBoth) {
      setAgreedTermsDoc(false);
      setAgreedPrivacyDoc(false);
      return;
    }
    if (!agreedTermsDoc) {
      setActiveDocModal("terms");
      return;
    }
    if (!agreedPrivacyDoc) {
      setActiveDocModal("privacy");
    }
  };

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
    if (!agreedBoth) {
      setFormError(
        "Please read and agree to both the KusinApp Terms & Conditions and Privacy Policy before creating your account."
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const user = await registerUser(mail, password, name, gender);
      if (typeof onRegisterSuccess === "function") onRegisterSuccess(user, mail, false, gender);
    } catch (err) {
      setFormError(err.message || "Registration failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setFormError("");
    if (!agreedBoth) {
      setFormError(
        "Please read and agree to both the Terms & Conditions and Privacy Policy first before signing up with Google."
      );
      return;
    }
    setIsSubmitting(true);
    try {
      const user = await loginWithGoogle();
      if (typeof onRegisterSuccess === "function") onRegisterSuccess(user, user?.email, true, gender);
    } catch (err) {
      setFormError(err.message || "Failed to sign up with Google.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      {/* Clean Header without extra KusinApp logo */}
      <div className="text-center mb-6">
        <h1 className="text-[1.85rem] font-extrabold text-slate-900 tracking-tight leading-tight">
          Create Your Account
        </h1>
        <p className="mt-1.5 text-sm text-slate-500 leading-relaxed">
          Begin your culinary journey with homestyle Filipino meal plans tailored for your table
        </p>
      </div>

      {formError && (
        <div
          role="alert"
          className="px-4 py-3 mb-4 rounded-2xl border border-red-200 bg-red-50 text-red-700 text-xs font-semibold text-center leading-relaxed"
        >
          {formError}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-3.5">
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="register-name"
            className="text-xs font-extrabold tracking-wider uppercase text-slate-900"
          >
            Full Name
          </label>
          <input
            id="register-name"
            type="text"
            className="w-full h-12 py-3.5 px-4 rounded-2xl border border-slate-200 bg-slate-50/80 focus:bg-white text-[0.95rem] text-slate-900 placeholder:text-slate-400 outline-none hover:border-slate-300 focus:border-amber-500 focus:shadow-amber-ring transition-all disabled:opacity-60"
            style={{ minHeight: "50px" }}
            placeholder="Juan Dela Cruz"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            disabled={isSubmitting}
            autoComplete="name"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            id="register-gender-label"
            htmlFor="register-gender"
            className="text-xs font-extrabold tracking-wider uppercase text-slate-900"
          >
            Biological Sex <span className="text-slate-400 font-semibold">(Optional)</span>
          </label>
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
            className="text-xs font-extrabold tracking-wider uppercase text-slate-900"
          >
            Email Address
          </label>
          <input
            id="register-email"
            type="email"
            className="w-full h-12 py-3.5 px-4 rounded-2xl border border-slate-200 bg-slate-50/80 focus:bg-white text-[0.95rem] text-slate-900 placeholder:text-slate-400 outline-none hover:border-slate-300 focus:border-amber-500 focus:shadow-amber-ring transition-all disabled:opacity-60"
            style={{ minHeight: "50px" }}
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
            className="text-xs font-extrabold tracking-wider uppercase text-slate-900"
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

        {/* Password requirements box */}
        <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200">
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
            className="text-xs font-extrabold tracking-wider uppercase text-slate-900"
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

        {/* Mandatory Terms & Conditions + Privacy Policy Dual-Read Checkbox */}
        <div className="flex items-start gap-2.5 mt-1 mb-1">
          <button
            type="button"
            role="checkbox"
            aria-checked={agreedBoth}
            onClick={handleCheckboxClick}
            className={`w-5 h-5 mt-0.5 rounded-md border flex items-center justify-center shrink-0 transition-all cursor-pointer ${
              agreedBoth
                ? "bg-amber-500 border-amber-500 text-white"
                : "bg-white border-slate-300 hover:border-amber-500"
            }`}
          >
            {agreedBoth && (
              <span className="text-xs font-extrabold leading-none">✓</span>
            )}
          </button>
          <div className="text-xs text-slate-600 leading-relaxed select-none">
            <span>
              I agree to the KusinApp{" "}
              <button
                type="button"
                onClick={() => setActiveDocModal("terms")}
                className={`border-0 bg-transparent p-0 font-extrabold hover:underline cursor-pointer ${
                  agreedTermsDoc ? "text-emerald-700" : "text-amber-700"
                }`}
              >
                Terms &amp; Conditions{agreedTermsDoc ? " ✓" : ""}
              </button>{" "}
              and{" "}
              <button
                type="button"
                onClick={() => setActiveDocModal("privacy")}
                className={`border-0 bg-transparent p-0 font-extrabold hover:underline cursor-pointer ${
                  agreedPrivacyDoc ? "text-emerald-700" : "text-amber-700"
                }`}
              >
                Privacy Policy{agreedPrivacyDoc ? " ✓" : ""}
              </button>
              .
            </span>
            {!agreedBoth && (
              <div className="text-[11px] text-slate-400 mt-0.5">
                Click and agree to both links above to check this box.
              </div>
            )}
          </div>
        </div>

        <button
          type="submit"
          className="w-full h-14 py-3.5 mt-1 px-6 bg-amber-500 hover:bg-amber-600 rounded-full text-base font-extrabold text-white shadow-[0_8px_20px_-4px_rgba(245,158,11,0.45)] inline-flex items-center justify-center gap-2.5 transition-all disabled:opacity-55 cursor-pointer"
          style={{ minHeight: "54px" }}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <span
                className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"
                aria-hidden="true"
              />
              <span>Creating account...</span>
            </>
          ) : (
            <>
              <span>Sign Up</span>
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
        onClick={handleGoogleSignUp}
        disabled={isSubmitting}
      >
        <img
          src="/assets/google-g.png"
          alt=""
          className="w-5 h-5 object-contain"
          aria-hidden="true"
        />
        <span>Sign up with Google</span>
      </button>

      {typeof onNavigateToLogin === "function" && (
        <p className="flex items-center justify-center gap-1.5 mt-6 text-xs font-medium text-slate-500">
          Already have an account?
          <button
            type="button"
            className="border-0 bg-transparent p-0 font-extrabold text-amber-700 hover:underline cursor-pointer"
            onClick={onNavigateToLogin}
          >
            Log in
          </button>
        </p>
      )}

      {/* Chained Terms & Conditions -> Privacy Policy Modal */}
      <ConfirmationModal
        isOpen={!!activeDocModal}
        onClose={() => setActiveDocModal(null)}
        onConfirm={() => {
          if (activeDocModal === "terms") {
            setAgreedTermsDoc(true);
            if (!agreedPrivacyDoc) {
              setActiveDocModal("privacy");
            } else {
              setFormError("");
              setActiveDocModal(null);
            }
          } else if (activeDocModal === "privacy") {
            setAgreedPrivacyDoc(true);
            if (!agreedTermsDoc) {
              setActiveDocModal("terms");
            } else {
              setFormError("");
              setActiveDocModal(null);
            }
          }
        }}
        title={
          activeDocModal === "privacy"
            ? "KusinApp Privacy Policy (2 of 2)"
            : "KusinApp Terms & Conditions (1 of 2)"
        }
        message={
          activeDocModal === "privacy"
            ? "KusinApp respects your privacy. Your personal profile and health metrics (biological sex, age, height, weight, BMI, BMR, dietary restrictions, allergies, and comorbidities) are stored securely in Firebase Realtime Database solely to personalize your recommended Filipino recipes and daily nutritional targets. We never sell or share your personal health data with third parties."
            : "By creating a KusinApp account, you agree to use our Filipino meal planning and pantry management platform for personal, non-commercial household use. You are responsible for maintaining the confidentiality of your account credentials. Note: Nutritional estimates, calorie targets, and recipe suggestions provided by KusinApp are for informational and meal-planning purposes only and are not a substitute for professional medical or dietary advice."
        }
        confirmText={
          activeDocModal === "terms" && !agreedPrivacyDoc
            ? "I Agree • Next: Privacy Policy"
            : activeDocModal === "privacy" && !agreedTermsDoc
            ? "I Agree • Next: Terms"
            : "I Agree"
        }
        cancelText="Close"
      />
    </div>
  );
}
