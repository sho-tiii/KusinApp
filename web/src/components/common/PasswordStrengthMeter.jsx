import React from "react";

/**
 * Calculates password strength and checks individual requirements.
 * Returns score (0-4), strength label, color token, and boolean flags.
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
  let color = "#d92d20"; // Red
  let score = 0;

  if (pwd.length === 0) {
    label = "";
    score = 0;
  } else if (passedCount <= 1) {
    label = "Weak";
    color = "#d92d20";
    score = 1;
  } else if (passedCount === 2) {
    label = "Fair";
    color = "#f59e0b"; // Amber
    score = 2;
  } else if (passedCount === 3) {
    label = "Good";
    color = "#0284c7"; // Blue
    score = 3;
  } else {
    label = "Strong";
    color = "#12b76a"; // Emerald green
    score = 4;
  }

  return {
    score,
    label,
    color,
    checks,
    isValid: pwd.length >= 8 && passedCount >= 3,
  };
}

/**
 * Reusable Password Strength Meter & Requirement Checklist
 * Designed cleanly matching KusinApp design tokens:
 * - 4-segment progress bar
 * - Live strength label
 * - Minimalist requirement items with SVG indicators (no emojis)
 */
export default function PasswordStrengthMeter({ password = "", showRequirements = true }) {
  if (!password) return null;

  const { score, label, color, checks } = evaluatePasswordStrength(password);

  const requirementList = [
    { label: "At least 8 characters", met: checks.length },
    { label: "Uppercase & lowercase letters", met: checks.hasUpper && checks.hasLower },
    { label: "At least one number (0-9)", met: checks.hasNumber },
    { label: "At least one symbol (e.g. !@#$)", met: checks.hasSpecial },
  ];

  return (
    <div className="k-pw-strength" aria-live="polite">
      {/* Strength indicator header */}
      <div className="k-pw-strength-header">
        <span className="k-pw-strength-title">Password strength:</span>
        <span className="k-pw-strength-label" style={{ color }}>
          {label}
        </span>
      </div>

      {/* 4-segment progress bar */}
      <div className="k-pw-strength-bars" role="progressbar" aria-valuenow={score} aria-valuemin="0" aria-valuemax="4">
        {[1, 2, 3, 4].map((step) => (
          <div
            key={step}
            className="k-pw-strength-segment"
            style={{
              backgroundColor: step <= score ? color : "var(--k-border-subtle, #e5e7eb)",
            }}
          />
        ))}
      </div>

      {/* Requirements checklist */}
      {showRequirements && (
        <ul className="k-pw-req-list">
          {requirementList.map((item, index) => (
            <li
              key={index}
              className={`k-pw-req-item ${item.met ? "k-pw-req-item--met" : ""}`}
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
                style={{ flexShrink: 0 }}
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
