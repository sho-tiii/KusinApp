import React, { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./config/firebase";
import {
  getUserProfile,
  logoutUser,
  skipUserOnboarding,
  resendVerificationLink,
} from "./services/authService";
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

const SLIDES = [
  {
    key: "welcome",
    title: null,
    image: "/assets/welcome-family.png",
    caption: "Your personal digital sous-chef to make hard days easy.",
  },
  {
    key: "recipes",
    title: "Easy Recipes for you",
    image: "/assets/onboard-cooking.png",
    caption: "Discover delicious, budget-friendly local meals tailored to your pantry.",
  },
  {
    key: "time",
    title: "Save your time and energy",
    image: "/assets/onboard-bowl.png",
    caption: "Smart grocery lists and auto-tracking that do the thinking for you.",
  },
];

const SETUP_ITEMS = [
  ["table", "Your table", "Who you're cooking for"],
  ["heart", "Your health", "Your goal, allergies, and health conditions"],
  ["taste", "Your taste", "The dishes and flavours you love"],
];

const SAMPLE_RECIPES = [
  {
    name: "Chicken Tinola sa Luya at Malunggay",
    region: "Tagalog Homestyle",
    kcal: "320 kcal / serving",
    tags: ["Low Sodium Option", "High Protein", "Beginner"],
    desc: "Warm ginger broth simmered with native chicken, green papaya, and nutrient-dense malunggay leaves.",
  },
  {
    name: "Ginisang Monggo with Tinapa & Ampalaya",
    region: "Ilocano / Luzon",
    kcal: "290 kcal / serving",
    tags: ["High Fiber", "Budget Friendly", "Diabetic Friendly"],
    desc: "Hearty mung bean stew enriched with smoked fish flakes, garlic, tomatoes, and young bitter melon leaves.",
  },
  {
    name: "Sinigang na Bangus sa Sampalok",
    region: "Central Luzon",
    kcal: "340 kcal / serving",
    tags: ["Heart Healthy", "Omega-3", "No Pork"],
    desc: "Milkfish belly in a bright, savory tamarind broth loaded with kangkong, radish, sitaw, and okra.",
  },
  {
    name: "Pinakbet Ilocano sa Kamatis",
    region: "Northern Luzon",
    kcal: "240 kcal / serving",
    tags: ["Vegetable Forward", "Low Calorie", "Quick & Easy"],
    desc: "Garden-fresh kalabasa, sitaw, talong, ampalaya, and okra braised in heirloom tomatoes and aromatics.",
  },
];

const capitalize = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : "—");

