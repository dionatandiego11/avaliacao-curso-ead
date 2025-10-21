import firebase from "firebase/compat/app";
import "firebase/compat/firestore";
import "firebase/compat/auth";

const env = (import.meta as any).env || {};

// Firebase configuration using environment variables with fallbacks for environments where import.meta.env is not defined.
const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY || "AIzaSyBgUsSU2tg9QipXbb_Z3EJAyLJaVozO8cs",
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || "avalia-ead.firebaseapp.com",
  projectId: env.VITE_FIREBASE_PROJECT_ID || "avalia-ead",
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || "avalia-ead.firebasestorage.app",
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || "506573215379",
  appId: env.VITE_FIREBASE_APP_ID || "1:506573215379:web:3aeab983473d0f4696df66",
  measurementId: env.VITE_FIREBASE_MEASUREMENT_ID || "G-LZ5DR094B1",
};


// Initialize Firebase only if it hasn't been initialized yet.
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const db = firebase.firestore();
const auth = firebase.auth();

export { db, auth };