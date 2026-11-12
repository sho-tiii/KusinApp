import React, { useState, useMemo } from "react";
import { calculateBMI, calculateBMR, saveUserOnboarding } from "../../services/authService";
import ConfirmationModal from "../common/ConfirmationModal";

const HOUSEHOLDS = [
  {
    id: "just_me",
    title: "Just me",
    desc: "Meals and portions for one",
    image: "/assets/cook-just-me.png",
  },
  {
    id: "for_two",
    title: "For two",
    desc: "Meals and portions for a pair",
    image: "/assets/cook-for-two.png",
  },
  {
    id: "family",
    title: "My family",
    desc: "Meals for the whole household",
    image: "/assets/cook-family.png",
  },
];

const GOALS = [
  { id: "get_inspired", label: "Get inspired", icon: "lightbulb" },
  { id: "learn_to_cook", label: "Learn to cook", icon: "chef" },
  { id: "save_money", label: "Save money", icon: "piggy" },
  { id: "less_waste", label: "Less food waste", icon: "trash" },
  { id: "eat_healthy", label: "Eat Healthy", icon: "carrot" },
  { id: "quick_easy", label: "Quick and Easy", icon: "clock" },
];

const DIETS = [
  "No Pork",
  "Halal",
  "Peanut-free",
  "Dairy-free",
  "Vegetarian",
  "Seafood-free",
  "Egg-free",
];

const COMORBIDITIES = [
  { id: "none", label: "None" },
  { id: "hypertension", label: "Hypertension (Low Sodium)" },
  { id: "diabetes", label: "Diabetes (Low Sugar)" },
  { id: "high_cholesterol", label: "High Cholesterol (Low Fat)" },
  { id: "hyperuricemia_gout", label: "Gout (Low Purine)" },
  { id: "gerd_acid_reflux", label: "Acid Reflux / GERD" },
];

const WEIGHT_GOALS = [
  { id: "maintain", label: "Maintain", icon: "scale" },
  { id: "gain", label: "Gain", icon: "trend" },
  { id: "lose", label: "Lose", icon: "flame" },
];

const LIMITS = {
  age: { min: 10, max: 120, step: 1, defaultVal: 25, label: "Age", unit: "yrs" },
  heightCm: { min: 50, max: 250, step: 1, defaultVal: 165, label: "Height", unit: "cm" },
  weightKg: { min: 20, max: 300, step: 1, defaultVal: 60, label: "Weight", unit: "kg" },
};

function VectorIcon({ name, active }) {
  const stroke = active ? "#D97706" : "#475467";
  switch (name) {
    case "lightbulb":
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 18h6" />
          <path d="M10 22h4" />
          <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14" />
        </svg>
      );
    case "chef":
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 1.05-1.54 5 5 0 0 1 7.08 0A5.11 5.11 0 0 1 16.59 6 4 4 0 0 1 18 13.87V21H6Z" />
          <line x1="6" y1="17" x2="18" y2="17" />
        </svg>
      );
    case "piggy":
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 5c-1.5 0-2.8 1.4-3 2-3.5-1.5-11-.3-11 5 0 1.8 0 3 2 4.5V20h4v-2h3v2h4v-4c1-.5 1.7-1 2-2h2v-4h-2c0-1-.5-1.5-1-2V5z" />
          <path d="M2 9v1c0 1.1.9 2 2 2h1" />
          <path d="M16 11h.01" />
        </svg>
      );
    case "trash":
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 6h18" />
          <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
          <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
        </svg>
      );
    case "carrot":
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2.27 21.7s9.87-3.5 12.73-6.36a4.5 4.5 0 0 0-6.36-6.37C5.77 11.84 2.27 21.7 2.27 21.7z" />
          <path d="M15.4 6.5 17 5" />
          <path d="m18 8 2-1" />
          <path d="M15 2v3" />
        </svg>
      );
    case "clock":
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      );
    case "female":
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="9" r="6" />
          <path d="M12 15v7" />
          <path d="M9 19h6" />
        </svg>
      );
    case "male":
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="10" cy="14" r="6" />
          <path d="M20 4l-5.5 5.5" />
          <path d="M15 4h5v5" />
        </svg>
      );
    case "scale":
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 3v18" />
          <path d="M5 7h14" />
          <path d="M5 7l-3 7h6l-3-7Z" />
          <path d="M19 7l-3 7h6l-3-7Z" />
          <path d="M8 21h8" />
        </svg>
      );
    case "trend":
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
          <polyline points="16 7 22 7 22 13" />
        </svg>
      );
    case "flame":
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
        </svg>
      );
    default:
      return null;
  }
}

