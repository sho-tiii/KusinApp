import React from "react";
import {
  Alert,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { colors, shadow } from "../theme";
import { FadeIn, Icon, LOGO_ICON, PrimaryButton, ScalePress } from "../components/ui";
import { logoutMobileUser } from "../services/authService";

export default function HomeScreen({ user, profile, onFinishSetup, onLoggedOut }) {
  const first = (user?.displayName || profile?.displayName || "Chef").split(" ")[0];
  const ob = profile?.onboarding;

  const logout = () =>
    Alert.alert("Log Out", "Are you sure you want to end your KusinApp session?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log Out",
        style: "destructive",
        onPress: async () => {
          try {
            await logoutMobileUser();
            onLoggedOut && onLoggedOut();
          } catch (e) {
            Alert.alert("Error", e.message);
          }
        },
      },
    ]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <FadeIn style={styles.header}>
          <Image
            source={LOGO_ICON}
            style={{ width: 52, height: 52 }}
            resizeMode="contain"
          />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.hello}>Mabuhay, {first}!</Text>
            <Text style={styles.sub}>
              Your mobile sous-chef is synced and ready to cook.
            </Text>
          </View>
        </FadeIn>

        <FadeIn delay={100}>
          <ScalePress onPress={onFinishSetup} style={styles.setupCard}>
            <View style={styles.setupIcon}>
              <Icon name="sliders" size={20} color={colors.primaryDark} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.setupTitle}>
                {profile?.onboardingCompleted
                  ? "Update your Kusina Preferences"
                  : "Finish setting up your kusina"}
              </Text>
              <Text style={styles.setupDesc}>
                Customize household size, dietary restrictions, and health goals.
              </Text>
            </View>
            <Icon name="chevron-right" size={20} color={colors.primaryDark} />
          </ScalePress>
        </FadeIn>

        <FadeIn delay={180} style={styles.card}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarInitial}>{first[0]?.toUpperCase() || "K"}</Text>
          </View>
          <Text style={styles.cardTitle}>KusinApp Profile</Text>
          <Row label="Display Name" value={user?.displayName || profile?.displayName} />
          <Row label="Email" value={user?.email} />
          {ob ? (
            <>
              <Row
                label="Household"
                value={`${ob.householdSize} ${ob.householdSize > 1 ? "people" : "person"}`}
              />
              <Row label="BMI" value={`${ob.bmi} (${ob.bmiCategory})`} />
              <Row label="Daily BMR" value={`${ob.bmr} kcal`} />
              <Row label="Weight Goal" value={ob.weightGoal} />
            </>
          ) : null}
          <Row
            label="Realtime Sync"
            value="Connected (asia-southeast1)"
            valueColor={colors.green}
            last
          />

          <ScalePress onPress={logout} style={styles.logoutPill}>
            <Text style={styles.logoutText}>Log Out</Text>
          </ScalePress>
        </FadeIn>

        <Text style={styles.footer}>Cook with joy • Less prep, zero stress</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function Row({ label, value, last, valueColor }) {
  return (
    <View style={[styles.row, last && { borderBottomWidth: 0 }]}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text
        style={[styles.rowValue, valueColor && { color: valueColor }]}
        numberOfLines={1}
      >
        {value || "—"}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  scroll: { padding: 24 },
  header: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
  hello: { fontSize: 22, fontWeight: "800", color: colors.ink },
  sub: { fontSize: 13, color: colors.inkMuted, marginTop: 2 },
  setupCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFBEB",
    borderColor: colors.primaryGlow,
    borderWidth: 1.5,
    borderRadius: 18,
    padding: 15,
    marginBottom: 16,
  },
  setupIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  setupTitle: { fontSize: 15, fontWeight: "700", color: colors.ink },
  setupDesc: {
    fontSize: 12.5,
    color: colors.inkMuted,
    marginTop: 2,
    lineHeight: 17,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 20,
    ...shadow.card,
  },
  avatarCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: colors.primarySoft,
    borderWidth: 2,
    borderColor: colors.primaryGlow,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginBottom: 10,
  },
  avatarInitial: {
    fontSize: 24,
    fontWeight: "800",
    color: "#92400E",
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.ink,
    textAlign: "center",
    marginBottom: 12,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  rowLabel: { color: colors.inkMuted, fontSize: 13 },
  rowValue: {
    color: colors.ink,
    fontWeight: "700",
    fontSize: 13,
    maxWidth: "62%",
  },
  logoutPill: {
    marginTop: 18,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.lavender,
    alignItems: "center",
    justifyContent: "center",
  },
  logoutText: {
    color: "#9F1239",
    fontWeight: "700",
    fontSize: 15,
  },
  footer: {
    textAlign: "center",
    color: colors.inkSubtle,
    fontSize: 12,
    marginTop: 24,
  },
});
