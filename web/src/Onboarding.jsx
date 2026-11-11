import React, { useState, useMemo } from "react";
import { calculateBMI, calculateBMR, saveUserOnboarding } from "./authService";
import Select from "./Select";

/**
 * US-03: Health & Cooking Skill Onboarding
 * Aligned with the KusinApp Software Proposal (Section 1):
 * - Demographics (Age, Sex)
 * - Physical metrics & current BMI (Height, Weight -> BMI + category + BMR)
 * - Weight goals: Maintain, Lose, Gain
 * - Existing comorbidities / health conditions
 * - Target user persona: Solo Eater, Household Provider, Health-Targeted Eater
 * - Cooking skill level: Beginner, Intermediate, Advanced
 *
 * Pass `initialData` (an existing onboarding record) to pre-fill when retaking.
 */

const STEPS = ["Your Body", "Health Goals", "Your Kitchen"];

const SEX_OPTIONS = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
];

const WEIGHT_GOALS = [
  { id: "maintain", emoji: "⚖️", title: "Maintain Weight", desc: "Stay where you are with balanced, nutritious Filipino meals." },
  { id: "lose", emoji: "🥗", title: "Lose Weight", desc: "Calorie-deficit plans, more gulay, less oil and fat." },
  { id: "gain", emoji: "💪", title: "Gain Weight / Muscle", desc: "Calorie-surplus, protein-rich Filipino recipes." },
];

const COMORBIDITIES = [
  { id: "none", label: "None" },
  { id: "hypertension", label: "Hypertension · Low Sodium" },
  { id: "diabetes", label: "Diabetes · Low Sugar" },
  { id: "high_cholesterol", label: "High Cholesterol · Low Fat" },
  { id: "hyperuricemia_gout", label: "Gout · Low Purine" },
  { id: "gerd_acid_reflux", label: "Acid Reflux / GERD" },
];

const PERSONAS = [
  { id: "solo_eater", emoji: "🧑‍🍳", title: "The Solo Eater", desc: "Individual meal prep and a personal grocery budget.", pax: "1" },
  { id: "household_provider", emoji: "👨‍👩‍👧‍👦", title: "The Household Provider", desc: "Daily, weekly, or monthly meals for the whole family.", pax: "4" },
  { id: "health_targeted_eater", emoji: "🎯", title: "The Health-Targeted Eater", desc: "Meals planned strictly around weight goals and health conditions.", pax: "1" },
];

const SKILLS = [
  { id: "beginner", emoji: "🥚", title: "Beginner", desc: "Simple boiled and stir-fried dishes — Tinola, Nilaga, Sinigang." },
  { id: "intermediate", emoji: "🍳", title: "Intermediate", desc: "Sautéing, braising, stewing — Adobo, Afritada, Kare-Kare." },
  { id: "advanced", emoji: "🔥", title: "Advanced", desc: "Complex regional dishes and multi-step prep — Lechon Kawali, Pinikpikan." },
];

