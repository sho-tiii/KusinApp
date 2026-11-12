import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { colors } from "../theme";
import {
  BackButton,
  ConfirmationModal,
  Divider,
  ErrorBanner,
  FadeIn,
  Field,
  Icon,
  PrimaryButton,
  ScalePress,
  SelectModal,
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
  { value: "female", label: "Female", description: "Used for baseline BMR & calorie calculations" },
  { value: "male", label: "Male", description: "Used for baseline BMR & calorie calculations" },
  { value: "other", label: "Prefer not to say", description: "Standard average calorie baseline" },
];

export default function SignupScreen({ initial, onBack, onLogin, onNext }) {
  const [name, setName] = useState(initial?.name || "");
  const [gender, setGender] = useState(initial?.gender || "");
  const [genderModal, setGenderModal] = useState(false);
  const [email, setEmail] = useState(initial?.email || "");
  const [password, setPassword] = useState(initial?.password || "");
  const [confirm, setConfirm] = useState(initial?.password || "");
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [termsModal, setTermsModal] = useState(false);
  const [error, setError] = useState("");
  const checks = getPasswordChecks(password);

  const selectedGenderObj = GENDER_OPTIONS.find((g) => g.value === gender);

  const submit = () => {
    setError("");
    if (name.trim().length < 2) return setError("Please enter your full name.");
    if (!isValidEmail(email)) return setError("Please enter a valid email address.");
    if (!Object.values(checks).every(Boolean)) {
      return setError("Your password doesn't meet all the requirements yet.");
    }
    if (password !== confirm) return setError("Passwords do not match.");
    if (!agreedTerms) {
      return setError(
        "Please agree to the KusinApp Terms & Conditions and Privacy Policy before creating your account."
      );
    }
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
              placeholder="Juan Dela Cruz"
              autoCapitalize="words"
            />

            <Text style={styles.label}>BIOLOGICAL SEX (OPTIONAL)</Text>
            <ScalePress
              onPress={() => setGenderModal(true)}
              style={styles.genderDropdown}
            >
              <Text
                style={[
                  styles.genderDropdownText,
                  !selectedGenderObj && { color: colors.inkSubtle, fontWeight: "400" },
                ]}
              >
                {selectedGenderObj ? selectedGenderObj.label : "Select biological sex"}
              </Text>
              <Icon name="chevron-down" size={18} color={colors.inkMuted} />
            </ScalePress>

            <Field
              label="EMAIL ADDRESS"
              icon="at-sign"
              value={email}
              onChangeText={setEmail}
              placeholder="juan@example.com"
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

            {/* Terms & Conditions and Privacy Policy Checkbox */}
            <View style={styles.termsRow}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setAgreedTerms((prev) => !prev)}
                style={[
                  styles.checkbox,
                  agreedTerms && styles.checkboxChecked,
                ]}
              >
                {agreedTerms ? (
                  <Text style={styles.checkboxMark}>✓</Text>
                ) : null}
              </TouchableOpacity>
              <Text style={styles.termsText}>
                I agree to the KusinApp{" "}
                <Text
                  style={styles.termsLink}
                  onPress={() => setTermsModal(true)}
                >
                  Terms & Conditions
                </Text>{" "}
                and{" "}
                <Text
                  style={styles.termsLink}
                  onPress={() => setTermsModal(true)}
                >
                  Privacy Policy
                </Text>
                .
              </Text>
            </View>
          </FadeIn>

          <FadeIn delay={170}>
            <PrimaryButton
              title="Create Account & Send Link"
              onPress={submit}
              style={{ marginTop: 6 }}
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

      <SelectModal
        visible={genderModal}
        onClose={() => setGenderModal(false)}
        title="Select Biological Sex"
        options={GENDER_OPTIONS}
        value={gender}
        onChange={setGender}
      />

      <ConfirmationModal
        visible={termsModal}
        onClose={() => setTermsModal(false)}
        onConfirm={() => {
          setAgreedTerms(true);
          setTermsModal(false);
        }}
        title="Terms & Conditions and Privacy Policy"
        message="By creating a KusinApp account, you agree to use our Filipino meal planning and pantry management platform responsibly. Your health metrics (BMI, BMR, allergies, and comorbidities) are stored securely in Firebase Realtime Database solely to personalize your recommended recipes and nutritional targets. Note: KusinApp nutritional estimates are a general guide and not a substitute for professional medical advice."
        confirmText="I Agree"
        cancelText="Close"
      />
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
    width: "100%",
    height: 48,
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
  termsRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 10,
    marginTop: 2,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: colors.borderStrong,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
    marginTop: 1,
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkboxMark: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "800",
  },
  termsText: {
    flex: 1,
    fontSize: 12.5,
    color: colors.inkMuted,
    lineHeight: 19,
  },
  termsLink: {
    color: colors.primaryDark,
    fontWeight: "700",
    textDecorationLine: "underline",
  },
  link: { color: colors.primaryDark, fontWeight: "700", fontSize: 13 },
  muted: { color: colors.inkMuted, fontSize: 13 },
  bottomRow: { flexDirection: "row", justifyContent: "center", marginTop: 18 },
});
