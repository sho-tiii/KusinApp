import { initializeApp, getApps, getApp } from "firebase/app";
import { initializeAuth, getAuth, getReactNativePersistence } from "firebase/auth";
import { getDatabase } from "firebase/database";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

/**
 * Firebase Mobile SDK Configuration
 * Cross-platform credentials mapped from:
 * - Android: /mobile/google-services.json
 * - iOS: /mobile/GoogleService-Info.plist
 */
const firebaseConfig = {
  apiKey: Platform.select({
    ios: "AIzaSyB7cs4H4Du75Vy2VDwbs1nk-YydrhPjtgQ",
    android: "AIzaSyAgiEAOgmlncIXk05tnDVcUwKT7TaAK548",
    default: "AIzaSyAgiEAOgmlncIXk05tnDVcUwKT7TaAK548",
  }),
  authDomain: "kusinapp-accd6.firebaseapp.com",
  databaseURL: "https://kusinapp-accd6-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "kusinapp-accd6",
  storageBucket: "kusinapp-accd6.firebasestorage.app",
  messagingSenderId: "923819958215",
  appId: Platform.select({
    ios: "1:923819958215:ios:613252778240d00390c3e2",
    android: "1:923819958215:android:47829dbb9695613190c3e2",
    default: "1:923819958215:web:32683482ae758d3490c3e2",
  }),
};

export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Auth with AsyncStorage persistence for React Native
let authInstance;
try {
  authInstance = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch (e) {
  authInstance = getAuth(app);
}

export const auth = authInstance;
export const db = getDatabase(app);
export default app;
