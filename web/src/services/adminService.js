import { 
  updatePassword, 
  updateProfile, 
  EmailAuthProvider, 
  reauthenticateWithCredential 
} from "firebase/auth";
import { ref, get, update, serverTimestamp } from "firebase/database";
import { auth, db } from "../config/firebase";
import { loginUser } from "./authService";

/**
 * US-14 & US-22: Unified Admin & Super Admin Login
 * Validates credentials and verifies that the account possesses
 * an administrative role ('admin' or 'super_admin').
 *
 * @param {string} email
 * @param {string} password
 * @param {boolean} [remember=true]
 * @returns {Promise<{ user: import("firebase/auth").User, profile: object }>}
 */
export async function loginAdmin(email, password, remember = true) {
  // 1. Authenticate credentials via standard Firebase Auth
  const user = await loginUser(email, password, remember);

  // 2. Fetch role record from Realtime Database at `/users/{uid}`
  const userRef = ref(db, `users/${user.uid}`);
  const snapshot = await get(userRef);

  if (!snapshot.exists()) {
    throw new Error("No administrative account record found in database.");
  }

  const profile = snapshot.val();
  const role = profile.role || "user";

  // 3. Restrict unauthorized users (US-14 & US-22 requirement)
  if (role !== "admin" && role !== "super_admin") {
    throw new Error(
      "Access Restricted: This portal is reserved for authorized Admin and Super Admin accounts only."
    );
  }

  return { user, profile };
}

/**
 * US-19 & US-27: Update Administrator Profile Information
 * Updates displayName in Firebase Auth and updates database records.
 *
 * @param {string} uid
 * @param {object} updates
 * @param {string} updates.displayName
 * @returns {Promise<void>}
 */
export async function updateAdminProfile(uid, { displayName }) {
  if (!uid) throw new Error("Administrator UID is required.");
  const trimmedName = typeof displayName === "string" ? displayName.trim() : "";
  if (!trimmedName || trimmedName.length < 2) {
    throw new Error("Display name must be at least 2 characters.");
  }

  // Update Firebase Auth user profile
  if (auth.currentUser) {
    await updateProfile(auth.currentUser, { displayName: trimmedName });
  }

  // Update Realtime Database record
  const userRef = ref(db, `users/${uid}`);
  await update(userRef, {
    displayName: trimmedName,
    updatedAt: serverTimestamp(),
  });
}

/**
 * US-19 & US-27: Secure Password Management
 * Re-authenticates the current administrator with their current password
 * before securely applying the new password.
 *
 * @param {string} currentPassword
 * @param {string} newPassword
 * @returns {Promise<void>}
 */
export async function changeAdminPassword(currentPassword, newPassword) {
  const user = auth.currentUser;
  if (!user || !user.email) {
    throw new Error("No active administrator session found.");
  }

  if (!newPassword || newPassword.length < 6) {
    throw new Error("New password must be at least 6 characters long.");
  }

  try {
    // 1. Re-authenticate administrator
    const credential = EmailAuthProvider.credential(user.email, currentPassword);
    await reauthenticateWithCredential(user, credential);

    // 2. Apply new password
    await updatePassword(user, newPassword);

    // 3. Record password change timestamp in database for audit trail
    const userRef = ref(db, `users/${user.uid}`);
    await update(userRef, {
      passwordUpdatedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    if (error.code === "auth/wrong-password" || error.code === "auth/invalid-credential") {
      throw new Error("The current password you entered is incorrect.");
    }
    if (error.code === "auth/weak-password") {
      throw new Error("The new password is too weak. Please use a stronger password.");
    }
    throw new Error(error.message || "Failed to update password. Please try again.");
  }
}