export default function Onboarding({ user, initialData, onComplete, onCancel }) {
  const [step, setStep] = useState(1);

  // Unselected by default unless editing existing profile
  const [household, setHousehold] = useState(initialData?.household || "");
  const [goals, setGoals] = useState(Array.isArray(initialData?.goals) ? initialData.goals : []);
  const [dietaryRestrictions, setDietaryRestrictions] = useState(
    Array.isArray(initialData?.dietaryRestrictions) ? initialData.dietaryRestrictions : []
  );
  const [comorbidities, setComorbidities] = useState(
    Array.isArray(initialData?.comorbidities) ? initialData.comorbidities : []
  );

  const [gender, setGender] = useState(initialData?.gender || "");
  const [age, setAge] = useState(initialData?.age ? String(initialData.age) : "");
  const [heightCm, setHeightCm] = useState(
    initialData?.heightCm ? String(initialData.heightCm) : ""
  );
  const [weightKg, setWeightKg] = useState(
    initialData?.weightKg ? String(initialData.weightKg) : ""
  );
  const [weightGoal, setWeightGoal] = useState(initialData?.weightGoal || "");

  // Metric editor modal state
  const [editingField, setEditingField] = useState(null);
  const [editorText, setEditorText] = useState("");
  const [errorModal, setErrorModal] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { bmi } = useMemo(() => calculateBMI(heightCm, weightKg), [heightCm, weightKg]);
  const estimatedBMR = useMemo(
    () => (gender ? calculateBMR(weightKg, heightCm, age, gender) : 0),
    [weightKg, heightCm, age, gender]
  );

  const range = !bmi
    ? { label: "Enter height & weight", color: "#98A2B3" }
    : bmi < 18.5
    ? { label: "Underweight", color: "#1D4ED8" }
    : bmi < 25
    ? { label: "Healthy range", color: "#15803D" }
    : bmi < 30
    ? { label: "Overweight", color: "#F97316" }
    : { label: "Obese", color: "#DC2626" };

  const toggleItem = (list, setList, id) => {
    setList((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const toggleComorbidity = (id) => {
    if (id === "none") {
      setComorbidities((prev) => (prev.includes("none") ? [] : ["none"]));
      return;
    }
    setComorbidities((prev) => {
      const withoutNone = prev.filter((c) => c !== "none");
      return withoutNone.includes(id)
        ? withoutNone.filter((c) => c !== id)
        : [...withoutNone, id];
    });
  };

  const openMetricEditor = (field) => {
    const lim = LIMITS[field];
    const currentVal =
      field === "age" ? age : field === "heightCm" ? heightCm : weightKg;
    setEditorText(currentVal ? String(currentVal) : String(lim.defaultVal));
    setEditingField(field);
  };

  const saveMetricEditor = () => {
    if (!editingField) return;
    const lim = LIMITS[editingField];
    const num = parseFloat(editorText) || 0;
    if (num < lim.min || num > lim.max) return;
    if (editingField === "age") setAge(String(num));
    if (editingField === "heightCm") setHeightCm(String(num));
    if (editingField === "weightKg") setWeightKg(String(num));
    setEditingField(null);
  };

  const handleBack = () => {
    if (step === 1) {
      if (typeof onCancel === "function") onCancel();
    } else {
      setStep((s) => s - 1);
    }
  };

  const handleContinue = async () => {
    if (step === 1) {
      if (!household) {
        setErrorModal({
          title: "Select Your Household",
          message: "Please choose who you are cooking for before continuing.",
        });
        return;
      }
      setStep(2);
      return;
    }

    if (step === 2) {
      setStep(3);
      return;
    }

    // Step 3 validation
    if (!gender) {
      setErrorModal({
        title: "Biological Sex Required",
        message: "Please select Female or Male so we can accurately compute your daily calorie needs.",
      });
      return;
    }
    if (!age || !heightCm || !weightKg) {
      setErrorModal({
        title: "Body Metrics Required",
        message: "Please click Age, Height, and Weight to enter your body measurements.",
      });
      return;
    }
    if (!weightGoal) {
      setErrorModal({
        title: "Select a Weight Goal",
        message: "Please choose whether you want to Maintain, Gain, or Lose weight.",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await saveUserOnboarding(user.uid, {
        household,
        goals,
        dietaryRestrictions,
        comorbidities,
        gender,
        age,
        heightCm,
        weightKg,
        weightGoal,
      });
      if (typeof onComplete === "function") onComplete(result);
    } catch (err) {
      setErrorModal({
        title: "Couldn't Save Profile",
        message: err.message || "Failed to save onboarding. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const BMI_MIN = 14;
  const BMI_MAX = 40;
  const bmiPct = bmi
    ? Math.min(100, Math.max(0, ((bmi - BMI_MIN) / (BMI_MAX - BMI_MIN)) * 100))
    : 0;

  const activeLim = editingField ? LIMITS[editingField] : null;
  const editorNum = parseFloat(editorText) || 0;
  const editorValid = activeLim
    ? editorNum >= activeLim.min && editorNum <= activeLim.max
    : false;

  return (
    <div className="w-full">
      {/* Top Bar matching Mobile OnboardingScreen */}
      <div className="flex items-center justify-between mb-6">
        <button
          type="button"
          onClick={handleBack}
          className="w-10 h-10 rounded-full bg-indigo-50/70 hover:bg-indigo-100/80 text-slate-900 grid place-items-center transition-colors cursor-pointer"
          aria-label="Go back"
        >
          <span className="text-lg font-bold leading-none">‹</span>
        </button>

        <div className="flex flex-col items-end">
          <span className="text-[11px] font-bold tracking-widest uppercase text-slate-400">
            STEP {step} OF 3
          </span>
          <div className="flex items-center gap-1.5 mt-1.5">
            {[1, 2, 3].map((i) => (
              <span
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i <= step ? "w-6 bg-amber-500" : "w-3 bg-slate-200"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* STEP 1: WHO ARE YOU COOKING FOR? */}
      {step === 1 && (
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 text-center tracking-tight">
            Who are you cooking for?
          </h1>
          <p className="mt-1.5 mb-6 text-sm text-slate-500 text-center leading-relaxed">
            Help us customize homestyle recipes and portion sizes for your home.
          </p>

          <div className="flex flex-col gap-3">
            {HOUSEHOLDS.map((h) => {
              const sel = household === h.id;
              return (
                <button
                  key={h.id}
                  type="button"
                  onClick={() => setHousehold(h.id)}
                  className={`w-full flex items-center gap-4 p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                    sel
                      ? "border-amber-500 bg-amber-50/80 border-[1.6px]"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <div className="w-19 h-19 rounded-xl bg-slate-100/80 grid place-items-center shrink-0 overflow-hidden">
                    <img
                      src={h.image}
                      alt={h.title}
                      className="w-16 h-16 object-contain"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="text-lg font-extrabold text-slate-900">
                      {h.title}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                      {h.desc}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* STEP 2: GOALS, ALLERGIES & COMORBIDITIES */}
      {step === 2 && (
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Set your goals & preferences
          </h1>
          <p className="mt-1.5 mb-5 text-sm text-slate-500 leading-relaxed">
            Tailor your Pinoy meal plans to your nutritional targets, allergies, and health needs.
          </p>

          <div className="grid grid-cols-2 gap-2.5 mb-5">
            {GOALS.map((g) => {
              const sel = goals.includes(g.id);
              return (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => toggleItem(goals, setGoals, g.id)}
                  className={`h-24 rounded-2xl border flex flex-col items-center justify-center gap-2 transition-all cursor-pointer ${
                    sel
                      ? "border-amber-500 bg-amber-50/80 border-[1.6px]"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <VectorIcon name={g.icon} active={sel} />
                  <span
                    className={`text-[13.5px] ${
                      sel ? "font-bold text-slate-900" : "font-semibold text-slate-500"
                    }`}
                  >
                    {g.label}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="text-[11.5px] font-bold tracking-wider uppercase text-slate-500 mb-2.5">
            Dietary Restrictions & Allergies
          </div>
          <div className="flex flex-wrap gap-2 mb-5">
            {DIETS.map((d) => {
              const sel = dietaryRestrictions.includes(d);
              return (
                <button
                  key={d}
                  type="button"
                  onClick={() => toggleItem(dietaryRestrictions, setDietaryRestrictions, d)}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                    sel
                      ? "border-amber-500 bg-amber-50 text-amber-800 font-bold"
                      : "border-slate-200 bg-white text-slate-800 hover:border-slate-300"
                  }`}
                >
                  {sel && <span className="text-amber-700 font-extrabold">✓</span>}
                  <span>{d}</span>
                </button>
              );
            })}
          </div>

          <div className="text-[11.5px] font-bold tracking-wider uppercase text-slate-500 mb-2.5">
            Health Conditions (Comorbidities)
          </div>
          <div className="flex flex-wrap gap-2">
            {COMORBIDITIES.map((c) => {
              const sel = comorbidities.includes(c.id);
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => toggleComorbidity(c.id)}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                    sel
                      ? "border-amber-500 bg-amber-50 text-amber-800 font-bold"
                      : "border-slate-200 bg-white text-slate-800 hover:border-slate-300"
                  }`}
                >
                  {sel && <span className="text-amber-700 font-extrabold">✓</span>}
                  <span>{c.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* STEP 3: LET'S SET YOUR HEALTH GOALS (STRICT GRID, UNSELECTED INITIAL STATE) */}
      {step === 3 && (
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Let&apos;s set your health goals
          </h1>
          <p className="mt-1.5 mb-5 text-sm text-slate-500 leading-relaxed">
            We&apos;ll use this to work out your daily calories. You can change it anytime.
          </p>

          {/* Row 1: Biological Sex (50/50 split) */}
          <div className="grid grid-cols-2 gap-2.5 mb-3">
            {[
              ["female", "Female", "female"],
              ["male", "Male", "male"],
            ].map(([id, label, icon]) => {
              const sel = gender === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setGender(id)}
                  className={`min-h-[96px] py-3.5 rounded-2xl border flex flex-col items-center justify-center transition-all cursor-pointer ${
                    sel
                      ? "border-amber-500 bg-amber-50/80 border-[1.6px]"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <div
                    className={`w-11 h-11 rounded-full grid place-items-center mb-2 ${
                      sel ? "bg-amber-100" : "bg-indigo-50/80"
                    }`}
                  >
                    <VectorIcon name={icon} active={sel} />
                  </div>
                  <span
                    className={`text-sm font-bold ${
                      sel ? "text-amber-700" : "text-slate-900"
                    }`}
                  >
                    {label}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Row 2: Metrics (1/3, 1/3, 1/3 split) */}
          <div className="grid grid-cols-3 gap-2.5 mb-3">
            {[
              ["age", "AGE", "yrs", age],
              ["heightCm", "HEIGHT", "cm", heightCm],
              ["weightKg", "WEIGHT", "kg", weightKg],
            ].map(([key, label, unit, val]) => {
              const hasVal = Boolean(val);
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => openMetricEditor(key)}
                  className={`min-h-[76px] py-3 rounded-2xl border flex flex-col items-center justify-center transition-all cursor-pointer ${
                    hasVal
                      ? "border-amber-500 bg-amber-50/80"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <span className="text-[11px] font-semibold tracking-wider text-slate-500">
                    {label}
                  </span>
                  <span
                    className={`text-xl font-extrabold mt-1 ${
                      hasVal ? "text-slate-900" : "text-slate-400"
                    }`}
                  >
                    {hasVal ? val : "—"}{" "}
                    <span className="text-xs font-medium text-slate-500">{unit}</span>
                  </span>
                </button>
              );
            })}
          </div>

          {/* Row 3: BMI Card */}
          <div className="p-4 rounded-2xl border border-slate-200 bg-white mb-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-slate-500 font-medium">
                  Your BMI {estimatedBMR > 0 ? `· ~${estimatedBMR} kcal/day` : ""}
                </div>
                <div className="text-2xl font-extrabold text-slate-900 mt-0.5">
                  {bmi || "—"}
                </div>
              </div>
              <div className="text-right">
                <span
                  className="text-xs font-bold"
                  style={{ color: range.color }}
                >
                  ● {range.label}
                </span>
              </div>
            </div>

            <div className="relative mt-4">
              {bmi > 0 && (
                <div
                  className="absolute -top-3.5 text-xs font-bold text-slate-900 transition-all duration-300"
                  style={{ left: `calc(${bmiPct}% - 5px)` }}
                >
                  ▾
                </div>
              )}
              <div className="flex h-2 rounded-full overflow-hidden gap-0.5">
                <div style={{ flex: 4.5 }} className="bg-indigo-100" />
                <div style={{ flex: 6.5 }} className="bg-lime-600" />
                <div style={{ flex: 5 }} className="bg-amber-500" />
                <div style={{ flex: 10 }} className="bg-red-600" />
              </div>
              <div className="flex text-[11px] text-slate-500 text-center mt-1.5">
                <span style={{ flex: 4.5 }}>Under</span>
                <span
                  style={{ flex: 6.5 }}
                  className={
                    range.label === "Healthy range"
                      ? "text-emerald-700 font-bold"
                      : ""
                  }
                >
                  Healthy
                </span>
                <span style={{ flex: 5 }}>Over</span>
                <span style={{ flex: 10 }}>Obese</span>
              </div>
            </div>

            <div className="text-center italic text-[11.5px] text-slate-400 mt-2.5">
              ⓘ A guide, not a medical diagnosis.
            </div>
          </div>

          {/* Row 4: Weight Goal (1/3, 1/3, 1/3 split) */}
          <div className="grid grid-cols-3 gap-2.5">
            {WEIGHT_GOALS.map((g) => {
              const sel = weightGoal === g.id;
              return (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => setWeightGoal(g.id)}
                  className={`min-h-[96px] py-3.5 rounded-2xl border flex flex-col items-center justify-center transition-all cursor-pointer ${
                    sel
                      ? "border-amber-500 bg-amber-50/80 border-[1.6px]"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <div
                    className={`w-9.5 h-9.5 rounded-full grid place-items-center mb-2 ${
                      sel ? "bg-amber-100" : "bg-indigo-50/80"
                    }`}
                  >
                    <VectorIcon name={g.icon} active={sel} />
                  </div>
                  <span
                    className={`text-sm font-bold ${
                      sel ? "text-amber-700" : "text-slate-900"
                    }`}
                  >
                    {g.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Primary Continue Button & Step Footer */}
      <div className="mt-6">
        <button
          type="button"
          onClick={handleContinue}
          disabled={isSubmitting}
          className="w-full h-13 px-5 bg-amber-500 hover:bg-amber-600 rounded-2xl text-base font-bold text-white shadow-sm inline-flex items-center justify-center gap-2 transition-all disabled:opacity-55 cursor-pointer"
        >
          {isSubmitting ? "Saving..." : "Continue →"}
        </button>
        <div className="text-center text-[11.5px] text-slate-400 mt-2.5">
          Step {step} of 3 • You can customize your preferences anytime in Settings
        </div>
      </div>

      {/* Custom Stepper Modal for Age / Height / Weight */}
      {editingField && activeLim && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/45 backdrop-blur-sm animate-fade-in"
          onClick={() => setEditingField(null)}
        >
          <div
            className="w-full max-w-[400px] bg-white border border-slate-200 rounded-3xl shadow-modal p-6 animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-extrabold text-slate-900 m-0">
                Set {activeLim.label}
              </h3>
              <button
                type="button"
                onClick={() => setEditingField(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 grid place-items-center cursor-pointer"
              >
                ×
              </button>
            </div>

            <div className="flex items-center justify-center gap-3 my-4">
              <button
                type="button"
                onClick={() =>
                  setEditorText(
                    String(
                      Math.max(
                        activeLim.min,
                        Math.min(activeLim.max, (editorNum || activeLim.defaultVal) - activeLim.step)
                      )
                    )
                  )
                }
                className="w-12 h-12 rounded-2xl bg-indigo-50 hover:bg-indigo-100 text-slate-900 text-xl font-bold grid place-items-center cursor-pointer"
              >
                −
              </button>
              <input
                type="number"
                value={editorText}
                onChange={(e) => setEditorText(e.target.value)}
                className="w-28 h-13 rounded-xl border-2 border-amber-500 text-center text-2xl font-extrabold text-slate-900 outline-none"
                autoFocus
              />
              <span className="text-sm font-semibold text-slate-500">
                {activeLim.unit}
              </span>
              <button
                type="button"
                onClick={() =>
                  setEditorText(
                    String(
                      Math.min(
                        activeLim.max,
                        Math.max(activeLim.min, (editorNum || activeLim.defaultVal) + activeLim.step)
                      )
                    )
                  )
                }
                className="w-12 h-12 rounded-2xl bg-indigo-50 hover:bg-indigo-100 text-slate-900 text-xl font-bold grid place-items-center cursor-pointer"
              >
                +
              </button>
            </div>

            {!editorValid && (
              <div className="text-xs text-red-600 text-center font-medium mb-3">
                Enter a value between {activeLim.min} and {activeLim.max} {activeLim.unit}.
              </div>
            )}

            <div className="grid grid-cols-2 gap-2.5 mt-5">
              <button
                type="button"
                onClick={() => setEditingField(null)}
                className="h-11 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-sm font-bold text-slate-600 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!editorValid}
                onClick={saveMetricEditor}
                className="h-11 rounded-xl bg-amber-500 hover:bg-amber-600 text-sm font-bold text-white disabled:opacity-50 cursor-pointer"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Shared Confirmation / Validation Modal */}
      <ConfirmationModal
        isOpen={!!errorModal}
        onClose={() => setErrorModal(null)}
        onConfirm={() => setErrorModal(null)}
        title={errorModal?.title || ""}
        message={errorModal?.message || ""}
        confirmText="Got it"
        cancelText=""
      />
    </div>
  );
}
