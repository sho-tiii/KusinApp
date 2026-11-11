import React, { useState, useEffect } from "react";
import { updateAdminProfile, changeAdminPassword } from "../../services/adminService";
import PasswordInput from "../common/PasswordInput";
import ConfirmationModal from "../common/ConfirmationModal";
import PasswordStrengthMeter, { evaluatePasswordStrength } from "../common/PasswordStrengthMeter";

/**
 * Admin & Super Admin Profile and Account Management styled with Tailwind CSS.
 */
export default function AdminProfile({
  user,
  profile,
  onProfileUpdated,
  onLogout,
  onSwitchToUserPortal,
}) {
  const [displayName, setDisplayName] = useState(
    user?.displayName || profile?.displayName || ""
  );
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  const [profileSuccess, setProfileSuccess] = useState("");
  const [profileError, setProfileError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  // Sync displayName state when user or profile prop finishes loading
  useEffect(() => {
    const resolvedName = user?.displayName || profile?.displayName || "";
    if (resolvedName) {
      setDisplayName(resolvedName);
    }
  }, [user?.displayName, profile?.displayName]);

  // Modal State for critical actions
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    title: "",
    message: "",
    confirmText: "Confirm",
    cancelText: "Cancel",
    variant: "primary",
    onConfirm: () => {},
  });

  const isSuperAdmin = profile?.role === "super_admin";

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    setProfileError("");
    setProfileSuccess("");

    if (!displayName.trim() || displayName.trim().length < 2) {
      setProfileError("Full name must be at least 2 characters.");
      return;
    }

    setModalConfig({
      isOpen: true,
      title: "Confirm Profile Update",
      message: `Are you sure you want to change your administrator display name to "${displayName.trim()}"? This will be reflected across administrative activity logs.`,
      confirmText: "Update Name",
      cancelText: "Cancel",
      variant: "primary",
      onConfirm: async () => {
        setIsUpdatingProfile(true);
        try {
          await updateAdminProfile(user.uid, { displayName });
          setProfileSuccess("Administrator profile name updated successfully.");
          if (typeof onProfileUpdated === "function") await onProfileUpdated();
        } catch (err) {
          setProfileError(err.message || "Failed to update profile.");
        } finally {
          setIsUpdatingProfile(false);
          setModalConfig((prev) => ({ ...prev, isOpen: false }));
        }
      },
    });
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    if (!currentPassword) {
      setPasswordError("Please enter your current administrator password.");
      return;
    }
    const strength = evaluatePasswordStrength(newPassword);
    if (!strength.isValid) {
      setPasswordError(
        "New password must satisfy at least 3 security criteria (minimum 8 characters)."
      );
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }

    setModalConfig({
      isOpen: true,
      title: "Confirm Password Change",
      message:
        "Are you sure you want to change your administrator credentials? You will need your new password for your next administrative sign-in.",
      confirmText: "Change Password",
      cancelText: "Cancel",
      variant: "danger",
      onConfirm: async () => {
        setIsUpdatingPassword(true);
        try {
          await changeAdminPassword(currentPassword, newPassword);
          setPasswordSuccess("Administrator password changed successfully.");
          setCurrentPassword("");
          setNewPassword("");
          setConfirmNewPassword("");
        } catch (err) {
          setPasswordError(err.message || "Failed to update password.");
        } finally {
          setIsUpdatingPassword(false);
          setModalConfig((prev) => ({ ...prev, isOpen: false }));
        }
      },
    });
  };

  const handleSignOutConfirm = () => {
    setModalConfig({
      isOpen: true,
      title: "Sign Out of KusinApp",
      message:
        "Are you sure you want to end your administrative session? You will need to re-authenticate to access the admin portal.",
      confirmText: "Sign Out",
      cancelText: "Cancel",
      variant: "danger",
      onConfirm: async () => {
        setIsSigningOut(true);
        try {
          if (typeof onLogout === "function") {
            await onLogout();
          }
        } finally {
          setIsSigningOut(false);
          setModalConfig((prev) => ({ ...prev, isOpen: false }));
        }
      },
    });
  };

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      <header className="flex flex-wrap items-center justify-between gap-3 px-4 sm:px-7 py-3.5 bg-white border-b border-slate-300">
        <div className="flex items-center gap-3.5">
          <img
            src="/assets/kusinapp-logo-horizontal.png"
            alt="KusinApp"
            className="h-10 sm:h-12 w-auto max-w-[200px] object-contain block"
          />
          <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-slate-100 text-slate-900 border border-slate-300">
            {isSuperAdmin ? "Super Admin Portal" : "Admin Portal"}
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            className="h-9 px-3 bg-slate-50 hover:bg-slate-100 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 inline-flex items-center justify-center transition-all"
            onClick={onSwitchToUserPortal}
          >
            ← Companion Web Viewer
          </button>
          <button
            type="button"
            className="h-9 px-3 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg text-xs font-semibold text-red-700 inline-flex items-center justify-center transition-all"
            onClick={handleSignOutConfirm}
          >
            Sign Out
          </button>
        </div>
      </header>

      <main className="max-w-[1100px] w-full mx-auto px-4 sm:px-6 pt-9 pb-14 flex-1">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-7">
          <div>
            <span className="inline-block text-xs font-bold tracking-widest uppercase text-amber-700 mb-1.5">
              {isSuperAdmin
                ? "Platform Director Access"
                : "Recipe & Nutrition Moderator Access"}
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Administrative Account Management
            </h1>
            <p className="mt-1.5 text-sm text-slate-600">
              Manage your administrator credentials, roles, and security policies.
            </p>
          </div>
          <div>
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase border ${
                isSuperAdmin
                  ? "bg-red-100 text-red-700 border-red-200"
                  : "bg-amber-100 text-amber-800 border-amber-200"
              }`}
            >
              {isSuperAdmin ? "Super Admin" : "Standard Admin"}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Section 1: Account Information & Profile Edit */}
          <div className="w-full bg-white border border-slate-300 rounded-2xl shadow-card p-6 sm:p-8">
            <h2 className="text-lg font-bold text-slate-900">Administrator Profile</h2>
            <p className="mt-1 text-xs text-slate-600">
              Your name is attached to recipe reviews, local price updates, and activity logs.
            </p>

            {profileSuccess && (
              <div
                role="status"
                className="mt-3.5 px-3.5 py-3 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-800 text-sm"
              >
                ✓ {profileSuccess}
              </div>
            )}
            {profileError && (
              <div
                role="alert"
                className="mt-3.5 px-3.5 py-3 rounded-lg border border-red-200 bg-red-50 text-red-700 text-sm"
              >
                {profileError}
              </div>
            )}

            <form
              onSubmit={handleProfileSubmit}
              noValidate
              className="flex flex-col gap-4 mt-4"
            >
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="admin-name"
                  className="flex justify-between items-baseline text-[0.83rem] font-semibold text-slate-900"
                >
                  Display Name
                </label>
                <input
                  id="admin-name"
                  type="text"
                  className="w-full h-11 px-3.5 bg-white border border-slate-300 rounded-lg text-[0.92rem] text-slate-900 outline-none hover:border-slate-400 focus:border-amber-500 focus:shadow-amber-ring transition-all disabled:opacity-60"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  disabled={isUpdatingProfile}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="flex justify-between items-baseline text-[0.83rem] font-semibold text-slate-900">
                  Administrative Email{" "}
                  <span className="text-xs font-medium text-slate-500">
                    Managed via root console
                  </span>
                </label>
                <input
                  type="text"
                  className="w-full h-11 px-3.5 bg-slate-50 border border-slate-300 rounded-lg text-[0.92rem] text-slate-600 opacity-75 cursor-not-allowed"
                  value={user?.email || ""}
                  disabled
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="flex justify-between items-baseline text-[0.83rem] font-semibold text-slate-900">
                  Assigned Operational Role
                </label>
                <input
                  type="text"
                  className="w-full h-11 px-3.5 bg-slate-50 border border-slate-300 rounded-lg text-[0.92rem] font-semibold text-slate-700 opacity-75 cursor-not-allowed"
                  value={
                    isSuperAdmin
                      ? "Super Admin — Platform Director"
                      : "Admin — Recipe & Nutrition Moderator"
                  }
                  disabled
                />
              </div>

              <button
                type="submit"
                className="self-start mt-1 h-11 px-5 bg-amber-500 hover:bg-amber-600 border border-amber-600 rounded-lg text-[0.92rem] font-semibold text-white shadow-sm inline-flex items-center justify-center transition-all disabled:opacity-55 focus-visible:outline-none focus-visible:shadow-amber-ring"
                disabled={isUpdatingProfile}
              >
                {isUpdatingProfile ? "Saving..." : "Save Profile Changes"}
              </button>
            </form>
          </div>

          {/* Section 2: Password Management */}
          <div className="w-full bg-white border border-slate-300 rounded-2xl shadow-card p-6 sm:p-8">
            <h2 className="text-lg font-bold text-slate-900">Password & Security</h2>
            <p className="mt-1 text-xs text-slate-600">
              Update your administrative sign-in password with strict credential validation.
            </p>

            {passwordSuccess && (
              <div
                role="status"
                className="mt-3.5 px-3.5 py-3 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-800 text-sm"
              >
                ✓ {passwordSuccess}
              </div>
            )}
            {passwordError && (
              <div
                role="alert"
                className="mt-3.5 px-3.5 py-3 rounded-lg border border-red-200 bg-red-50 text-red-700 text-sm"
              >
                {passwordError}
              </div>
            )}

            <form
              onSubmit={handlePasswordSubmit}
              noValidate
              className="flex flex-col gap-4 mt-4"
            >
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="admin-current-pw"
                  className="flex justify-between items-baseline text-[0.83rem] font-semibold text-slate-900"
                >
                  Current Password
                </label>
                <PasswordInput
                  id="admin-current-pw"
                  placeholder="Enter current password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  disabled={isUpdatingPassword}
                  autoComplete="current-password"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="admin-new-pw"
                  className="flex justify-between items-baseline text-[0.83rem] font-semibold text-slate-900"
                >
                  New Password{" "}
                  <span className="text-xs font-medium text-slate-500">min. 8 characters</span>
                </label>
                <PasswordInput
                  id="admin-new-pw"
                  placeholder="Enter new strong password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={isUpdatingPassword}
                  autoComplete="new-password"
                />
                <PasswordStrengthMeter password={newPassword} />
              </div>

              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="admin-confirm-new-pw"
                  className="flex justify-between items-baseline text-[0.83rem] font-semibold text-slate-900"
                >
                  Confirm New Password
                </label>
                <PasswordInput
                  id="admin-confirm-new-pw"
                  placeholder="Re-enter new password"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  disabled={isUpdatingPassword}
                  autoComplete="new-password"
                />
              </div>

              <button
                type="submit"
                className="self-start mt-1 h-11 px-5 bg-slate-50 hover:bg-slate-100 border border-slate-300 rounded-lg text-[0.92rem] font-semibold text-slate-900 inline-flex items-center justify-center transition-all disabled:opacity-55"
                disabled={isUpdatingPassword}
              >
                {isUpdatingPassword ? "Updating..." : "Update Password"}
              </button>
            </form>
          </div>
        </div>
      </main>

      {/* Shared Confirmation Modal */}
      <ConfirmationModal
        isOpen={modalConfig.isOpen}
        onClose={() => setModalConfig((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={modalConfig.onConfirm}
        title={modalConfig.title}
        message={modalConfig.message}
        confirmText={modalConfig.confirmText}
        cancelText={modalConfig.cancelText}
        variant={modalConfig.variant}
        isLoading={isUpdatingProfile || isUpdatingPassword || isSigningOut}
      />
    </div>
  );
}
