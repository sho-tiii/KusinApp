import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyBfP4upOEZkU02e9M8Wy2iY9-AB2MCa5LE",
  authDomain: "kusinapp-accd6.firebaseapp.com",
  projectId: "kusinapp-accd6",
  storageBucket: "kusinapp-accd6.firebasestorage.app",
  messagingSenderId: "923819958215",
  appId: "1:923819958215:web:32683482ae758d3490c3e2",
  measurementId: "G-9L0V6VF5FY"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
