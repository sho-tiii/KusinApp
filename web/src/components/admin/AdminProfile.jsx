import React, { useState, useEffect } from "react";
import { updateAdminProfile, changeAdminPassword } from "../../services/adminService";
import { getPasswordChecks } from "../../services/authService";
import PasswordInput from "../common/PasswordInput";
import ConfirmationModal from "../common/ConfirmationModal";

const RULES = [
  ["length", "8+ characters"],
  ["upper", "Uppercase letter"],
  ["lower", "Lowercase letter"],
  ["number", "A number"],
  ["symbol", "A symbol"],
];

/**
 * Admin & Super Admin Profile and Account Management — Cohesive with KusinApp Design System.
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

  const checks = getPasswordChecks(newPassword);

  useEffect(() => {
    const resolvedName = user?.displayName || profile?.displayName || "";
    if (resolvedName) {
      setDisplayName(resolvedName);
    }
  }, [user?.displayName, profile?.displayName]);

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
  const first = (displayName || "Admin").split(" ")[0];

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
    if (!Object.values(checks).every(Boolean)) {
      setPasswordError(
        "New password must meet all 5 password requirements (8+ characters, upper, lower, number, symbol)."
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
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="sticky top-0 z-40 flex flex-wrap items-center justify-between gap-3 px-4 sm:px-7 py-3.5 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="flex items-center gap-4">
          <img
            src="/assets/kusinapp-logo-horizontal.png"
            alt="KusinApp"
            className="h-10 sm:h-11 w-auto max-w-[190px] object-contain block"
          />
          <div className="hidden sm:block h-5 w-px bg-slate-200" />
          <span className="text-xs font-extrabold tracking-wider uppercase text-amber-700">
            {isSuperAdmin ? "Super Admin Portal" : "Admin Portal"}
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            className="h-10 px-3.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 inline-flex items-center justify-center transition-all cursor-pointer"
            onClick={onSwitchToUserPortal}
          >
            ← KusinApp Web
          </button>
          <button
            type="button"
            className="h-10 px-3.5 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl text-xs font-bold text-red-700 inline-flex items-center justify-center transition-all cursor-pointer"
            onClick={handleSignOutConfirm}
          >
            Sign Out
          </button>
        </div>
      </header>

      <main className="max-w-[1060px] w-full mx-auto px-4 sm:px-6 pt-8 pb-14 flex-1">
        {/* Top Greeting Banner matching Mobile HomeScreen */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-amber-100 border-2 border-amber-200 grid place-items-center text-xl font-extrabold text-amber-800 shrink-0">
              {first[0]?.toUpperCase() || "A"}
            </div>
            <div>
              <div className="text-xs font-extrabold tracking-widest uppercase text-amber-700">
                {isSuperAdmin ? "Platform Director Access" : "Recipe & Nutrition Moderator"}
              </div>
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight leading-tight mt-0.5">
                Mabuhay, {first}!
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Manage your administrator credentials, operational role, and security policies.
              </p>
            </div>
          </div>

          <div className="text-left sm:text-right border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100 w-full sm:w-auto">
            <div className="text-[11px] font-bold tracking-wider uppercase text-slate-400">
              Access Level
            </div>
            <div className="text-sm font-extrabold text-slate-900 mt-0.5">
              ● {isSuperAdmin ? "Super Admin" : "Standard Admin"}
            </div>
            <div className="text-xs font-semibold text-emerald-600 mt-0.5">
              Connected (asia-southeast1)
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Section 1: Account Information & Profile Edit */}
          <div className="w-full bg-white border border-slate-200 rounded-3xl shadow-xs p-6 sm:p-7">
            <h2 className="text-lg font-extrabold text-slate-900">Administrator Profile</h2>
            <p className="mt-1 text-xs text-slate-500 leading-relaxed">
              Your name is attached to recipe reviews, local price updates, and activity logs.
            </p>

            {profileSuccess && (
              <div
                role="status"
                className="mt-4 px-3.5 py-3 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-800 text-xs font-semibold"
              >
                ✓ {profileSuccess}
              </div>
            )}
            {profileError && (
              <div
                role="alert"
                className="mt-4 px-3.5 py-3 rounded-xl border border-red-200 bg-red-50 text-red-700 text-xs font-semibold"
              >
                {profileError}
              </div>
            )}

            <form
              onSubmit={handleProfileSubmit}
              noValidate
              className="flex flex-col gap-4 mt-5"
            >
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="admin-name"
                  className="text-xs font-bold tracking-wider uppercase text-slate-800"
                >
                  Display Name
                </label>
                <input
                  id="admin-name"
                  type="text"
                  className="w-full h-12 px-3.5 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-[0.95rem] text-slate-900 outline-none hover:border-slate-300 focus:border-amber-500 focus:shadow-amber-ring transition-all disabled:opacity-60"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  disabled={isUpdatingProfile}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="flex justify-between items-baseline text-xs font-bold tracking-wider uppercase text-slate-800">
                  <span>Administrative Email</span>
                  <span className="text-[11px] font-medium normal-case text-slate-400">
                    Managed via root console
                  </span>
                </label>
                <input
                  type="text"
                  className="w-full h-12 px-3.5 bg-slate-100 border border-slate-200 rounded-xl text-[0.95rem] text-slate-500 cursor-not-allowed"
                  value={user?.email || ""}
                  disabled
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold tracking-wider uppercase text-slate-800">
                  Assigned Operational Role
                </label>
                <input
                  type="text"
                  className="w-full h-12 px-3.5 bg-slate-100 border border-slate-200 rounded-xl text-[0.95rem] font-bold text-slate-700 cursor-not-allowed"
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
                className="w-full sm:w-auto self-start mt-2 h-12 px-6 bg-amber-500 hover:bg-amber-600 rounded-2xl text-sm font-bold text-white shadow-sm inline-flex items-center justify-center transition-all disabled:opacity-55 cursor-pointer"
                disabled={isUpdatingProfile}
              >
                {isUpdatingProfile ? "Saving..." : "Save Profile Changes"}
              </button>
            </form>
          </div>

          {/* Section 2: Password Management */}
          <div className="w-full bg-white border border-slate-200 rounded-3xl shadow-xs p-6 sm:p-7">
            <h2 className="text-lg font-extrabold text-slate-900">Password & Security</h2>
            <p className="mt-1 text-xs text-slate-500 leading-relaxed">
              Update your administrative sign-in password with strict credential validation.
            </p>

            {passwordSuccess && (
              <div
                role="status"
                className="mt-4 px-3.5 py-3 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-800 text-xs font-semibold"
              >
                ✓ {passwordSuccess}
              </div>
            )}
            {passwordError && (
              <div
                role="alert"
                className="mt-4 px-3.5 py-3 rounded-xl border border-red-200 bg-red-50 text-red-700 text-xs font-semibold"
              >
                {passwordError}
              </div>
            )}

            <form
              onSubmit={handlePasswordSubmit}
              noValidate
              className="flex flex-col gap-4 mt-5"
            >
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="admin-current-pw"
                  className="text-xs font-bold tracking-wider uppercase text-slate-800"
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
                  className="text-xs font-bold tracking-wider uppercase text-slate-800"
                >
                  New Password
                </label>
                <PasswordInput
                  id="admin-new-pw"
                  placeholder="Enter new strong password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={isUpdatingPassword}
                  autoComplete="new-password"
                />
              </div>

              {/* Password requirements box matching mobile SignupScreen */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="text-xs font-bold text-slate-700 mb-2">
                  Password requirements:
                </div>
                <div className="grid grid-cols-2 gap-y-1.5 gap-x-2">
                  {RULES.map(([key, label]) => {
                    const ok = checks[key];
                    return (
                      <div key={key} className="flex items-center gap-2">
                        <span
                          className={`w-3.5 h-3.5 rounded-full grid place-items-center text-[9px] font-extrabold transition-colors ${
                            ok
                              ? "bg-emerald-600 text-white"
                              : "bg-slate-200 text-transparent"
                          }`}
                        >
                          ✓
                        </span>
                        <span
                          className={`text-xs transition-colors ${
                            ok ? "text-emerald-700 font-semibold" : "text-slate-500"
                          }`}
                        >
                          {label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="admin-confirm-new-pw"
                  className="text-xs font-bold tracking-wider uppercase text-slate-800"
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
                className="w-full sm:w-auto self-start mt-1 h-12 px-6 bg-slate-900 hover:bg-slate-800 rounded-2xl text-sm font-bold text-white inline-flex items-center justify-center transition-all disabled:opacity-55 cursor-pointer"
                disabled={isUpdatingPassword}
              >
                {isUpdatingPassword ? "Updating..." : "Update Password"}
              </button>
            </form>
          </div>
        </div>
      </main>

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