export default function Onboarding({ user, initialData, onComplete, onCancel }) {
  const [step, setStep] = useState(1);

  const [age, setAge] = useState(initialData?.age?.toString() || "");
  const [gender, setGender] = useState(initialData?.gender || "");
  const [heightCm, setHeightCm] = useState(initialData?.heightCm?.toString() || "");
  const [weightKg, setWeightKg] = useState(initialData?.weightKg?.toString() || "");

  const [weightGoal, setWeightGoal] = useState(initialData?.weightGoal || "maintain");
  const [comorbidities, setComorbidities] = useState(initialData?.comorbidities || ["none"]);

  const [userPersona, setUserPersona] = useState(initialData?.userPersona || "solo_eater");
  const [householdSize, setHouseholdSize] = useState(initialData?.householdSize?.toString() || "1");
  const [cookingSkill, setCookingSkill] = useState(initialData?.cookingSkill || "beginner");

  const [errorMsg, setErrorMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { bmi, category } = useMemo(() => calculateBMI(heightCm, weightKg), [heightCm, weightKg]);
  const estimatedBMR = useMemo(
    () => (gender ? calculateBMR(weightKg, heightCm, age, gender) : 0),
    [weightKg, heightCm, age, gender]
  );

  const toggleComorbidity = (condition) => {
    if (condition === "none") {
      setComorbidities(["none"]);
      return;
    }
    setComorbidities((prev) => {
      const withoutNone = prev.filter((c) => c !== "none");
      const next = withoutNone.includes(condition)
        ? withoutNone.filter((c) => c !== condition)
        : [...withoutNone, condition];
      return next.length ? next : ["none"];
    });
  };

  const validateStep1 = () => {
    const a = parseInt(age, 10);
    const h = parseFloat(heightCm);
    const w = parseFloat(weightKg);
    if (!a || a < 10 || a > 120) return "Please enter a valid age between 10 and 120.";
    if (!gender) return "Please select your biological sex (used to compute your BMR).";
    if (!h || h < 50 || h > 250) return "Please enter a valid height between 50 and 250 cm.";
    if (!w || w < 20 || w > 300) return "Please enter a valid weight between 20 and 300 kg.";
    return "";
  };

  const handleNext = () => {
    if (step === 1) {
      const error = validateStep1();
      if (error) {
        setErrorMsg(error);
        return;
      }
    }
    setErrorMsg("");
    setStep((s) => Math.min(STEPS.length, s + 1));
  };

  const handleBack = () => {
    setErrorMsg("");
    setStep((s) => Math.max(1, s - 1));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!user?.uid) {
      setErrorMsg("No active user session found. Please log in first.");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await saveUserOnboarding(user.uid, {
        age,
        gender,
        heightCm,
        weightKg,
        weightGoal,
        comorbidities,
        userPersona,
        householdSize,
        cookingSkill,
      });
      if (typeof onComplete === "function") onComplete(result);
    } catch (err) {
      setErrorMsg(err.message || "Failed to save onboarding. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div className="k-card-head">
        <span className="k-eyebrow">Getting to know you</span>
        <h1 className="k-title">Set Up Your KusinApp Profile</h1>
        <p className="k-subtitle">We use this to personalize your meal plans, calorie targets, and recipes.</p>
      </div>

      <ol className="k-stepper" aria-label="Onboarding progress" style={{ listStyle: "none", padding: 0, margin: "0 0 24px" }}>
        {STEPS.map((label, i) => {
          const n = i + 1;
          const state = n < step ? "done" : n === step ? "current" : "upcoming";
          return (
            <li key={label} className="k-step" data-state={state} aria-current={state === "current" ? "step" : undefined}>
              <span className="k-step-bar" />
              <span>{n}. {label}</span>
            </li>
          );
        })}
      </ol>

      {errorMsg && (
        <div role="alert" className="k-alert k-alert--error">
          {errorMsg}
        </div>
      )}

      {/* STEP 1 — Demographics & physical metrics */}
      {step === 1 && (
        <div className="k-form">
          <div>
            <h2 className="k-section-title">Demographics & Body Metrics</h2>
            <p className="k-section-desc">Used to compute your BMI and daily calorie baseline.</p>
          </div>

          <div className="k-row">
            <div className="k-field">
              <label htmlFor="ob-age" className="k-label">Age</label>
              <div className="k-input-wrap">
                <input id="ob-age" type="number" inputMode="numeric" className="k-input" placeholder="e.g., 22"
                  value={age} onChange={(e) => setAge(e.target.value)} min="10" max="120" />
                <span className="k-input-suffix">yrs</span>
              </div>
            </div>
            <div className="k-field">
              <span id="ob-sex-label" className="k-label">Biological Sex</span>
              <Select
                id="ob-sex"
                ariaLabelledBy="ob-sex-label"
                value={gender}
                onChange={setGender}
                options={SEX_OPTIONS}
                placeholder="Select"
              />
            </div>
          </div>

          <div className="k-row">
            <div className="k-field">
              <label htmlFor="ob-height" className="k-label">Height</label>
              <div className="k-input-wrap">
                <input id="ob-height" type="number" inputMode="decimal" className="k-input" placeholder="e.g., 165"
                  value={heightCm} onChange={(e) => setHeightCm(e.target.value)} min="50" max="250" />
                <span className="k-input-suffix">cm</span>
              </div>
            </div>
            <div className="k-field">
              <label htmlFor="ob-weight" className="k-label">Weight</label>
              <div className="k-input-wrap">
                <input id="ob-weight" type="number" inputMode="decimal" className="k-input" placeholder="e.g., 62"
                  value={weightKg} onChange={(e) => setWeightKg(e.target.value)} min="20" max="300" />
                <span className="k-input-suffix">kg</span>
              </div>
            </div>
          </div>

          {bmi > 0 && (
            <div className="k-metrics" aria-live="polite">
              <div className="k-metric">
                <div className="k-metric-label">Current BMI</div>
                <div className="k-metric-value">{bmi}</div>
                <div className="k-metric-sub" style={{ color: getCategoryColor(category) }}>{category}</div>
              </div>
              <div className="k-metric">
                <div className="k-metric-label">Base BMR</div>
                <div className="k-metric-value">{estimatedBMR > 0 ? `~${estimatedBMR}` : "—"}</div>
                <div className="k-metric-sub" style={{ color: "var(--k-muted)" }}>
                  {estimatedBMR > 0 ? "kcal / day" : "Add age & sex"}
                </div>
              </div>
            </div>
          )}

          <div className="k-actions">
            {typeof onCancel === "function" && (
              <button type="button" className="k-btn k-btn--outline" onClick={onCancel}>Cancel</button>
            )}
            <button type="button" className="k-btn k-btn--primary" onClick={handleNext}>
              Continue →
            </button>
          </div>
        </div>
      )}

      {/* STEP 2 — Weight goal & comorbidities */}
      {step === 2 && (
        <div className="k-form">
          <div>
            <h2 className="k-section-title">Weight Goal</h2>
            <p className="k-section-desc">Your meal plans and calorie targets will follow this goal.</p>
          </div>

          <div className="k-choice-grid" role="radiogroup" aria-label="Weight goal">
            {WEIGHT_GOALS.map((g) => (
              <label key={g.id} className="k-choice">
                <input type="radio" name="weightGoal" value={g.id} checked={weightGoal === g.id}
                  onChange={() => setWeightGoal(g.id)} />
                <span className="k-choice-radio" aria-hidden="true" />
                <span className="k-choice-emoji" aria-hidden="true">{g.emoji}</span>
                <span>
                  <span className="k-choice-title">{g.title}</span>
                  <span className="k-choice-desc" style={{ display: "block" }}>{g.desc}</span>
                </span>
              </label>
            ))}
          </div>

          <div>
            <h2 className="k-section-title">Health Conditions</h2>
            <p className="k-section-desc">Select any that apply so we can filter recipes for you.</p>
          </div>

          <div className="k-chips">
            {COMORBIDITIES.map((c) => {
              const selected = comorbidities.includes(c.id);
              return (
                <button key={c.id} type="button" className="k-chip" aria-pressed={selected}
                  onClick={() => toggleComorbidity(c.id)}>
                  {selected ? "✓" : "+"} {c.label}
                </button>
              );
            })}
          </div>

          <div className="k-actions">
            <button type="button" className="k-btn k-btn--outline" onClick={handleBack}>← Back</button>
            <button type="button" className="k-btn k-btn--primary" onClick={handleNext}>Continue →</button>
          </div>
        </div>
      )}

      {/* STEP 3 — Persona, household size & cooking skill */}
      {step === 3 && (
        <form className="k-form" onSubmit={handleSubmit}>
          <div>
            <h2 className="k-section-title">Who are you cooking for?</h2>
            <p className="k-section-desc">This sets your default recipe servings.</p>
          </div>

          <div className="k-choice-grid" role="radiogroup" aria-label="User profile">
            {PERSONAS.map((p) => (
              <label key={p.id} className="k-choice">
                <input type="radio" name="userPersona" value={p.id} checked={userPersona === p.id}
                  onChange={() => { setUserPersona(p.id); setHouseholdSize(p.pax); }} />
                <span className="k-choice-radio" aria-hidden="true" />
                <span className="k-choice-emoji" aria-hidden="true">{p.emoji}</span>
                <span>
                  <span className="k-choice-title">{p.title}</span>
                  <span className="k-choice-desc" style={{ display: "block" }}>{p.desc}</span>
                </span>
              </label>
            ))}
          </div>

          <div className="k-field">
            <label htmlFor="ob-pax" className="k-label">Number of people eating</label>
            <div className="k-input-wrap">
              <input id="ob-pax" type="number" inputMode="numeric" className="k-input" min="1" max="30"
                value={householdSize} onChange={(e) => setHouseholdSize(e.target.value)} />
              <span className="k-input-suffix">pax</span>
            </div>
          </div>

          <div>
            <h2 className="k-section-title">Cooking Skill Level</h2>
            <p className="k-section-desc">We&apos;ll suggest recipes that match your experience.</p>
          </div>

          <div className="k-choice-grid" role="radiogroup" aria-label="Cooking skill level">
            {SKILLS.map((s) => (
              <label key={s.id} className="k-choice">
                <input type="radio" name="cookingSkill" value={s.id} checked={cookingSkill === s.id}
                  onChange={() => setCookingSkill(s.id)} />
                <span className="k-choice-radio" aria-hidden="true" />
                <span className="k-choice-emoji" aria-hidden="true">{s.emoji}</span>
                <span>
                  <span className="k-choice-title">{s.title}</span>
                  <span className="k-choice-desc" style={{ display: "block" }}>{s.desc}</span>
                </span>
              </label>
            ))}
          </div>

          <div className="k-actions">
            <button type="button" className="k-btn k-btn--outline" onClick={handleBack} disabled={isSubmitting}>
              ← Back
            </button>
            <button type="submit" className="k-btn k-btn--primary" disabled={isSubmitting}>
              {isSubmitting && <span className="k-spinner" aria-hidden="true" />}
              {isSubmitting ? "Saving..." : "Complete Profile"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

function getCategoryColor(category) {
  switch (category) {
    case "Normal": return "#067647";
    case "Overweight": return "#b54708";
    case "Obese": return "#b42318";
    case "Underweight": return "#1d4ed8";
    default: return "var(--k-muted)";
  }
}
