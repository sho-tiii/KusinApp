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

const SPLASH_CENTERPIECE = require("./assets/splash-centerpiece.png");

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

  // Smooth directional slide + fade transition between screens
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
        duration: 360,
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
        onNext={(d) => {
          setSignupData(d);
          signupInProgress.current = true;
          go("verify");
        }}
      />
    ),
    verify: signupData ? (
      <VerifyScreen
        data={signupData}
        onBack={() => {
          signupInProgress.current = false;
          go("signup");
        }}
        onEdit={() => {
          signupInProgress.current = false;
          go("signup");
        }}
        onVerified={({ profile: p }) => {
          setProfile(p);
          setSignupData(null);
          signupInProgress.current = false;
          go("setupIntro");
        }}
      />
    ) : null,
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
                outputRange: [36 * dir.current, 0],
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

function Splash({ ready, onDone }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.9)).current;
  const out = useRef(new Animated.Value(1)).current;
  const [minTimePassed, setMinTimePassed] = useState(false);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 650,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        friction: 6,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
    const t = setTimeout(() => setMinTimePassed(true), 2000);
    return () => clearTimeout(t);
  }, [opacity, scale]);

  useEffect(() => {
    if (!ready || !minTimePassed) return;
    Animated.timing(out, {
      toValue: 0,
      duration: 320,
      useNativeDriver: true,
    }).start(() => onDone());
  }, [ready, minTimePassed, out, onDone]);

  return (
    <Pressable
      style={styles.splash}
      onPress={() => ready && setMinTimePassed(true)}
    >
      <Animated.View
        style={{
          opacity: Animated.multiply(opacity, out),
          transform: [{ scale }],
        }}
      >
        <Image
          source={SPLASH_CENTERPIECE}
          style={styles.splashImg}
          resizeMode="contain"
        />
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  splashImg: { width: 270, height: 270 },
});
