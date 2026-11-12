import React, { useEffect, useRef, useState } from "react";
import { Animated, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { colors } from "../theme";
import {
  BackButton,
  ConfirmationModal,
  ErrorBanner,
  FadeIn,
  Icon,
  PrimaryButton,
  ScalePress,
} from "../components/ui";
import {
  registerMobileUser,
  sendVerificationEmailLink,
} from "../services/authService";
import { auth } from "../config/firebase";

export default function VerifyScreen({ data, onBack, onEdit, onVerified }) {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [createdResult, setCreatedResult] = useState(null);
  const [infoModal, setInfoModal] = useState(null);
  const registeredOnce = useRef(false);

  // Create account & send verification link on mount
  useEffect(() => {
    if (registeredOnce.current) return;
    registeredOnce.current = true;

    let active = true;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const result = await registerMobileUser(
          data.email,
          data.password,
          data.name,
          data.gender
        );
        if (active) {
          setCreatedResult(result);
        }
      } catch (e) {
        if (active) {
          setError(e.message || "Could not create account.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    })();

    return () => {
      active = false;
    };
  }, [data]);

  const handleResendLink = async () => {
    setError("");
    setResending(true);
    try {
      await sendVerificationEmailLink(createdResult?.user || auth.currentUser);
      setInfoModal({
        title: "Verification Link Sent",
        message: `A fresh verification link has been sent to ${data.email}. Please check your inbox or spam folder.`,
      });
    } catch (e) {
      setError(e.message || "Could not resend verification link.");
    } finally {
      setResending(false);
    }
  };

  const handleContinue = async () => {
    setError("");
    if (createdResult) {
      try {
        await auth.currentUser?.reload?.();
      } catch (_e) {
        // Proceed even if reload is offline
      }
      onVerified(createdResult);
      return;
    }

    // Retry account creation if initial attempt failed
    setLoading(true);
    try {
      const result = await registerMobileUser(
        data.email,
        data.password,
        data.name,
        data.gender
      );
      setCreatedResult(result);
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
      </View>

      <View style={styles.body}>
        <FadeIn style={{ alignItems: "center" }}>
          <MailBadge />
          <Text style={styles.title}>Check Your Email</Text>
          <Text style={styles.subtitle}>
            We sent a verification link to your email address:
          </Text>
          <Text style={styles.emailHighlight}>{data.email}</Text>
          <ScalePress onPress={onEdit} style={{ marginTop: 6 }}>
            <Text style={styles.edit}>Change email address</Text>
          </ScalePress>
        </FadeIn>

        <FadeIn delay={140} style={styles.instructionsCard}>
          <View style={styles.stepRow}>
            <View style={styles.stepCircle}>
              <Text style={styles.stepNum}>1</Text>
            </View>
            <Text style={styles.stepText}>
              Open the email from KusinApp in your inbox or spam folder.
            </Text>
          </View>
          <View style={[styles.stepRow, { marginTop: 12 }]}>
            <View style={styles.stepCircle}>
              <Text style={styles.stepNum}>2</Text>
            </View>
            <Text style={styles.stepText}>
              Tap the verification link inside the email to activate your account, then tap Continue below.
            </Text>
          </View>
        </FadeIn>

        <View style={{ width: "100%", marginTop: 14 }}>
          <ErrorBanner message={error} />
        </View>

        <FadeIn delay={220} style={{ alignItems: "center", marginTop: 10 }}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleResendLink}
            disabled={resending || loading}
            style={styles.resendBtn}
          >
            <Text style={styles.resendText}>
              {resending ? "Sending link..." : "Didn't receive the email? Resend link"}
            </Text>
          </TouchableOpacity>
        </FadeIn>
      </View>

      <View style={{ paddingHorizontal: 24, paddingBottom: 14 }}>
        <PrimaryButton
          title="Continue to Kusina Setup"
          onPress={handleContinue}
          loading={loading}
        />
        <Text style={styles.footer}>KusinApp Email Link Authentication</Text>
      </View>

      <ConfirmationModal
        visible={!!infoModal}
        title={infoModal?.title || ""}
        message={infoModal?.message || ""}
        confirmText="Got it"
        cancelText=""
        onClose={() => setInfoModal(null)}
        onConfirm={() => setInfoModal(null)}
      />
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
      delay: 180,
      useNativeDriver: true,
    }).start();
  }, [pop]);
  return (
    <View style={styles.badgeOuter}>
      <View style={styles.badgeInner}>
        <Icon name="mail" size={26} color={colors.primaryDark} />
      </View>
      <Animated.View style={[styles.badgeCheck, { transform: [{ scale: pop }] }]}>
        <Text style={{ color: "#fff", fontSize: 10, fontWeight: "800" }}>✓</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    marginTop: 6,
  },
  body: {
    flex: 1,
    paddingHorizontal: 26,
    justifyContent: "center",
    alignItems: "center",
  },
  badgeOuter: {
    width: 78,
    height: 78,
    borderRadius: 39,
    backgroundColor: colors.lavender,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  badgeInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#FDE68A",
    alignItems: "center",
    justifyContent: "center",
  },
  badgeCheck: {
    position: "absolute",
    top: 2,
    right: 0,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#65A30D",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: colors.ink,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: colors.inkMuted,
    textAlign: "center",
    marginTop: 8,
    lineHeight: 20,
  },
  emailHighlight: {
    fontSize: 15.5,
    fontWeight: "800",
    color: colors.ink,
    marginTop: 4,
    textAlign: "center",
  },
  edit: {
    color: colors.primaryDark,
    fontWeight: "700",
    fontSize: 13,
    textDecorationLine: "underline",
  },
  instructionsCard: {
    width: "100%",
    backgroundColor: "#F8FAFC",
    borderWidth: 1.2,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 18,
    marginTop: 22,
  },
  stepRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  stepCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#FEF3C7",
    borderWidth: 1,
    borderColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    marginTop: 1,
  },
  stepNum: {
    fontSize: 12,
    fontWeight: "800",
    color: colors.primaryDark,
  },
  stepText: {
    flex: 1,
    fontSize: 13.5,
    color: colors.inkMuted,
    lineHeight: 20,
  },
  resendBtn: {
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  resendText: {
    fontSize: 13.5,
    fontWeight: "700",
    color: colors.primaryDark,
  },
  footer: {
    textAlign: "center",
    color: colors.inkMuted,
    fontSize: 12,
    marginTop: 8,
  },
});
