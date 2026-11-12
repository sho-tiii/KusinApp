import React, { useRef, useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { colors, shadow } from "../theme";
import {
  BackButton,
  ConfirmationModal,
  Divider,
  ErrorBanner,
  FadeIn,
  Field,
  Icon,
  LOGO_ICON,
  PrimaryButton,
  ScalePress,
} from "../components/ui";
import GoogleSignInButton from "../components/GoogleSignInButton";
import { loginMobileUser, sendMobilePasswordResetLink } from "../services/authService";

export default function LoginScreen({ onBack, onSignup }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Forgot Password Email Link Modal state
  const [forgotVisible, setForgotVisible] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetError, setResetError] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSentModal, setResetSentModal] = useState(false);

  const pwRef = useRef(null);

  const submit = async () => {
    setError("");
    if (!email.trim() || !password) {
      setError("Please enter both your email and password.");
      return;
    }
    setLoading(true);
    try {
      await loginMobileUser(email, password);
    } catch (e) {
      setError(e.message);
      setLoading(false);
    }
  };

  const openForgotModal = () => {
    setResetEmail(email.trim());
    setResetError("");
    setForgotVisible(true);
  };

  const handleSendResetLink = async () => {
    setResetError("");
    if (!resetEmail.trim()) {
      setResetError("Please enter your registered email address.");
      return;
    }
    setResetLoading(true);
    try {
      await sendMobilePasswordResetLink(resetEmail.trim());
      setForgotVisible(false);
      setResetSentModal(true);
    } catch (e) {
      setResetError(e.message || "Could not send password reset link.");
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <BackButton onPress={onBack} />
          <FadeIn style={styles.header}>
            <Image
              source={LOGO_ICON}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.title}>Welcome!</Text>
            <Text style={styles.subtitle}>
              Plan delicious homestyle Filipino{"\n"}meals every day
            </Text>
          </FadeIn>

          <FadeIn delay={100}>
            <ErrorBanner message={error} />
            <Field
              label="USERNAME OR EMAIL"
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email"
              keyboardType="email-address"
              returnKeyType="next"
              onSubmitEditing={() => pwRef.current?.focus()}
            />
            <Field
              label="PASSWORD"
              value={password}
              onChangeText={setPassword}
              placeholder="Enter your password"
              secure
              inputRef={pwRef}
              returnKeyType="go"
              onSubmitEditing={submit}
            />
            <ScalePress
              style={{ alignSelf: "flex-end", marginBottom: 20 }}
              onPress={openForgotModal}
            >
              <Text style={styles.link}>Forgot Password?</Text>
            </ScalePress>

            <PrimaryButton title="Log In" icon={null} onPress={submit} loading={loading} />
          </FadeIn>

          <FadeIn delay={200}>
            <Divider label={"OR\nCONTINUE\nWITH"} />
            <GoogleSignInButton title="Continue with Google" onError={setError} />
            <View style={styles.bottomRow}>
              <Text style={styles.muted}>Don't have an account? </Text>
              <ScalePress onPress={onSignup}>
                <Text style={styles.link}>Sign up</Text>
              </ScalePress>
            </View>
          </FadeIn>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Custom Forgot Password Link Dialog */}
      <Modal
        transparent
        visible={forgotVisible}
        animationType="fade"
        onRequestClose={() => !resetLoading && setForgotVisible(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalBackdrop}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View style={styles.modalDialog}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitle}>Reset Password</Text>
              <TouchableOpacity
                onPress={() => setForgotVisible(false)}
                disabled={resetLoading}
                style={styles.closeBtn}
              >
                <Icon name="close" size={18} color={colors.inkMuted} />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalBody}>
              Enter the email address linked to your KusinApp account and we will send you a password reset link.
            </Text>

            <View style={{ marginTop: 14 }}>
              <ErrorBanner message={resetError} />
              <Text style={styles.inputLabel}>EMAIL ADDRESS</Text>
              <TextInput
                style={styles.inputBox}
                placeholder="juan@example.com"
                placeholderTextColor={colors.inkSubtle}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                value={resetEmail}
                onChangeText={setResetEmail}
              />
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                activeOpacity={0.82}
                onPress={() => setForgotVisible(false)}
                disabled={resetLoading}
                style={styles.cancelBtn}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={handleSendResetLink}
                disabled={resetLoading}
                style={styles.confirmBtn}
              >
                <Text style={styles.confirmBtnText}>
                  {resetLoading ? "Sending..." : "Send Link"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <ConfirmationModal
        visible={resetSentModal}
        title="Password Reset Link Sent"
        message={`We sent a password reset link to ${resetEmail}. Open the link in your email to set a new password.`}
        confirmText="Back to Log In"
        cancelText=""
        onClose={() => setResetSentModal(false)}
        onConfirm={() => setResetSentModal(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", overflow: "hidden" },
  scroll: { paddingHorizontal: 26, paddingBottom: 32, paddingTop: 6 },
  header: { alignItems: "center", marginBottom: 20 },
  logo: { width: 136, height: 126, marginBottom: 12 },
  title: { fontSize: 28, fontWeight: "800", color: colors.ink },
  subtitle: {
    fontSize: 15,
    color: colors.inkMuted,
    textAlign: "center",
    marginTop: 8,
    lineHeight: 22,
  },
  link: { color: colors.primaryDark, fontWeight: "700", fontSize: 13 },
  muted: { color: colors.inkMuted, fontSize: 13 },
  bottomRow: { flexDirection: "row", justifyContent: "center", marginTop: 22 },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(16, 24, 40, 0.48)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 22,
  },
  modalDialog: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: "#fff",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 22,
    ...shadow.card,
  },
  modalHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  modalTitle: {
    fontSize: 19,
    fontWeight: "800",
    color: colors.ink,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F8FAFC",
    alignItems: "center",
    justifyContent: "center",
  },
  modalBody: {
    fontSize: 14,
    color: colors.inkMuted,
    lineHeight: 20,
    marginTop: 8,
  },
  inputLabel: {
    fontSize: 11.5,
    fontWeight: "700",
    letterSpacing: 0.8,
    color: "#1E293B",
    marginBottom: 6,
  },
  inputBox: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1.2,
    borderColor: colors.border,
    backgroundColor: colors.field,
    paddingHorizontal: 14,
    fontSize: 15,
    color: colors.ink,
  },
  modalActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 20,
  },
  cancelBtn: {
    flex: 1,
    height: 46,
    borderRadius: 14,
    borderWidth: 1.2,
    borderColor: colors.border,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  cancelBtnText: {
    fontSize: 14.5,
    fontWeight: "700",
    color: colors.inkMuted,
  },
  confirmBtn: {
    flex: 1,
    height: 46,
    borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  confirmBtnText: {
    fontSize: 14.5,
    fontWeight: "700",
    color: "#fff",
  },
});
