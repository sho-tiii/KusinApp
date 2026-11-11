import React, { useState, useMemo } from "react";
import { calculateBMI, calculateBMR, saveUserOnboarding } from "./authService";

/**
 * US-03: Health & Cooking Skill Onboarding
 * Accurately aligned with KusinApp Software Proposal (Section 1):
 * - Demographics (Age, Gender)
 * - Physical & BMI Targets (Height, Weight -> BMI + Category + BMR)
 * - Weight Goals: Maintain, Gain, Lose
 * - Existing Comorbidities (Hypertension, Diabetes, High Cholesterol, etc.)
 * - Target User Persona: The Solo Eater, The Household Provider, The Health-Targeted Eater
 * - Cooking Skill Level: Beginner, Intermediate, Advanced
 */
export default function Onboarding({ user, onComplete }) {
  const [step, setStep] = useState(1);

  // 1. Demographics & Physical Metrics
  const [age, setAge] = useState("22");
  const [gender, setGender] = useState("male");
  const [heightCm, setHeightCm] = useState("");
  const [weightKg, setWeightKg] = useState("");

  // 2. Health & Weight Goals (Proposal: Maintain, Gain, Lose)
  const [weightGoal, setWeightGoal] = useState("maintain");
  const [comorbidities, setComorbidities] = useState(["none"]);

  // 3. Target User Profiles (Proposal: Solo Eater, Household Provider, Health-Targeted)
  const [userPersona, setUserPersona] = useState("solo_eater");
  const [householdSize, setHouseholdSize] = useState("1");

  // 4. Cooking Skill Level
  const [cookingSkill, setCookingSkill] = useState("beginner");

  const [errorMsg, setErrorMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Live BMI & BMR calculations
  const { bmi, category } = useMemo(() => {
    return calculateBMI(heightCm, weightKg);
  }, [heightCm, weightKg]);

  const estimatedBMR = useMemo(() => {
    return calculateBMR(weightKg, heightCm, age, gender);
  }, [weightKg, heightCm, age, gender]);

  const toggleComorbidity = (condition) => {
    if (condition === "none") {
      setComorbidities(["none"]);
      return;
    }
    setComorbidities((prev) => {
      const filtered = prev.filter((c) => c !== "none");
      return filtered.includes(condition)
        ? filtered.filter((c) => c !== condition)
        : [...filtered, condition];
    });
  };

  const handleNext = () => {
    setErrorMsg("");
    if (step === 1) {
      const a = parseInt(age, 10);
      const h = parseFloat(heightCm);
      const w = parseFloat(weightKg);
      if (!a || a < 10 || a > 120) {
        setErrorMsg("Please enter a valid age between 10 and 120.");
        return;
      }
      if (!h || h < 50 || h > 250) {
        setErrorMsg("Please enter a valid height between 50 cm and 250 cm.");
        return;
      }
      if (!w || w < 20 || w > 300) {
        setErrorMsg("Please enter a valid weight between 20 kg and 300 kg.");
        return;
      }
    }
    setStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setErrorMsg("");
    setStep((prev) => Math.max(1, prev - 1));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    const uid = user?.uid;
    if (!uid) {
      setErrorMsg("No active user session found. Please log in first.");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await saveUserOnboarding(uid, {
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

      if (typeof onComplete === "function") {
        onComplete(result);
      }
    } catch (err) {
      setErrorMsg(err.message || "Failed to save onboarding. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <span style={styles.badge}>Step {step} of 3</span>
          <h2 style={styles.title}>KusinApp Onboarding Assessment</h2>
          <p style={styles.subtitle}>
            Personalizing your Filipino meal plans, nutrition gains, and virtual pantry.
          </p>
        </div>

        {errorMsg && (
          <div role="alert" style={styles.alertError}>
            {errorMsg}
          </div>
        )}

        {/* STEP 1: Demographics, Height, Weight & Current BMI */}
        {step === 1 && (
          <div style={styles.stepContent}>
            <h3 style={styles.sectionTitle}>1. Demographics & Physical Metrics</h3>
            <p style={styles.sectionDesc}>
              These metrics establish your baseline BMI targets and daily calorie requirements.
            </p>

            <div style={styles.row}>
              <div style={styles.field}>
                <label style={styles.label}>Age</label>
                <input
                  type="number"
                  placeholder="e.g., 22"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  style={styles.input}
                  min="10"
                  max="120"
                />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Biological Sex (for BMR)</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  style={styles.select}
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
            </div>

            <div style={styles.row}>
              <div style={styles.field}>
                <label style={styles.label}>Height (cm)</label>
                <input
                  type="number"
                  placeholder="e.g., 165"
                  value={heightCm}
                  onChange={(e) => setHeightCm(e.target.value)}
                  style={styles.input}
                  min="50"
                  max="250"
                />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Weight (kg)</label>
                <input
                  type="number"
                  placeholder="e.g., 62"
                  value={weightKg}
                  onChange={(e) => setWeightKg(e.target.value)}
                  style={styles.input}
                  min="20"
                  max="300"
                />
              </div>
            </div>

            {bmi > 0 && (
              <div style={styles.bmiCard}>
                <div>
                  <div style={styles.bmiValue}>
                    Current BMI: <strong>{bmi}</strong>
                  </div>
                  <div style={{ ...styles.bmiCategory, color: getCategoryColor(category) }}>
                    Category: <strong>{category}</strong>
                  </div>
                </div>
                {estimatedBMR > 0 && (
                  <div style={styles.bmrValue}>
                    Base BMR: <strong>~{estimatedBMR} kcal/day</strong>
                  </div>
                )}
              </div>
            )}

            <button type="button" onClick={handleNext} style={styles.primaryButton}>
              Next: Health Goals & Comorbidities →
            </button>
          </div>
        )}

        {/* STEP 2: Health-Targeted Goals & Existing Health Conditions (Comorbidities) */}
        {step === 2 && (
          <div style={styles.stepContent}>
            <h3 style={styles.sectionTitle}>2. Health Goals & Comorbidities</h3>
            <p style={styles.sectionDesc}>
              Tailors recipe recommendations strictly around your weight goal and health conditions.
            </p>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Specific Weight Goal (Proposal Section 1)</label>
              <div style={styles.radioGrid}>
                {[
                  {
                    id: "maintain",
                    title: "Maintain Weight",
                    desc: "Maintain current weight with balanced, nutritious Filipino meals.",
                  },
                  {
                    id: "lose",
                    title: "Lose Weight",
                    desc: "Calorie-deficit meal recommendations, vegetable-heavy, low-fat.",
                  },
                  {
                    id: "gain",
                    title: "Gain Weight / Muscle",
                    desc: "Calorie-surplus and protein-focused Filipino recipes.",
                  },
                ].map((item) => (
                  <label
                    key={item.id}
                    style={{
                      ...styles.radioCard,
                      borderColor: weightGoal === item.id ? "#ea580c" : "#e5e7eb",
                      backgroundColor: weightGoal === item.id ? "#fff7ed" : "#ffffff",
                    }}
                  >
                    <input
                      type="radio"
                      name="weightGoal"
                      value={item.id}
                      checked={weightGoal === item.id}
                      onChange={() => setWeightGoal(item.id)}
                      style={{ marginRight: "10px" }}
                    />
                    <div>
                      <div style={styles.radioTitle}>{item.title}</div>
                      <div style={styles.radioDesc}>{item.desc}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>
                Existing Comorbidities & Dietary Filters (Proposal Section 1)
              </label>
              <div style={styles.chipContainer}>
                {[
                  { id: "none", label: "No Known Health Conditions" },
                  { id: "hypertension", label: "Hypertension (Low Sodium / Iwas-Alat)" },
                  { id: "diabetes", label: "Diabetes (Low Glycemic / Low Sugar)" },
                  { id: "high_cholesterol", label: "High Cholesterol (Low Saturated Fat)" },
                  { id: "hyperuricemia_gout", label: "Gout / High Uric Acid (Low Purine)" },
                  { id: "gerd_acid_reflux", label: "Acid Reflux / GERD (Non-Acidic)" },
                ].map((chip) => {
                  const selected = comorbidities.includes(chip.id);
                  return (
                    <button
                      key={chip.id}
                      type="button"
                      onClick={() => toggleComorbidity(chip.id)}
                      style={{
                        ...styles.chip,
                        backgroundColor: selected ? "#ea580c" : "#f3f4f6",
                        color: selected ? "#ffffff" : "#374151",
                        borderColor: selected ? "#ea580c" : "#d1d5db",
                      }}
                    >
                      {selected ? "✓ " : "+ "}
                      {chip.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div style={styles.buttonRow}>
              <button type="button" onClick={handleBack} style={styles.secondaryButton}>
                ← Back
              </button>
              <button type="button" onClick={handleNext} style={styles.primaryButton}>
                Next: Target Persona & Cooking Skill →
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Target User Profile & Cooking Skill Level */}
        {step === 3 && (
          <form onSubmit={handleSubmit} style={styles.stepContent}>
            <h3 style={styles.sectionTitle}>3. Target Persona & Cooking Skill</h3>
            <p style={styles.sectionDesc}>
              Select the persona that best describes your cooking setup.
            </p>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Target User Profile (Proposal Section 1)</label>
              <div style={styles.radioGrid}>
                {[
                  {
                    id: "solo_eater",
                    title: "The Solo Eater",
                    desc: "Managing individual meal prep, single-serving portions, and personal grocery budgets.",
                    defaultPax: "1",
                  },
                  {
                    id: "household_provider",
                    title: "The Household Provider",
                    desc: "Planning daily, weekly, or monthly meals for a family or multi-member household.",
                    defaultPax: "4",
                  },
                  {
                    id: "health_targeted_eater",
                    title: "The Health-Targeted Eater",
                    desc: "Planning meals strictly around specific weight goals and managing health conditions.",
                    defaultPax: "1",
                  },
                ].map((persona) => (
                  <label
                    key={persona.id}
                    style={{
                      ...styles.radioCard,
                      borderColor: userPersona === persona.id ? "#ea580c" : "#e5e7eb",
                      backgroundColor: userPersona === persona.id ? "#fff7ed" : "#ffffff",
                    }}
                  >
                    <input
                      type="radio"
                      name="userPersona"
                      value={persona.id}
                      checked={userPersona === persona.id}
                      onChange={() => {
                        setUserPersona(persona.id);
                        setHouseholdSize(persona.defaultPax);
                      }}
                      style={{ marginRight: "10px" }}
                    />
                    <div>
                      <div style={styles.radioTitle}>{persona.title}</div>
                      <div style={styles.radioDesc}>{persona.desc}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Number of People Eating (Pax)</label>
              <input
                type="number"
                min="1"
                max="30"
                value={householdSize}
                onChange={(e) => setHouseholdSize(e.target.value)}
                style={styles.input}
              />
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Cooking Skill Level</label>
              <div style={styles.radioGrid}>
                {[
                  {
                    id: "beginner",
                    title: "Beginner",
                    desc: "Basic knife skills, simple stir-fries, and boiled Filipino soups (Nilaga, Sinigang, Tinola).",
                  },
                  {
                    id: "intermediate",
                    title: "Intermediate",
                    desc: "Comfortable sautéing, braising, stewing (Adobo, Afritada, Kare-Kare), seasoning to taste.",
                  },
                  {
                    id: "advanced",
                    title: "Advanced",
                    desc: "Complex regional & indigenous dishes, deep-frying (Lechon Kawali), multi-stage preparation.",
                  },
                ].map((skill) => (
                  <label
                    key={skill.id}
                    style={{
                      ...styles.radioCard,
                      borderColor: cookingSkill === skill.id ? "#ea580c" : "#e5e7eb",
                      backgroundColor: cookingSkill === skill.id ? "#fff7ed" : "#ffffff",
                    }}
                  >
                    <input
                      type="radio"
                      name="cookingSkill"
                      value={skill.id}
                      checked={cookingSkill === skill.id}
                      onChange={() => setCookingSkill(skill.id)}
                      style={{ marginRight: "10px" }}
                    />
                    <div>
                      <div style={styles.radioTitle}>{skill.title}</div>
                      <div style={styles.radioDesc}>{skill.desc}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div style={styles.buttonRow}>
              <button
                type="button"
                onClick={handleBack}
                disabled={isSubmitting}
                style={styles.secondaryButton}
              >
                ← Back
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  ...styles.primaryButton,
                  opacity: isSubmitting ? 0.7 : 1,
                }}
              >
                {isSubmitting ? "Saving Profile..." : "Complete Onboarding"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

function getCategoryColor(category) {
  switch (category) {
    case "Normal":
      return "#059669";
    case "Overweight":
      return "#d97706";
    case "Obese":
      return "#dc2626";
    case "Underweight":
      return "#2563eb";
    default:
      return "#4b5563";
  }
}

const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    padding: "0.5rem 0",
    fontFamily: "system-ui, -apple-system, sans-serif",
  },
  card: {
    width: "100%",
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    padding: "1.25rem",
  },
  header: {
    marginBottom: "1.25rem",
    textAlign: "center",
  },
  badge: {
    display: "inline-block",
    padding: "0.25rem 0.65rem",
    backgroundColor: "#ffedd5",
    color: "#c2410c",
    fontSize: "0.75rem",
    fontWeight: 700,
    borderRadius: "9999px",
    marginBottom: "0.5rem",
    textTransform: "uppercase",
  },
  title: {
    margin: "0 0 0.25rem 0",
    fontSize: "1.35rem",
    color: "#111827",
  },
  subtitle: {
    margin: 0,
    fontSize: "0.85rem",
    color: "#6b7280",
  },
  alertError: {
    backgroundColor: "#fef2f2",
    color: "#b91c1c",
    border: "1px solid #f87171",
    borderRadius: "8px",
    padding: "0.65rem 0.85rem",
    marginBottom: "1rem",
    fontSize: "0.85rem",
  },
  stepContent: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  },
  sectionTitle: {
    margin: 0,
    fontSize: "1.05rem",
    color: "#1f2937",
  },
  sectionDesc: {
    margin: "0 0 0.5rem 0",
    fontSize: "0.825rem",
    color: "#6b7280",
  },
  row: {
    display: "flex",
    gap: "0.75rem",
  },
  field: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "0.3rem",
  },
  fieldGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "0.35rem",
  },
  label: {
    fontSize: "0.85rem",
    fontWeight: 600,
    color: "#374151",
  },
  input: {
    padding: "0.65rem",
    borderRadius: "8px",
    border: "1px solid #d1d5db",
    fontSize: "0.95rem",
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
  },
  select: {
    padding: "0.65rem",
    borderRadius: "8px",
    border: "1px solid #d1d5db",
    fontSize: "0.925rem",
    backgroundColor: "#ffffff",
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
  },
  bmiCard: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0.75rem 1rem",
    backgroundColor: "#f9fafb",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
  },
  bmiValue: {
    fontSize: "0.95rem",
    color: "#1f2937",
  },
  bmiCategory: {
    fontSize: "0.95rem",
  },
  bmrValue: {
    fontSize: "0.825rem",
    color: "#6b7280",
  },
  radioGrid: {
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
  },
  radioCard: {
    display: "flex",
    alignItems: "flex-start",
    padding: "0.75rem",
    border: "1.5px solid #e5e7eb",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "all 0.15s ease",
  },
  radioTitle: {
    fontSize: "0.9rem",
    fontWeight: 600,
    color: "#111827",
  },
  radioDesc: {
    fontSize: "0.775rem",
    color: "#6b7280",
    marginTop: "2px",
  },
  chipContainer: {
    display: "flex",
    flexWrap: "wrap",
    gap: "0.5rem",
  },
  chip: {
    padding: "0.4rem 0.75rem",
    borderRadius: "9999px",
    border: "1px solid #d1d5db",
    fontSize: "0.785rem",
    fontWeight: 500,
    cursor: "pointer",
    transition: "all 0.15s ease",
  },
  buttonRow: {
    display: "flex",
    gap: "0.75rem",
    marginTop: "0.5rem",
  },
  primaryButton: {
    flex: 1,
    padding: "0.75rem",
    backgroundColor: "#ea580c",
    color: "#ffffff",
    fontWeight: 600,
    fontSize: "0.95rem",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
  },
  secondaryButton: {
    padding: "0.75rem 1.25rem",
    backgroundColor: "#f3f4f6",
    color: "#374151",
    fontWeight: 600,
    fontSize: "0.95rem",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    cursor: "pointer",
  },
};
