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
import { FadeIn, PrimaryButton } from "../components/ui";

const CONFETTI = [
  { x: -70, y: -60, size: 10, color: "#DC2626" },
  { x: 70, y: -70, size: 12, color: colors.primary },
  { x: 85, y: -15, size: 8, color: "#FCA5A5" },
  { x: -88, y: -5, size: 8, color: "#FDBA74" },
  { x: 82, y: 45, size: 8, color: "#86EFAC" },
  { x: -66, y: 60, size: 11, color: "#84CC16" },
  { x: 12, y: 74, size: 10, color: colors.primary },
];

export default function AllSetScreen({ onContinue }) {
  const pop = useRef(new Animated.Value(0)).current;
  const check = useRef(new Animated.Value(0)).current;
  const burst = useRef(new Animated.Value(0)).current;

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
  }, [pop, check, burst]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.contentWrap}>
        <View style={styles.center}>
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
                      outputRange: [0, c.x * 1.3],
                    }),
                  },
                  {
                    translateY: burst.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, c.y * 1.3],
                    }),
                  },
                  { scale: burst },
                ],
              }}
            >
              <View
                style={{
                  width: c.size,
                  height: c.size,
                  borderRadius: c.size / 2,
                  backgroundColor: c.color,
                }}
              />
            </Animated.View>
          ))}
          <Animated.View
            style={[
              styles.circle,
              { transform: [{ scale: pop }] },
            ]}
          >
            <Animated.View style={{ transform: [{ scale: check }] }}>
              <Text style={styles.bigCheck}>✓</Text>
            </Animated.View>
          </Animated.View>
        </View>

        <FadeIn delay={400} style={styles.textBlock}>
          <Text style={styles.title}>You're All Set!</Text>
          <Text style={styles.subtitle}>
            Your dietary preferences and household details have been saved. Let's start planning your meals.
          </Text>
        </FadeIn>
      </View>

      <FadeIn delay={600} style={styles.bottomSection}>
        <PrimaryButton
          title="Go to Homepage"
          onPress={onContinue}
          style={{ height: 54 }}
        />
      </FadeIn>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  contentWrap: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  center: {
    width: 240,
    height: 240,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 28,
  },
  circle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    ...shadow.button,
  },
  bigCheck: {
    color: "#fff",
    fontSize: 52,
    fontWeight: "800",
  },
  textBlock: {
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: colors.ink,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 15,
    color: colors.inkMuted,
    textAlign: "center",
    lineHeight: 23,
    marginTop: 12,
    maxWidth: 320,
  },
  bottomSection: {
    paddingHorizontal: 26,
    paddingBottom: 20,
  },
});
