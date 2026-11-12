import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  KeyboardAvoidingView,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { colors } from "../theme";
import {
  BackButton,
  Divider,
  ErrorBanner,
  FadeIn,
  Field,
  Icon,
  PrimaryButton,
  ScalePress,
  StepIndicator,
} from "../components/ui";
import GoogleSignInButton from "../components/GoogleSignInButton";
import { getPasswordChecks, isValidEmail } from "../services/authService";

const RULES = [
  ["length", "8+ characters"],
  ["upper", "Uppercase letter"],
  ["lower", "Lowercase letter"],
  ["number", "A number"],
  ["symbol", "A symbol"],
];

const GENDER_OPTIONS = [
  { value: "female", label: "Female" },
  { value: "male", label: "Male" },
  { value: "other", label: "Prefer not to say" },
];

export default function SignupScreen({ initial, onBack, onLogin, onNext }) {
  const [name, setName] = useState(initial?.name || "");
  const [gender, setGender] = useState(initial?.gender || "female");
  const [genderModal, setGenderModal] = useState(false);
  const [email, setEmail] = useState(initial?.email || "");
  const [password, setPassword] = useState(initial?.password || "");
  const [confirm, setConfirm] = useState(initial?.password || "");
  const [error, setError] = useState("");
  const checks = getPasswordChecks(password);

  const selectedGenderLabel =
    GENDER_OPTIONS.find((g) => g.value === gender)?.label || "Female";

  const submit = () => {
    setError("");
    if (name.trim().length < 2) return setError("Please enter your full name.");
    if (!isValidEmail(email)) return setError("Please enter a valid email address.");
    if (!Object.values(checks).every(Boolean)) {
      return setError("Your password doesn't meet all the requirements yet.");
    }
    if (password !== confirm) return setError("Passwords do not match.");
    onNext({ name: name.trim(), gender, email: email.trim(), password });
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
          <View style={styles.topRow}>
            <BackButton onPress={onBack} />
            <StepIndicator step={1} total={3} />
          </View>

          <FadeIn>
            <Text style={styles.screenTitle}>Create Your Account</Text>
            <Text style={styles.subtitle}>
              Begin your culinary journey with homestyle Filipino meal plans tailored for your table.
            </Text>
          </FadeIn>

          <FadeIn delay={90}>
            <ErrorBanner message={error} />

            <Field
              label="FULL NAME"
              icon="user"
              value={name}
              onChangeText={setName}
              placeholder="Ashley Alcantara"
              autoCapitalize="words"
            />

            <Text style={styles.label}>GENDER</Text>
            <ScalePress
              onPress={() => setGenderModal(true)}
              style={styles.genderDropdown}
            >
              <Text style={styles.genderDropdownText}>{selectedGenderLabel}</Text>
              <Icon name="chevron-down" size={18} color={colors.inkMuted} />
            </ScalePress>

            <Field
              label="EMAIL ADDRESS"
              icon="at-sign"
              value={email}
              onChangeText={setEmail}
              placeholder="ashley@gmail.com"
              keyboardType="email-address"
            />
            <Field
              label="NEW PASSWORD"
              value={password}
              onChangeText={setPassword}
              placeholder="Enter new password"
              secure
            />

            <View style={styles.rulesBox}>
              <Text style={styles.rulesTitle}>Password requirements:</Text>
              <View style={styles.rulesGrid}>
                {RULES.map(([key, label]) => (
                  <Rule key={key} ok={checks[key]} label={label} />
                ))}
              </View>
            </View>

            <Field
              label="CONFIRM PASSWORD"
              value={confirm}
              onChangeText={setConfirm}
              placeholder="Re-enter password"
              secure
              error={confirm.length > 0 && confirm !== password}
            />
          </FadeIn>

          <FadeIn delay={170}>
            <PrimaryButton
              title="Next Step"
              onPress={submit}
              style={{ marginTop: 4 }}
            />

            <Divider label={"OR\nCONTINUE\nWITH"} />
            <GoogleSignInButton title="Sign up with Google" onError={setError} />

            <View style={styles.bottomRow}>
              <Text style={styles.muted}>Already have an account? </Text>
              <ScalePress onPress={onLogin}>
                <Text style={styles.link}>Log in</Text>
              </ScalePress>
            </View>
          </FadeIn>
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal
        visible={genderModal}
        transparent
        animationType="fade"
        onRequestClose={() => setGenderModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <FadeIn from={24} style={styles.modalSheet}>
            <Text style={styles.modalTitle}>Select Gender</Text>
            {GENDER_OPTIONS.map((opt) => {
              const active = gender === opt.value;
              return (
                <ScalePress
                  key={opt.value}
                  onPress={() => {
                    setGender(opt.value);
                    setGenderModal(false);
                  }}
                  style={[
                    styles.modalOption,
                    active && styles.modalOptionActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.modalOptionText,
                      active && { color: colors.primaryDark, fontWeight: "700" },
                    ]}
                  >
                    {opt.label}
                  </Text>
                  {active ? (
                    <Icon name="check" size={16} color={colors.primaryDark} />
                  ) : null}
                </ScalePress>
              );
            })}
          </FadeIn>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function Rule({ ok, label }) {
  const v = useRef(new Animated.Value(ok ? 1 : 0)).current;
  useEffect(() => {
    Animated.spring(v, {
      toValue: ok ? 1 : 0,
      friction: 5,
      useNativeDriver: true,
    }).start();
  }, [ok, v]);
  return (
    <View style={styles.rule}>
      <View style={styles.ruleIcon}>
        <View
          style={[
            styles.ruleDot,
            ok && { backgroundColor: colors.green },
          ]}
        />
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            styles.ruleCheck,
            { opacity: v, transform: [{ scale: v }] },
          ]}
        >
          <Text style={{ color: "#fff", fontSize: 9, fontWeight: "800" }}>✓</Text>
        </Animated.View>
      </View>
      <Text style={[styles.ruleText, ok && { color: colors.green, fontWeight: "600" }]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  scroll: { paddingHorizontal: 24, paddingBottom: 32 },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 6,
    marginBottom: 14,
  },
  screenTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: colors.ink,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    color: colors.inkMuted,
    lineHeight: 20,
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.9,
    color: "#1E293B",
    marginBottom: 7,
  },
  genderDropdown: {
    width: "52%",
    height: 46,
    borderRadius: 12,
    borderWidth: 1.2,
    borderColor: colors.border,
    backgroundColor: colors.field,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  genderDropdownText: {
    fontSize: 15,
    color: colors.ink,
    fontWeight: "500",
  },
  rulesBox: {
    backgroundColor: colors.field,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    marginBottom: 14,
  },
  rulesTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#334155",
    marginBottom: 8,
  },
  rulesGrid: { flexDirection: "row", flexWrap: "wrap" },
  rule: {
    width: "50%",
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 4,
  },
  ruleIcon: {
    width: 14,
    height: 14,
    marginRight: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  ruleDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.inkSubtle,
  },
  ruleCheck: {
    borderRadius: 7,
    backgroundColor: colors.green,
    alignItems: "center",
    justifyContent: "center",
  },
  ruleText: { fontSize: 12.5, color: colors.inkMuted },
  link: { color: colors.primaryDark, fontWeight: "700", fontSize: 13 },
  muted: { color: colors.inkMuted, fontSize: 13 },
  bottomRow: { flexDirection: "row", justifyContent: "center", marginTop: 18 },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(16, 24, 40, 0.45)",
    justifyContent: "center",
    paddingHorizontal: 28,
  },
  modalSheet: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: colors.ink,
    marginBottom: 12,
  },
  modalOption: {
    height: 48,
    borderRadius: 12,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  modalOptionActive: {
    backgroundColor: "#FFFBEB",
  },
  modalOptionText: {
    fontSize: 15,
    color: colors.ink,
  },
});
