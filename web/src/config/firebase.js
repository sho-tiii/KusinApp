import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:
    import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ||
    "kusinapp-accd6.firebaseapp.com",
  databaseURL:
    import.meta.env.VITE_FIREBASE_DATABASE_URL ||
    "https://kusinapp-accd6-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "kusinapp-accd6",
  storageBucket:
    import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ||
    "kusinapp-accd6.firebasestorage.app",
  messagingSenderId:
    import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "923819958215",
  appId:
    import.meta.env.VITE_FIREBASE_APP_ID ||
    "1:923819958215:web:32683482ae758d3490c3e2",
  measurementId:
    import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-9L0V6VF5FY",
};

export const app = initializeApp(firebaseConfig);

export let analytics = null;
if (typeof window !== "undefined") {
  isSupported()
    .then((supported) => {
      if (supported && firebaseConfig.apiKey) {
        analytics = getAnalytics(app);
      }
    })
    .catch(() => {
      analytics = null;
    });
}

export const auth = getAuth(app);
export const db = getDatabase(app);
export default app;
