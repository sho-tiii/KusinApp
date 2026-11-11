import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";
import { auth } from "./firebase";

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
 * US-01: User Registration
 * Validates inputs before creating a new Firebase user account and setting displayName.
 *
 * @param {string} email
 * @param {string} password
 * @param {string} displayName
 * @returns {Promise<import("firebase/auth").User>}
 */
export async function registerUser(email, password, displayName) {
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
    throw new Error(
      `Password must be at least ${MIN_PASSWORD_LENGTH} characters long.`
    );
  }

  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      trimmedEmail,
      password
    );

    await updateProfile(userCredential.user, {
      displayName: trimmedName,
    });

    return userCredential.user;
  } catch (error) {
    throw new Error(
      formatAuthError(error, "Failed to register user. Please try again.")
    );
  }
}

/**
 * US-02: User Authentication (Login)
 * Validates credentials and signs the user in with Firebase Auth.
 *
 * @param {string} email
 * @param {string} password
 * @returns {Promise<import("firebase/auth").User>}
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
 * Ends the active user session.
 *
 * @returns {Promise<void>}
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
