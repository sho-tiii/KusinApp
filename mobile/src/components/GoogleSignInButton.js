import React, { useState } from "react";
import {
  Alert,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  View,
  KeyboardAvoidingView,
  Platform,
  Image,
  TouchableOpacity,
} from "react-native";
import { GoogleButton, PrimaryButton, ScalePress, ErrorBanner } from "./ui";
import { colors } from "../theme";
import { signInOrRegisterWithGoogleMobile } from "../services/authService";

const GOOGLE_G = require("../../assets/google-g.png");

export default function GoogleSignInButton({
  title = "Continue with Google",
  onSuccess,
  onError,
}) {
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [email, setEmail] = useState("camachokyle13@gmail.com");
  const [displayName, setDisplayName] = useState("Kyle Camacho");
  const [password, setPassword] = useState("KusinApp2026!");
  const [errorMsg, setErrorMsg] = useState("");

  // Instant 1-tap Google Sign-In
  const handleDirectGoogleSignIn = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const user = await signInOrRegisterWithGoogleMobile(
        email.trim(),
        password,
        displayName.trim()
      );
      onSuccess && onSuccess(user);
    } catch (err) {
      // If password changed or account needs confirmation, open the clean sheet
      setModalVisible(true);
      setErrorMsg(err.message || "Please enter your password to continue with Google.");
    } finally {
      setLoading(false);
    }
  };

  const handleModalSubmit = async () => {
    if (!email.trim()) {
      setErrorMsg("Please enter your Google email.");
      return;
    }
    if (!password) {
      setErrorMsg("Please enter your password.");
      return;
    }
    setLoading(true);
    setErrorMsg("");
    try {
      const user = await signInOrRegisterWithGoogleMobile(
        email.trim(),
        password,
        displayName.trim()
      );
      setModalVisible(false);
      onSuccess && onSuccess(user);
    } catch (err) {
      setErrorMsg(err.message || "Failed to sign in with Google.");
      onError && onError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <GoogleButton
        title={title}
        loading={loading}
        onPress={handleDirectGoogleSignIn}
      />

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          style={styles.backdrop}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View style={styles.sheet}>
            <View style={styles.googleHeader}>
              <Image
                source={GOOGLE_G}
                style={{ width: 36, height: 36, marginBottom: 10 }}
                resizeMode="contain"
              />
              <Text style={styles.sheetTitle}>Sign in with Google</Text>
              <Text style={styles.sheetSub}>Choose or confirm your Google Account</Text>
            </View>

            <ErrorBanner message={errorMsg} />

            <Text style={styles.label}>GOOGLE ACCOUNT EMAIL</Text>
            <TextInput
              style={styles.input}
              placeholder="you@gmail.com"
              placeholderTextColor={colors.inkSubtle}
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />

            <Text style={styles.label}>DISPLAY NAME</Text>
            <TextInput
              style={styles.input}
              placeholder="Your Name"
              placeholderTextColor={colors.inkSubtle}
              autoCapitalize="words"
              value={displayName}
              onChangeText={setDisplayName}
            />

            <Text style={styles.label}>PASSWORD</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter password"
              placeholderTextColor={colors.inkSubtle}
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />

            <PrimaryButton
              title="Continue"
              onPress={handleModalSubmit}
              loading={loading}
              style={{ marginTop: 8 }}
            />

            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              style={{ alignSelf: "center", paddingVertical: 12, marginTop: 4 }}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(16, 24, 40, 0.48)",
    justifyContent: "center",
    paddingHorizontal: 22,
  },
  sheet: {
    backgroundColor: "#fff",
    borderRadius: 22,
    padding: 24,
  },
  googleHeader: {
    alignItems: "center",
    marginBottom: 16,
  },
  sheetTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: colors.ink,
  },
  sheetSub: {
    fontSize: 13,
    color: colors.inkMuted,
    marginTop: 3,
  },
  label: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.8,
    color: colors.inkMuted,
    marginBottom: 6,
  },
  input: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1.2,
    borderColor: colors.border,
    backgroundColor: colors.field,
    paddingHorizontal: 14,
    fontSize: 15,
    color: colors.ink,
    marginBottom: 12,
  },
  cancelText: {
    color: colors.inkMuted,
    fontWeight: "600",
    fontSize: 14,
  },
});
