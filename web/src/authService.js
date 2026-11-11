import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  updateProfile 
} from "firebase/auth";
import { ref, set, get, update, serverTimestamp } from "firebase/database";
import { auth, db } from "./firebase";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 6;

/**
 * Maps Firebase Auth error codes to user-friendly descriptive messages.
 */
function formatAuthError(error, defaultMessage) {
  const code = error?.code || "";
  switch (code) {
    case "auth/email-already-in-use":
      return "An account with this email address already exists.";
    case "auth/invalid-email":
      return "Please enter a valid email address.";
    case "auth/weak-password":
      return `Password is too weak. Please use at least ${MIN_PASSWORD_LENGTH} characters.`;
    case "auth/user-not-found":
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "Invalid email or password. Please check your credentials and try again.";
    case "auth/user-disabled":
      return "This user account has been disabled. Please contact support.";
    case "auth/too-many-requests":
      return "Too many failed attempts. Please wait a moment and try again.";
    case "auth/network-request-failed":
      return "Network error. Please check your internet connection and try again.";
    default:
      return error?.message || defaultMessage;
  }
}

/**
 * Calculates Body Mass Index (BMI) and determines BMI category per WHO standards.
 * Formula: weight (kg) / (height (m) ^ 2)
 *
 * @param {number} heightCm - Height in centimeters
 * @param {number} weightKg - Weight in kilograms
 * @returns {{ bmi: number, category: string }}
 */
export function calculateBMI(heightCm, weightKg) {
  const height = parseFloat(heightCm);
  const weight = parseFloat(weightKg);

  if (!height || !weight || height <= 0 || weight <= 0) {
    return { bmi: 0, category: "N/A" };
  }

  const heightInMeters = height / 100;
  const bmi = parseFloat((weight / (heightInMeters * heightInMeters)).toFixed(1));

  let category = "Normal";
  if (bmi < 18.5) {
    category = "Underweight";
  } else if (bmi >= 18.5 && bmi < 25) {
    category = "Normal";
  } else if (bmi >= 25 && bmi < 30) {
    category = "Overweight";
  } else {
    category = "Obese";
  }

  return { bmi, category };
}

/**
 * Calculates estimated Basal Metabolic Rate (BMR) using the Mifflin-St Jeor equation.
 * Used as the baseline for KusinApp's Calorie & Health Monitor engine.
 *
 * @param {number} weightKg
 * @param {number} heightCm
 * @param {number} age
 * @param {"male"|"female"} gender
 * @returns {number}
 */
export function calculateBMR(weightKg, heightCm, age, gender = "male") {
  const w = parseFloat(weightKg);
  const h = parseFloat(heightCm);
  const a = parseInt(age, 10);
  if (!w || !h || !a) return 0;

  // Mifflin-St Jeor Formula
  const base = 10 * w + 6.25 * h - 5 * a;
  return Math.round(gender === "female" ? base - 161 : base + 5);
}

/**
 * US-01: User Registration
 * Validates inputs, creates the Firebase Auth user, sets displayName,
 * and records user profile data into Firebase Realtime Database at `/users/{uid}`.
 *
 * @param {string} email
 * @param {string} password
 * @param {string} displayName
 * @param {string} [role="user"] - 'user' (End-user), 'admin' (Recipe & Nutrition Moderator), or 'super_admin' (Platform Director)
 * @returns {Promise<import("firebase/auth").User>}
 */
export async function registerUser(email, password, displayName, role = "user") {
  const trimmedName = typeof displayName === "string" ? displayName.trim() : "";
  const trimmedEmail = typeof email === "string" ? email.trim() : "";

  if (!trimmedName) {
    throw new Error("Display name is required.");
  }
  if (trimmedName.length < 2) {
    throw new Error("Display name must be at least 2 characters long.");
  }
  if (!trimmedEmail) {
    throw new Error("Email address is required.");
  }
  if (!EMAIL_REGEX.test(trimmedEmail)) {
    throw new Error("Please enter a valid email address.");
  }
  if (!password || typeof password !== "string") {
    throw new Error("Password is required.");
  }
  if (password.length < MIN_PASSWORD_LENGTH) {
    throw new Error(`Password must be at least ${MIN_PASSWORD_LENGTH} characters long.`);
  }

  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      trimmedEmail,
      password
    );

    const user = userCredential.user;

    // Update Firebase Auth profile
    await updateProfile(user, {
      displayName: trimmedName,
    });

    // Write user profile to Realtime Database at `/users/{uid}`
    const userRef = ref(db, `users/${user.uid}`);
    await set(userRef, {
      uid: user.uid,
      displayName: trimmedName,
      email: trimmedEmail,
      role: role,
      onboardingCompleted: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return user;
  } catch (error) {
    throw new Error(
      formatAuthError(error, "Failed to register user. Please try again.")
    );
  }
}

