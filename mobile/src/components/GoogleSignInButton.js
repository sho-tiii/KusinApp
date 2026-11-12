import React, { useState } from "react";
import {
  Modal,
  StyleSheet,
  Text,
  TextInput,
  View,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { GoogleButton, PrimaryButton, ScalePress, ErrorBanner, FadeIn } from "./ui";
import { colors } from "../theme";
import { signInOrRegisterWithGoogleMobile } from "../services/authService";

export default function GoogleSignInButton({ title = "Continue with Google", onSuccess, onError }) {
  const [modalVisible, setModalVisible] = useState(false);
  const [googleEmail, setGoogleEmail] = useState("");
  const [googleName, setGoogleName] = useState("");
  const [googlePassword, setGooglePassword] = useState("");
  const [localError, setLocalError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleContinue = async () => {
    setLocalError("");
    if (!googleEmail.trim()) {
      setLocalError("Please enter your Google email address.");
      return;
    }
    if (!googlePassword || googlePassword.length < 6) {
      setLocalError("Please enter your password (min. 6 characters).");
      return;
    }
    setLoading(true);
    try {
      const result = await signInOrRegisterWithGoogleMobile(
        googleEmail.trim(),
        googlePassword,
        googleName.trim()
      );
      setModalVisible(false);
      onSuccess && onSuccess(result);
    } catch (e) {
      setLocalError(e.message || "Google sign-in failed.");
      onError && onError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <GoogleButton
        title={title}
        onPress={() => {
          setLocalError("");
          setModalVisible(true);
        }}
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
          <FadeIn from={30} style={styles.sheet}>
            <View style={styles.googleHeader}>
              <View style={styles.gCircle}>
                <Text style={styles.gLetter}>G</Text>
              </View>
              <Text style={styles.sheetTitle}>Sign in with Google</Text>
              <Text style={styles.sheetSub}>Continue to KusinApp</Text>
            </View>

            <ErrorBanner message={localError} />

            <Text style={styles.label}>GOOGLE EMAIL</Text>
            <TextInput
              style={styles.input}
              placeholder="you@gmail.com"
              placeholderTextColor={colors.inkSubtle}
              keyboardType="email-address"
              autoCapitalize="none"
              value={googleEmail}
              onChangeText={setGoogleEmail}
            />

            <Text style={styles.label}>DISPLAY NAME (FOR NEW ACCOUNTS)</Text>
            <TextInput
              style={styles.input}
              placeholder="Ashley Alcantara"
              placeholderTextColor={colors.inkSubtle}
              autoCapitalize="words"
              value={googleName}
              onChangeText={setGoogleName}
            />

            <Text style={styles.label}>ACCOUNT PASSWORD</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter password"
              placeholderTextColor={colors.inkSubtle}
              secureTextEntry
              value={googlePassword}
              onChangeText={setGooglePassword}
            />

            <PrimaryButton
              title="Continue with Google"
              onPress={handleContinue}
              loading={loading}
              style={{ marginTop: 8 }}
            />

            <ScalePress
              onPress={() => setModalVisible(false)}
              style={{ alignSelf: "center", paddingVertical: 12, marginTop: 4 }}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </ScalePress>
          </FadeIn>
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
    borderRadius: 24,
    padding: 24,
  },
  googleHeader: {
    alignItems: "center",
    marginBottom: 18,
  },
  gCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  gLetter: {
    fontSize: 26,
    fontWeight: "800",
    color: "#4285F4",
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
