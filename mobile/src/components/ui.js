import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Image,
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
const GOOGLE_G = require("../../assets/google-g.png");

/**
 * Pure geometric vector icons with ZERO emojis.
 * Clean, minimalist, and aligned with standard iOS/Android design systems.
 */
export function Icon({ name, size = 18, color = colors.ink, style }) {
  // Arrow right: →
  if (name === "arrow-right") {
    return (
      <Text style={[{ fontSize: size, fontWeight: "700", color, lineHeight: size * 1.1 }, style]}>
        →
      </Text>
    );
  }

  // Arrow left: ←
  if (name === "arrow-left") {
    return (
      <Text style={[{ fontSize: size, fontWeight: "700", color, lineHeight: size * 1.1 }, style]}>
        ←
      </Text>
    );
  }

  // Chevron left: ‹
  if (name === "chevron-left") {
    return (
      <Text style={[{ fontSize: size * 1.4, fontWeight: "700", color, lineHeight: size * 1.4 }, style]}>
        ‹
      </Text>
    );
  }

  // Chevron right: ›
  if (name === "chevron-right") {
    return (
      <Text style={[{ fontSize: size * 1.4, fontWeight: "700", color, lineHeight: size * 1.4 }, style]}>
        ›
      </Text>
    );
  }

  // Chevron down: ⌄
  if (name === "chevron-down") {
    return (
      <Text style={[{ fontSize: size * 1.1, fontWeight: "700", color, lineHeight: size * 1.1 }, style]}>
        ▾
      </Text>
    );
  }

  // Checkmark: ✓
  if (name === "check" || name === "check-circle") {
    return (
      <Text style={[{ fontSize: size, fontWeight: "800", color, lineHeight: size * 1.1 }, style]}>
        ✓
      </Text>
    );
  }

  // Minus: −
  if (name === "minus") {
    return (
      <Text style={[{ fontSize: size * 1.2, fontWeight: "700", color, lineHeight: size * 1.1 }, style]}>
        −
      </Text>
    );
  }

  // Plus: +
  if (name === "plus") {
    return (
      <Text style={[{ fontSize: size * 1.2, fontWeight: "700", color, lineHeight: size * 1.1 }, style]}>
        +
      </Text>
    );
  }

  // Delete / Backspace
  if (name === "delete") {
    return (
      <Text style={[{ fontSize: size * 1.1, fontWeight: "700", color, lineHeight: size * 1.1 }, style]}>
        ⌫
      </Text>
    );
  }

  // Eye / Eye-off for password visibility
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

  // User icon
  if (name === "user") {
    return (
      <View style={[{ width: size, height: size, alignItems: "center", justifyContent: "center" }, style]}>
        <View
          style={{
            width: Math.round(size * 0.44),
            height: Math.round(size * 0.44),
            borderRadius: size,
            borderWidth: 1.6,
            borderColor: color,
            marginBottom: 1,
          }}
        />
        <View
          style={{
            width: Math.round(size * 0.76),
            height: Math.round(size * 0.36),
            borderTopLeftRadius: size,
            borderTopRightRadius: size,
            borderWidth: 1.6,
            borderBottomWidth: 0,
            borderColor: color,
          }}
        />
      </View>
    );
  }

  // Mail icon
  if (name === "mail" || name === "at-sign") {
    return (
      <View style={[{ width: size, height: size * 0.75, borderWidth: 1.6, borderColor: color, borderRadius: 3, justifyContent: "flex-start", overflow: "hidden" }, style]}>
        <View style={{ width: "100%", height: 1.5, backgroundColor: color, transform: [{ rotate: "25deg" }, { translateY: 3 }] }} />
      </View>
    );
  }

  // Female gender symbol
  if (name === "gender-female") {
    return (
      <View style={[{ width: size, height: size, alignItems: "center", justifyContent: "center" }, style]}>
        <View
          style={{
            width: Math.round(size * 0.6),
            height: Math.round(size * 0.6),
            borderRadius: size,
            borderWidth: 1.8,
            borderColor: color,
          }}
        />
        <View style={{ width: 1.8, height: Math.round(size * 0.36), backgroundColor: color }} />
        <View
          style={{
            position: "absolute",
            bottom: Math.round(size * 0.12),
            width: Math.round(size * 0.4),
            height: 1.8,
            backgroundColor: color,
          }}
        />
      </View>
    );
  }

  // Male gender symbol
  if (name === "gender-male") {
    return (
      <View style={[{ width: size, height: size, alignItems: "center", justifyContent: "center" }, style]}>
        <View
          style={{
            width: Math.round(size * 0.62),
            height: Math.round(size * 0.62),
            borderRadius: size,
            borderWidth: 1.8,
            borderColor: color,
            marginTop: 4,
            marginRight: 4,
          }}
        />
        <View
          style={{
            position: "absolute",
            top: 2,
            right: 2,
            width: 1.8,
            height: Math.round(size * 0.45),
            backgroundColor: color,
            transform: [{ rotate: "45deg" }],
          }}
        />
        <View
          style={{
            position: "absolute",
            top: 1,
            right: 1,
            width: Math.round(size * 0.28),
            height: 1.8,
            backgroundColor: color,
          }}
        />
        <View
          style={{
            position: "absolute",
            top: 1,
            right: 1,
            width: 1.8,
            height: Math.round(size * 0.28),
            backgroundColor: color,
          }}
        />
      </View>
    );
  }

  // Table (dining / portion setup)
  if (name === "table") {
    return (
      <View style={[{ width: size, height: size, alignItems: "center", justifyContent: "center" }, style]}>
        <View style={{ width: size * 0.9, height: 2, backgroundColor: color, borderRadius: 1 }} />
        <View style={{ width: size * 0.7, flexDirection: "row", justifyContent: "space-between", height: size * 0.45 }}>
          <View style={{ width: 2, height: "100%", backgroundColor: color }} />
          <View style={{ width: 2, height: "100%", backgroundColor: color }} />
        </View>
      </View>
    );
  }

  // Heart (health goals)
  if (name === "heart") {
    return (
      <View style={[{ width: size, height: size, alignItems: "center", justifyContent: "center" }, style]}>
        <View style={{ flexDirection: "row", marginTop: -2 }}>
          <View style={{ width: size * 0.4, height: size * 0.4, borderRadius: size * 0.2, backgroundColor: color }} />
          <View style={{ width: size * 0.4, height: size * 0.4, borderRadius: size * 0.2, backgroundColor: color, marginLeft: -2 }} />
        </View>
        <View
          style={{
            width: size * 0.52,
            height: size * 0.52,
            backgroundColor: color,
            transform: [{ rotate: "45deg" }],
            marginTop: -size * 0.32,
          }}
        />
      </View>
    );
  }

  // Taste (spoon / flavours)
  if (name === "taste") {
    return (
      <View style={[{ width: size, height: size, alignItems: "center", justifyContent: "center" }, style]}>
        <View style={{ width: size * 0.45, height: size * 0.55, borderRadius: size * 0.25, borderWidth: 1.8, borderColor: color }} />
        <View style={{ width: 2, height: size * 0.45, backgroundColor: color }} />
      </View>
    );
  }

  // Lightbulb (get inspired)
  if (name === "lightbulb-outline") {
    return (
      <View style={[{ width: size, height: size, alignItems: "center", justifyContent: "center" }, style]}>
        <View style={{ width: size * 0.65, height: size * 0.65, borderRadius: size * 0.35, borderWidth: 1.8, borderColor: color }} />
        <View style={{ width: size * 0.35, height: 2, backgroundColor: color, marginTop: 1 }} />
        <View style={{ width: size * 0.2, height: 2, backgroundColor: color, marginTop: 1 }} />
      </View>
    );
  }

  // Chef Hat (learn to cook)
  if (name === "chef-hat") {
    return (
      <View style={[{ width: size, height: size, alignItems: "center", justifyContent: "center" }, style]}>
        <View style={{ flexDirection: "row", alignItems: "flex-end" }}>
          <View style={{ width: size * 0.3, height: size * 0.35, borderRadius: size * 0.15, borderWidth: 1.6, borderColor: color }} />
          <View style={{ width: size * 0.36, height: size * 0.45, borderRadius: size * 0.18, borderWidth: 1.6, borderColor: color, marginHorizontal: -2 }} />
          <View style={{ width: size * 0.3, height: size * 0.35, borderRadius: size * 0.15, borderWidth: 1.6, borderColor: color }} />
        </View>
        <View style={{ width: size * 0.72, height: 2, backgroundColor: color, marginTop: 1 }} />
      </View>
    );
  }

  // Piggy bank / Save money
  if (name === "piggy-bank-outline") {
    return (
      <View style={[{ width: size, height: size, alignItems: "center", justifyContent: "center" }, style]}>
        <View style={{ width: size * 0.8, height: size * 0.58, borderRadius: size * 0.26, borderWidth: 1.8, borderColor: color, alignItems: "center", justifyContent: "center" }}>
          <View style={{ width: size * 0.32, height: 1.8, backgroundColor: color }} />
        </View>
        <View style={{ width: size * 0.5, flexDirection: "row", justifyContent: "space-between" }}>
          <View style={{ width: 2, height: 3, backgroundColor: color }} />
          <View style={{ width: 2, height: 3, backgroundColor: color }} />
        </View>
      </View>
    );
  }

  // Trash / Less food waste
  if (name === "trash-can-outline") {
    return (
      <View style={[{ width: size, height: size, alignItems: "center", justifyContent: "center" }, style]}>
        <View style={{ width: size * 0.75, height: 2, backgroundColor: color }} />
        <View style={{ width: size * 0.55, height: size * 0.6, borderWidth: 1.8, borderTopWidth: 0, borderColor: color, borderBottomLeftRadius: 3, borderBottomRightRadius: 3, marginTop: 1 }} />
      </View>
    );
  }

  // Carrot / Eat healthy
  if (name === "carrot") {
    return (
      <View style={[{ width: size, height: size, alignItems: "center", justifyContent: "center" }, style]}>
        <View style={{ width: 1.8, height: size * 0.3, backgroundColor: color, marginBottom: 1 }} />
        <View
          style={{
            width: size * 0.45,
            height: size * 0.65,
            borderTopLeftRadius: size * 0.2,
            borderTopRightRadius: size * 0.2,
            borderBottomLeftRadius: size * 0.05,
            borderBottomRightRadius: size * 0.05,
            borderWidth: 1.8,
            borderColor: color,
          }}
        />
      </View>
    );
  }

  // Clock / Quick and easy
  if (name === "clock-outline") {
    return (
      <View
        style={[
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: 1.8,
            borderColor: color,
            alignItems: "center",
            justifyContent: "center",
          },
          style,
        ]}
      >
        <View style={{ width: 1.8, height: size * 0.32, backgroundColor: color, position: "absolute", top: size * 0.16 }} />
        <View style={{ width: size * 0.24, height: 1.8, backgroundColor: color, position: "absolute", right: size * 0.22 }} />
      </View>
    );
  }

  // Scale balance / Maintain
  if (name === "scale-balance") {
    return (
      <View style={[{ width: size, height: size, alignItems: "center", justifyContent: "center" }, style]}>
        <View style={{ width: size * 0.85, height: 1.8, backgroundColor: color }} />
        <View style={{ width: 1.8, height: size * 0.45, backgroundColor: color }} />
        <View style={{ width: size * 0.45, height: 1.8, backgroundColor: color }} />
      </View>
    );
  }

  // Trending up / Gain
  if (name === "trending-up") {
    return (
      <View style={[{ width: size, height: size, alignItems: "center", justifyContent: "center" }, style]}>
        <Text style={{ fontSize: size * 1.1, fontWeight: "800", color, lineHeight: size }}>
          ↗
        </Text>
      </View>
    );
  }

  // Flame / Lose
  if (name === "fire") {
    return (
      <View style={[{ width: size, height: size, alignItems: "center", justifyContent: "center" }, style]}>
        <View
          style={{
            width: size * 0.55,
            height: size * 0.72,
            borderTopLeftRadius: size * 0.4,
            borderBottomLeftRadius: size * 0.28,
            borderBottomRightRadius: size * 0.28,
            borderWidth: 1.8,
            borderColor: color,
            transform: [{ rotate: "45deg" }],
          }}
        />
      </View>
    );
  }

  // Sliders / Settings
  if (name === "sliders") {
    return (
      <View style={[{ width: size, height: size, justifyContent: "space-around" }, style]}>
        <View style={{ width: "100%", height: 1.8, backgroundColor: color }} />
        <View style={{ width: "100%", height: 1.8, backgroundColor: color }} />
        <View style={{ width: "100%", height: 1.8, backgroundColor: color }} />
      </View>
    );
  }

  return (
    <Text style={[{ fontSize: size, fontWeight: "700", color }, style]}>
      •
    </Text>
  );
}

