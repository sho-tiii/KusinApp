import React, { useState, useEffect } from "react";
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
} from "react-native";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./src/config/firebase";
import {
  loginMobileUser,
  registerMobileUser,
  logoutMobileUser,
  getMobileUserProfile,
} from "./src/services/authService";

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  // Form State
  const [mode, setMode] = useState("login"); // 'login' | 'register'
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Status State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

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

  const handleLogin = async () => {
    setErrorMessage("");
    if (!email.trim() || !password) {
      setErrorMessage("Please enter both email and password.");
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
            } catch (err) {
              Alert.alert("Error", err.message || "Failed to log out.");
            }
          },
        },
      ]
    );
  };

  if (isLoadingAuth) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#f7f4ee" />
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#f59e0b" />
          <Text style={styles.loadingText}>Connecting to KusinApp...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f7f4ee" />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header Brand */}
          <View style={styles.brandHeader}>
            <View style={styles.logoBadge}>
              <Text style={styles.logoBadgeText}>🍲</Text>
            </View>
            <Text style={styles.brandTitle}>
              <Text style={{ color: "#f59e0b" }}>Kusin</Text>
              <Text style={{ color: "#d92d20" }}>App</Text>
            </Text>
            <Text style={styles.brandSubtitle}>
              Smart Filipino Meal Planning & Pantry Management
            </Text>
            <View style={styles.platformBadge}>
              <Text style={styles.platformBadgeText}>
                {Platform.OS === "ios" ? "🍎 iOS (Apple)" : "🤖 Android"} • Ready
              </Text>
            </View>
          </View>

          {/* AUTHENTICATED VIEW */}
          {currentUser ? (
            <View style={styles.card}>
              <View style={styles.userBadge}>
                <Text style={styles.userInitials}>
                  {(currentUser.displayName || "K")[0].toUpperCase()}
                </Text>
              </View>
              <Text style={styles.welcomeText}>
                Mabuhay, {currentUser.displayName?.split(" ")[0] || "Chef"}!
              </Text>
              <Text style={styles.accountSubtitle}>
                Your mobile account is connected and synced with Firebase.
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
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Database Sync</Text>
                  <Text style={[styles.infoValue, { color: "#027a48" }]}>
                    ✓ Live (asia-southeast1)
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.logoutButton}
                onPress={handleLogout}
                activeOpacity={0.8}
              >
                <Text style={styles.logoutButtonText}>Log Out from Mobile</Text>
              </TouchableOpacity>
            </View>
          ) : (
            /* UNAUTHENTICATED FORM CARD */
            <View style={styles.card}>
              {/* Mode Switcher Tabs */}
              <View style={styles.tabContainer}>
                <TouchableOpacity
                  style={[
                    styles.tabButton,
                    mode === "login" && styles.tabButtonActive,
                  ]}
                  onPress={() => {
                    setMode("login");
                    setErrorMessage("");
                  }}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.tabText,
                      mode === "login" && styles.tabTextActive,
                    ]}
                  >
                    Log In
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.tabButton,
                    mode === "register" && styles.tabButtonActive,
                  ]}
                  onPress={() => {
                    setMode("register");
                    setErrorMessage("");
                  }}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.tabText,
                      mode === "register" && styles.tabTextActive,
                    ]}
                  >
                    Sign Up
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Error Alert */}
              {errorMessage ? (
                <View style={styles.errorAlert}>
                  <Text style={styles.errorAlertText}>{errorMessage}</Text>
                </View>
              ) : null}

              {/* SIGN UP FORM */}
              {mode === "register" ? (
                <View style={styles.form}>
                  <View style={styles.field}>
                    <Text style={styles.label}>Full Name</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Juan Dela Cruz"
                      placeholderTextColor="#98a2b3"
                      value={displayName}
                      onChangeText={setDisplayName}
                      autoCapitalize="words"
                      editable={!isSubmitting}
                    />
                  </View>

                  <View style={styles.field}>
                    <Text style={styles.label}>Email Address</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="juan@example.com"
                      placeholderTextColor="#98a2b3"
                      value={email}
                      onChangeText={setEmail}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      editable={!isSubmitting}
                    />
                  </View>

                  <View style={styles.field}>
                    <Text style={styles.label}>
                      Password <Text style={styles.hint}>(min. 8 chars)</Text>
                    </Text>
                    <View style={styles.passwordWrap}>
                      <TextInput
                        style={[styles.input, { flex: 1, paddingRight: 50 }]}
                        placeholder="Create strong password"
                        placeholderTextColor="#98a2b3"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry={!showPassword}
                        editable={!isSubmitting}
                      />
                      <TouchableOpacity
                        style={styles.eyeBtn}
                        onPress={() => setShowPassword(!showPassword)}
                      >
                        <Text style={styles.eyeBtnText}>
                          {showPassword ? "Hide" : "Show"}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  <View style={styles.field}>
                    <Text style={styles.label}>Confirm Password</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Re-enter password"
                      placeholderTextColor="#98a2b3"
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      secureTextEntry={!showPassword}
                      editable={!isSubmitting}
                    />
                  </View>

                  <TouchableOpacity
                    style={styles.primaryButton}
                    onPress={handleRegister}
                    disabled={isSubmitting}
                    activeOpacity={0.8}
                  >
                    {isSubmitting ? (
                      <ActivityIndicator color="#ffffff" />
                    ) : (
                      <Text style={styles.primaryButtonText}>Create Account</Text>
                    )}
                  </TouchableOpacity>
                </View>
              ) : (
                /* LOGIN FORM */
                <View style={styles.form}>
                  <View style={styles.field}>
                    <Text style={styles.label}>Email Address</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="juan@example.com"
                      placeholderTextColor="#98a2b3"
                      value={email}
                      onChangeText={setEmail}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      editable={!isSubmitting}
                    />
                  </View>

                  <View style={styles.field}>
                    <Text style={styles.label}>Password</Text>
                    <View style={styles.passwordWrap}>
                      <TextInput
                        style={[styles.input, { flex: 1, paddingRight: 50 }]}
                        placeholder="Enter your password"
                        placeholderTextColor="#98a2b3"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry={!showPassword}
                        editable={!isSubmitting}
                      />
                      <TouchableOpacity
                        style={styles.eyeBtn}
                        onPress={() => setShowPassword(!showPassword)}
                      >
                        <Text style={styles.eyeBtnText}>
                          {showPassword ? "Hide" : "Show"}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={styles.primaryButton}
                    onPress={handleLogin}
                    disabled={isSubmitting}
                    activeOpacity={0.8}
                  >
                    {isSubmitting ? (
                      <ActivityIndicator color="#ffffff" />
                    ) : (
                      <Text style={styles.primaryButtonText}>Sign In</Text>
                    )}
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}

          {/* Footer */}
          <Text style={styles.footerText}>
            © 2026 KusinApp • Lasang Pinoy sa Bawat Luto
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f7f4ee",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#667085",
  },
  scrollContent: {
    padding: 20,
    paddingTop: 10,
    alignItems: "center",
  },
  brandHeader: {
    alignItems: "center",
    marginVertical: 16,
  },
  logoBadge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#fef3c7",
    borderWidth: 1.5,
    borderColor: "#fde68a",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  logoBadgeText: {
    fontSize: 32,
  },
  brandTitle: {
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  brandSubtitle: {
    fontSize: 13,
    color: "#667085",
    marginTop: 4,
    textAlign: "center",
  },
  platformBadge: {
    marginTop: 8,
    paddingHorizontal: 10,
    paddingVertical: 3,
    backgroundColor: "#e0f2fe",
    borderRadius: 999,
  },
  platformBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#0369a1",
  },
  card: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: "#e4e7ec",
    shadowColor: "#101828",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 3,
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#eaecf0",
    borderRadius: 10,
    padding: 3,
    marginBottom: 20,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 8,
  },
  tabButtonActive: {
    backgroundColor: "#ffffff",
    shadowColor: "#101828",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#667085",
  },
  tabTextActive: {
    color: "#101828",
    fontWeight: "700",
  },
  errorAlert: {
    backgroundColor: "#fef3f2",
    borderWidth: 1,
    borderColor: "#fee4e2",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorAlertText: {
    color: "#b42318",
    fontSize: 13,
    lineHeight: 18,
  },
  form: {
    width: "100%",
  },
  field: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#101828",
    marginBottom: 6,
  },
  hint: {
    fontSize: 11,
    fontWeight: "400",
    color: "#667085",
  },
  input: {
    height: 46,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#d0d5dd",
    borderRadius: 8,
    paddingHorizontal: 14,
    fontSize: 15,
    color: "#101828",
  },
  passwordWrap: {
    flexDirection: "row",
    alignItems: "center",
    position: "relative",
  },
  eyeBtn: {
    position: "absolute",
    right: 12,
    padding: 6,
  },
  eyeBtnText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#d97706",
  },
  primaryButton: {
    height: 48,
    backgroundColor: "#f59e0b",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 6,
    shadowColor: "#f59e0b",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 2,
  },
  primaryButtonText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "700",
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
  welcomeText: {
    fontSize: 22,
    fontWeight: "800",
    color: "#101828",
    textAlign: "center",
  },
  accountSubtitle: {
    fontSize: 13,
    color: "#667085",
    textAlign: "center",
    marginTop: 4,
    marginBottom: 20,
  },
  infoBox: {
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "#eaecf0",
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  infoLabel: {
    fontSize: 13,
    color: "#667085",
  },
  infoValue: {
    fontSize: 13,
    fontWeight: "700",
    color: "#101828",
  },
  logoutButton: {
    height: 44,
    backgroundColor: "#fef3f2",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#fee4e2",
    justifyContent: "center",
    alignItems: "center",
  },
  logoutButtonText: {
    color: "#b42318",
    fontSize: 14,
    fontWeight: "600",
  },
  footerText: {
    fontSize: 12,
    color: "#98a2b3",
    marginTop: 24,
    marginBottom: 12,
    textAlign: "center",
  },
});
