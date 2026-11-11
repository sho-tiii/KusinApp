import React, { useState, useMemo } from "react";
import { calculateBMI, calculateBMR, saveUserOnboarding } from "../../services/authService";
import Select from "../common/Select";
import {
  IconScale,
  IconSalad,
  IconMuscle,
  IconUserSingle,
  IconUsersFamily,
  IconTarget,
  IconChefHat,
  IconCookingPot,
  IconFlame,
  IconCheck,
  IconPlus,
} from "../common/Icons";

const STEPS = ["Your Body", "Health Goals", "Your Kitchen"];

const SEX_OPTIONS = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
];

const WEIGHT_GOALS = [
  {
    id: "maintain",
    Icon: IconScale,
    title: "Maintain Weight",
    desc: "Stay where you are with balanced, nutritious Filipino meals.",
  },
  {
    id: "lose",
    Icon: IconSalad,
    title: "Lose Weight",
    desc: "Calorie-deficit plans, vegetable-forward, reduced oil and fat.",
  },
  {
    id: "gain",
    Icon: IconMuscle,
    title: "Gain Weight / Muscle",
    desc: "Calorie-surplus, protein-rich Filipino recipes.",
  },
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
  {
    id: "solo_eater",
    Icon: IconUserSingle,
    title: "The Solo Eater",
    desc: "Individual meal prep and a personal grocery budget.",
    pax: "1",
  },
  {
    id: "household_provider",
    Icon: IconUsersFamily,
    title: "The Household Provider",
    desc: "Daily, weekly, or monthly meals for the whole family.",
    pax: "4",
  },
  {
    id: "health_targeted_eater",
    Icon: IconTarget,
    title: "The Health-Targeted Eater",
    desc: "Meals planned strictly around weight goals and health conditions.",
    pax: "1",
  },
];

const SKILLS = [
  {
    id: "beginner",
    Icon: IconChefHat,
    title: "Beginner",
    desc: "Simple boiled and stir-fried dishes — Tinola, Nilaga, Sinigang.",
  },
  {
    id: "intermediate",
    Icon: IconCookingPot,
    title: "Intermediate",
    desc: "Sautéing, braising, stewing — Adobo, Afritada, Kare-Kare.",
  },
  {
    id: "advanced",
    Icon: IconFlame,
    title: "Advanced",
    desc: "Complex regional dishes and multi-step prep — Lechon Kawali, Pinikpikan.",
  },
];

function getCategoryColorClass(category) {
  switch (category) {
    case "Normal":
      return "text-emerald-700";
    case "Overweight":
      return "text-amber-700";
    case "Obese":
      return "text-red-700";
    case "Underweight":
      return "text-blue-700";
    default:
      return "text-slate-500";
  }
}

