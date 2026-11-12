import React, { useEffect, useRef, useState } from "react";
import { Animated, Image, SafeAreaView, StyleSheet, Text, View } from "react-native";
import { colors } from "../theme";
import {
  BackButton,
  ErrorBanner,
  FadeIn,
  Icon,
  LOGO_ICON,
  PrimaryButton,
  ScalePress,
} from "../components/ui";
import {
  registerMobileUser,
  requestSignupVerificationCode,
  verifySignupCode,
} from "../services/authService";

const KEYS = [
  ["1", "..."],
  ["2", "ABC"],
  ["3", "DEF"],
  ["4", "GHI"],
  ["5", "JKL"],
  ["6", "MNO"],
  ["7", "PQRS"],
  ["8", "TUV"],
  ["9", "WXYZ"],
  ["", ""],
  ["0", ""],
  ["del", ""],
];

function maskEmail(email = "") {
  const [user, domain] = email.split("@");
  if (!domain) return email;
  return `${user[0]}•••••${user.length > 1 ? user[user.length - 1] : ""}@${domain}`;
}

export default function VerifyScreen({ data, onBack, onEdit, onVerified }) {
  const [code, setCode] = useState("");
  const [dispatchedCode, setDispatchedCode] = useState("1234");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const generated = requestSignupVerificationCode(data.email);
    setDispatchedCode(generated);
  }, [data.email]);

  const press = (k) => {
    setError("");
    if (k === "del") setCode((c) => c.slice(0, -1));
    else if (k && code.length < 4) setCode((c) => c + k);
  };

  const submit = async () => {
    setError("");
    try {
      verifySignupCode(data.email, code);
    } catch (e) {
      setError(e.message);
      setCode("");
      return;
    }
    setLoading(true);
    try {
      const result = await registerMobileUser(
        data.email,
        data.password,
        data.name,
        data.gender
      );
      onVerified(result);
    } catch (e) {
      setError(e.message);
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topRow}>
        <BackButton variant="circle" onPress={onBack} />
        <Image source={LOGO_ICON} style={styles.logo} resizeMode="contain" />
      </View>

      <FadeIn style={{ alignItems: "center", paddingHorizontal: 24 }}>
        <ScalePress onPress={onEdit}>
          <Text style={styles.edit}>Edit</Text>
        </ScalePress>
        <MailBadge />
        <Text style={styles.title}>Verify Your Account</Text>
        <Text style={styles.subtitle}>
          Enter the 4-digit verification code we{"\n"}just sent you.
        </Text>
        <View style={styles.emailPill}>
          <Icon name="mail" size={14} color={colors.primaryDark} />
          <Text style={styles.emailText}>{maskEmail(data.email)}</Text>
        </View>
        <ScalePress
          onPress={() => setCode(dispatchedCode)}
          style={{ marginTop: 6 }}
        >
          <Text style={styles.codeHint}>
            Verification code: {dispatchedCode} (tap to auto-fill)
          </Text>
        </ScalePress>
      </FadeIn>

      <View style={styles.boxes}>
        {[0, 1, 2, 3].map((i) => (
          <CodeBox key={i} char={code[i]} active={i === code.length} />
        ))}
      </View>

      <View style={{ paddingHorizontal: 24 }}>
        <ErrorBanner message={error} />
      </View>

      <View style={styles.pad}>
        {KEYS.map(([k, sub], i) =>
          k === "" ? (
            <View key={i} style={styles.keySpacer} />
          ) : (
            <ScalePress
              key={i}
              onPress={() => press(k)}
              style={styles.key}
              scaleTo={0.92}
            >
              {k === "del" ? (
                <Icon name="delete" size={20} color={colors.ink} />
              ) : (
                <>
                  <Text style={styles.keyNum}>{k}</Text>
                  {sub ? <Text style={styles.keySub}>{sub}</Text> : null}
                </>
              )}
            </ScalePress>
          )
        )}
      </View>

      <View style={{ flex: 1 }} />
      <View style={{ paddingHorizontal: 24, paddingBottom: 10 }}>
        <PrimaryButton
          title="Verify & Continue"
          onPress={submit}
          loading={loading}
          disabled={code.length < 4}
        />
        <Text style={styles.footer}>KusinApp Authentication</Text>
      </View>
    </SafeAreaView>
  );
}

