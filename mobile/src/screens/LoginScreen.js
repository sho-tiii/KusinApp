import React, { useRef, useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
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
  LOGO_ICON,
  PrimaryButton,
  ScalePress,
  WarmGlow,
} from "../components/ui";
import GoogleSignInButton from "../components/GoogleSignInButton";
import { loginMobileUser } from "../services/authService";

export default function LoginScreen({ onBack, onSignup }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
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

  return (
    <SafeAreaView style={styles.container}>
      <WarmGlow size={420} style={{ top: -170, right: -170 }} />
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
            <View style={styles.logoCard}>
              <Image source={LOGO_ICON} style={styles.logo} resizeMode="contain" />
            </View>
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
              onPress={() =>
                Alert.alert(
                  "Forgot Password",
                  "Password reset OTP is available on the KusinApp web portal."
                )
              }
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", overflow: "hidden" },
  scroll: { paddingHorizontal: 26, paddingBottom: 32, paddingTop: 6 },
  header: { alignItems: "center", marginBottom: 26 },
  logoCard: {
    width: 118,
    height: 118,
    borderRadius: 16,
    backgroundColor: "#FAFAFA",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  logo: { width: 92, height: 92 },
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
});
