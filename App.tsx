import React, { useState, useEffect } from 'react';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import ReviewPage from './pages/ReviewPage';
import RankingPage from './pages/RankingPage';
import AdminPage from './pages/AdminPage';
import { auth, db } from './firebase';
import { onAuthStateChanged, signOut, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

interface AppUser {
  uid: string;
  nome: string;
  email: string | null;
  ra: string;
  curso: string;
  cursoId: string;
  universidade: string;
  // Fix: Renamed 'uf' to 'estado' to match the prop type expected by ReviewPage.
  estado: string;
  municipio: string;
  publica_privada: string;
  grau: string;
  area: string;
  isAdmin: boolean;
}

const App: React.FC = () => {
  const [page, setPage] = useState('home');
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        // User is signed in, see docs for a list of available properties
        // https://firebase.google.com/docs/reference/js/firebase.User
        const userDocRef = doc(db, 'usuarios', firebaseUser.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          setCurrentUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            nome: userData.nome || 'Usuário',
            isAdmin: userData.tipo_usuario === 'admin',
            ra: userData.ra || '',
            curso: userData.curso || '',
            cursoId: userData.cursoId || '',
            universidade: userData.universidade || '',
            // Fix: Populated 'estado' from the 'uf' field in Firestore to resolve the type mismatch.
            estado: userData.uf || '',
            municipio: userData.municipio || '',
            publica_privada: userData.publica_privada || '',
            grau: userData.grau || '',
            area: userData.area || '',
          });
        } else {
            // This case might happen if a user is created in Auth but not in Firestore.
            // For now, we sign them out to enforce consistency.
            await signOut(auth);
            setCurrentUser(null);
        }
      } else {
        // User is signed out
        setCurrentUser(null);
      }
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);


  const navigate = (targetPage: string) => setPage(targetPage);

  const handleLogout = async () => {
    await signOut(auth);
    navigate('home');
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Carregando...</div>;
  }

  const renderPage = () => {
    const isLoggedIn = !!currentUser;
    switch (page) {
      case 'login':
        return <LoginPage onNavigate={navigate} />;
      case 'review':
        if (!isLoggedIn) {
          return <LoginPage onNavigate={navigate} />;
        }
        return <ReviewPage onNavigate={navigate} user={currentUser} />;
      case 'ranking':
        return <RankingPage onNavigate={navigate} />;
      case 'admin':
        if (!isLoggedIn || !currentUser.isAdmin) {
            return <HomePage onNavigate={navigate} isLoggedIn={isLoggedIn} onLogout={handleLogout} user={currentUser} />;
        }
        return <AdminPage onNavigate={navigate} />;
      case 'home':
      default:
        return <HomePage onNavigate={navigate} isLoggedIn={isLoggedIn} onLogout={handleLogout} user={currentUser} />;
    }
  };

  return (
      <div className="font-sans">
        {renderPage()}
      </div>
  );
};

export default App;