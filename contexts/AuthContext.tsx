import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
// Fix: Import firebase for User type and use v8 onAuthStateChanged
import firebase from 'firebase/compat/app';
import { auth } from '../firebase';
import type { UserProfile } from '../types';

interface AuthContextType {
  currentUser: UserProfile | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ currentUser: null, loading: true });

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fix: Use v8 onAuthStateChanged method and firebase.User type
    const unsubscribe = auth.onAuthStateChanged((user: firebase.User | null) => {
      if (user) {
        setCurrentUser({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL
        });
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};