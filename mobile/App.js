import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform,
  KeyboardAvoidingView,
  Image,
  Animated,
  Dimensions,
} from "react-native";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./src/config/firebase";
import {
  loginMobileUser,
  registerMobileUser,
  logoutMobileUser,
  getMobileUserProfile,
} from "./src/services/authService";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// Assets extracted from official KusinApp mobile mockups
const SPLASH_CENTERPIECE = require("./assets/splash-centerpiece.png");
const KUSINAPP_WORDMARK = require("./assets/kusinapp-wordmark.png");
const WELCOME_FAMILY = require("./assets/welcome-family.png");
const LOGO_STACKED = require("./assets/logo-stacked.png");

const ONBOARDING_SLIDES = [
  {
    id: 0,
    caption: "Your personal digital sous-chef to make\nhard days easy.",
  },
  {
    id: 1,
    caption: "Plan balanced, budget-friendly Filipino\nmeals for the whole family.",
  },
  {
    id: 2,
    caption: "Track your kusina pantry in real time\nand reduce food waste.",
  },
];

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [showSplash, setShowSplash] = useState(true);

  // Navigation screen: 'welcome' | 'login' | 'register'
  const [screen, setScreen] = useState("welcome");
  const [slideIndex, setSlideIndex] = useState(0);

  // Form State
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Status State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Splash animation values
  const splashOpacity = useRef(new Animated.Value(0)).current;
  const splashScale = useRef(new Animated.Value(0.92)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(splashOpacity, {
        toValue: 1,
        duration: 650,
        useNativeDriver: true,
      }),
      Animated.spring(splashScale, {
        toValue: 1,
        friction: 7,
        tension: 45,
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2200);

    return () => clearTimeout(timer);
  }, [splashOpacity, splashScale]);

  // Listen for Firebase Auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user || null);
      if (user) {
        try {
          const profile = await getMobileUserProfile(user.uid);
          setUserProfile(profile);
        } catch (e) {
          console.warn("Error fetching user profile:", e);
        }
      } else {
        setUserProfile(null);
      }
      setIsLoadingAuth(false);
    });
    return () => unsubscribe();
  }, []);

  const resetFormErrors = () => {
    setErrorMessage("");
  };

  const handleLogin = async () => {
    setErrorMessage("");
    if (!email.trim() || !password) {
      setErrorMessage("Please enter both your email address and password.");
      return;
    }

    setIsSubmitting(true);
    try {
      await loginMobileUser(email, password);
      setPassword("");
    } catch (err) {
      setErrorMessage(err.message || "Failed to sign in.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegister = async () => {
    setErrorMessage("");
    if (!displayName.trim() || displayName.trim().length < 2) {
      setErrorMessage("Please enter your full name (min. 2 characters).");
      return;
    }
    if (!email.trim()) {
      setErrorMessage("Please enter your email address.");
      return;
    }
    if (!password || password.length < 8) {
      setErrorMessage("Password must be at least 8 characters long.");
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    try {
      await registerMobileUser(email, password, displayName);
      setPassword("");
      setConfirmPassword("");
    } catch (err) {
      setErrorMessage(err.message || "Registration failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      "Log Out",
      "Are you sure you want to end your KusinApp mobile session?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Log Out",
          style: "destructive",
          onPress: async () => {
            try {
              await logoutMobileUser();
              setScreen("welcome");
            } catch (err) {
              Alert.alert("Error", err.message || "Failed to log out.");
            }
          },
        },
      ]
    );
  };

  // 1. DEDICATED MOBILE SPLASH SCREEN (matches image.png)
  if (showSplash || isLoadingAuth) {
    return (
      <SafeAreaView style={styles.splashContainer}>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
        <TouchableOpacity
          activeOpacity={1}
          style={styles.splashInner}
          onPress={() => {
            if (!isLoadingAuth) setShowSplash(false);
          }}
        >
          <Animated.View
            style={[
              styles.splashLogoWrap,
              {
                opacity: splashOpacity,
                transform: [{ scale: splashScale }],
              },
            ]}
          >
            <Image
              source={SPLASH_CENTERPIECE}
              style={styles.splashCenterImage}
              resizeMode="contain"
            />
          </Animated.View>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // 2. AUTHENTICATED MOBILE DASHBOARD
  if (currentUser) {
    return (
      <SafeAreaView style={styles.whiteContainer}>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
        <ScrollView
          contentContainerStyle={styles.authDashboardScroll}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.dashboardHeader}>
            <Image
              source={LOGO_STACKED}
              style={styles.dashboardLogo}
              resizeMode="contain"
            />
          </View>

          <View style={styles.profileCard}>
            <View style={styles.userBadge}>
              <Text style={styles.userInitials}>
                {(currentUser.displayName || "K")[0].toUpperCase()}
              </Text>
            </View>
            <Text style={styles.welcomeUserTitle}>
              Mabuhay, {currentUser.displayName?.split(" ")[0] || "Chef"}!
            </Text>
            <Text style={styles.accountSubtitle}>
              Your mobile sous-chef is synced and ready to cook.
            </Text>

            <View style={styles.infoBox}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Display Name</Text>
                <Text style={styles.infoValue}>
                  {currentUser.displayName || "—"}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Email</Text>
                <Text style={styles.infoValue}>{currentUser.email}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Role</Text>
                <Text style={styles.infoValue}>
                  {userProfile?.role || "user"}
                </Text>
              </View>
              <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
                <Text style={styles.infoLabel}>Realtime Sync</Text>
                <Text style={[styles.infoValue, { color: "#15803d" }]}>
                  Connected (asia-southeast1)
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.logoutPillButton}
              onPress={handleLogout}
              activeOpacity={0.85}
            >
              <Text style={styles.logoutPillText}>Log Out</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.taglineFooter}>
            Cook with joy • Less prep, zero stress
          </Text>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // 3. MOBILE WELCOME / ONBOARDING LANDING SCREEN (matches image_2.png)
  if (screen === "welcome") {
    const activeSlide = ONBOARDING_SLIDES[slideIndex] || ONBOARDING_SLIDES[0];

    return (
      <SafeAreaView style={styles.whiteContainer}>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
        <View style={styles.welcomeScreenWrap}>
          {/* Top Heading: "Welcome to [KusinApp]" */}
          <View style={styles.welcomeHeaderRow}>
            <Text style={styles.welcomeTitleText}>Welcome to</Text>
            <Image
              source={KUSINAPP_WORDMARK}
              style={styles.welcomeWordmark}
              resizeMode="contain"
            />
          </View>

          {/* Center Family Illustration with Warm Radial Glow */}
          <TouchableOpacity
            activeOpacity={0.95}
            style={styles.illustrationContainer}
            onPress={() =>
              setSlideIndex((prev) => (prev + 1) % ONBOARDING_SLIDES.length)
            }
          >
            <Image
              source={WELCOME_FAMILY}
              style={styles.welcomeIllustration}
              resizeMode="contain"
            />
          </TouchableOpacity>

          {/* Middle Copy & Carousel Dots */}
          <View style={styles.captionSection}>
            <Text style={styles.welcomeCaptionText}>{activeSlide.caption}</Text>

            <View style={styles.dotsRow}>
              {ONBOARDING_SLIDES.map((slide, idx) => {
                const isActive = idx === slideIndex;
                return (
                  <TouchableOpacity
                    key={slide.id}
                    onPress={() => setSlideIndex(idx)}
                    hitSlop={{ top: 10, bottom: 10, left: 6, right: 6 }}
                    style={[
                      styles.dotItem,
                      isActive ? styles.dotItemActive : styles.dotItemInactive,
                    ]}
                  />
                );
              })}
            </View>
          </View>

          {/* Bottom Action Pill Buttons & Tagline */}
          <View style={styles.welcomeBottomSection}>
            <View style={styles.actionButtonsRow}>
              <TouchableOpacity
                style={styles.welcomeLoginBtn}
                onPress={() => {
                  resetFormErrors();
                  setScreen("login");
                }}
                activeOpacity={0.85}
              >
                <Text style={styles.welcomeLoginBtnText}>Login</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.welcomeSignupBtn}
                onPress={() => {
                  resetFormErrors();
                  setScreen("register");
                }}
                activeOpacity={0.85}
              >
                <Text style={styles.welcomeSignupBtnText}>Sign up →</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.taglineFooter}>
              Cook with joy • Less prep, zero stress
            </Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // 4. MOBILE LOGIN & SIGN UP SCREENS
  const isRegister = screen === "register";

  return (
    <SafeAreaView style={styles.whiteContainer}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.authFormScroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Back to Welcome Button */}
          <View style={styles.topNavRow}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => {
                resetFormErrors();
                setScreen("welcome");
              }}
              activeOpacity={0.75}
            >
              <Text style={styles.backButtonText}>← Back</Text>
            </TouchableOpacity>
          </View>

          {/* Brand Header */}
          <View style={styles.authHeaderBlock}>
            <Image
              source={LOGO_STACKED}
              style={styles.authLogoStacked}
              resizeMode="contain"
            />
            <Text style={styles.authHeadingTitle}>
              {isRegister ? "Create Your Account" : "Welcome Back"}
            </Text>
            <Text style={styles.authHeadingSubtitle}>
              {isRegister
                ? "Sign up to start planning healthy, budget-friendly Filipino meals."
                : "Log in to your KusinApp mobile account to continue cooking."}
            </Text>
          </View>

          {/* Error Alert */}
          {errorMessage ? (
            <View style={styles.errorAlert}>
              <Text style={styles.errorAlertText}>{errorMessage}</Text>
            </View>
          ) : null}

          {/* Form Fields */}
          <View style={styles.formContainer}>
            {isRegister && (
              <View style={styles.fieldGroup}>
                <Text style={styles.inputLabel}>Full Name</Text>
                <TextInput
                  style={styles.mobileInput}
                  placeholder="Juan Dela Cruz"
                  placeholderTextColor="#94a3b8"
                  value={displayName}
                  onChangeText={setDisplayName}
                  autoCapitalize="words"
                  editable={!isSubmitting}
                />
              </View>
            )}

            <View style={styles.fieldGroup}>
              <Text style={styles.inputLabel}>Email Address</Text>
              <TextInput
                style={styles.mobileInput}
                placeholder="juan@example.com"
                placeholderTextColor="#94a3b8"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!isSubmitting}
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.inputLabel}>
                Password{" "}
                {isRegister && (
                  <Text style={styles.inputHint}>(min. 8 characters)</Text>
                )}
              </Text>
              <View style={styles.passwordInputWrap}>
                <TextInput
                  style={[styles.mobileInput, { flex: 1, paddingRight: 58 }]}
                  placeholder={
                    isRegister ? "Create a password" : "Enter your password"
                  }
                  placeholderTextColor="#94a3b8"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  editable={!isSubmitting}
                />
                <TouchableOpacity
                  style={styles.eyeToggleBtn}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Text style={styles.eyeToggleText}>
                    {showPassword ? "Hide" : "Show"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {isRegister && (
              <View style={styles.fieldGroup}>
                <Text style={styles.inputLabel}>Confirm Password</Text>
                <TextInput
                  style={styles.mobileInput}
                  placeholder="Confirm your password"
                  placeholderTextColor="#94a3b8"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showPassword}
                  editable={!isSubmitting}
                />
              </View>
            )}

            {/* Primary Pill Submit Button */}
            <TouchableOpacity
              style={styles.primaryPillButton}
              onPress={isRegister ? handleRegister : handleLogin}
              disabled={isSubmitting}
              activeOpacity={0.85}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#0f172a" />
              ) : (
                <Text style={styles.primaryPillButtonText}>
                  {isRegister ? "Sign up →" : "Login →"}
                </Text>
              )}
            </TouchableOpacity>

            {/* Switch Mode Pill Link */}
            <View style={styles.switchModeRow}>
              <Text style={styles.switchModePrompt}>
                {isRegister
                  ? "Already have an account? "
                  : "Don't have an account yet? "}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  resetFormErrors();
                  setScreen(isRegister ? "login" : "register");
                }}
              >
                <Text style={styles.switchModeAction}>
                  {isRegister ? "Login" : "Sign up"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <Text style={[styles.taglineFooter, { marginTop: 28 }]}>
            Cook with joy • Less prep, zero stress
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // SPLASH SCREEN (image.png)
  splashContainer: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  splashInner: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  splashLogoWrap: {
    justifyContent: "center",
    alignItems: "center",
  },
  splashCenterImage: {
    width: Math.min(SCREEN_WIDTH * 0.82, 320),
    height: Math.min(SCREEN_WIDTH * 0.95, 370),
  },

  // SHARED WHITE CANVAS
  whiteContainer: {
    flex: 1,
    backgroundColor: "#ffffff",
  },

  // WELCOME / ONBOARDING LANDING SCREEN (image_2.png)
  welcomeScreenWrap: {
    flex: 1,
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: Platform.OS === "android" ? 42 : 28,
    paddingBottom: 20,
  },
  welcomeHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    flexWrap: "wrap",
    marginTop: 24,
  },
  welcomeTitleText: {
    fontSize: 25,
    fontWeight: "800",
    color: "#111827",
    letterSpacing: -0.4,
    marginRight: 8,
  },
  welcomeWordmark: {
    width: 142,
    height: 38,
    marginTop: -2,
  },
  illustrationContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    maxHeight: 330,
  },
  welcomeIllustration: {
    width: Math.min(SCREEN_WIDTH * 0.88, 340),
    height: Math.min(SCREEN_WIDTH * 0.78, 300),
  },
  captionSection: {
    alignItems: "center",
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  welcomeCaptionText: {
    fontSize: 14.5,
    lineHeight: 22,
    color: "#3f3f46",
    textAlign: "center",
    fontWeight: "400",
  },
  dotsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 22,
  },
  dotItem: {
    height: 7,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  dotItemActive: {
    width: 24,
    backgroundColor: "#1e293b",
  },
  dotItemInactive: {
    width: 7,
    backgroundColor: "#dbeafe",
  },
  welcomeBottomSection: {
    width: "100%",
    maxWidth: 400,
    alignItems: "center",
  },
  actionButtonsRow: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-between",
    gap: 14,
    marginBottom: 16,
  },
  welcomeLoginBtn: {
    flex: 1,
    height: 52,
    borderRadius: 999,
    backgroundColor: "#eef2ff",
    justifyContent: "center",
    alignItems: "center",
  },
  welcomeLoginBtnText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0f172a",
  },
  welcomeSignupBtn: {
    flex: 1,
    height: 52,
    borderRadius: 999,
    backgroundColor: "#f59e0b",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#f59e0b",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  welcomeSignupBtnText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0f172a",
  },
  taglineFooter: {
    fontSize: 12,
    color: "#64748b",
    textAlign: "center",
    fontWeight: "400",
  },

  // AUTH FORMS (LOGIN / SIGN UP)
  authFormScroll: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: Platform.OS === "android" ? 24 : 12,
    paddingBottom: 28,
    alignItems: "center",
  },
  topNavRow: {
    width: "100%",
    maxWidth: 400,
    flexDirection: "row",
    justifyContent: "flex-start",
    marginBottom: 8,
  },
  backButton: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: "#eef2ff",
  },
  backButtonText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1e293b",
  },
  authHeaderBlock: {
    alignItems: "center",
    marginBottom: 22,
    width: "100%",
    maxWidth: 400,
  },
  authLogoStacked: {
    width: 110,
    height: 110,
    marginBottom: 8,
  },
  authHeadingTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#0f172a",
    letterSpacing: -0.4,
    textAlign: "center",
  },
  authHeadingSubtitle: {
    fontSize: 13.5,
    color: "#64748b",
    textAlign: "center",
    marginTop: 6,
    lineHeight: 20,
    paddingHorizontal: 10,
  },
  errorAlert: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: "#fef2f2",
    borderWidth: 1,
    borderColor: "#fecaca",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  errorAlertText: {
    color: "#b91c1c",
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "500",
  },
  formContainer: {
    width: "100%",
    maxWidth: 400,
  },
  fieldGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 6,
  },
  inputHint: {
    fontSize: 11.5,
    fontWeight: "400",
    color: "#64748b",
  },
  mobileInput: {
    height: 50,
    backgroundColor: "#f1f5f9",
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 14.5,
    color: "#0f172a",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  passwordInputWrap: {
    flexDirection: "row",
    alignItems: "center",
    position: "relative",
  },
  eyeToggleBtn: {
    position: "absolute",
    right: 14,
    paddingVertical: 6,
    paddingHorizontal: 6,
  },
  eyeToggleText: {
    fontSize: 12.5,
    fontWeight: "700",
    color: "#d97706",
  },
  primaryPillButton: {
    height: 52,
    borderRadius: 999,
    backgroundColor: "#f59e0b",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
    shadowColor: "#f59e0b",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  primaryPillButtonText: {
    fontSize: 15.5,
    fontWeight: "700",
    color: "#0f172a",
  },
  switchModeRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  switchModePrompt: {
    fontSize: 13.5,
    color: "#64748b",
  },
  switchModeAction: {
    fontSize: 13.5,
    fontWeight: "700",
    color: "#d97706",
  },

  // AUTHENTICATED DASHBOARD
  authDashboardScroll: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 24,
    alignItems: "center",
    justifyContent: "space-between",
  },
  dashboardHeader: {
    alignItems: "center",
    marginBottom: 12,
  },
  dashboardLogo: {
    width: 110,
    height: 110,
  },
  profileCard: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: "#ffffff",
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 3,
    marginBottom: 20,
  },
  userBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#fef3c7",
    borderWidth: 2,
    borderColor: "#fde68a",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginBottom: 12,
  },
  userInitials: {
    fontSize: 26,
    fontWeight: "800",
    color: "#b45309",
  },
  welcomeUserTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#0f172a",
    textAlign: "center",
  },
  accountSubtitle: {
    fontSize: 13.5,
    color: "#64748b",
    textAlign: "center",
    marginTop: 4,
    marginBottom: 20,
  },
  infoBox: {
    backgroundColor: "#f8fafc",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  infoLabel: {
    fontSize: 13,
    color: "#64748b",
  },
  infoValue: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0f172a",
  },
  logoutPillButton: {
    height: 48,
    backgroundColor: "#eef2ff",
    borderRadius: 999,
    justifyContent: "center",
    alignItems: "center",
  },
  logoutPillText: {
    color: "#be123c",
    fontSize: 14.5,
    fontWeight: "700",
  },
});
