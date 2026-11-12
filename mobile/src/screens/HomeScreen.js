import React, { useState } from "react";
import {
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { colors, shadow } from "../theme";
import {
  ConfirmationModal,
  FadeIn,
  Icon,
  LOGO_ICON,
  ScalePress,
} from "../components/ui";
import { logoutMobileUser } from "../services/authService";

const CONDITION_LABELS = {
  none: "None",
  hypertension: "Hypertension",
  diabetes: "Diabetes",
  high_cholesterol: "High Cholesterol",
  hyperuricemia_gout: "Gout",
  gerd_acid_reflux: "Acid Reflux / GERD",
};

export default function HomeScreen({ user, profile, onFinishSetup, onLoggedOut }) {
  const first = (user?.displayName || profile?.displayName || "Chef").split(" ")[0];
  const ob = profile?.onboarding;
  const [logoutModal, setLogoutModal] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [errorModal, setErrorModal] = useState(null);

  const handleConfirmLogout = async () => {
    setLoggingOut(true);
    try {
      await logoutMobileUser();
      setLogoutModal(false);
      onLoggedOut && onLoggedOut();
    } catch (e) {
      setLogoutModal(false);
      setErrorModal(e.message || "Failed to log out.");
    } finally {
      setLoggingOut(false);
    }
  };

  const comorbiditiesStr =
    Array.isArray(ob?.comorbidities) && ob.comorbidities.length
      ? ob.comorbidities.map((c) => CONDITION_LABELS[c] || c).join(", ")
      : "None";

  const dietaryStr =
    Array.isArray(ob?.dietaryRestrictions) && ob.dietaryRestrictions.length
      ? ob.dietaryRestrictions.join(", ")
      : "None";

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
                Customize household size, dietary restrictions, comorbidities, and health goals.
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
              <Row label="Allergies & Diet" value={dietaryStr} />
              <Row label="Health Conditions" value={comorbiditiesStr} />
            </>
          ) : null}
          <Row
            label="Realtime Sync"
            value="Connected (asia-southeast1)"
            valueColor={colors.green}
            last
          />

          <ScalePress onPress={() => setLogoutModal(true)} style={styles.logoutBtn}>
            <Text style={styles.logoutText}>Sign Out</Text>
          </ScalePress>
        </FadeIn>

        <Text style={styles.footer}>Cook with joy • Less prep, zero stress</Text>
      </ScrollView>

      <ConfirmationModal
        visible={logoutModal}
        onClose={() => setLogoutModal(false)}
        onConfirm={handleConfirmLogout}
        title="Sign Out of KusinApp"
        message="Are you sure you want to log out? Your active session will be ended securely."
        confirmText="Log Out"
        cancelText="Cancel"
        variant="danger"
        loading={loggingOut}
      />

      <ConfirmationModal
        visible={!!errorModal}
        onClose={() => setErrorModal(null)}
        onConfirm={() => setErrorModal(null)}
        title="Notice"
        message={errorModal || ""}
        confirmText="OK"
        cancelText=""
      />
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
    textAlign: "right",
  },
  logoutBtn: {
    marginTop: 18,
    height: 48,
    borderRadius: 14,
    backgroundColor: colors.redSoft,
    borderWidth: 1,
    borderColor: "#FECACA",
    alignItems: "center",
    justifyContent: "center",
  },
  logoutText: {
    color: colors.red,
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