/** Staggered fade & slide in */
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

/** Touch component with responsive opacity */
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

/**
 * Authentic 4-color Google Sign-In Button with official G logo
 */
export function GoogleButton({ title = "Continue with Google", onPress, loading }) {
  return (
    <TouchableOpacity
      activeOpacity={0.82}
      onPress={onPress}
      disabled={loading}
      style={styles.googleBtn}
    >
      {loading ? (
        <ActivityIndicator color={colors.ink} />
      ) : (
        <>
          <Image
            source={GOOGLE_G}
            style={{ width: 20, height: 20, marginRight: 12 }}
            resizeMode="contain"
          />
          <Text style={styles.googleText}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
}

export function Divider({ label = "OR CONTINUE WITH" }) {
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
        size={variant === "circle" ? 20 : 26}
        color={colors.ink}
      />
    </ScalePress>
  );
}

export function StepIndicator({ step, total = 3 }) {
  return (
    <View style={{ alignItems: "flex-end" }}>
      <Text style={styles.stepLabel}>
        STEP {step} OF {total}
      </Text>
      <View style={{ flexDirection: "row", marginTop: 6 }}>
        {Array.from({ length: total }).map((_, i) => (
          <View
            key={i}
            style={[
              styles.stepPill,
              {
                width: i < step ? 22 : 12,
                backgroundColor: i < step ? colors.primary : colors.border,
              },
            ]}
          />
        ))}
      </View>
    </View>
  );
}

export function Field({
  label,
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

  return (
    <View style={{ marginBottom: 14 }}>
      {label ? <Text style={styles.fieldLabel}>{label}</Text> : null}
      <View
        style={[
          styles.fieldBox,
          {
            borderColor: error ? colors.red : focused ? colors.primary : colors.border,
            backgroundColor: focused ? colors.white : colors.field,
          },
        ]}
      >
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
          <TouchableOpacity onPress={() => setHidden((h) => !h)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Icon name={hidden ? "eye" : "eye-off"} size={18} color={colors.inkSubtle} />
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
}

export function ErrorBanner({ message }) {
  if (!message) return null;
  return (
    <View style={styles.errorBox}>
      <Text style={styles.errorText}>{message}</Text>
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
    borderWidth: 1.2,
    borderColor: colors.border,
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  googleText: { fontSize: 15, fontWeight: "600", color: colors.ink },
  dividerRow: { flexDirection: "row", alignItems: "center", marginVertical: 18 },
  dividerLine: { flex: 1, height: 1, backgroundColor: colors.border },
  dividerText: {
    marginHorizontal: 12,
    fontSize: 10.5,
    letterSpacing: 1.1,
    color: colors.inkSubtle,
    fontWeight: "600",
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
    backgroundColor: colors.redSoft,
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
  },
  errorText: { color: colors.red, fontSize: 13, fontWeight: "600", textAlign: "center" },
});
