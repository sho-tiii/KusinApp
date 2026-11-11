import React from "react";

/**
 * Calculates password strength and checks individual requirements.
 * Returns score (0-4), strength label, Tailwind classes, and boolean flags.
 */
export function evaluatePasswordStrength(password = "") {
  const pwd = typeof password === "string" ? password : "";

  const checks = {
    length: pwd.length >= 8,
    hasUpper: /[A-Z]/.test(pwd),
    hasLower: /[a-z]/.test(pwd),
    hasNumber: /[0-9]/.test(pwd),
    hasSpecial: /[^A-Za-z0-9]/.test(pwd),
  };

  let passedCount = 0;
  if (checks.length) passedCount++;
  if (checks.hasUpper && checks.hasLower) passedCount++;
  if (checks.hasNumber) passedCount++;
  if (checks.hasSpecial) passedCount++;

  let label = "Very Weak";
  let textColorClass = "text-red-600";
  let barColorClass = "bg-red-600";
  let score = 0;

  if (pwd.length === 0) {
    label = "";
    score = 0;
  } else if (passedCount <= 1) {
    label = "Weak";
    textColorClass = "text-red-600";
    barColorClass = "bg-red-600";
    score = 1;
  } else if (passedCount === 2) {
    label = "Fair";
    textColorClass = "text-amber-600";
    barColorClass = "bg-amber-500";
    score = 2;
  } else if (passedCount === 3) {
    label = "Good";
    textColorClass = "text-sky-600";
    barColorClass = "bg-sky-600";
    score = 3;
  } else {
    label = "Strong";
    textColorClass = "text-emerald-600";
    barColorClass = "bg-emerald-500";
    score = 4;
  }

  return {
    score,
    label,
    textColorClass,
    barColorClass,
    checks,
    isValid: pwd.length >= 8 && passedCount >= 3,
  };
}

/**
 * Reusable Password Strength Meter & Requirement Checklist styled with Tailwind CSS.
 */
export default function PasswordStrengthMeter({ password = "", showRequirements = true }) {
  if (!password) return null;

  const { score, label, textColorClass, barColorClass, checks } =
    evaluatePasswordStrength(password);

  const requirementList = [
    { label: "At least 8 characters", met: checks.length },
    { label: "Uppercase & lowercase letters", met: checks.hasUpper && checks.hasLower },
    { label: "At least one number (0-9)", met: checks.hasNumber },
    { label: "At least one symbol (e.g. !@#$)", met: checks.hasSpecial },
  ];

  return (
    <div
      className="mt-2.5 p-3 bg-slate-50 border border-slate-200 rounded-lg"
      aria-live="polite"
    >
      {/* Strength indicator header */}
      <div className="flex justify-between items-center text-xs mb-1.5">
        <span className="text-slate-600 font-medium">Password strength:</span>
        <span className={`font-bold ${textColorClass}`}>{label}</span>
      </div>

      {/* 4-segment progress bar */}
      <div
        className="flex gap-1 h-1.5 mb-2.5"
        role="progressbar"
        aria-valuenow={score}
        aria-valuemin={0}
        aria-valuemax={4}
      >
        {[1, 2, 3, 4].map((step) => (
          <div
            key={step}
            className={`flex-1 h-full rounded-sm transition-colors duration-200 ${
              step <= score ? barColorClass : "bg-slate-200"
            }`}
          />
        ))}
      </div>

      {/* Requirements checklist */}
      {showRequirements && (
        <ul className="list-none p-0 m-0 flex flex-col gap-1">
          {requirementList.map((item) => (
            <li
              key={item.label}
              className={`flex items-center gap-1.5 text-xs transition-colors duration-150 ${
                item.met ? "text-emerald-600 font-semibold" : "text-slate-400"
              }`}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
                className="shrink-0"
              >
                {item.met ? (
                  <polyline points="20 6 9 17 4 12" />
                ) : (
                  <circle cx="12" cy="12" r="6" />
                )}
              </svg>
              <span>{item.label}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
