import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  ActivityIndicator,
  Platform,
  TouchableOpacity,
} from "react-native";
import { colors, shadow } from "../theme";

export const LOGO_ICON = require("../../assets/logo-stacked.png");

export function tap(_style = "light") {
  // Lightweight no-op/safe tactile hook without requiring extra native modules
}

/**
 * Pure React Native Icon component that renders crisp icons for all screens
 * without requiring @expo/vector-icons or external font files.
 */
export function Icon({ name, size = 18, color = colors.ink, style }) {
  const glyphMap = {
    "arrow-right": "→",
    "arrow-left": "←",
    "chevron-left": "‹",
    "chevron-right": "›",
    "chevron-down": "⌄",
    check: "✓",
    "check-circle": "✓",
    "check-decagram": "✓",
    user: "👤",
    "at-sign": "@",
    mail: "✉",
    lock: "🔒",
    shield: "🛡",
    eye: "👁",
    "eye-off": "◡",
    "alert-circle": "!",
    delete: "⌫",
    coffee: "🪑",
    table: "🪑",
    heart: "♡",
    award: "🥄",
    taste: "🥄",
    "lightbulb-outline": "💡",
    "chef-hat": "👩🏻‍🍳",
    "piggy-bank-outline": "🐷",
    "trash-can-outline": "🗑",
    carrot: "🥕",
    "clock-outline": "🕒",
    "gender-female": "♀",
    "gender-male": "♂",
    "scale-balance": "⚖",
    "trending-up": "↗",
    fire: "🔥",
    "menu-down": "▾",
    info: "ⓘ",
    minus: "−",
    plus: "+",
    "silverware-fork-knife": "🍴",
    "star-four-points": "✦",
    "log-out": "↪",
    sliders: "⚙",
    calendar: "📅",
  };

  // Custom drawn eye icon for password visibility toggle
  if (name === "eye" || name === "eye-off") {
    return (
      <View
        style={[
          {
            width: size + 4,
            height: size,
            alignItems: "center",
            justifyContent: "center",
          },
          style,
        ]}
      >
        <View
          style={{
            width: size,
            height: Math.round(size * 0.62),
            borderRadius: size,
            borderWidth: 1.6,
            borderColor: color,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <View
            style={{
              width: Math.max(4, Math.round(size * 0.26)),
              height: Math.max(4, Math.round(size * 0.26)),
              borderRadius: size,
              backgroundColor: color,
            }}
          />
        </View>
        {name === "eye-off" ? (
          <View
            style={{
              position: "absolute",
              width: size + 2,
              height: 1.6,
              backgroundColor: color,
              transform: [{ rotate: "-35deg" }],
            }}
          />
        ) : null}
      </View>
    );
  }

  // Custom drawn person icon
  if (name === "user") {
    return (
      <View
        style={[
          {
            width: size,
            height: size,
            alignItems: "center",
            justifyContent: "center",
          },
          style,
        ]}
      >
        <View
          style={{
            width: Math.round(size * 0.42),
            height: Math.round(size * 0.42),
            borderRadius: size,
            borderWidth: 1.5,
            borderColor: color,
            marginBottom: 1,
          }}
        />
        <View
          style={{
            width: Math.round(size * 0.72),
            height: Math.round(size * 0.34),
            borderTopLeftRadius: size,
            borderTopRightRadius: size,
            borderWidth: 1.5,
            borderBottomWidth: 0,
            borderColor: color,
          }}
        />
      </View>
    );
  }

  const glyph = glyphMap[name] || "•";
  const isChevron = name === "chevron-left" || name === "chevron-right";

  return (
    <Text
      style={[
        {
          fontSize: isChevron ? size * 1.35 : size * 0.92,
          lineHeight: isChevron ? size * 1.4 : size * 1.15,
          color,
          fontWeight: "700",
          textAlign: "center",
        },
        style,
      ]}
    >
      {glyph}
    </Text>
  );
}

/** Fades + slides children in, optionally after a delay (for staggered lists). */
export function FadeIn({ delay = 0, from = 16, duration = 420, style, children }) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(v, {
      toValue: 1,
      duration,
      delay,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [v, delay, duration]);
  return (
    <Animated.View
      style={[
        style,
        {
          opacity: v,
          transform: [
            { translateY: v.interpolate({ inputRange: [0, 1], outputRange: [from, 0] }) },
          ],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}

/** Touch component with smooth native active opacity that preserves flex layout */
export function ScalePress({ onPress, disabled, style, children, activeOpacity = 0.82, ...rest }) {
  return (
    <TouchableOpacity
      activeOpacity={activeOpacity}
      onPress={(e) => {
        if (disabled) return;
        onPress && onPress(e);
      }}
      disabled={disabled}
      style={style}
      {...rest}
    >
      {children}
    </TouchableOpacity>
  );
}

export function PrimaryButton({ title, onPress, loading, disabled, icon = "arrow-right", style }) {
  return (
    <ScalePress
      onPress={onPress}
      disabled={disabled || loading}
      style={[styles.primaryBtn, (disabled || loading) && { opacity: 0.6 }, style]}
    >
      {loading ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <>
          <Text style={styles.primaryBtnText}>{title}</Text>
          {icon ? <Icon name={icon} size={18} color="#fff" style={{ marginLeft: 8 }} /> : null}
        </>
      )}
    </ScalePress>
  );
}

export function GoogleButton({ title = "Continue with Google", onPress, loading }) {
  return (
    <ScalePress onPress={onPress} disabled={loading} style={styles.googleBtn}>
      {loading ? (
        <ActivityIndicator color={colors.ink} />
      ) : (
        <>
          <View style={styles.googleGBadge}>
            <Text style={styles.googleGText}>G</Text>
          </View>
          <Text style={styles.googleText}>{title}</Text>
        </>
      )}
    </ScalePress>
  );
}

export function Divider({ label = "OR\nCONTINUE\nWITH" }) {
  return (
    <View style={styles.dividerRow}>
      <View style={styles.dividerLine} />
      <Text style={styles.dividerText}>{label}</Text>
      <View style={styles.dividerLine} />
    </View>
  );
}

export function BackButton({ onPress, variant = "plain" }) {
  return (
    <ScalePress
      onPress={onPress}
      style={variant === "circle" ? styles.backCircle : styles.backPlain}
      hitSlop={12}
    >
      <Icon
        name={variant === "circle" ? "arrow-left" : "chevron-left"}
        size={variant === "circle" ? 20 : 24}
        color={colors.ink}
      />
    </ScalePress>
  );
}

/** "STEP 1 OF 3" label with animated progress pills. */
export function StepIndicator({ step, total = 3 }) {
  return (
    <View style={{ alignItems: "flex-end" }}>
      <Text style={styles.stepLabel}>
        STEP {step} OF {total}
      </Text>
      <View style={{ flexDirection: "row", marginTop: 6 }}>
        {Array.from({ length: total }).map((_, i) => (
          <StepPill key={i} active={i < step} />
        ))}
      </View>
    </View>
  );
}

function StepPill({ active }) {
  const v = useRef(new Animated.Value(active ? 1 : 0)).current;
  useEffect(() => {
    Animated.timing(v, { toValue: active ? 1 : 0, duration: 350, useNativeDriver: false }).start();
  }, [active, v]);
  return (
    <Animated.View
      style={[
        styles.stepPill,
        {
          width: v.interpolate({ inputRange: [0, 1], outputRange: [12, 24] }),
          backgroundColor: v.interpolate({
            inputRange: [0, 1],
            outputRange: [colors.border, colors.primary],
          }),
        },
      ]}
    />
  );
}

export function Field({
  label,
  icon,
  value,
  onChangeText,
  placeholder,
  secure,
  keyboardType,
  autoCapitalize = "none",
  error,
  onSubmitEditing,
  returnKeyType,
  inputRef,
}) {
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(true);
  const f = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(f, { toValue: focused ? 1 : 0, duration: 180, useNativeDriver: false }).start();
  }, [focused, f]);

  return (
    <View style={{ marginBottom: 14 }}>
      {label ? <Text style={styles.fieldLabel}>{label}</Text> : null}
      <Animated.View
        style={[
          styles.fieldBox,
          {
            borderColor: error
              ? colors.red
              : f.interpolate({ inputRange: [0, 1], outputRange: [colors.border, colors.primary] }),
            backgroundColor: f.interpolate({
              inputRange: [0, 1],
              outputRange: [colors.field, colors.white],
            }),
          },
        ]}
      >
        {icon ? (
          <Icon
            name={icon}
            size={16}
            color={focused ? colors.primary : colors.inkSubtle}
            style={{ marginRight: 10 }}
          />
        ) : null}
        <TextInput
          ref={inputRef}
          style={styles.fieldInput}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.inkSubtle}
          secureTextEntry={secure && hidden}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={false}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onSubmitEditing={onSubmitEditing}
          returnKeyType={returnKeyType}
        />
        {secure ? (
          <Pressable onPress={() => setHidden((h) => !h)} hitSlop={10}>
            <Icon name={hidden ? "eye" : "eye-off"} size={18} color={colors.inkSubtle} />
          </Pressable>
        ) : null}
      </Animated.View>
    </View>
  );
}

/** Red banner that shakes whenever `message` changes. */
export function ErrorBanner({ message }) {
  const x = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!message) return;
    Animated.sequence(
      [10, -10, 7, -7, 3, 0].map((toValue) =>
        Animated.timing(x, { toValue, duration: 55, useNativeDriver: true })
      )
    ).start();
  }, [message, x]);
  if (!message) return null;
  return (
    <Animated.View style={[styles.errorBox, { transform: [{ translateX: x }] }]}>
      <View style={styles.errorDot}>
        <Text style={{ color: "#fff", fontSize: 11, fontWeight: "800" }}>!</Text>
      </View>
      <Text style={styles.errorText}>{message}</Text>
    </Animated.View>
  );
}

