import React, { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./config/firebase";
import { getUserProfile, logoutUser } from "./services/authService";
import Register from "./components/auth/Register";
import Login from "./components/auth/Login";
import ForgotPassword from "./components/auth/ForgotPassword";
import Onboarding from "./components/onboarding/Onboarding";
import ConfirmationModal from "./components/common/ConfirmationModal";
import AdminLogin from "./components/admin/AdminLogin";
import AdminProfile from "./components/admin/AdminProfile";

const PERSONA_LABELS = {
  solo_eater: "The Solo Eater",
  household_provider: "The Household Provider",
  health_targeted_eater: "The Health-Targeted Eater",
};

const GOAL_LABELS = {
  maintain: "Maintain Weight",
  lose: "Lose Weight",
  gain: "Gain Weight / Muscle",
};

const CONDITION_LABELS = {
  none: "None",
  hypertension: "Hypertension",
  diabetes: "Diabetes",
  high_cholesterol: "High Cholesterol",
  hyperuricemia_gout: "Gout",
  gerd_acid_reflux: "Acid Reflux / GERD",
};

const capitalize = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : "—");

export default function App() {
  // Portal navigation: 'user' (Companion Web Viewer) or 'admin' (Admin / Super Admin Portal)
  const [portal, setPortal] = useState("user");
  const [activeTab, setActiveTab] = useState("login");
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isRetaking, setIsRetaking] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Sync portal state with URL query parameter (?portal=admin) on mount & browser back/forward
  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    const syncPortalFromUrl = () => {
      const params = new URLSearchParams(window.location.search);
      setPortal(params.get("portal") === "admin" ? "admin" : "user");
    };

    syncPortalFromUrl();
    window.addEventListener("popstate", syncPortalFromUrl);
    return () => window.removeEventListener("popstate", syncPortalFromUrl);
  }, []);

  // Sync portal query param
  const switchPortal = (targetPortal) => {
    setPortal(targetPortal);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      if (targetPortal === "admin") {
        url.searchParams.set("portal", "admin");
      } else {
        url.searchParams.delete("portal");
      }
      window.history.pushState({}, "", url.toString());
    }
  };

  // Reusable confirmation modal state
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    title: "",
    message: "",
    confirmText: "Confirm",
    cancelText: "Cancel",
    variant: "danger",
    onConfirm: () => {},
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user || null);
      if (user) {
        setIsLoadingProfile(true);
        try {
          setUserProfile(await getUserProfile(user.uid));
        } catch (err) {
          console.error("Error fetching user profile:", err);
        }
      } else {
        setUserProfile(null);
      }
      setIsLoadingProfile(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logoutUser();
      setCurrentUser(null);
      setUserProfile(null);
      setIsRetaking(false);
      setActiveTab("login");
    } catch (err) {
      console.error("Error logging out:", err);
    } finally {
      setIsLoggingOut(false);
      setModalConfig((prev) => ({ ...prev, isOpen: false }));
    }
  };

  const confirmLogout = () => {
    setModalConfig({
      isOpen: true,
      title: "Sign Out of KusinApp",
      message: "Are you sure you want to log out? Your active session will be ended securely.",
      confirmText: "Log Out",
      cancelText: "Cancel",
      variant: "danger",
      onConfirm: handleLogout,
    });
  };

  const confirmRetakeOnboarding = () => {
    setModalConfig({
      isOpen: true,
      title: "Retake Health Assessment",
      message:
        "You are about to re-evaluate your physical metrics, target audience, and cooking skill level. Would you like to proceed?",
      confirmText: "Retake",
      cancelText: "Keep Current",
      variant: "primary",
      onConfirm: () => {
        setIsRetaking(true);
        setModalConfig((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  const handleOnboardingComplete = async () => {
    if (currentUser) {
      setUserProfile(await getUserProfile(currentUser.uid));
    }
    setIsRetaking(false);
  };

  const displayName =
    currentUser?.displayName || userProfile?.displayName || currentUser?.email || "";
  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");

  const isAdminOrSuper =
    userProfile?.role === "admin" || userProfile?.role === "super_admin";
  const showOnboarding =
    currentUser && !isLoadingProfile && (!userProfile?.onboardingCompleted || isRetaking);
  const ob = userProfile?.onboarding;

  // =========================================================================
  // VIEW 1: ADMIN & SUPER ADMIN PORTAL
  // =========================================================================
  if (portal === "admin") {
    if (!currentUser || !isAdminOrSuper) {
      return (
        <AdminLogin
          onLoginSuccess={(user, profile) => {
            setCurrentUser(user);
            setUserProfile(profile);
          }}
          onSwitchToUserPortal={() => switchPortal("user")}
        />
      );
    }

    return (
      <AdminProfile
        user={currentUser}
        profile={userProfile}
        onProfileUpdated={async () => {
          if (currentUser) setUserProfile(await getUserProfile(currentUser.uid));
        }}
        onLogout={handleLogout}
        onSwitchToUserPortal={() => switchPortal("user")}
      />
    );
  }

  // =========================================================================
  // VIEW 2: COMPANION WEB VIEWER & USER PORTAL
  // =========================================================================
  return (
    <div className="flex-1 flex flex-col min-h-screen bg-kusinapp-ambient">
      <header className="sticky top-0 z-40 flex items-center justify-between px-4 sm:px-7 py-3.5 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
        <div className="flex items-center">
          <img
            src="/assets/kusinapp-logo-horizontal.png"
            alt="KusinApp"
            className="h-10 sm:h-13 w-auto max-w-[180px] sm:max-w-[240px] object-contain block"
          />
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          {/* Admin Switch Shortcut */}
          <button
            type="button"
            className="h-9 px-3 bg-slate-50 hover:bg-slate-100 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 inline-flex items-center justify-center transition-all"
            onClick={() => switchPortal("admin")}
            title="Switch to Admin / Super Admin Portal"
          >
            Admin Portal ↗
          </button>

          {currentUser && (
            <div className="flex items-center gap-2.5">
              <span
                className="grid place-items-center w-9 h-9 rounded-full bg-amber-100 text-amber-800 font-bold text-sm border border-amber-200"
                aria-hidden="true"
              >
                {initials || "K"}
              </span>
              <div className="hidden sm:flex flex-col">
                <div className="text-sm font-bold text-slate-900 leading-tight">
                  {displayName}
                </div>
                <div className="text-xs text-slate-500">
                  {capitalize(userProfile?.role || "user")}
                </div>
              </div>
              <button
                type="button"
                className="h-9 px-3 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg text-xs font-semibold text-red-700 inline-flex items-center justify-center transition-all"
                onClick={confirmLogout}
              >
                Log Out
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="flex-1 flex justify-center items-start px-3 sm:px-4 pt-6 sm:pt-10 pb-12 sm:pb-14">
        {!currentUser && (
          <div className="w-full max-w-[440px] bg-white border border-slate-300 rounded-2xl shadow-card p-6 sm:p-8">
            {activeTab !== "forgot" && (
              <div
                className="grid grid-cols-2 gap-1 p-1 mb-6 bg-slate-200/80 rounded-xl"
                role="tablist"
                aria-label="Account access"
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeTab === "login"}
                  className={`py-2 px-3 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                    activeTab === "login"
                      ? "bg-white text-slate-900 shadow-xs"
                      : "bg-transparent text-slate-600 hover:text-slate-900"
                  }`}
                  onClick={() => setActiveTab("login")}
                >
                  Log In
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeTab === "register"}
                  className={`py-2 px-3 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                    activeTab === "register"
                      ? "bg-white text-slate-900 shadow-xs"
                      : "bg-transparent text-slate-600 hover:text-slate-900"
                  }`}
                  onClick={() => setActiveTab("register")}
                >
                  Sign Up
                </button>
              </div>
            )}

            {activeTab === "register" ? (
              <Register onNavigateToLogin={() => setActiveTab("login")} />
            ) : activeTab === "forgot" ? (
              <ForgotPassword onBackToLogin={() => setActiveTab("login")} />
            ) : (
              <Login
                onNavigateToRegister={() => setActiveTab("register")}
                onNavigateToForgot={() => setActiveTab("forgot")}
              />
            )}
          </div>
        )}

        {currentUser && isLoadingProfile && (
          <div className="w-full max-w-[440px] bg-white border border-slate-300 rounded-2xl shadow-card p-8">
            <div className="flex justify-center py-10 text-slate-500 text-sm">
              Loading your profile…
            </div>
          </div>
        )}

        {showOnboarding && (
          <div className="w-full max-w-[640px] bg-white border border-slate-300 rounded-2xl shadow-card p-6 sm:p-8">
            <Onboarding
              user={currentUser}
              initialData={isRetaking ? ob : undefined}
              onComplete={handleOnboardingComplete}
              onCancel={isRetaking ? () => setIsRetaking(false) : undefined}
            />
          </div>
        )}

        {currentUser && !isLoadingProfile && !showOnboarding && (
          <div className="w-full max-w-[640px] bg-white border border-slate-300 rounded-2xl shadow-card p-6 sm:p-8">
            <div className="text-center mb-6">
              <span className="inline-block text-xs font-bold tracking-widest uppercase text-amber-700 mb-1.5">
                Mabuhay, {displayName.split(" ")[0]}!
              </span>
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight leading-tight">
                Your KusinApp Profile
              </h1>
              <p className="mt-1.5 text-sm text-slate-600 leading-relaxed">
                Your onboarding assessment is saved and ready for meal planning.
              </p>
            </div>

            <div
              className="px-3.5 py-3 mb-4 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-800 text-sm"
              role="status"
            >
              ✓ Onboarding complete — your health profile is synced to your account.
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="p-3.5 bg-slate-50 border border-slate-300 rounded-xl">
                <div className="text-[0.72rem] font-bold tracking-wider uppercase text-slate-500">
                  BMI
                </div>
                <div className="mt-1 text-xl font-extrabold text-slate-900">
                  {ob?.bmi ?? "—"}
                </div>
                <div className="text-xs font-semibold text-amber-700">{ob?.bmiCategory}</div>
              </div>
              <div className="p-3.5 bg-slate-50 border border-slate-300 rounded-xl">
                <div className="text-[0.72rem] font-bold tracking-wider uppercase text-slate-500">
                  Base BMR
                </div>
                <div className="mt-1 text-xl font-extrabold text-slate-900">
                  ~{ob?.bmr ?? "—"}
                </div>
                <div className="text-xs font-semibold text-slate-500">kcal / day</div>
              </div>
              <div className="col-span-2 sm:col-span-1 p-3.5 bg-slate-50 border border-slate-300 rounded-xl">
                <div className="text-[0.72rem] font-bold tracking-wider uppercase text-slate-500">
                  Goal
                </div>
                <div className="mt-2 text-base font-extrabold text-slate-900">
                  {GOAL_LABELS[ob?.weightGoal] || "—"}
                </div>
              </div>
            </div>

            <ul className="mt-4 p-0 list-none border border-slate-300 rounded-xl overflow-hidden bg-white divide-y divide-slate-200">
              <li className="flex justify-between gap-3 px-4 py-3 text-sm">
                <span className="text-slate-500 font-medium">Profile Persona</span>
                <span className="text-slate-900 font-semibold text-right">
                  {PERSONA_LABELS[ob?.userPersona] || "—"}
                </span>
              </li>
              <li className="flex justify-between gap-3 px-4 py-3 text-sm">
                <span className="text-slate-500 font-medium">Age & Sex</span>
                <span className="text-slate-900 font-semibold text-right">
                  {ob?.age} yrs · {capitalize(ob?.gender)}
                </span>
              </li>
              <li className="flex justify-between gap-3 px-4 py-3 text-sm">
                <span className="text-slate-500 font-medium">Height & Weight</span>
                <span className="text-slate-900 font-semibold text-right">
                  {ob?.heightCm} cm · {ob?.weightKg} kg
                </span>
              </li>
              <li className="flex justify-between gap-3 px-4 py-3 text-sm">
                <span className="text-slate-500 font-medium">Household Size</span>
                <span className="text-slate-900 font-semibold text-right">
                  {ob?.householdSize} pax
                </span>
              </li>
              <li className="flex justify-between gap-3 px-4 py-3 text-sm">
                <span className="text-slate-500 font-medium">Cooking Skill</span>
                <span className="text-slate-900 font-semibold text-right">
                  {capitalize(ob?.cookingSkill)}
                </span>
              </li>
              <li className="flex justify-between gap-3 px-4 py-3 text-sm">
                <span className="text-slate-500 font-medium">Health Conditions</span>
                <span className="text-slate-900 font-semibold text-right">
                  {(ob?.comorbidities || ["none"])
                    .map((c) => CONDITION_LABELS[c] || c)
                    .join(", ")}
                </span>
              </li>
            </ul>

            <button
              type="button"
              className="w-full mt-5 h-11 px-4 bg-slate-50 hover:bg-slate-100 border border-slate-300 rounded-lg text-[0.92rem] font-semibold text-slate-900 inline-flex items-center justify-center transition-all"
              onClick={confirmRetakeOnboarding}
            >
              ↻ Retake Onboarding Assessment
            </button>
          </div>
        )}
      </main>

      <footer className="text-center text-xs text-slate-500 py-6 px-4 border-t border-slate-200 bg-white/75">
        © 2026 KusinApp · Lasang Pinoy sa Bawat Luto.
      </footer>

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
        isLoading={isLoggingOut}
      />
    </div>
  );
}