import firebase from "firebase/compat/app";
import "firebase/compat/firestore";
import "firebase/compat/auth";

// Firebase configuration. Prefer Vite environment variables (VITE_*) for local/CI setup.
// Values fall back to the inline config for compatibility if env vars are not provided.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDxwGQPyOB8rYC1rrCtwUGSE-evevah0Uo",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "avaliaead-f5a98.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "avaliaead-f5a98",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "avaliaead-f5a98.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "587076153149",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:587076153149:web:03f96821220a344af21f54",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-4XHNBT0TFY",
};

// Initialize Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

// Initialize Firebase services and export them
const db = firebase.firestore();
const auth = firebase.auth();

export { db, auth };