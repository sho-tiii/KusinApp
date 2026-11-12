import React from "react";
import {
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { colors } from "../theme";
import {
  BackButton,
  FadeIn,
  Icon,
  LOGO_ICON,
  PrimaryButton,
  ScalePress,
  WarmGlow,
} from "../components/ui";

const ITEMS = [
  ["table", "Your table", "Who you're cooking for"],
  ["heart", "Your health", "Your goal and any health needs"],
  ["taste", "Your taste", "The dishes and flavours you love"],
];

export default function SetupIntroScreen({ name, onBack, onStart, onLater }) {
  const { width } = useWindowDimensions();
  const first = (name || "Chef").split(" ")[0];
  return (
    <SafeAreaView style={styles.container}>
      <WarmGlow size={420} style={{ top: -160, right: -180 }} />
      <View style={styles.topRow}>
        {onBack ? <BackButton variant="circle" onPress={onBack} /> : null}
        <Image source={LOGO_ICON} style={styles.logo} resizeMode="contain" />
      </View>

      <FadeIn from={30} style={{ alignItems: "center" }}>
        <Image
          source={require("../../assets/setup-kusina.png")}
          style={{ width: width * 0.58, height: width * 0.58 }}
          resizeMode="contain"
        />
      </FadeIn>

      <FadeIn delay={120}>
        <Text style={styles.title}>
          Let's set up your kusina,{"\n"}
          {first}
        </Text>
      </FadeIn>

      <View style={{ paddingHorizontal: 24, marginTop: 16 }}>
        {ITEMS.map(([icon, t, d], i) => (
          <FadeIn key={t} delay={200 + i * 100}>
            <View style={styles.card}>
              <View style={styles.iconBox}>
                <Icon name={icon} size={18} color={colors.ink} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>{t}</Text>
                <Text style={styles.cardDesc}>{d}</Text>
              </View>
            </View>
          </FadeIn>
        ))}
      </View>

      <View style={{ flex: 1 }} />
      <FadeIn delay={520} style={{ paddingHorizontal: 24, paddingBottom: 10 }}>
        <PrimaryButton title="START" icon={null} onPress={onStart} />
        <ScalePress onPress={onLater} style={{ alignSelf: "center", padding: 14 }}>
          <Text style={styles.later}>I'll do this later</Text>
        </ScalePress>
      </FadeIn>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", overflow: "hidden" },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    marginTop: 4,
    height: 50,
  },
  logo: { width: 88, height: 42, marginLeft: 8 },
  title: {
    fontSize: 25,
    fontWeight: "800",
    color: colors.ink,
    textAlign: "center",
    lineHeight: 33,
    marginTop: 6,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F4F6FB",
    borderRadius: 16,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E8ECF6",
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  cardTitle: { fontSize: 15, fontWeight: "700", color: colors.ink },
  cardDesc: { fontSize: 12.5, color: colors.inkMuted, marginTop: 2 },
  later: { color: colors.inkMuted, fontSize: 13.5, fontWeight: "600" },
});
