import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";
import { ref, set, get, update, serverTimestamp } from "firebase/database";
import { auth, db } from "../config/firebase";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;

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
      return "Invalid email or password. Please check your credentials.";
    case "auth/too-many-requests":
      return "Too many failed attempts. Please wait a moment and try again.";
    case "auth/network-request-failed":
      return "Network error. Please check your internet connection.";
    default:
      return error?.message || defaultMessage;
  }
}

/**
 * Calculates Body Mass Index (BMI)
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
  if (bmi < 18.5) category = "Underweight";
  else if (bmi >= 18.5 && bmi < 25) category = "Normal";
  else if (bmi >= 25 && bmi < 30) category = "Overweight";
  else category = "Obese";

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
 * Register mobile user
 */
export async function registerMobileUser(email, password, displayName) {
  const trimmedName = typeof displayName === "string" ? displayName.trim() : "";
  const trimmedEmail = typeof email === "string" ? email.trim() : "";

  if (!trimmedName || trimmedName.length < 2) {
    throw new Error("Display name must be at least 2 characters.");
  }
  if (!trimmedEmail || !EMAIL_REGEX.test(trimmedEmail)) {
    throw new Error("Please enter a valid email address.");
  }
  if (!password || password.length < MIN_PASSWORD_LENGTH) {
    throw new Error(`Password must be at least ${MIN_PASSWORD_LENGTH} characters long.`);
  }

  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      trimmedEmail,
      password
    );
    const user = userCredential.user;

    await updateProfile(user, { displayName: trimmedName });

    const userRef = ref(db, `users/${user.uid}`);
    await set(userRef, {
      uid: user.uid,
      displayName: trimmedName,
      email: trimmedEmail,
      role: "user",
      onboardingCompleted: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return user;
  } catch (error) {
    throw new Error(formatAuthError(error, "Failed to create account."));
  }
}

/**
 * Login mobile user
 */
export async function loginMobileUser(email, password) {
  const trimmedEmail = typeof email === "string" ? email.trim() : "";
  if (!trimmedEmail || !EMAIL_REGEX.test(trimmedEmail)) {
    throw new Error("Please enter a valid email address.");
  }
  if (!password) {
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
    throw new Error(formatAuthError(error, "Invalid email or password."));
  }
}

/**
 * Logout mobile user
 */
export async function logoutMobileUser() {
  try {
    await signOut(auth);
  } catch (error) {
    throw new Error(formatAuthError(error, "Failed to log out."));
  }
}

/**
 * Fetch profile from Realtime Database
 */
export async function getMobileUserProfile(uid) {
  if (!uid) return null;
  const userRef = ref(db, `users/${uid}`);
  const snapshot = await get(userRef);
  return snapshot.exists() ? snapshot.val() : null;
}
