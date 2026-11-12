import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Image,
  Pressable,
  StatusBar,
  StyleSheet,
  View,
} from "react-native";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./src/config/firebase";
import { getMobileUserProfile, skipMobileOnboarding } from "./src/services/authService";

import WelcomeScreen from "./src/screens/WelcomeScreen";
import LoginScreen from "./src/screens/LoginScreen";
import SignupScreen from "./src/screens/SignupScreen";
import VerifyScreen from "./src/screens/VerifyScreen";
import SetupIntroScreen from "./src/screens/SetupIntroScreen";
import OnboardingScreen from "./src/screens/OnboardingScreen";
import AllSetScreen from "./src/screens/AllSetScreen";
import HomeScreen from "./src/screens/HomeScreen";

const SPLASH_EMBLEM = require("./assets/splash-emblem.png");
const SPLASH_WORDMARK = require("./assets/splash-wordmark.png");

const ORDER = [
  "welcome",
  "login",
  "signup",
  "verify",
  "setupIntro",
  "onboarding",
  "allSet",
  "home",
];
const AUTH_ROUTES = ["welcome", "login", "signup", "verify"];

export default function App() {
  return (
    <View style={{ flex: 1, backgroundColor: "#ffffff" }}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <Root />
    </View>
  );
}

function Root() {
  const [splashDone, setSplashDone] = useState(false);
  const [authReady, setAuthReady] = useState(false);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [route, setRoute] = useState("welcome");
  const [signupData, setSignupData] = useState(null);
  const signupInProgress = useRef(false);
  const routeRef = useRef(route);
  routeRef.current = route;

  // Smooth directional slide + fade + scale transition between screens
  const anim = useRef(new Animated.Value(1)).current;
  const dir = useRef(1);
  const go = useCallback(
    (next) => {
      if (next === routeRef.current) return;
      dir.current = ORDER.indexOf(next) >= ORDER.indexOf(routeRef.current) ? 1 : -1;
      anim.setValue(0);
      setRoute(next);
      Animated.timing(anim, {
        toValue: 1,
        duration: 380,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    },
    [anim]
  );

  const routeForProfile = (p) =>
    p?.onboardingCompleted || p?.onboardingSkipped ? "home" : "setupIntro";

  useEffect(() => {
    if (!auth) {
      setAuthReady(true);
      return undefined;
    }
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u || null);
      if (u) {
        let p = null;
        try {
          p = await getMobileUserProfile(u.uid);
        } catch (e) {
          console.warn("Error fetching user profile:", e);
        }
        setProfile(p);
        if (!signupInProgress.current && AUTH_ROUTES.includes(routeRef.current)) {
          go(routeForProfile(p));
        }
      } else {
        setProfile(null);
        if (!AUTH_ROUTES.includes(routeRef.current)) go("welcome");
      }
      setAuthReady(true);
    });
    return unsub;
  }, [go]);

  const refreshProfile = async () => {
    if (!user) return;
    try {
      setProfile(await getMobileUserProfile(user.uid));
    } catch (_e) {
      // keep previous profile
    }
  };

  if (!splashDone || !authReady) {
    return <Splash ready={authReady} onDone={() => setSplashDone(true)} />;
  }

  const screens = {
    welcome: (
      <WelcomeScreen
        onLogin={() => go("login")}
        onSignup={() => go("signup")}
      />
    ),
    login: (
      <LoginScreen
        onBack={() => go("welcome")}
        onSignup={() => go("signup")}
      />
    ),
    signup: (
      <SignupScreen
        initial={signupData}
        onBack={() => go("welcome")}
        onLogin={() => go("login")}
        onNext={(res) => {
          if (res?.profile) {
            setProfile(res.profile);
          }
          setSignupData(null);
          signupInProgress.current = false;
          go("setupIntro");
        }}
      />
    ),
    setupIntro: (
      <SetupIntroScreen
        name={user?.displayName || profile?.displayName}
        onStart={() => go("onboarding")}
        onLater={async () => {
          try {
            await skipMobileOnboarding(user?.uid);
          } catch (_e) {
            // non-blocking
          }
          await refreshProfile();
          go("home");
        }}
      />
    ),
    onboarding: (
      <OnboardingScreen
        user={user}
        profile={profile}
        onExit={() => go(profile?.onboardingSkipped ? "home" : "setupIntro")}
        onDone={async () => {
          await refreshProfile();
          go("allSet");
        }}
      />
    ),
    allSet: <AllSetScreen onContinue={() => go("home")} />,
    home: (
      <HomeScreen
        user={user}
        profile={profile}
        onFinishSetup={() => go("setupIntro")}
        onLoggedOut={() => go("welcome")}
      />
    ),
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <Animated.View
        key={route}
        style={{
          flex: 1,
          opacity: anim,
          transform: [
            {
              translateX: anim.interpolate({
                inputRange: [0, 1],
                outputRange: [34 * dir.current, 0],
              }),
            },
            {
              scale: anim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.975, 1],
              }),
            },
          ],
        }}
      >
        {screens[route] || screens.welcome}
      </Animated.View>
    </View>
  );
}