/** Soft warm radial-style glow built from stacked translucent circles. */
export function WarmGlow({ size = 340, style }) {
  const pulse = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 2600,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 2600,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);
  const scale = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.95, 1.05] });
  return (
    <Animated.View
      pointerEvents="none"
      style={[
        {
          position: "absolute",
          width: size,
          height: size,
          alignItems: "center",
          justifyContent: "center",
          transform: [{ scale }],
        },
        style,
      ]}
    >
      {[1, 0.78, 0.58, 0.4].map((k, i) => (
        <View
          key={i}
          style={{
            position: "absolute",
            width: size * k,
            height: size * k,
            borderRadius: (size * k) / 2,
            backgroundColor: colors.primaryGlow,
            opacity: 0.11 + i * 0.04,
          }}
        />
      ))}
    </Animated.View>
  );
}

/** Header row with the KusinApp mark beside a title (signup/onboarding). */
export function TitleWithLogo({ title }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 6 }}>
      <View style={styles.logoCardSmall}>
        <Image source={LOGO_ICON} style={{ width: 28, height: 28 }} resizeMode="contain" />
      </View>
      <Text style={styles.screenTitle}>{title}</Text>
    </View>
  );
}

export const styles = StyleSheet.create({
  primaryBtn: {
    height: 54,
    borderRadius: 16,
    backgroundColor: colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    ...shadow.button,
  },
  primaryBtnText: { color: "#fff", fontSize: 17, fontWeight: "700" },
  googleBtn: {
    height: 52,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  googleGBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  googleGText: {
    fontSize: 16,
    fontWeight: "800",
    color: "#4285F4",
  },
  googleText: { fontSize: 15, fontWeight: "600", color: colors.ink },
  dividerRow: { flexDirection: "row", alignItems: "center", marginVertical: 18 },
  dividerLine: { flex: 1, height: 1, backgroundColor: colors.border },
  dividerText: {
    marginHorizontal: 14,
    fontSize: 10,
    letterSpacing: 1.1,
    color: colors.inkSubtle,
    fontWeight: "600",
    textAlign: "center",
  },
  backPlain: { width: 38, height: 38, justifyContent: "center" },
  backCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.lavender,
    alignItems: "center",
    justifyContent: "center",
  },
  stepLabel: { fontSize: 12, fontWeight: "700", letterSpacing: 1.4, color: colors.inkSubtle },
  stepPill: { height: 5, borderRadius: 3, marginLeft: 5 },
  fieldLabel: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.9,
    color: "#1E293B",
    marginBottom: 7,
  },
  fieldBox: {
    height: 50,
    borderRadius: 12,
    borderWidth: 1.2,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
  },
  fieldInput: { flex: 1, fontSize: 15, color: colors.ink, height: "100%" },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.redSoft,
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
  },
  errorDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.red,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  errorText: { color: colors.red, fontSize: 13, flex: 1, fontWeight: "600" },
  logoCardSmall: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: "#FAFAFA",
    borderWidth: 1,
    borderColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  screenTitle: { fontSize: 22, fontWeight: "800", color: colors.ink, flexShrink: 1 },
});
