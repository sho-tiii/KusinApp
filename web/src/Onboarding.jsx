import React, { useState, useMemo } from "react";
import { calculateBMI, saveUserOnboarding } from "./authService";

/**
 * US-03: Health & Cooking Skill Onboarding
 * Collects physical metrics (height, weight -> auto-calculates BMI),
 * dietary/health goals, target audience / household size, and cooking skill level.
 */
export default function Onboarding({ user, onComplete }) {
  const [step, setStep] = useState(1);
  const [heightCm, setHeightCm] = useState("");
  const [weightKg, setWeightKg] = useState("");
  const [primaryGoal, setPrimaryGoal] = useState("healthy_eating");
  const [targetAudience, setTargetAudience] = useState("solo");
  const [householdSize, setHouseholdSize] = useState("1");
  const [cookingSkill, setCookingSkill] = useState("beginner");
  const [dietaryPreferences, setDietaryPreferences] = useState([]);

  const [errorMsg, setErrorMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Live BMI calculation
  const { bmi, category } = useMemo(() => {
    return calculateBMI(heightCm, weightKg);
  }, [heightCm, weightKg]);

  const toggleDietaryPref = (pref) => {
    setDietaryPreferences((prev) =>
      prev.includes(pref) ? prev.filter((p) => p !== pref) : [...prev, pref]
    );
  };

  const handleNext = () => {
    setErrorMsg("");
    if (step === 1) {
      const h = parseFloat(heightCm);
      const w = parseFloat(weightKg);
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
        heightCm,
        weightKg,
        primaryGoal,
        targetAudience,
        householdSize,
        cookingSkill,
        dietaryPreferences,
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
          <h2 style={styles.title}>KusinApp Profile Setup</h2>
          <p style={styles.subtitle}>
            Help us personalize your Filipino meal plans and pantry recommendations.
          </p>
        </div>

        {errorMsg && (
          <div role="alert" style={styles.alertError}>
            {errorMsg}
          </div>
        )}

        {/* STEP 1: Health & BMI Assessment */}
        {step === 1 && (
          <div style={styles.stepContent}>
            <h3 style={styles.sectionTitle}>1. Health & Physical Assessment</h3>
            <p style={styles.sectionDesc}>
              We calculate your BMI to help tailor daily calorie targets and nutritional recommendations.
            </p>

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
                <div style={styles.bmiValue}>
                  BMI: <strong>{bmi}</strong>
                </div>
                <div style={{ ...styles.bmiCategory, color: getCategoryColor(category) }}>
                  Category: <strong>{category}</strong>
                </div>
              </div>
            )}

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Primary Meal Planning Goal</label>
              <select
                value={primaryGoal}
                onChange={(e) => setPrimaryGoal(e.target.value)}
                style={styles.select}
              >
                <option value="healthy_eating">Healthy & Balanced Filipino Meals</option>
                <option value="weight_loss">Weight Management & Calorie Deficit</option>
                <option value="muscle_gain">High Protein & Muscle Building</option>
                <option value="budget_friendly">Budget-Friendly Tipid Meals</option>
                <option value="quick_easy">Quick & Easy (Busy Lifestyle)</option>
              </select>
            </div>

            <button type="button" onClick={handleNext} style={styles.primaryButton}>
              Next: Target Audience & Household →
            </button>
          </div>
        )}

        {/* STEP 2: Target Audience & Household Size */}
        {step === 2 && (
          <div style={styles.stepContent}>
            <h3 style={styles.sectionTitle}>2. Target Audience & Household</h3>
            <p style={styles.sectionDesc}>
              Tell us who you're cooking for so we can scale recipe ingredient portions.
            </p>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Target Audience</label>
              <div style={styles.radioGrid}>
                {[
                  { id: "solo", title: "Solo Living / Student", desc: "1 person, quick single servings" },
                  { id: "couple", title: "Couple / Roommates", desc: "2 people, balanced prep" },
                  { id: "family_small", title: "Small Family", desc: "3 - 4 people" },
                  { id: "family_large", title: "Large Family / Household", desc: "5+ people, bulk cooking" },
                ].map((item) => (
                  <label
                    key={item.id}
                    style={{
                      ...styles.radioCard,
                      borderColor: targetAudience === item.id ? "#ea580c" : "#e5e7eb",
                      backgroundColor: targetAudience === item.id ? "#fff7ed" : "#ffffff",
                    }}
                  >
                    <input
                      type="radio"
                      name="targetAudience"
                      value={item.id}
                      checked={targetAudience === item.id}
                      onChange={() => {
                        setTargetAudience(item.id);
                        if (item.id === "solo") setHouseholdSize("1");
                        else if (item.id === "couple") setHouseholdSize("2");
                        else if (item.id === "family_small") setHouseholdSize("4");
                        else if (item.id === "family_large") setHouseholdSize("6");
                      }}
                      style={{ marginRight: "8px" }}
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
              <label style={styles.label}>Exact Household Size (people)</label>
              <input
                type="number"
                min="1"
                max="20"
                value={householdSize}
                onChange={(e) => setHouseholdSize(e.target.value)}
                style={styles.input}
              />
            </div>

            <div style={styles.buttonRow}>
              <button type="button" onClick={handleBack} style={styles.secondaryButton}>
                ← Back
              </button>
              <button type="button" onClick={handleNext} style={styles.primaryButton}>
                Next: Cooking Skill Level →
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Cooking Skill Level & Dietary Preferences */}
        {step === 3 && (
          <form onSubmit={handleSubmit} style={styles.stepContent}>
            <h3 style={styles.sectionTitle}>3. Cooking Skill & Dietary Needs</h3>
            <p style={styles.sectionDesc}>
              We recommend Filipino recipes matching your culinary experience level.
            </p>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Cooking Skill Level</label>
              <div style={styles.radioGrid}>
                {[
                  {
                    id: "beginner",
                    title: "Beginner",
                    desc: "Simple stir-fries, boiled dishes (Nilaga, Sinigang), basic knife skills",
                  },
                  {
                    id: "intermediate",
                    title: "Intermediate",
                    desc: "Comfortable sautéing, braising (Adobo, Kare-Kare), seasoning by taste",
                  },
                  {
                    id: "advanced",
                    title: "Advanced",
                    desc: "Complex recipes, deep flavors, fiestas, lechon kawali, baking",
                  },
                ].map((item) => (
                  <label
                    key={item.id}
                    style={{
                      ...styles.radioCard,
                      borderColor: cookingSkill === item.id ? "#ea580c" : "#e5e7eb",
                      backgroundColor: cookingSkill === item.id ? "#fff7ed" : "#ffffff",
                    }}
                  >
                    <input
                      type="radio"
                      name="cookingSkill"
                      value={item.id}
                      checked={cookingSkill === item.id}
                      onChange={() => setCookingSkill(item.id)}
                      style={{ marginRight: "8px" }}
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
              <label style={styles.label}>Dietary Preferences (Optional)</label>
              <div style={styles.chipContainer}>
                {[
                  { id: "low_sodium", label: "Low Sodium / Iwas-Alat" },
                  { id: "low_sugar", label: "Low Sugar / Diabetic Friendly" },
                  { id: "high_protein", label: "High Protein" },
                  { id: "pork_free", label: "Pork-Free / Halal Friendly" },
                  { id: "pescatarian", label: "Pescatarian / Seafood" },
                  { id: "vegetable_heavy", label: "Gulay-Heavy / Vegetarian" },
                ].map((chip) => {
                  const selected = dietaryPreferences.includes(chip.id);
                  return (
                    <button
                      key={chip.id}
                      type="button"
                      onClick={() => toggleDietaryPref(chip.id)}
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
    padding: "1rem 0",
    fontFamily: "system-ui, -apple-system, sans-serif",
  },
  card: {
    width: "100%",
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    padding: "1.5rem",
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