export default function App() {
  const [portal, setPortal] = useState("user");
  const [navSection, setNavSection] = useState("home"); // 'home' | 'catalog' | 'about'
  const [activeTab, setActiveTab] = useState("login");
  const [slideIdx, setSlideIdx] = useState(0);

  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  // Post-signup / onboarding flow states mirroring mobile App.js:
  // 'verifyLink' -> 'setupIntro' -> 'onboarding' -> 'allSet' -> 'home'
  const [flowStep, setFlowStep] = useState(null);
  const [pendingVerifyEmail, setPendingVerifyEmail] = useState("");
  const [resendingVerify, setResendingVerify] = useState(false);
  const [verifyNotice, setVerifyNotice] = useState("");
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [mobileAppModalOpen, setMobileAppModalOpen] = useState(false);

  // Auto-advance welcome carousel slides every 3.4s
  useEffect(() => {
    if (currentUser) return undefined;
    const t = setInterval(() => {
      setSlideIdx((prev) => (prev + 1) % SLIDES.length);
    }, 3400);
    return () => clearInterval(t);
  }, [currentUser]);

  // Sync portal state with URL query parameter (?portal=admin)
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
          const p = await getUserProfile(user.uid);
          setUserProfile(p);
          setFlowStep((prev) => {
            if (prev === "verifyLink" || prev === "onboarding" || prev === "allSet") {
              return prev;
            }
            if (!p?.onboardingCompleted && !p?.onboardingSkipped) {
              return "setupIntro";
            }
            return "home";
          });
        } catch (err) {
          console.error("Error fetching user profile:", err);
        }
      } else {
        setUserProfile(null);
        setFlowStep(null);
      }
      setIsLoadingProfile(false);
    });
    return () => unsubscribe();
  }, []);

  const refreshProfile = async () => {
    if (currentUser) {
      setUserProfile(await getUserProfile(currentUser.uid));
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logoutUser();
      setCurrentUser(null);
      setUserProfile(null);
      setFlowStep(null);
      setActiveTab("login");
      setNavSection("home");
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
      title: "Update Kusina Preferences",
      message:
        "You are about to update your household size, dietary restrictions, comorbidities, and health goals. Would you like to proceed?",
      confirmText: "Update Setup",
      cancelText: "Keep Current",
      variant: "primary",
      onConfirm: () => {
        setNavSection("home");
        setFlowStep("onboarding");
        setModalConfig((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  const handleSkipSetupLater = async () => {
    try {
      await skipUserOnboarding(currentUser?.uid);
    } catch (_e) {
      // non-blocking
    }
    await refreshProfile();
    setFlowStep("home");
  };

  const handleResendVerification = async () => {
    if (resendingVerify) return;
    setResendingVerify(true);
    setVerifyNotice("");
    try {
      await resendVerificationLink(currentUser);
      setVerifyNotice("A fresh verification link has been sent to your email.");
    } catch (e) {
      setVerifyNotice(e.message || "Could not resend verification link.");
    } finally {
      setResendingVerify(false);
    }
  };

  const displayName =
    currentUser?.displayName || userProfile?.displayName || currentUser?.email || "";
  const first = (displayName || "Chef").split(" ")[0];
  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");

  const isAdminOrSuper =
    userProfile?.role === "admin" || userProfile?.role === "super_admin";
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
        onProfileUpdated={refreshProfile}
        onLogout={handleLogout}
        onSwitchToUserPortal={() => switchPortal("user")}
      />
    );
  }

  const activeSlide = SLIDES[slideIdx] || SLIDES[0];

  // =========================================================================
  // VIEW 2: UNIFIED KUSINAPP WEB & COMPANION PORTAL
  // =========================================================================
  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#FAF8F4]">
      {/* ================================================================= */}
      {/* NAVBAR (Exact match to image_2.png)                               */}
      {/* ================================================================= */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-100 shadow-[0_2px_12px_rgba(16,24,40,0.03)]">
        <div className="max-w-[1240px] mx-auto px-5 sm:px-8 h-20 flex items-center justify-between gap-4">
          {/* Left: KusinApp Horizontal Logo */}
          <button
            type="button"
            onClick={() => setNavSection("home")}
            className="border-0 bg-transparent p-0 flex items-center cursor-pointer"
          >
            <img
              src="/assets/kusinapp-logo-horizontal.png"
              alt="KusinApp"
              className="h-12 sm:h-14 w-auto object-contain block"
            />
          </button>

          {/* Center: Navigation Links (Home | Recipe Catalog | About us) */}
          <nav
            className="hidden md:flex items-center gap-9"
            aria-label="Primary Navigation"
          >
            {[
              ["home", "Home"],
              ["catalog", "Recipe Catalog"],
              ["about", "About us"],
            ].map(([id, label]) => {
              const active = navSection === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setNavSection(id)}
                  className={`border-0 bg-transparent p-0 text-[0.95rem] transition-colors cursor-pointer ${
                    active
                      ? "font-extrabold text-slate-900"
                      : "font-semibold text-slate-500 hover:text-slate-900"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </nav>

          {/* Right: Log In (or User Avatar) + Red Get Mobile App Pill Button */}
          <div className="flex items-center gap-4 sm:gap-6">
            {!currentUser ? (
              <button
                type="button"
                onClick={() => {
                  setNavSection("home");
                  setActiveTab("login");
                }}
                className="border-0 bg-transparent p-0 text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
              >
                Log In
              </button>
            ) : (
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setNavSection("home")}
                  className="border-0 bg-transparent p-0 flex items-center gap-2 cursor-pointer"
                >
                  <span
                    className="grid place-items-center w-9 h-9 rounded-full bg-amber-100 text-amber-800 font-extrabold text-xs border border-amber-200"
                    aria-hidden="true"
                  >
                    {initials || "K"}
                  </span>
                  <span className="hidden sm:inline text-xs font-extrabold text-slate-900">
                    {first}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={confirmLogout}
                  className="border-0 bg-transparent p-0 text-xs font-bold text-slate-500 hover:text-red-600 transition-colors cursor-pointer ml-1"
                >
                  Sign Out
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={() => setMobileAppModalOpen(true)}
              className="h-11 px-5 rounded-full bg-[#D92D20] hover:bg-[#B42318] text-white text-xs sm:text-sm font-extrabold inline-flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
            >
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
                <line x1="12" y1="18" x2="12.01" y2="18" />
              </svg>
              <span>Get Mobile App</span>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 flex justify-center items-center px-3 sm:px-6 py-6 sm:py-10">
        {/* =============================================================== */}
        {/* NAV SECTION: RECIPE CATALOG                                     */}
        {/* =============================================================== */}
        {navSection === "catalog" && (
          <div className="w-full max-w-[980px] bg-white border border-slate-200 rounded-3xl shadow-card p-6 sm:p-10">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
              <div>
                <div className="text-xs font-extrabold tracking-widest uppercase text-amber-700 mb-1.5">
                  KusinApp Culinary Library
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  Filipino Homestyle Recipe Catalog
                </h1>
                <p className="text-sm text-slate-500 mt-1">
                  Balanced regional Filipino dishes tailored to your calorie goals, allergies, and health conditions.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setNavSection("home")}
                className="self-start sm:self-auto h-10 px-5 rounded-full bg-amber-500 hover:bg-amber-600 text-white text-xs font-extrabold transition-all cursor-pointer"
              >
                {currentUser ? "Back to My Profile" : "Sign In to Personalize"}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {SAMPLE_RECIPES.map((r) => (
                <div
                  key={r.name}
                  className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-amber-400 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 text-xs font-bold text-amber-700 mb-1">
                      <span>{r.region}</span>
                      <span>{r.kcal}</span>
                    </div>
                    <h2 className="text-lg font-extrabold text-slate-900">{r.name}</h2>
                    <p className="text-xs text-slate-600 leading-relaxed mt-1.5">{r.desc}</p>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-4">
                    {r.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-[11px] font-bold text-slate-700"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* =============================================================== */}
        {/* NAV SECTION: ABOUT US                                           */}
        {/* =============================================================== */}
        {navSection === "about" && (
          <div className="w-full max-w-[820px] bg-white border border-slate-200 rounded-3xl shadow-card p-6 sm:p-10">
            <div className="text-center max-w-[600px] mx-auto">
              <img
                src="/assets/setup-kusina.png"
                alt="KusinApp Family Kitchen"
                className="w-44 h-44 object-contain mx-auto mb-4"
              />
              <div className="text-xs font-extrabold tracking-widest uppercase text-amber-700 mb-1.5">
                About KusinApp
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Your Personal Digital Sous-Chef for the Filipino Kitchen
              </h1>
              <p className="text-sm text-slate-600 leading-relaxed mt-3">
                KusinApp combines traditional Filipino home cooking with smart nutrition and pantry management. Whether you are cooking solo or providing for an entire household, KusinApp computes your BMI and daily BMR while filtering recipes around allergies and health conditions like hypertension, diabetes, high cholesterol, gout, and acid reflux.
              </p>
              <button
                type="button"
                onClick={() => setNavSection("home")}
                className="mt-6 h-11 px-6 rounded-full bg-amber-500 hover:bg-amber-600 text-white text-sm font-extrabold transition-all cursor-pointer"
              >
                Return to Home →
              </button>
            </div>
          </div>
        )}

        {/* =============================================================== */}
        {/* NAV SECTION: HOME (AUTH + ONBOARDING + PROFILE)                 */}
        {/* =============================================================== */}
        {navSection === "home" && !currentUser && (
          <div className="w-full max-w-[960px] bg-white border border-slate-200/80 rounded-[28px] shadow-card overflow-hidden grid grid-cols-1 lg:grid-cols-12">
            {/* Left Column: Welcome Carousel matching Mobile WelcomeScreen */}
            <div className="lg:col-span-6 p-6 sm:p-10 bg-[#FCFBF7] border-b lg:border-b-0 lg:border-r border-slate-100 flex flex-col items-center justify-between text-center">
              <div className="min-h-[84px] flex flex-col items-center justify-center">
                {activeSlide.title ? (
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
                    {activeSlide.title}
                  </h2>
                ) : (
                  <div className="flex flex-col items-center">
                    <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                      Welcome to
                    </span>
                    <img
                      src="/assets/kusinapp-wordmark.png"
                      alt="KusinApp"
                      className="h-11 w-auto object-contain mt-1"
                    />
                  </div>
                )}
              </div>

              <div className="relative my-4 w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center">
                <div className="absolute inset-3 rounded-full bg-amber-100/70" />
                <img
                  key={activeSlide.key}
                  src={activeSlide.image}
                  alt="KusinApp Welcome"
                  className="relative w-56 h-56 sm:w-64 sm:h-64 object-contain transition-all duration-300"
                />
              </div>

              <div>
                <p className="text-sm text-slate-600 max-w-[300px] mx-auto leading-relaxed">
                  {activeSlide.caption}
                </p>

                {/* Interactive Carousel Indicators */}
                <div className="flex items-center justify-center gap-2 mt-5">
                  {SLIDES.map((s, i) => (
                    <button
                      key={s.key}
                      type="button"
                      onClick={() => setSlideIdx(i)}
                      aria-label={`Slide ${i + 1}`}
                      className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                        slideIdx === i
                          ? "w-7 bg-slate-900"
                          : "w-2 bg-indigo-200 hover:bg-indigo-300"
                      }`}
                    />
                  ))}
                </div>
                <div className="text-[11.5px] text-slate-400 mt-4">
                  Cook with joy • Less prep, zero stress
                </div>
              </div>
            </div>

            {/* Right Column: Login / Sign Up / Forgot Password (Exact match to image.png) */}
            <div className="lg:col-span-6 p-6 sm:p-10 flex flex-col justify-center bg-white">
              {activeTab !== "forgot" && (
                <div
                  className="grid grid-cols-2 gap-1.5 p-1.5 mb-7 bg-slate-100/90 rounded-2xl"
                  role="tablist"
                  aria-label="Account access"
                >
                  <button
                    type="button"
                    role="tab"
                    aria-selected={activeTab === "login"}
                    className={`py-2.5 px-3 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer ${
                      activeTab === "login"
                        ? "bg-white text-slate-900 shadow-xs"
                        : "bg-transparent text-slate-500 hover:text-slate-900"
                    }`}
                    onClick={() => setActiveTab("login")}
                  >
                    LOG IN
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={activeTab === "register"}
                    className={`py-2.5 px-3 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer ${
                      activeTab === "register"
                        ? "bg-white text-slate-900 shadow-xs"
                        : "bg-transparent text-slate-500 hover:text-slate-900"
                    }`}
                    onClick={() => setActiveTab("register")}
                  >
                    SIGN UP
                  </button>
                </div>
              )}

              {activeTab === "register" ? (
                <Register
                  onNavigateToLogin={() => setActiveTab("login")}
                  onRegisterSuccess={(_user, registeredEmail, isGoogle) => {
                    if (isGoogle) {
                      setFlowStep("setupIntro");
                    } else {
                      setPendingVerifyEmail(registeredEmail || "");
                      setFlowStep("verifyLink");
                    }
                  }}
                />
              ) : activeTab === "forgot" ? (
                <ForgotPassword onBackToLogin={() => setActiveTab("login")} />
              ) : (
                <Login
                  onNavigateToRegister={() => setActiveTab("register")}
                  onNavigateToForgot={() => setActiveTab("forgot")}
                />
              )}
            </div>
          </div>
        )}

        {/* =============================================================== */}
        {/* LOADING PROFILE                                                 */}
        {/* =============================================================== */}
        {navSection === "home" && currentUser && isLoadingProfile && (
          <div className="w-full max-w-[460px] bg-white border border-slate-200 rounded-3xl shadow-card p-10 text-center">
            <div className="text-sm font-semibold text-slate-500">
              Syncing your KusinApp kitchen profile…
            </div>
          </div>
        )}

        {/* =============================================================== */}
        {/* STEP A: CHECK YOUR EMAIL LINK (Matches Mobile VerifyScreen)     */}
        {/* =============================================================== */}
        {navSection === "home" && currentUser && !isLoadingProfile && flowStep === "verifyLink" && (
          <div className="w-full max-w-[460px] bg-white border border-slate-200 rounded-3xl shadow-card p-6 sm:p-8 text-center">
            <div className="w-18 h-18 rounded-full bg-indigo-50 grid place-items-center mx-auto mb-4 relative">
              <div className="w-13 h-13 rounded-full bg-amber-200 grid place-items-center text-amber-800">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
              </div>
              <span className="absolute top-0 right-0 w-5 h-5 rounded-full bg-lime-600 text-white text-[10px] font-extrabold grid place-items-center border-2 border-white">
                ✓
              </span>
            </div>

            <h1 className="text-2xl font-extrabold text-slate-900">Check Your Email</h1>
            <p className="text-sm text-slate-500 mt-2">
              We sent a verification link to your email address:
            </p>
            <div className="text-base font-extrabold text-slate-900 mt-1">
              {pendingVerifyEmail || currentUser.email}
            </div>

            <div className="text-left p-4 my-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 text-xs text-slate-600">
              <div className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-amber-100 border border-amber-300 text-amber-800 font-extrabold text-[11px] grid place-items-center shrink-0">
                  1
                </span>
                <span>Open the email from KusinApp in your inbox or spam folder.</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-amber-100 border border-amber-300 text-amber-800 font-extrabold text-[11px] grid place-items-center shrink-0">
                  2
                </span>
                <span>
                  Click the verification link inside the email to activate your account, then click Continue below.
                </span>
              </div>
            </div>

            {verifyNotice && (
              <div className="px-3.5 py-2.5 mb-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold">
                {verifyNotice}
              </div>
            )}

            <button
              type="button"
              onClick={() => setFlowStep("setupIntro")}
              className="w-full h-13 bg-amber-500 hover:bg-amber-600 rounded-full text-base font-extrabold text-white shadow-[0_8px_20px_-4px_rgba(245,158,11,0.45)] transition-all cursor-pointer"
            >
              Continue to Kusina Setup →
            </button>

            <button
              type="button"
              onClick={handleResendVerification}
              disabled={resendingVerify}
              className="mt-4 border-0 bg-transparent text-xs font-bold text-amber-700 hover:underline cursor-pointer disabled:opacity-50"
            >
              {resendingVerify ? "Sending link..." : "Didn't receive the email? Resend link"}
            </button>
          </div>
        )}

        {/* =============================================================== */}
        {/* STEP B: SETUP INTRO SCREEN (Matches Mobile SetupIntroScreen)    */}
        {/* =============================================================== */}
        {navSection === "home" && currentUser && !isLoadingProfile && flowStep === "setupIntro" && (
          <div className="w-full max-w-[460px] bg-white border border-slate-200 rounded-3xl shadow-card p-6 sm:p-8">
            <div className="flex justify-center mb-2">
              <img
                src="/assets/setup-kusina.png"
                alt="Set up your kusina"
                className="w-48 h-48 object-contain"
              />
            </div>

            <h1 className="text-2xl font-extrabold text-slate-900 text-center leading-snug">
              Let&apos;s set up your kusina,
              <br />
              {first}
            </h1>

            <div className="flex flex-col gap-2.5 my-5">
              {SETUP_ITEMS.map(([icon, title, desc]) => (
                <div
                  key={title}
                  className="flex items-center gap-3.5 p-3 rounded-2xl bg-slate-50 border border-slate-200/80"
                >
                  <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 grid place-items-center shrink-0 text-slate-900">
                    {icon === "table" && (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 10h18" />
                        <path d="M5 10v9" />
                        <path d="M19 10v9" />
                        <path d="M8 6h8" />
                        <path d="M12 6v4" />
                      </svg>
                    )}
                    {icon === "heart" && (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                      </svg>
                    )}
                    {icon === "taste" && (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
                        <path d="M7 2v20" />
                        <path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-900">{title}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{desc}</div>
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setFlowStep("onboarding")}
              className="w-full h-13 bg-amber-500 hover:bg-amber-600 rounded-full text-base font-extrabold text-white shadow-[0_8px_20px_-4px_rgba(245,158,11,0.45)] transition-all cursor-pointer"
            >
              START
            </button>
            <button
              type="button"
              onClick={handleSkipSetupLater}
              className="w-full mt-3 py-2 border-0 bg-transparent text-xs font-semibold text-slate-500 hover:text-slate-800 cursor-pointer"
            >
              I&apos;ll do this later
            </button>
          </div>
        )}

        {/* =============================================================== */}
        {/* STEP C: 3-STEP ONBOARDING (Matches Mobile OnboardingScreen)     */}
        {/* =============================================================== */}
        {navSection === "home" && currentUser && !isLoadingProfile && flowStep === "onboarding" && (
          <div className="w-full max-w-[520px] bg-white border border-slate-200 rounded-3xl shadow-card p-6 sm:p-8">
            <Onboarding
              user={currentUser}
              initialData={ob}
              onComplete={async () => {
                await refreshProfile();
                setFlowStep("allSet");
              }}
              onCancel={() =>
                setFlowStep(
                  userProfile?.onboardingCompleted || userProfile?.onboardingSkipped
                    ? "home"
                    : "setupIntro"
                )
              }
            />
          </div>
        )}

        {/* =============================================================== */}
        {/* STEP D: ALL SET SCREEN (Matches Mobile AllSetScreen, No Pills)  */}
        {/* =============================================================== */}
        {navSection === "home" && currentUser && !isLoadingProfile && flowStep === "allSet" && (
          <div className="w-full max-w-[460px] bg-white border border-slate-200 rounded-3xl shadow-card p-8 sm:p-10 text-center">
            <div className="relative w-36 h-36 mx-auto mb-6 flex items-center justify-center">
              <span className="absolute -top-1 left-4 w-2.5 h-2.5 rounded-full bg-red-500" />
              <span className="absolute top-1 right-3 w-3 h-3 rounded-full bg-amber-500" />
              <span className="absolute bottom-3 left-2 w-2.5 h-2.5 rounded-full bg-lime-500" />
              <span className="absolute bottom-2 right-5 w-2 h-2 rounded-full bg-orange-400" />
              <div className="w-28 h-28 rounded-full bg-amber-500 text-white text-5xl font-extrabold grid place-items-center shadow-md">
                ✓
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              You&apos;re All Set!
            </h1>
            <p className="text-sm text-slate-500 leading-relaxed mt-3 max-w-[320px] mx-auto">
              Your dietary preferences, allergies, health conditions, and household details have been saved. Let&apos;s start planning your meals.
            </p>

            <button
              type="button"
              onClick={() => setFlowStep("home")}
              className="w-full h-13 mt-8 bg-amber-500 hover:bg-amber-600 rounded-full text-base font-extrabold text-white shadow-[0_8px_20px_-4px_rgba(245,158,11,0.45)] inline-flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              Go to Homepage →
            </button>
          </div>
        )}

        {/* =============================================================== */}
        {/* STEP E: HOME PROFILE SCREEN (Matches Mobile HomeScreen)         */}
        {/* =============================================================== */}
        {navSection === "home" && currentUser && !isLoadingProfile && (flowStep === "home" || !flowStep) && (
          <div className="w-full max-w-[540px]">
            {/* Top Greeting */}
            <div className="flex items-center gap-3.5 mb-5">
              <div className="w-12 h-12 rounded-full bg-amber-100 border border-amber-200 grid place-items-center text-lg font-extrabold text-amber-800 shrink-0">
                {first[0]?.toUpperCase() || "K"}
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                  Mabuhay, {first}!
                </h1>
                <p className="text-xs sm:text-sm text-slate-500">
                  Your digital sous-chef is synced and ready to cook.
                </p>
              </div>
            </div>

            {/* Setup / Update Preferences Card */}
            <button
              type="button"
              onClick={() =>
                userProfile?.onboardingCompleted
                  ? confirmRetakeOnboarding()
                  : setFlowStep("setupIntro")
              }
              className="w-full flex items-center gap-3.5 p-4 mb-4 rounded-2xl bg-amber-50/90 hover:bg-amber-100/70 border border-amber-200 text-left transition-all cursor-pointer"
            >
              <div className="w-11 h-11 rounded-xl bg-amber-200/80 text-amber-800 grid place-items-center shrink-0">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <line x1="4" y1="21" x2="4" y2="14" />
                  <line x1="4" y1="10" x2="4" y2="3" />
                  <line x1="12" y1="21" x2="12" y2="12" />
                  <line x1="12" y1="8" x2="12" y2="3" />
                  <line x1="20" y1="21" x2="20" y2="16" />
                  <line x1="20" y1="12" x2="20" y2="3" />
                  <line x1="1" y1="14" x2="7" y2="14" />
                  <line x1="9" y1="8" x2="15" y2="8" />
                  <line x1="17" y1="16" x2="23" y2="16" />
                </svg>
              </div>
              <div className="flex-1">
                <div className="text-sm font-extrabold text-slate-900">
                  {userProfile?.onboardingCompleted
                    ? "Update your Kusina Preferences"
                    : "Finish setting up your kusina"}
                </div>
                <div className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                  Customize household size, dietary restrictions, comorbidities, and health goals.
                </div>
              </div>
              <span className="text-xl font-bold text-amber-700">›</span>
            </button>

            {/* Profile Card matching Mobile HomeScreen */}
            <div className="bg-white border border-slate-200 rounded-3xl shadow-card p-6 sm:p-7">
              <div className="w-15 h-15 rounded-full bg-amber-100 border-2 border-amber-200 grid place-items-center text-2xl font-extrabold text-amber-800 mx-auto mb-2.5">
                {first[0]?.toUpperCase() || "K"}
              </div>
              <h2 className="text-lg font-extrabold text-slate-900 text-center mb-4">
                KusinApp Profile
              </h2>

              <div className="divide-y divide-slate-200 text-sm">
                <div className="flex justify-between py-3 gap-4">
                  <span className="text-slate-500">Display Name</span>
                  <span className="font-bold text-slate-900 text-right">{displayName}</span>
                </div>
                <div className="flex justify-between py-3 gap-4">
                  <span className="text-slate-500">Email</span>
                  <span className="font-bold text-slate-900 text-right">{currentUser.email}</span>
                </div>
                {ob && (
                  <>
                    <div className="flex justify-between py-3 gap-4">
                      <span className="text-slate-500">Profile Persona</span>
                      <span className="font-bold text-slate-900 text-right">
                        {PERSONA_LABELS[ob.userPersona] || "—"}
                      </span>
                    </div>
                    <div className="flex justify-between py-3 gap-4">
                      <span className="text-slate-500">Household</span>
                      <span className="font-bold text-slate-900 text-right">
                        {ob.householdSize} {ob.householdSize > 1 ? "people" : "person"}
                      </span>
                    </div>
                    <div className="flex justify-between py-3 gap-4">
                      <span className="text-slate-500">Age & Biological Sex</span>
                      <span className="font-bold text-slate-900 text-right">
                        {ob.age} yrs · {capitalize(ob.gender)}
                      </span>
                    </div>
                    <div className="flex justify-between py-3 gap-4">
                      <span className="text-slate-500">Height & Weight</span>
                      <span className="font-bold text-slate-900 text-right">
                        {ob.heightCm} cm · {ob.weightKg} kg
                      </span>
                    </div>
                    <div className="flex justify-between py-3 gap-4">
                      <span className="text-slate-500">BMI</span>
                      <span className="font-bold text-slate-900 text-right">
                        {ob.bmi} ({ob.bmiCategory})
                      </span>
                    </div>
                    <div className="flex justify-between py-3 gap-4">
                      <span className="text-slate-500">Daily BMR</span>
                      <span className="font-bold text-slate-900 text-right">~{ob.bmr} kcal</span>
                    </div>
                    <div className="flex justify-between py-3 gap-4">
                      <span className="text-slate-500">Weight Goal</span>
                      <span className="font-bold text-slate-900 text-right">
                        {GOAL_LABELS[ob.weightGoal] || capitalize(ob.weightGoal)}
                      </span>
                    </div>
                    <div className="flex justify-between py-3 gap-4">
                      <span className="text-slate-500">Allergies & Diet</span>
                      <span className="font-bold text-slate-900 text-right">
                        {Array.isArray(ob.dietaryRestrictions) && ob.dietaryRestrictions.length
                          ? ob.dietaryRestrictions.join(", ")
                          : "None"}
                      </span>
                    </div>
                    <div className="flex justify-between py-3 gap-4">
                      <span className="text-slate-500">Health Conditions</span>
                      <span className="font-bold text-slate-900 text-right">
                        {(ob.comorbidities || ["none"])
                          .map((c) => CONDITION_LABELS[c] || c)
                          .join(", ")}
                      </span>
                    </div>
                  </>
                )}
                <div className="flex justify-between py-3 gap-4">
                  <span className="text-slate-500">Realtime Sync</span>
                  <span className="font-bold text-emerald-600 text-right">
                    Connected (asia-southeast1)
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={confirmLogout}
                className="w-full h-12 mt-5 rounded-full bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 font-bold text-sm transition-all cursor-pointer"
              >
                Sign Out
              </button>
            </div>

            <div className="text-center text-xs text-slate-400 mt-6">
              Cook with joy • Less prep, zero stress
            </div>
          </div>
        )}
      </main>

      <footer className="text-center text-xs text-slate-400 py-5 px-4 border-t border-slate-200 bg-white flex flex-col sm:flex-row items-center justify-center gap-3">
        <span>© 2026 KusinApp · Lasang Pinoy sa Bawat Luto.</span>
        <span className="hidden sm:inline text-slate-300">·</span>
        <button
          type="button"
          onClick={() => switchPortal("admin")}
          className="border-0 bg-transparent p-0 text-xs font-semibold text-slate-400 hover:text-amber-700 cursor-pointer"
        >
          Admin Portal
        </button>
      </footer>

      {/* Get Mobile App Modal */}
      <ConfirmationModal
        isOpen={mobileAppModalOpen}
        onClose={() => setMobileAppModalOpen(false)}
        onConfirm={() => setMobileAppModalOpen(false)}
        title="Get the KusinApp Mobile App"
        message="Experience KusinApp on iOS and Android via Expo Go! Run `npx expo start` inside the `/mobile` directory and scan the QR code with your iPhone Camera or Android Expo Go app. Your account, health metrics, allergies, and comorbidities sync automatically in real time."
        confirmText="Got it"
        cancelText=""
      />

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