import React, { useState } from "react";
import { updateAdminProfile, changeAdminPassword } from "../../services/adminService";
import PasswordInput from "../common/PasswordInput";
import ConfirmationModal from "../common/ConfirmationModal";
import PasswordStrengthMeter, { evaluatePasswordStrength } from "../common/PasswordStrengthMeter";

/**
 * Admin & Super Admin Profile and Account Management
 * Allows administrators to:
 * - View account metadata (UID, Role: Admin / Moderator vs. Super Admin / Platform Director)
 * - Edit administrator display name
 * - Manage and securely change account password with re-authentication
 */
export default function AdminProfile({ user, profile, onProfileUpdated, onLogout, onSwitchToUserPortal }) {
  const [displayName, setDisplayName] = useState(user?.displayName || profile?.displayName || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  const [profileSuccess, setProfileSuccess] = useState("");
  const [profileError, setProfileError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

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
        setModalConfig((prev) => ({ ...prev, isOpen: false }));
        setIsUpdatingProfile(true);
        try {
          await updateAdminProfile(user.uid, { displayName });
          setProfileSuccess("Administrator profile name updated successfully.");
          if (typeof onProfileUpdated === "function") onProfileUpdated();
        } catch (err) {
          setProfileError(err.message || "Failed to update profile.");
        } finally {
          setIsUpdatingProfile(false);
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
      setPasswordError("New password must satisfy at least 3 security criteria (minimum 8 characters).");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }

    setModalConfig({
      isOpen: true,
      title: "Confirm Password Change",
      message: "Are you sure you want to change your administrator credentials? You will need your new password for your next administrative sign-in.",
      confirmText: "Change Password",
      cancelText: "Cancel",
      variant: "danger",
      onConfirm: async () => {
        setModalConfig((prev) => ({ ...prev, isOpen: false }));
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
        }
      },
    });
  };

  const handleSignOutConfirm = () => {
    setModalConfig({
      isOpen: true,
      title: "Sign Out of KusinApp",
      message: "Are you sure you want to end your administrative session? You will need to re-authenticate to access the admin portal.",
      confirmText: "Sign Out",
      cancelText: "Cancel",
      variant: "danger",
      onConfirm: async () => {
        setModalConfig((prev) => ({ ...prev, isOpen: false }));
        if (typeof onLogout === "function") {
          await onLogout();
        }
      },
    });
  };

  return (
    <div className="k-admin-dashboard">
      <header className="k-admin-nav">
        <div className="k-admin-nav-left">
          <img
            src="/assets/kusinapp-logo-horizontal.png"
            alt="KusinApp"
            className="k-brand-img"
          />
          <span className="k-admin-portal-tag">
            {isSuperAdmin ? "Super Admin Portal" : "Admin Portal"}
          </span>
        </div>

        <div className="k-admin-nav-right">
          <button
            type="button"
            className="k-btn k-btn--outline k-btn--sm"
            onClick={onSwitchToUserPortal}
          >
            ← Companion Web Viewer
          </button>
          <button
            type="button"
            className="k-btn k-btn--ghost-danger k-btn--sm"
            onClick={handleSignOutConfirm}
          >
            Sign Out
          </button>
        </div>
      </header>

      <main className="k-admin-body">
        <div className="k-admin-header-row">
          <div>
            <span className="k-eyebrow">
              {isSuperAdmin ? "Platform Director Access" : "Recipe & Nutrition Moderator Access"}
            </span>
            <h1 className="k-title">Administrative Account Management</h1>
            <p className="k-subtitle">
              Manage your administrator credentials, roles, and security policies.
            </p>
          </div>
          <div className="k-admin-role-badge-box">
            <span className={`k-admin-badge ${isSuperAdmin ? "k-admin-badge--super" : ""}`}>
              {isSuperAdmin ? "Super Admin" : "Standard Admin"}
            </span>
          </div>
        </div>

        <div className="k-admin-grid">
          {/* Section 1: Account Information & Profile Edit */}
          <div className="k-card" style={{ maxWidth: "100%" }}>
            <h2 className="k-section-title">Administrator Profile</h2>
            <p className="k-section-desc">
              Your name is attached to recipe reviews, local price updates, and activity logs.
            </p>

            {profileSuccess && (
              <div role="status" className="k-alert k-alert--success" style={{ marginTop: "12px" }}>
                ✓ {profileSuccess}
              </div>
            )}
            {profileError && (
              <div role="alert" className="k-alert k-alert--error" style={{ marginTop: "12px" }}>
                {profileError}
              </div>
            )}

            <form onSubmit={handleProfileSubmit} noValidate className="k-form" style={{ marginTop: "16px" }}>
              <div className="k-field">
                <label htmlFor="admin-name" className="k-label">
                  Display Name
                </label>
                <input
                  id="admin-name"
                  type="text"
                  className="k-input"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  disabled={isUpdatingProfile}
                />
              </div>

              <div className="k-field">
                <label className="k-label">
                  Administrative Email <span className="k-hint">Managed via root console</span>
                </label>
                <input
                  type="text"
                  className="k-input"
                  value={user?.email || ""}
                  disabled
                  style={{ opacity: 0.7 }}
                />
              </div>

              <div className="k-field">
                <label className="k-label">Assigned Operational Role</label>
                <input
                  type="text"
                  className="k-input"
                  value={
                    isSuperAdmin
                      ? "Super Admin — Platform Director"
                      : "Admin — Recipe & Nutrition Moderator"
                  }
                  disabled
                  style={{ opacity: 0.7, fontWeight: 600 }}
                />
              </div>

              <button
                type="submit"
                className="k-btn k-btn--primary"
                style={{ alignSelf: "flex-start", marginTop: "4px" }}
                disabled={isUpdatingProfile}
              >
                {isUpdatingProfile ? "Saving..." : "Save Profile Changes"}
              </button>
            </form>
          </div>

          {/* Section 2: Password Management */}
          <div className="k-card" style={{ maxWidth: "100%" }}>
            <h2 className="k-section-title">Password & Security</h2>
            <p className="k-section-desc">
              Update your administrative sign-in password with strict credential validation.
            </p>

            {passwordSuccess && (
              <div role="status" className="k-alert k-alert--success" style={{ marginTop: "12px" }}>
                ✓ {passwordSuccess}
              </div>
            )}
            {passwordError && (
              <div role="alert" className="k-alert k-alert--error" style={{ marginTop: "12px" }}>
                {passwordError}
              </div>
            )}

            <form onSubmit={handlePasswordSubmit} noValidate className="k-form" style={{ marginTop: "16px" }}>
              <div className="k-field">
                <label htmlFor="admin-current-pw" className="k-label">
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

              <div className="k-field">
                <label htmlFor="admin-new-pw" className="k-label">
                  New Password <span className="k-hint">min. 8 characters</span>
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

              <div className="k-field">
                <label htmlFor="admin-confirm-new-pw" className="k-label">
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
                className="k-btn k-btn--outline"
                style={{ alignSelf: "flex-start", marginTop: "4px" }}
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
      />
    </div>
  );
}
