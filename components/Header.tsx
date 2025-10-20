
import React from 'react';
import { useAuth } from '../contexts/AuthContext';
// Fix: signOut is a method on auth object in v8, so remove this import
import { auth } from '../firebase';

const Header: React.FC<{ onNavigate: (page: string) => void }> = ({ onNavigate }) => {
  const { currentUser } = useAuth();

  const handleLogout = () => {
    // Fix: Use v8 auth.signOut() method
    auth.signOut().catch((error) => console.error("Logout failed", error));
  };

  return (
    <header className="absolute top-0 left-0 right-0 z-10">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-2 cursor-pointer" onClick={() => onNavigate('home')}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="6" cy="12" r="2" fill="white"/>
            <circle cx="12" cy="12" r="2" fill="white"/>
            <circle cx="18" cy="12" r="2" fill="white"/>
            <circle cx="6" cy="18" r="2" fill="white"/>
            <circle cx="12" cy="18" r="2" fill="white"/>
            <circle cx="18" cy="18" r="2" fill="white"/>
            <circle cx="6" cy="6" r="2" fill="white"/>
            <circle cx="12" cy="6" r="2" fill="white"/>
          </svg>
          <span className="font-extrabold text-xl tracking-wider text-white">AVALIA<span className="font-light">EAD</span></span>
        </div>
        <nav className="hidden md:flex items-center space-x-8 text-white font-semibold">
          <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('ranking'); }} className="hover:text-gray-200">Rankings</a>
          <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('review'); }} className="hover:text-gray-200">Deixar uma avaliação</a>
        </nav>
        <div>
          {currentUser ? (
            <div className="flex items-center space-x-4">
              <span className="text-white hidden sm:block">{currentUser.displayName || currentUser.email}</span>
              <button 
                onClick={handleLogout}
                className="bg-white text-red-500 font-bold py-2 px-4 rounded-md hover:bg-gray-200 transition-colors text-sm"
              >
                Sair
              </button>
            </div>
          ) : (
            <button 
              onClick={() => onNavigate('login')}
              className="bg-white text-red-500 font-bold py-2 px-4 rounded-md hover:bg-gray-200 transition-colors"
            >
              Entrar
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
