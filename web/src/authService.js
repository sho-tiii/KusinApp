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
 * Calculates Body Mass Index (BMI) and determines BMI category.
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
 * US-01: User Registration
 * Validates inputs, creates the Firebase Auth user, sets displayName,
 * and records user profile data into Firebase Realtime Database at `/users/{uid}`.
 *
 * @param {string} email
 * @param {string} password
 * @param {string} displayName
 * @param {string} [role="user"] - Optional role: 'user', 'admin', or 'super_admin'
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
 * Saves BMI assessment, dietary/health goals, household/target audience,
 * and cooking skill level into `/users/{uid}/onboarding`.
 *
 * @param {string} uid
 * @param {object} onboardingData
 * @param {number} onboardingData.heightCm
 * @param {number} onboardingData.weightKg
 * @param {string} onboardingData.primaryGoal - e.g., 'weight_loss', 'healthy_eating', 'budget_meal', 'maintenance', 'muscle_gain'
 * @param {string} onboardingData.targetAudience - e.g., 'solo', 'couple', 'family_small', 'family_large'
 * @param {number} onboardingData.householdSize - number of people eating
 * @param {string} onboardingData.cookingSkill - 'beginner', 'intermediate', 'advanced'
 * @param {string[]} [onboardingData.dietaryPreferences] - e.g., ['low_sodium', 'diabetic_friendly', 'none']
 * @returns {Promise<object>}
 */
export async function saveUserOnboarding(uid, onboardingData) {
  if (!uid) {
    throw new Error("User ID is required to save onboarding.");
  }

  const height = parseFloat(onboardingData.heightCm);
  const weight = parseFloat(onboardingData.weightKg);

  if (!height || height <= 0 || height > 260) {
    throw new Error("Please provide a valid height in cm (e.g., 165).");
  }
  if (!weight || weight <= 0 || weight > 350) {
    throw new Error("Please provide a valid weight in kg (e.g., 60).");
  }
  if (!onboardingData.primaryGoal) {
    throw new Error("Please select your primary meal planning goal.");
  }
  if (!onboardingData.cookingSkill) {
    throw new Error("Please select your cooking skill level.");
  }

  const { bmi, category: bmiCategory } = calculateBMI(height, weight);

  const payload = {
    heightCm: height,
    weightKg: weight,
    bmi,
    bmiCategory,
    primaryGoal: onboardingData.primaryGoal,
    targetAudience: onboardingData.targetAudience || "solo",
    householdSize: parseInt(onboardingData.householdSize, 10) || 1,
    cookingSkill: onboardingData.cookingSkill,
    dietaryPreferences: Array.isArray(onboardingData.dietaryPreferences)
      ? onboardingData.dietaryPreferences
      : [],
    completedAt: serverTimestamp(),
  };

  try {
    // 1. Update user onboarding node
    const onboardingRef = ref(db, `users/${uid}/onboarding`);
    await set(onboardingRef, payload);

    // 2. Mark onboardingCompleted: true on user root
    const userRootRef = ref(db, `users/${uid}`);
    await update(userRootRef, {
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