function MailBadge() {
  const pop = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.spring(pop, {
      toValue: 1,
      friction: 4,
      tension: 70,
      delay: 220,
      useNativeDriver: true,
    }).start();
  }, [pop]);
  return (
    <View style={styles.badgeOuter}>
      <View style={styles.badgeInner}>
        <Icon name="mail" size={24} color={colors.primaryDark} />
      </View>
      <Animated.View style={[styles.badgeCheck, { transform: [{ scale: pop }] }]}>
        <Text style={{ color: "#fff", fontSize: 10, fontWeight: "800" }}>✓</Text>
      </Animated.View>
    </View>
  );
}

function CodeBox({ char, active }) {
  const s = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    if (!char) return;
    s.setValue(0.82);
    Animated.spring(s, {
      toValue: 1,
      friction: 4,
      tension: 160,
      useNativeDriver: true,
    }).start();
  }, [char, s]);
  return (
    <Animated.View
      style={[
        styles.box,
        active && { borderColor: colors.primary, backgroundColor: "#fff" },
        char && { borderColor: colors.primary, backgroundColor: "#FFFBEB" },
        { transform: [{ scale: s }] },
      ]}
    >
      <Text style={[styles.boxText, !char && { color: colors.inkSubtle }]}>
        {char || "–"}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    marginTop: 4,
  },
  logo: { width: 88, height: 42, marginLeft: 8 },
  edit: {
    color: "#92400E",
    fontWeight: "700",
    fontSize: 12,
    textDecorationLine: "underline",
    marginBottom: 4,
  },
  badgeOuter: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: colors.lavender,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeInner: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#FDE68A",
    alignItems: "center",
    justifyContent: "center",
  },
  badgeCheck: {
    position: "absolute",
    top: 0,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#65A30D",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  title: { fontSize: 24, fontWeight: "800", color: colors.ink, marginTop: 10 },
  subtitle: {
    fontSize: 14,
    color: colors.inkMuted,
    textAlign: "center",
    marginTop: 4,
    lineHeight: 20,
  },
  emailPill: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "stretch",
    backgroundColor: colors.lavender,
    borderRadius: 12,
    paddingVertical: 7,
    paddingHorizontal: 14,
    marginTop: 10,
  },
  emailText: { marginLeft: 8, fontWeight: "700", fontSize: 13, color: colors.ink },
  codeHint: {
    fontSize: 11.5,
    color: colors.primaryDark,
    fontWeight: "600",
  },
  boxes: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 14,
    marginVertical: 14,
  },
  box: {
    width: 54,
    height: 56,
    borderRadius: 12,
    borderWidth: 1.4,
    borderColor: colors.border,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  boxText: { fontSize: 22, fontWeight: "700", color: colors.ink },
  pad: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 36,
    justifyContent: "space-between",
  },
  key: {
    width: 64,
    height: 48,
    marginVertical: 5,
    marginHorizontal: 10,
    borderRadius: 12,
    backgroundColor: colors.lavender,
    alignItems: "center",
    justifyContent: "center",
  },
  keySpacer: { width: 64, height: 48, marginVertical: 5, marginHorizontal: 10 },
  keyNum: { fontSize: 19, fontWeight: "700", color: colors.ink },
  keySub: { fontSize: 8.5, letterSpacing: 1, color: colors.inkMuted },
  footer: {
    textAlign: "center",
    color: colors.inkMuted,
    fontSize: 12,
    marginTop: 6,
  },
});
