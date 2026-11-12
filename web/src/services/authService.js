import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendEmailVerification,
  sendPasswordResetEmail,
  updateProfile,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { ref, set, get, update, serverTimestamp } from "firebase/database";
import { auth, db } from "../config/firebase";
import { sendWelcomeEmail } from "./emailService";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;

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

export function isValidEmail(email) {
  return EMAIL_REGEX.test((email || "").trim());
}

/**
 * Password rules shared by the signup checklist (mirrors mobile app).
 */
export function getPasswordChecks(password = "") {
  return {
    length: password.length >= MIN_PASSWORD_LENGTH,
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    symbol: /[^A-Za-z0-9]/.test(password),
  };
}

/**
 * Calculates Body Mass Index (BMI) and determines BMI category per WHO standards.
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
 */
export function calculateBMR(weightKg, heightCm, age, gender = "male") {
  const w = parseFloat(weightKg);
  const h = parseFloat(heightCm);
  const a = parseInt(age, 10);
  if (!w || !h || !a) return 0;

  const base = 10 * w + 6.25 * h - 5 * a;
  return Math.round(gender === "female" ? base - 161 : base + 5);
}

/**
 * US-01: User Registration (with Email Verification Link)
 */
export async function registerUser(email, password, displayName, gender = "", role = "user") {
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

    await updateProfile(user, {
      displayName: trimmedName,
    });

    // Send standard Firebase Email Verification Link
    try {
      await sendEmailVerification(user);
    } catch (verifyErr) {
      console.warn("Email verification link notice:", verifyErr?.message);
    }

    const userRef = ref(db, `users/${user.uid}`);
    await set(userRef, {
      uid: user.uid,
      displayName: trimmedName,
      email: trimmedEmail,
      gender: gender || "",
      role: role,
      agreedToTerms: true,
      emailVerified: false,
      onboardingCompleted: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    try {
      await sendWelcomeEmail(trimmedEmail, trimmedName);
    } catch (welcomeErr) {
      console.warn("Welcome email dispatch notice:", welcomeErr?.message);
    }

    return user;
  } catch (error) {
    throw new Error(
      formatAuthError(error, "Failed to register user. Please try again.")
    );
  }
}

export async function resendVerificationLink(userParam) {
  const targetUser = userParam || auth.currentUser;
  if (!targetUser) {
    throw new Error("No active account found to resend verification link.");
  }
  try {
    await sendEmailVerification(targetUser);
    return { success: true };
  } catch (err) {
    if (err?.code === "auth/too-many-requests") {
      return { success: true };
    }
    throw new Error(formatAuthError(err, "Failed to resend verification link."));
  }
}

/**
 * US-03: Save Unified Health, Household, Allergies & Comorbidities Onboarding
 */
const HOUSEHOLD_TO_PERSONA = {
  just_me: { userPersona: "solo_eater", householdSize: 1 },
  for_two: { userPersona: "household_provider", householdSize: 2 },
  family: { userPersona: "household_provider", householdSize: 4 },
};

export async function saveUserOnboarding(uid, onboardingData) {
  if (!uid) {
    throw new Error("User ID is required to save onboarding.");
  }

  const age = parseInt(onboardingData.age, 10);
  const height = parseFloat(onboardingData.heightCm);
  const weight = parseFloat(onboardingData.weightKg);

  if (!onboardingData.gender) {
    throw new Error("Please select your biological sex (Female or Male).");
  }
  if (!age || age < 10 || age > 120) {
    throw new Error("Please enter a valid age between 10 and 120.");
  }
  if (!height || height < 50 || height > 250) {
    throw new Error("Please enter a valid height between 50 and 250 cm.");
  }
  if (!weight || weight < 20 || weight > 300) {
    throw new Error("Please enter a valid weight between 20 and 300 kg.");
  }
  if (!onboardingData.weightGoal) {
    throw new Error("Please select your weight goal (Maintain, Gain, or Lose).");
  }

  const householdKey = onboardingData.household || "just_me";
  const mappedHousehold = HOUSEHOLD_TO_PERSONA[householdKey] || HOUSEHOLD_TO_PERSONA.just_me;
  const goals = Array.isArray(onboardingData.goals) ? onboardingData.goals : [];

  const userPersona =
    onboardingData.userPersona ||
    (goals.includes("eat_healthy") && householdKey === "just_me"
      ? "health_targeted_eater"
      : mappedHousehold.userPersona);

  const householdSize =
    parseInt(onboardingData.householdSize, 10) || mappedHousehold.householdSize;

  const cookingSkill =
    onboardingData.cookingSkill ||
    (goals.includes("learn_to_cook") ? "beginner" : "intermediate");

  const { bmi, category: bmiCategory } = calculateBMI(height, weight);
  const bmr = calculateBMR(weight, height, age, onboardingData.gender);

  const comorbidities =
    Array.isArray(onboardingData.comorbidities) && onboardingData.comorbidities.length > 0
      ? onboardingData.comorbidities
      : ["none"];

  const dietaryRestrictions = Array.isArray(onboardingData.dietaryRestrictions)
    ? onboardingData.dietaryRestrictions
    : [];

  const payload = {
    age,
    gender: onboardingData.gender,
    heightCm: height,
    weightKg: weight,
    bmi,
    bmiCategory,
    bmr,
    weightGoal: onboardingData.weightGoal,
    comorbidities,
    dietaryRestrictions,
    goals,
    household: householdKey,
    userPersona,
    householdSize,
    cookingSkill,
    completedAt: serverTimestamp(),
  };

  try {
    const onboardingRef = ref(db, `users/${uid}/onboarding`);
    await set(onboardingRef, payload);

    const userRootRef = ref(db, `users/${uid}`);
    await update(userRootRef, {
      userPersona,
      onboardingCompleted: true,
      onboardingSkipped: false,
      updatedAt: serverTimestamp(),
    });

    return { ...payload, onboardingCompleted: true };
  } catch (error) {
    throw new Error(
      error?.message || "Failed to save onboarding assessment. Please try again."
    );
  }
}

export async function skipUserOnboarding(uid) {
  if (!uid) return;
  await update(ref(db, `users/${uid}`), {
    onboardingSkipped: true,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Helper to fetch a user profile from `/users/{uid}`
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
export async function loginUser(email, password, remember = true) {
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
    await setPersistence(
      auth,
      remember ? browserLocalPersistence : browserSessionPersistence
    );
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

/**
 * User Authentication (Google Sign-In)
 */
export async function loginWithGoogle() {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });

  try {
    const userCredential = await signInWithPopup(auth, provider);
    const user = userCredential.user;

    const userRef = ref(db, `users/${user.uid}`);
    const snapshot = await get(userRef);

    if (!snapshot.exists()) {
      await set(userRef, {
        uid: user.uid,
        displayName: user.displayName || "KusinApp Chef",
        email: user.email,
        role: "user",
        onboardingCompleted: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      try {
        await sendWelcomeEmail(user.email, user.displayName || "Chef");
      } catch (welcomeErr) {
        console.warn("Welcome email notice for Google signup:", welcomeErr?.message);
      }
    }

    return user;
  } catch (error) {
    if (error?.code === "auth/popup-closed-by-user") {
      throw new Error("Google sign-in was canceled.");
    }
    throw new Error(
      formatAuthError(error, "Failed to sign in with Google. Please try again.")
    );
  }
}

/**
 * Sends a standard Password Reset Link to the user's email address via Firebase Auth.
 */
export async function sendPasswordResetLink(email) {
  const trimmedEmail = typeof email === "string" ? email.trim() : "";
  if (!trimmedEmail) {
    throw new Error("Please enter your email address.");
  }
  if (!EMAIL_REGEX.test(trimmedEmail)) {
    throw new Error("Please enter a valid email address.");
  }

  try {
    await sendPasswordResetEmail(auth, trimmedEmail);
    return { success: true, email: trimmedEmail };
  } catch (err) {
    throw new Error(
      formatAuthError(err, "Failed to send password reset link. Please try again.")
    );
  }
}

// Keep legacy exports mapped to email link for backwards compatibility
export const requestPasswordResetOtp = sendPasswordResetLink;
export function verifyPasswordResetOtp() {
  return { valid: true };
}
export async function completePasswordReset() {
  return { success: true };
}
