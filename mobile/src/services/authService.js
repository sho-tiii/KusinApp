import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithCredential,
  GoogleAuthProvider,
  sendEmailVerification,
  sendPasswordResetEmail,
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

export function isValidEmail(email) {
  return EMAIL_REGEX.test((email || "").trim());
}

/**
 * Password rules shared by the signup checklist (mirrors the web app).
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

/* ------------------------------------------------------------------ */
/* Email Verification Link & Password Reset Link                       */
/* ------------------------------------------------------------------ */

export async function sendVerificationEmailLink(userParam) {
  const targetUser = userParam || auth.currentUser;
  if (!targetUser) {
    throw new Error("No active account found to send verification link.");
  }
  try {
    await sendEmailVerification(targetUser);
    return true;
  } catch (err) {
    // Handle rate limit gracefully
    if (err?.code === "auth/too-many-requests") {
      return true;
    }
    throw new Error(formatAuthError(err, "Failed to send verification link."));
  }
}

export async function sendMobilePasswordResetLink(email) {
  const trimmedEmail = typeof email === "string" ? email.trim() : "";
  if (!trimmedEmail || !EMAIL_REGEX.test(trimmedEmail)) {
    throw new Error("Please enter a valid email address.");
  }
  try {
    await sendPasswordResetEmail(auth, trimmedEmail);
    return true;
  } catch (err) {
    throw new Error(formatAuthError(err, "Failed to send password reset link."));
  }
}

// Keep legacy exports as no-op helpers in case referenced
export function requestSignupVerificationCode(email) {
  return "LINK";
}

export function verifySignupCode() {
  return true;
}

/* ------------------------------------------------------------------ */
/* Account                                                             */
/* ------------------------------------------------------------------ */

export async function registerMobileUser(email, password, displayName, gender) {
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

    const profile = {
      uid: user.uid,
      displayName: trimmedName,
      email: trimmedEmail,
      gender: gender || "",
      role: "user",
      agreedToTerms: true,
      emailVerified: false,
      onboardingCompleted: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    await set(ref(db, `users/${user.uid}`), profile);

    return { user, profile };
  } catch (error) {
    throw new Error(formatAuthError(error, "Failed to create account."));
  }
}

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
 * Signs in or creates a Google-linked account on mobile (works inside Expo Go)
 * and ensures `/users/{uid}` is synced with the web schema.
 */
export async function signInOrRegisterWithGoogleMobile(email, password, displayName) {
  const trimmedEmail = (email || "").trim();
  if (!EMAIL_REGEX.test(trimmedEmail)) {
    throw new Error("Please enter a valid Google email address.");
  }

  try {
    const cred = await signInWithEmailAndPassword(auth, trimmedEmail, password);
    const user = cred.user;
    const userRef = ref(db, `users/${user.uid}`);
    const snap = await get(userRef);
    if (!snap.exists()) {
      await set(userRef, {
        uid: user.uid,
        displayName: user.displayName || displayName || trimmedEmail.split("@")[0],
        email: trimmedEmail,
        authProvider: "google",
        role: "user",
        onboardingCompleted: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
    return user;
  } catch (signInErr) {
    if (
      signInErr?.code === "auth/user-not-found" ||
      signInErr?.code === "auth/invalid-credential"
    ) {
      try {
        const nameToUse =
          (displayName || "").trim() || trimmedEmail.split("@")[0] || "KusinApp Chef";
        const created = await createUserWithEmailAndPassword(
          auth,
          trimmedEmail,
          password
        );
        const user = created.user;
        await updateProfile(user, { displayName: nameToUse });
        await set(ref(db, `users/${user.uid}`), {
          uid: user.uid,
          displayName: nameToUse,
          email: trimmedEmail,
          authProvider: "google",
          role: "user",
          onboardingCompleted: false,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        return user;
      } catch (createErr) {
        if (createErr?.code === "auth/email-already-in-use") {
          throw new Error("Invalid password for this Google account.");
        }
        throw new Error(formatAuthError(createErr, "Failed to sign in with Google."));
      }
    }
    throw new Error(formatAuthError(signInErr, "Failed to sign in with Google."));
  }
}

export async function loginWithGoogleIdToken(idToken, accessToken) {
  try {
    const credential = GoogleAuthProvider.credential(idToken || null, accessToken || null);
    const { user } = await signInWithCredential(auth, credential);

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
    }
    return user;
  } catch (error) {
    throw new Error(formatAuthError(error, "Failed to sign in with Google."));
  }
}

export async function logoutMobileUser() {
  try {
    await signOut(auth);
  } catch (error) {
    throw new Error(formatAuthError(error, "Failed to log out."));
  }
}

export async function getMobileUserProfile(uid) {
  if (!uid) return null;
  const snapshot = await get(ref(db, `users/${uid}`));
  return snapshot.exists() ? snapshot.val() : null;
}

/* ------------------------------------------------------------------ */
/* Onboarding                                                          */
/* ------------------------------------------------------------------ */

const HOUSEHOLD_TO_PERSONA = {
  just_me: { userPersona: "solo_eater", householdSize: 1 },
  for_two: { userPersona: "household_provider", householdSize: 2 },
  family: { userPersona: "household_provider", householdSize: 4 },
};

export async function saveMobileOnboarding(uid, data) {
  if (!uid) throw new Error("You need to be signed in to save your kusina setup.");

  const age = parseInt(data.age, 10);
  const height = parseFloat(data.heightCm);
  const weight = parseFloat(data.weightKg);
  if (!data.gender) throw new Error("Please select your biological sex (Female or Male).");
  if (!age || age < 10 || age > 120) throw new Error("Please enter a valid age between 10 and 120.");
  if (!height || height < 50 || height > 250) throw new Error("Please enter a valid height between 50 and 250 cm.");
  if (!weight || weight < 20 || weight > 300) throw new Error("Please enter a valid weight between 20 and 300 kg.");
  if (!data.weightGoal) throw new Error("Please select your weight goal (Maintain, Gain, or Lose).");

  const household = HOUSEHOLD_TO_PERSONA[data.household] || HOUSEHOLD_TO_PERSONA.just_me;
  const goals = Array.isArray(data.goals) ? data.goals : [];
  const userPersona = goals.includes("eat_healthy") && data.household === "just_me"
    ? "health_targeted_eater"
    : household.userPersona;

  const { bmi, category: bmiCategory } = calculateBMI(height, weight);
  const bmr = calculateBMR(weight, height, age, data.gender);

  const comorbidities =
    Array.isArray(data.comorbidities) && data.comorbidities.length > 0
      ? data.comorbidities
      : ["none"];

  const payload = {
    age,
    gender: data.gender,
    heightCm: height,
    weightKg: weight,
    bmi,
    bmiCategory,
    bmr,
    weightGoal: data.weightGoal,
    comorbidities,
    userPersona,
    householdSize: household.householdSize,
    household: data.household || "just_me",
    goals,
    dietaryRestrictions: Array.isArray(data.dietaryRestrictions) ? data.dietaryRestrictions : [],
    cookingSkill: goals.includes("learn_to_cook") ? "beginner" : "intermediate",
    completedAt: serverTimestamp(),
  };

  await set(ref(db, `users/${uid}/onboarding`), payload);
  await update(ref(db, `users/${uid}`), {
    userPersona,
    onboardingCompleted: true,
    onboardingSkipped: false,
    updatedAt: serverTimestamp(),
  });
  return payload;
}

export async function skipMobileOnboarding(uid) {
  if (!uid) return;
  await update(ref(db, `users/${uid}`), {
    onboardingSkipped: true,
    updatedAt: serverTimestamp(),
  });
}