/**
 * Choreographed Multi-Stage KusinApp Entrance Animation:
 * 1. Soft golden radial aura blooms & breathes behind the centerpiece.
 * 2. Emblem (Golden House + Steaming Pot + Chili + Leaves) springs in with tactile bounce & subtle tilt.
 * 3. Rising aroma wisps float gracefully above the rooftop pot.
 * 4. "KusinApp" Wordmark glides up & locks into place.
 * 5. Golden divider line expands outward & "Lasang Pinoy sa Bawat Luto." tagline reveals.
 * 6. Smooth cinematic zoom-lift exit into the Welcome screen.
 */
function Splash({ ready, onDone }) {
  // Stage 1: Warm Aura & Emblem
  const auraScale = useRef(new Animated.Value(0.35)).current;
  const auraOpacity = useRef(new Animated.Value(0)).current;
  const auraPulse = useRef(new Animated.Value(1)).current;

  const emblemOpacity = useRef(new Animated.Value(0)).current;
  const emblemScale = useRef(new Animated.Value(0.45)).current;
  const emblemY = useRef(new Animated.Value(30)).current;
  const emblemTilt = useRef(new Animated.Value(0)).current;

  // Stage 2: Wordmark ("KusinApp")
  const wordOpacity = useRef(new Animated.Value(0)).current;
  const wordScale = useRef(new Animated.Value(0.84)).current;
  const wordY = useRef(new Animated.Value(22)).current;

  // Stage 3: Golden Bar & Tagline ("Lasang Pinoy sa Bawat Luto.")
  const lineScaleX = useRef(new Animated.Value(0.01)).current;
  const lineOpacity = useRef(new Animated.Value(0)).current;
  const tagOpacity = useRef(new Animated.Value(0)).current;
  const tagY = useRef(new Animated.Value(12)).current;

  // Stage 4: Exit transition
  const exitProgress = useRef(new Animated.Value(0)).current;

  // Floating steam wisps
  const steam1 = useRef(new Animated.Value(0)).current;
  const steam2 = useRef(new Animated.Value(0)).current;
  const steam3 = useRef(new Animated.Value(0)).current;

  const [minTimePassed, setMinTimePassed] = useState(false);

  useEffect(() => {
    // Continuous gentle aura pulse + rising steam wisps
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(auraPulse, {
          toValue: 1.08,
          duration: 1300,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(auraPulse, {
          toValue: 1.0,
          duration: 1300,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );
    pulseLoop.start();

    const makeSteam = (val, delay) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(val, {
            toValue: 1,
            duration: 1500,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(val, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ])
      );

    const s1 = makeSteam(steam1, 200);
    const s2 = makeSteam(steam2, 650);
    const s3 = makeSteam(steam3, 1100);
    s1.start();
    s2.start();
    s3.start();

    // Main choreographed entrance sequence
    Animated.parallel([
      // 1. Warm Aura bloom
      Animated.timing(auraOpacity, {
        toValue: 1,
        duration: 520,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(auraScale, {
        toValue: 1,
        friction: 6,
        tension: 40,
        useNativeDriver: true,
      }),

      // 2. Emblem spring-in with playful tilt settle
      Animated.timing(emblemOpacity, {
        toValue: 1,
        duration: 420,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(emblemScale, {
        toValue: 1,
        friction: 5.5,
        tension: 58,
        useNativeDriver: true,
      }),
      Animated.spring(emblemY, {
        toValue: 0,
        friction: 6,
        tension: 55,
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.timing(emblemTilt, {
          toValue: 1,
          duration: 280,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.spring(emblemTilt, {
          toValue: 0,
          friction: 4.5,
          tension: 60,
          useNativeDriver: true,
        }),
      ]),

      // 3. Wordmark ("KusinApp") staggered reveal at 320ms
      Animated.sequence([
        Animated.delay(320),
        Animated.parallel([
          Animated.timing(wordOpacity, {
            toValue: 1,
            duration: 420,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.spring(wordScale, {
            toValue: 1,
            friction: 6,
            tension: 65,
            useNativeDriver: true,
          }),
          Animated.spring(wordY, {
            toValue: 0,
            friction: 6.5,
            tension: 65,
            useNativeDriver: true,
          }),
        ]),
      ]),

      // 4. Golden bar + Tagline reveal at 640ms
      Animated.sequence([
        Animated.delay(640),
        Animated.parallel([
          Animated.timing(lineOpacity, {
            toValue: 1,
            duration: 320,
            useNativeDriver: true,
          }),
          Animated.spring(lineScaleX, {
            toValue: 1,
            friction: 6,
            tension: 60,
            useNativeDriver: true,
          }),
          Animated.timing(tagOpacity, {
            toValue: 1,
            duration: 480,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(tagY, {
            toValue: 0,
            duration: 480,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
        ]),
      ]),
    ]).start();

    const t = setTimeout(() => setMinTimePassed(true), 2450);
    return () => {
      clearTimeout(t);
      pulseLoop.stop();
      s1.stop();
      s2.stop();
      s3.stop();
    };
  }, [
    auraOpacity,
    auraPulse,
    auraScale,
    emblemOpacity,
    emblemScale,
    emblemTilt,
    emblemY,
    lineOpacity,
    lineScaleX,
    steam1,
    steam2,
    steam3,
    tagOpacity,
    tagY,
    wordOpacity,
    wordScale,
    wordY,
  ]);

  useEffect(() => {
    if (!ready || !minTimePassed) return;
    Animated.timing(exitProgress, {
      toValue: 1,
      duration: 420,
      easing: Easing.inOut(Easing.cubic),
      useNativeDriver: true,
    }).start(() => onDone());
  }, [ready, minTimePassed, exitProgress, onDone]);

  const containerOpacity = exitProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0],
  });
  const containerScale = exitProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.07],
  });
  const containerLift = exitProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -18],
  });

  const tiltDeg = emblemTilt.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "-5deg"],
  });

  const renderSteamWisp = (animVal, offsetX, size) => {
    const wispY = animVal.interpolate({
      inputRange: [0, 1],
      outputRange: [6, -26],
    });
    const wispOpacity = animVal.interpolate({
      inputRange: [0, 0.35, 0.8, 1],
      outputRange: [0, 0.65, 0.35, 0],
    });
    const wispScale = animVal.interpolate({
      inputRange: [0, 1],
      outputRange: [0.65, 1.25],
    });
    return (
      <Animated.View
        style={[
          styles.steamWisp,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            marginLeft: offsetX,
            opacity: wispOpacity,
            transform: [{ translateY: wispY }, { scale: wispScale }],
          },
        ]}
      />
    );
  };

  return (
    <Pressable
      style={styles.splash}
      onPress={() => ready && setMinTimePassed(true)}
    >
      <Animated.View
        style={[
          styles.splashStage,
          {
            opacity: containerOpacity,
            transform: [{ scale: containerScale }, { translateY: containerLift }],
          },
        ]}
      >
        {/* Ambient Warm Radial Aura */}
        <Animated.View
          pointerEvents="none"
          style={[
            styles.auraOuter,
            {
              opacity: auraOpacity,
              transform: [
                { scale: Animated.multiply(auraScale, auraPulse) },
              ],
            },
          ]}
        >
          <View style={styles.auraInner} />
        </Animated.View>

        {/* Rising Steam Wisps above the Emblem */}
        <View style={styles.steamRow} pointerEvents="none">
          {renderSteamWisp(steam1, -18, 9)}
          {renderSteamWisp(steam2, 2, 12)}
          {renderSteamWisp(steam3, 20, 8)}
        </View>

        {/* Stage 1: Emblem (Golden House + Steaming Pot + Chili + Leaves) */}
        <Animated.View
          style={{
            opacity: emblemOpacity,
            transform: [
              { translateY: emblemY },
              { scale: emblemScale },
              { rotate: tiltDeg },
            ],
          }}
        >
          <Image
            source={SPLASH_EMBLEM}
            style={styles.emblemImg}
            resizeMode="contain"
          />
        </Animated.View>

        {/* Stage 2: "KusinApp" Wordmark */}
        <Animated.View
          style={{
            opacity: wordOpacity,
            transform: [{ translateY: wordY }, { scale: wordScale }],
            marginTop: -6,
          }}
        >
          <Image
            source={SPLASH_WORDMARK}
            style={styles.wordmarkImg}
            resizeMode="contain"
          />
        </Animated.View>

        {/* Stage 3: Expanding Golden Accent Line + Tagline */}
        <Animated.View
          style={[
            styles.goldDivider,
            {
              opacity: lineOpacity,
              transform: [{ scaleX: lineScaleX }],
            },
          ]}
        />

        <Animated.Text
          style={[
            styles.taglineText,
            {
              opacity: tagOpacity,
              transform: [{ translateY: tagY }],
            },
          ]}
        >
          Lasang Pinoy sa Bawat Luto.
        </Animated.Text>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  splashStage: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  auraOuter: {
    position: "absolute",
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: "rgba(254, 243, 199, 0.55)",
    alignItems: "center",
    justifyContent: "center",
  },
  auraInner: {
    width: 210,
    height: 210,
    borderRadius: 105,
    backgroundColor: "rgba(253, 230, 138, 0.45)",
  },
  steamRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 18,
    marginBottom: -6,
  },
  steamWisp: {
    backgroundColor: "#F59E0B",
  },
  emblemImg: {
    width: 220,
    height: 155,
  },
  wordmarkImg: {
    width: 228,
    height: 61,
  },
  goldDivider: {
    width: 46,
    height: 2.5,
    borderRadius: 2,
    backgroundColor: "#F59E0B",
    marginTop: 10,
    marginBottom: 8,
  },
  taglineText: {
    fontSize: 12.5,
    fontWeight: "600",
    color: "#57534E",
    letterSpacing: 1.4,
    textAlign: "center",
  },
});
