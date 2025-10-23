// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBgUsSU2tg9QipXbb_Z3EJAyLJaVozO8cs",
  authDomain: "avalia-ead.firebaseapp.com",
  projectId: "avalia-ead",
  storageBucket: "avalia-ead.firebasestorage.app",
  messagingSenderId: "506573215379",
  appId: "1:506573215379:web:3aeab983473d0f4696df66",
  measurementId: "G-LZ5DR094B1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
