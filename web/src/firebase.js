import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:
    import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ||
    "kusinapp-accd6.firebaseapp.com",
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

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const analytics = typeof window !== "undefined" ? getAnalytics(app) : null;

// Initialize and export Firebase Authentication
export const auth = getAuth(app);
export default app;