export default function Onboarding({ user, initialData, onComplete, onCancel }) {
  const [step, setStep] = useState(1);

  const [age, setAge] = useState(initialData?.age?.toString() || "");
  const [gender, setGender] = useState(initialData?.gender || "");
  const [heightCm, setHeightCm] = useState(initialData?.heightCm?.toString() || "");
  const [weightKg, setWeightKg] = useState(initialData?.weightKg?.toString() || "");

  const [weightGoal, setWeightGoal] = useState(initialData?.weightGoal || "maintain");
  const [comorbidities, setComorbidities] = useState(initialData?.comorbidities || ["none"]);

  const [userPersona, setUserPersona] = useState(initialData?.userPersona || "solo_eater");
  const [householdSize, setHouseholdSize] = useState(
    initialData?.householdSize?.toString() || "1"
  );
  const [cookingSkill, setCookingSkill] = useState(initialData?.cookingSkill || "beginner");

  const [errorMsg, setErrorMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { bmi, category } = useMemo(
    () => calculateBMI(heightCm, weightKg),
    [heightCm, weightKg]
  );
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
      <div className="text-center mb-6">
        <span className="inline-block text-xs font-bold tracking-widest uppercase text-amber-700 mb-1.5">
          Personalized Profile Setup
        </span>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight leading-tight">
          Set Up Your KusinApp Profile
        </h1>
        <p className="mt-1.5 text-sm text-slate-600 leading-relaxed">
          We use this to tailor your Filipino meal plans, calorie targets, and recipes.
        </p>
      </div>

      {/* 3-Step Progress Bar */}
      <ol
        className="grid grid-cols-3 gap-2 mb-6 list-none p-0"
        aria-label="Onboarding progress"
      >
        {STEPS.map((label, i) => {
          const n = i + 1;
          const isDone = n < step;
          const isCurrent = n === step;
          return (
            <li
              key={label}
              className={`flex flex-col gap-1.5 text-xs font-semibold ${
                isCurrent
                  ? "text-amber-700"
                  : isDone
                  ? "text-slate-900"
                  : "text-slate-400"
              }`}
              aria-current={isCurrent ? "step" : undefined}
            >
              <div className="h-1 rounded-full bg-slate-200 overflow-hidden">
                <div
                  className={`h-full bg-amber-500 rounded-full transition-all duration-300 ${
                    isDone || isCurrent ? "w-full" : "w-0"
                  }`}
                />
              </div>
              <span className="truncate">
                {n}. {label}
              </span>
            </li>
          );
        })}
      </ol>

      {errorMsg && (
        <div
          role="alert"
          className="px-3.5 py-3 mb-4 rounded-lg border border-red-200 bg-red-50 text-red-700 text-sm leading-relaxed"
        >
          {errorMsg}
        </div>
      )}

      {/* STEP 1: DEMOGRAPHICS & BODY METRICS */}
      {step === 1 && (
        <div className="flex flex-col gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Demographics & Body Metrics</h2>
            <p className="mt-0.5 text-xs text-slate-600">
              Used to compute your baseline BMI and daily calorie requirements.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="ob-age"
                className="flex justify-between items-baseline text-[0.83rem] font-semibold text-slate-900"
              >
                Age
              </label>
              <div className="relative flex items-center">
                <input
                  id="ob-age"
                  type="number"
                  inputMode="numeric"
                  className="w-full h-11 pl-3.5 pr-11 bg-white border border-slate-300 rounded-lg text-[0.92rem] text-slate-900 placeholder:text-slate-400 outline-none hover:border-slate-400 focus:border-amber-500 focus:shadow-amber-ring transition-all"
                  placeholder="22"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  min="10"
                  max="120"
                />
                <span className="absolute right-3 text-xs font-semibold text-slate-500 pointer-events-none">
                  yrs
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <span
                id="ob-sex-label"
                className="flex justify-between items-baseline text-[0.83rem] font-semibold text-slate-900"
              >
                Biological Sex
              </span>
              <Select
                id="ob-sex"
                ariaLabelledBy="ob-sex-label"
                value={gender}
                onChange={setGender}
                options={SEX_OPTIONS}
                placeholder="Select sex"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="ob-height"
                className="flex justify-between items-baseline text-[0.83rem] font-semibold text-slate-900"
              >
                Height
              </label>
              <div className="relative flex items-center">
                <input
                  id="ob-height"
                  type="number"
                  inputMode="decimal"
                  className="w-full h-11 pl-3.5 pr-11 bg-white border border-slate-300 rounded-lg text-[0.92rem] text-slate-900 placeholder:text-slate-400 outline-none hover:border-slate-400 focus:border-amber-500 focus:shadow-amber-ring transition-all"
                  placeholder="165"
                  value={heightCm}
                  onChange={(e) => setHeightCm(e.target.value)}
                  min="50"
                  max="250"
                />
                <span className="absolute right-3 text-xs font-semibold text-slate-500 pointer-events-none">
                  cm
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="ob-weight"
                className="flex justify-between items-baseline text-[0.83rem] font-semibold text-slate-900"
              >
                Weight
              </label>
              <div className="relative flex items-center">
                <input
                  id="ob-weight"
                  type="number"
                  inputMode="decimal"
                  className="w-full h-11 pl-3.5 pr-11 bg-white border border-slate-300 rounded-lg text-[0.92rem] text-slate-900 placeholder:text-slate-400 outline-none hover:border-slate-400 focus:border-amber-500 focus:shadow-amber-ring transition-all"
                  placeholder="62"
                  value={weightKg}
                  onChange={(e) => setWeightKg(e.target.value)}
                  min="20"
                  max="300"
                />
                <span className="absolute right-3 text-xs font-semibold text-slate-500 pointer-events-none">
                  kg
                </span>
              </div>
            </div>
          </div>

          {bmi > 0 && (
            <div className="grid grid-cols-2 gap-3" aria-live="polite">
              <div className="p-3.5 bg-slate-50 border border-slate-300 rounded-xl">
                <div className="text-[0.72rem] font-bold tracking-wider uppercase text-slate-500">
                  Current BMI
                </div>
                <div className="mt-1 text-xl font-extrabold text-slate-900">{bmi}</div>
                <div className={`text-xs font-semibold ${getCategoryColorClass(category)}`}>
                  {category}
                </div>
              </div>
              <div className="p-3.5 bg-slate-50 border border-slate-300 rounded-xl">
                <div className="text-[0.72rem] font-bold tracking-wider uppercase text-slate-500">
                  Base BMR
                </div>
                <div className="mt-1 text-xl font-extrabold text-slate-900">
                  {estimatedBMR > 0 ? `~${estimatedBMR}` : "—"}
                </div>
                <div className="text-xs font-semibold text-slate-500">
                  {estimatedBMR > 0 ? "kcal / day" : "Add age & sex"}
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-2.5 mt-2">
            {typeof onCancel === "function" && (
              <button
                type="button"
                className="h-11 px-4 bg-slate-50 hover:bg-slate-100 border border-slate-300 rounded-lg text-[0.92rem] font-semibold text-slate-900 inline-flex items-center justify-center transition-all"
                onClick={onCancel}
              >
                Cancel
              </button>
            )}
            <button
              type="button"
              className="flex-1 h-11 px-4 bg-amber-500 hover:bg-amber-600 border border-amber-600 rounded-lg text-[0.92rem] font-semibold text-white shadow-sm inline-flex items-center justify-center transition-all focus-visible:outline-none focus-visible:shadow-amber-ring"
              onClick={handleNext}
            >
              Continue →
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: HEALTH GOALS & CONDITIONS */}
      {step === 2 && (
        <div className="flex flex-col gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Weight Goal</h2>
            <p className="mt-0.5 text-xs text-slate-600">
              Your daily calorie targets and recommended ulam will align with this goal.
            </p>
          </div>

          <div className="grid gap-2.5" role="radiogroup" aria-label="Weight goal">
            {WEIGHT_GOALS.map((g) => {
              const GoalIcon = g.Icon;
              const isSelected = weightGoal === g.id;
              return (
                <label
                  key={g.id}
                  className={`relative flex gap-3 items-start p-3.5 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? "border-amber-500 bg-amber-50/90"
                      : "border-slate-300 bg-white hover:border-slate-400 hover:bg-slate-50/40"
                  }`}
                >
                  <input
                    type="radio"
                    name="weightGoal"
                    value={g.id}
                    checked={isSelected}
                    onChange={() => setWeightGoal(g.id)}
                    className="sr-only"
                  />
                  <span
                    className={`shrink-0 w-4 h-4 mt-0.5 rounded-full border flex items-center justify-center transition-all ${
                      isSelected ? "border-amber-500 bg-amber-500" : "border-slate-300 bg-white"
                    }`}
                    aria-hidden="true"
                  >
                    {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </span>
                  <span
                    className={`shrink-0 grid place-items-center w-8 h-8 rounded-lg transition-colors ${
                      isSelected
                        ? "bg-amber-200 text-amber-800"
                        : "bg-slate-100 text-slate-700"
                    }`}
                    aria-hidden="true"
                  >
                    <GoalIcon size={20} />
                  </span>
                  <span>
                    <span className="block text-sm font-bold text-slate-900">{g.title}</span>
                    <span className="block mt-0.5 text-xs text-slate-600 leading-relaxed">
                      {g.desc}
                    </span>
                  </span>
                </label>
              );
            })}
          </div>

          <div className="mt-1">
            <h2 className="text-base font-bold text-slate-900">Health Conditions</h2>
            <p className="mt-0.5 text-xs text-slate-600">
              Select any dietary filters you want KusinApp to apply.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {COMORBIDITIES.map((c) => {
              const selected = comorbidities.includes(c.id);
              return (
                <button
                  key={c.id}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => toggleComorbidity(c.id)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold transition-all cursor-pointer ${
                    selected
                      ? "border-amber-500 bg-amber-50 text-amber-800"
                      : "border-slate-300 bg-white text-slate-700 hover:border-slate-400"
                  }`}
                >
                  {selected ? <IconCheck size={14} /> : <IconPlus size={14} />}
                  <span>{c.label}</span>
                </button>
              );
            })}
          </div>

          <div className="flex flex-col sm:flex-row gap-2.5 mt-2">
            <button
              type="button"
              className="h-11 px-4 bg-slate-50 hover:bg-slate-100 border border-slate-300 rounded-lg text-[0.92rem] font-semibold text-slate-900 inline-flex items-center justify-center transition-all"
              onClick={handleBack}
            >
              ← Back
            </button>
            <button
              type="button"
              className="flex-1 h-11 px-4 bg-amber-500 hover:bg-amber-600 border border-amber-600 rounded-lg text-[0.92rem] font-semibold text-white shadow-sm inline-flex items-center justify-center transition-all focus-visible:outline-none focus-visible:shadow-amber-ring"
              onClick={handleNext}
            >
              Continue →
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: HOUSEHOLD & COOKING SKILL */}
      {step === 3 && (
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <div>
            <h2 className="text-base font-bold text-slate-900">Target Household Profile</h2>
            <p className="mt-0.5 text-xs text-slate-600">
              Sets default recipe ingredient scaling and serving sizes.
            </p>
          </div>

          <div className="grid gap-2.5" role="radiogroup" aria-label="Target user profile">
            {PERSONAS.map((p) => {
              const PersonaIcon = p.Icon;
              const isSelected = userPersona === p.id;
              return (
                <label
                  key={p.id}
                  className={`relative flex gap-3 items-start p-3.5 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? "border-amber-500 bg-amber-50/90"
                      : "border-slate-300 bg-white hover:border-slate-400 hover:bg-slate-50/40"
                  }`}
                >
                  <input
                    type="radio"
                    name="userPersona"
                    value={p.id}
                    checked={isSelected}
                    onChange={() => {
                      setUserPersona(p.id);
                      setHouseholdSize(p.pax);
                    }}
                    className="sr-only"
                  />
                  <span
                    className={`shrink-0 w-4 h-4 mt-0.5 rounded-full border flex items-center justify-center transition-all ${
                      isSelected ? "border-amber-500 bg-amber-500" : "border-slate-300 bg-white"
                    }`}
                    aria-hidden="true"
                  >
                    {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </span>
                  <span
                    className={`shrink-0 grid place-items-center w-8 h-8 rounded-lg transition-colors ${
                      isSelected
                        ? "bg-amber-200 text-amber-800"
                        : "bg-slate-100 text-slate-700"
                    }`}
                    aria-hidden="true"
                  >
                    <PersonaIcon size={20} />
                  </span>
                  <span>
                    <span className="block text-sm font-bold text-slate-900">{p.title}</span>
                    <span className="block mt-0.5 text-xs text-slate-600 leading-relaxed">
                      {p.desc}
                    </span>
                  </span>
                </label>
              );
            })}
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="ob-pax"
              className="flex justify-between items-baseline text-[0.83rem] font-semibold text-slate-900"
            >
              Number of people eating (household size)
            </label>
            <div className="relative flex items-center">
              <input
                id="ob-pax"
                type="number"
                inputMode="numeric"
                className="w-full h-11 pl-3.5 pr-12 bg-white border border-slate-300 rounded-lg text-[0.92rem] text-slate-900 placeholder:text-slate-400 outline-none hover:border-slate-400 focus:border-amber-500 focus:shadow-amber-ring transition-all"
                min="1"
                max="30"
                value={householdSize}
                onChange={(e) => setHouseholdSize(e.target.value)}
              />
              <span className="absolute right-3 text-xs font-semibold text-slate-500 pointer-events-none">
                pax
              </span>
            </div>
          </div>

          <div className="mt-1">
            <h2 className="text-base font-bold text-slate-900">Cooking Skill Level</h2>
            <p className="mt-0.5 text-xs text-slate-600">
              We will suggest recipes and cooking steps suited for your skill level.
            </p>
          </div>

          <div className="grid gap-2.5" role="radiogroup" aria-label="Cooking skill level">
            {SKILLS.map((s) => {
              const SkillIcon = s.Icon;
              const isSelected = cookingSkill === s.id;
              return (
                <label
                  key={s.id}
                  className={`relative flex gap-3 items-start p-3.5 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? "border-amber-500 bg-amber-50/90"
                      : "border-slate-300 bg-white hover:border-slate-400 hover:bg-slate-50/40"
                  }`}
                >
                  <input
                    type="radio"
                    name="cookingSkill"
                    value={s.id}
                    checked={isSelected}
                    onChange={() => setCookingSkill(s.id)}
                    className="sr-only"
                  />
                  <span
                    className={`shrink-0 w-4 h-4 mt-0.5 rounded-full border flex items-center justify-center transition-all ${
                      isSelected ? "border-amber-500 bg-amber-500" : "border-slate-300 bg-white"
                    }`}
                    aria-hidden="true"
                  >
                    {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </span>
                  <span
                    className={`shrink-0 grid place-items-center w-8 h-8 rounded-lg transition-colors ${
                      isSelected
                        ? "bg-amber-200 text-amber-800"
                        : "bg-slate-100 text-slate-700"
                    }`}
                    aria-hidden="true"
                  >
                    <SkillIcon size={20} />
                  </span>
                  <span>
                    <span className="block text-sm font-bold text-slate-900">{s.title}</span>
                    <span className="block mt-0.5 text-xs text-slate-600 leading-relaxed">
                      {s.desc}
                    </span>
                  </span>
                </label>
              );
            })}
          </div>

          <div className="flex flex-col sm:flex-row gap-2.5 mt-2">
            <button
              type="button"
              className="h-11 px-4 bg-slate-50 hover:bg-slate-100 border border-slate-300 rounded-lg text-[0.92rem] font-semibold text-slate-900 inline-flex items-center justify-center transition-all disabled:opacity-55"
              onClick={handleBack}
              disabled={isSubmitting}
            >
              ← Back
            </button>
            <button
              type="submit"
              className="flex-1 h-11 px-4 bg-amber-500 hover:bg-amber-600 border border-amber-600 rounded-lg text-[0.92rem] font-semibold text-white shadow-sm inline-flex items-center justify-center gap-2 transition-all disabled:opacity-55 focus-visible:outline-none focus-visible:shadow-amber-ring"
              disabled={isSubmitting}
            >
              {isSubmitting && (
                <span
                  className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin"
                  aria-hidden="true"
                />
              )}
              {isSubmitting ? "Saving profile..." : "Complete Profile"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
