import React, { useEffect, useRef } from "react";
import {
  Animated,
  Easing,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { colors, shadow } from "../theme";
import { FadeIn, Icon, PrimaryButton, WarmGlow } from "../components/ui";

const CONFETTI = [
  { x: -70, y: -60, size: 13, color: "#DC2626", shape: "dot" },
  { x: 70, y: -70, size: 30, color: colors.primary, shape: "star" },
  { x: 85, y: -15, size: 10, color: "#FCA5A5", shape: "dot" },
  { x: -88, y: -5, size: 9, color: "#FDBA74", shape: "dot" },
  { x: 82, y: 45, size: 9, color: "#86EFAC", shape: "dot" },
  { x: -66, y: 60, size: 24, color: "#84CC16", shape: "star" },
  { x: 12, y: 74, size: 14, color: colors.primary, shape: "dot" },
];

export default function AllSetScreen({ onContinue }) {
  const pop = useRef(new Animated.Value(0)).current;
  const check = useRef(new Animated.Value(0)).current;
  const burst = useRef(new Animated.Value(0)).current;
  const float = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.spring(pop, {
        toValue: 1,
        friction: 5,
        tension: 60,
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.spring(check, {
          toValue: 1,
          friction: 4,
          tension: 120,
          useNativeDriver: true,
        }),
        Animated.timing(burst, {
          toValue: 1,
          duration: 650,
          easing: Easing.out(Easing.back(1.6)),
          useNativeDriver: true,
        }),
      ]),
    ]).start();
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(float, {
          toValue: 1,
          duration: 1800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(float, {
          toValue: 0,
          duration: 1800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pop, check, burst, float]);

  const bob = float.interpolate({ inputRange: [0, 1], outputRange: [0, -6] });

  return (
    <SafeAreaView style={styles.container}>
      <FadeIn style={styles.tag}>
        <Icon name="silverware-fork-knife" size={13} color={colors.primaryDark} />
        <Text style={styles.tagText}>MALIGAYANG PAGDATING</Text>
      </FadeIn>

      <View style={styles.center}>
        <WarmGlow size={360} />
        {CONFETTI.map((c, i) => (
          <Animated.View
            key={i}
            style={{
              position: "absolute",
              opacity: burst,
              transform: [
                {
                  translateX: burst.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, c.x * 1.25],
                  }),
                },
                {
                  translateY: Animated.add(
                    burst.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, c.y * 1.25],
                    }),
                    bob
                  ),
                },
                { scale: burst },
              ],
            }}
          >
            {c.shape === "star" ? (
              <Icon name="star-four-points" size={c.size} color={c.color} />
            ) : (
              <View
                style={{
                  width: c.size,
                  height: c.size,
                  borderRadius: c.size / 2,
                  backgroundColor: c.color,
                }}
              />
            )}
          </Animated.View>
        ))}
        <Animated.View
          style={[
            styles.circle,
            { transform: [{ scale: pop }, { translateY: bob }] },
          ]}
        >
          <Animated.View style={{ transform: [{ scale: check }] }}>
            <Text style={styles.bigCheck}>✓</Text>
          </Animated.View>
        </Animated.View>
      </View>

      <FadeIn delay={600} style={{ alignItems: "center", paddingHorizontal: 32 }}>
        <View style={styles.readyPill}>
          <View style={styles.greenSeal}>
            <Text style={{ color: "#fff", fontSize: 9, fontWeight: "800" }}>✓</Text>
          </View>
          <Text style={styles.readyText}>KusinApp Profile Ready</Text>
        </View>
        <Text style={styles.title}>You're All Set!</Text>
        <Text style={styles.subtitle}>
          Your dietary preferences and household{"\n"}details have been saved. Let's start{"\n"}planning your meals.
        </Text>
      </FadeIn>

      <View style={{ flex: 1 }} />
      <FadeIn delay={820} style={{ paddingHorizontal: 26, paddingBottom: 16 }}>
        <PrimaryButton
          title="Go to Homepage"
          onPress={onContinue}
          style={{ borderRadius: 28, height: 56 }}
        />
      </FadeIn>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", alignItems: "stretch" },
  tag: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "center",
    backgroundColor: colors.lavender,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 7,
    marginTop: 22,
  },
  tagText: {
    marginLeft: 6,
    fontWeight: "700",
    fontSize: 11.5,
    letterSpacing: 0.7,
    color: "#334155",
  },
  center: { height: 330, alignItems: "center", justifyContent: "center" },
  circle: {
    width: 126,
    height: 126,
    borderRadius: 63,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    ...shadow.button,
  },
  bigCheck: {
    color: "#fff",
    fontSize: 48,
    fontWeight: "800",
  },
  readyPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.lavender,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  greenSeal: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#4D7C0F",
    alignItems: "center",
    justifyContent: "center",
  },
  readyText: { marginLeft: 7, fontWeight: "700", fontSize: 12.5, color: colors.ink },
  title: { fontSize: 26, fontWeight: "800", color: colors.ink, marginTop: 14 },
  subtitle: {
    fontSize: 14.5,
    color: "#57534E",
    textAlign: "center",
    lineHeight: 22,
    marginTop: 10,
  },
});
