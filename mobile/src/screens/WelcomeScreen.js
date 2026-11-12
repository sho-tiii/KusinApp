import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import { colors, shadow } from "../theme";
import { Icon, ScalePress, WarmGlow } from "../components/ui";

const WORDMARK = require("../../assets/kusinapp-wordmark.png");

const SLIDES = [
  {
    key: "welcome",
    image: require("../../assets/welcome-family.png"),
    caption: "Your personal digital sous-chef to make\nhard days easy.",
  },
  {
    key: "recipes",
    title: "Easy Recipes for you",
    image: require("../../assets/onboard-cooking.png"),
    caption: "Discover delicious, budget-friendly local\nmeals tailored to your pantry.",
  },
  {
    key: "time",
    title: "Save your time and\nenergy",
    image: require("../../assets/onboard-bowl.png"),
    caption: "Smart grocery lists and auto-tracking\nthat do the thinking for you.",
  },
];

const AUTO_ADVANCE_MS = 3400;

export default function WelcomeScreen({ onLogin, onSignup }) {
  const { width } = useWindowDimensions();
  const scrollX = useRef(new Animated.Value(0)).current;
  const listRef = useRef(null);
  const [index, setIndex] = useState(0);
  const [dragging, setDragging] = useState(false);

  // Automatic slide switching + pauses while user manually slides
  useEffect(() => {
    if (dragging) return undefined;
    const t = setTimeout(() => {
      const next = (index + 1) % SLIDES.length;
      listRef.current?.scrollToOffset({ offset: next * width, animated: true });
      setIndex(next);
    }, AUTO_ADVANCE_MS);
    return () => clearTimeout(t);
  }, [index, dragging, width]);

  const jumpToSlide = (targetIdx) => {
    listRef.current?.scrollToOffset({ offset: targetIdx * width, animated: true });
    setIndex(targetIdx);
  };

  const renderSlide = ({ item, index: i }) => {
    const inputRange = [(i - 1) * width, i * width, (i + 1) * width];
    const imgScale = scrollX.interpolate({
      inputRange,
      outputRange: [0.84, 1, 0.84],
      extrapolate: "clamp",
    });
    const imgShift = scrollX.interpolate({
      inputRange,
      outputRange: [width * 0.2, 0, -width * 0.2],
      extrapolate: "clamp",
    });
    const fade = scrollX.interpolate({
      inputRange,
      outputRange: [0.2, 1, 0.2],
      extrapolate: "clamp",
    });
    const titleShift = scrollX.interpolate({
      inputRange,
      outputRange: [30, 0, -30],
      extrapolate: "clamp",
    });

    return (
      <View style={[styles.slide, { width }]}>
        <Animated.View
          style={[
            styles.titleWrap,
            { opacity: fade, transform: [{ translateX: titleShift }] },
          ]}
        >
          {item.title ? (
            <Text style={styles.title}>{item.title}</Text>
          ) : (
            <View style={styles.welcomeRow}>
              <Text style={styles.title}>Welcome to</Text>
              <Image source={WORDMARK} style={styles.wordmark} resizeMode="contain" />
            </View>
          )}
        </Animated.View>

        <View style={styles.imageArea}>
          <WarmGlow size={width * 0.88} />
          <Animated.Image
            source={item.image}
            resizeMode="contain"
            style={[
              styles.image,
              {
                width: width * 0.68,
                height: width * 0.68,
                opacity: fade,
                transform: [{ translateX: imgShift }, { scale: imgScale }],
              },
            ]}
          />
        </View>

        <Animated.Text style={[styles.caption, { opacity: fade }]}>
          {item.caption}
        </Animated.Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Animated.FlatList
        ref={listRef}
        data={SLIDES}
        keyExtractor={(s) => s.key}
        renderItem={renderSlide}
        horizontal
        pagingEnabled
        bounces={false}
        showsHorizontalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
        onScrollBeginDrag={() => setDragging(true)}
        onMomentumScrollEnd={(e) => {
          const newIdx = Math.round(e.nativeEvent.contentOffset.x / width);
          setIndex(newIdx);
          setDragging(false);
        }}
        getItemLayout={(_, i) => ({ length: width, offset: width * i, index: i })}
        style={{ flex: 1 }}
      />

      <View style={styles.dots}>
        {SLIDES.map((_, i) => {
          const inputRange = [(i - 1) * width, i * width, (i + 1) * width];
          const w = scrollX.interpolate({
            inputRange,
            outputRange: [7, 28, 7],
            extrapolate: "clamp",
          });
          const bg = scrollX.interpolate({
            inputRange,
            outputRange: [colors.lavenderStrong, colors.ink, colors.lavenderStrong],
            extrapolate: "clamp",
          });
          return (
            <ScalePress key={i} onPress={() => jumpToSlide(i)} hitSlop={8}>
              <Animated.View style={[styles.dot, { width: w, backgroundColor: bg }]} />
            </ScalePress>
          );
        })}
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          activeOpacity={0.82}
          onPress={onLogin}
          style={[styles.btn, styles.loginBtn]}
        >
          <Text style={styles.loginText}>Login</Text>
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.82}
          onPress={onSignup}
          style={[styles.btn, styles.signupBtn]}
        >
          <Text style={styles.signupText}>Sign up</Text>
          <Icon name="arrow-right" size={18} color={colors.ink} style={{ marginLeft: 8 }} />
        </TouchableOpacity>
      </View>
      <Text style={styles.footer}>Cook with joy • Less prep, zero stress</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  slide: {
    flex: 1,
    alignItems: "center",
    paddingTop: 42,
    paddingHorizontal: 26,
  },
  titleWrap: { minHeight: 84, justifyContent: "center", alignItems: "center" },
  welcomeRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: colors.ink,
    textAlign: "center",
    lineHeight: 36,
  },
  wordmark: { width: 146, height: 40, marginLeft: 8 },
  imageArea: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  image: {},
  caption: {
    fontSize: 15,
    lineHeight: 23,
    color: "#57534E",
    textAlign: "center",
    marginBottom: 18,
    paddingHorizontal: 8,
  },
  dots: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 26,
  },
  dot: { height: 7, borderRadius: 4, marginHorizontal: 4 },
  actions: {
    flexDirection: "row",
    paddingHorizontal: 24,
    gap: 14,
    width: "100%",
    minHeight: 52,
    alignItems: "center",
  },
  btn: {
    flex: 1,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  loginBtn: { backgroundColor: colors.lavender },
  signupBtn: { backgroundColor: colors.primary, ...shadow.button },
  loginText: { fontSize: 16, fontWeight: "700", color: colors.ink },
  signupText: { fontSize: 16, fontWeight: "700", color: colors.ink },
  footer: {
    textAlign: "center",
    color: colors.inkSubtle,
    fontSize: 12,
    marginTop: 14,
    marginBottom: 10,
  },
});