/**
 * US-03: Save Health & Cooking Skill Onboarding
 * Aligned with KusinApp Software Proposal Section 1:
 * Collects demographics, comorbidities, current BMI, target audience, and cooking skill level.
 *
 * @param {string} uid
 * @param {object} onboardingData
 * @param {number} onboardingData.age
 * @param {"male"|"female"|"prefer_not_to_say"} onboardingData.gender
 * @param {number} onboardingData.heightCm
 * @param {number} onboardingData.weightKg
 * @param {"maintain"|"lose"|"gain"} onboardingData.weightGoal - Maintain, Gain, or Lose (Proposal Section 1)
 * @param {string[]} onboardingData.comorbidities - e.g., ['hypertension', 'diabetes', 'high_cholesterol', 'none']
 * @param {"solo_eater"|"household_provider"|"health_targeted_eater"} onboardingData.userPersona
 * @param {number} onboardingData.householdSize
 * @param {"beginner"|"intermediate"|"advanced"} onboardingData.cookingSkill
 * @returns {Promise<object>}
 */
export async function saveUserOnboarding(uid, onboardingData) {
  if (!uid) {
    throw new Error("User ID is required to save onboarding.");
  }

  const age = parseInt(onboardingData.age, 10);
  const height = parseFloat(onboardingData.heightCm);
  const weight = parseFloat(onboardingData.weightKg);

  if (!age || age < 10 || age > 120) {
    throw new Error("Please enter a valid age (10 to 120).");
  }
  if (!height || height <= 50 || height > 260) {
    throw new Error("Please provide a valid height in cm (e.g., 165).");
  }
  if (!weight || weight <= 20 || weight > 350) {
    throw new Error("Please provide a valid weight in kg (e.g., 60).");
  }
  if (!onboardingData.weightGoal) {
    throw new Error("Please select your weight goal (Maintain, Lose, or Gain).");
  }
  if (!onboardingData.userPersona) {
    throw new Error("Please select your target user profile persona.");
  }
  if (!onboardingData.cookingSkill) {
    throw new Error("Please select your cooking skill level.");
  }

  const { bmi, category: bmiCategory } = calculateBMI(height, weight);
  const bmr = calculateBMR(weight, height, age, onboardingData.gender || "male");

  const payload = {
    // Demographics
    age,
    gender: onboardingData.gender || "male",

    // Physical metrics & BMI Targets
    heightCm: height,
    weightKg: weight,
    bmi,
    bmiCategory,
    bmr,

    // Weight Goals: Strictly Maintain, Gain, Lose (per Proposal Section 1)
    weightGoal: onboardingData.weightGoal,

    // Comorbidities & Existing Health Conditions (per Proposal Section 1)
    comorbidities: Array.isArray(onboardingData.comorbidities)
      ? onboardingData.comorbidities
      : ["none"],

    // Target User Profiles (Proposal Section 1)
    userPersona: onboardingData.userPersona, // 'solo_eater', 'household_provider', 'health_targeted_eater'
    householdSize: parseInt(onboardingData.householdSize, 10) || 1,

    // Cooking Skill Level
    cookingSkill: onboardingData.cookingSkill, // 'beginner', 'intermediate', 'advanced'

    completedAt: serverTimestamp(),
  };

  try {
    // 1. Update user onboarding node
    const onboardingRef = ref(db, `users/${uid}/onboarding`);
    await set(onboardingRef, payload);

    // 2. Mark onboardingCompleted: true and record userPersona on root user node
    const userRootRef = ref(db, `users/${uid}`);
    await update(userRootRef, {
      userPersona: onboardingData.userPersona,
      onboardingCompleted: true,
      updatedAt: serverTimestamp(),
    });

    return { ...payload, onboardingCompleted: true };
  } catch (error) {
    throw new Error(
      error?.message || "Failed to save onboarding assessment. Please try again."
    );
  }
}

/**
 * Helper to fetch a user profile from `/users/{uid}`
 * @param {string} uid
 * @returns {Promise<object|null>}
 */
export async function getUserProfile(uid) {
  if (!uid) return null;
  const userRef = ref(db, `users/${uid}`);
  const snapshot = await get(userRef);
  return snapshot.exists() ? snapshot.val() : null;
}

/**
 * US-02: User Authentication (Login)
 */
export async function loginUser(email, password) {
  const trimmedEmail = typeof email === "string" ? email.trim() : "";

  if (!trimmedEmail) {
    throw new Error("Email address is required.");
  }
  if (!EMAIL_REGEX.test(trimmedEmail)) {
    throw new Error("Please enter a valid email address.");
  }
  if (!password || typeof password !== "string") {
    throw new Error("Password is required.");
  }

  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      trimmedEmail,
      password
    );
    return userCredential.user;
  } catch (error) {
    throw new Error(
      formatAuthError(
        error,
        "Invalid email or password. Please check your credentials and try again."
      )
    );
  }
}

/**
 * US-02: User Authentication (Logout)
 */
export async function logoutUser() {
  try {
    await signOut(auth);
  } catch (error) {
    throw new Error(
      formatAuthError(error, "Failed to log out. Please try again.")
    );
  }
}