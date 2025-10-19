import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// ATENÇÃO: Substitua o objeto a seguir pela configuração do seu projeto Firebase.
// Você pode encontrar essa configuração no Console do Firebase, nas configurações do seu projeto.
const firebaseConfig = {
  apiKey: "AIzaSy...YOUR_API_KEY",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "1:your-sender-id:web:your-app-id"
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);

// Inicializa os serviços do Firebase e obtém referências para eles
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };