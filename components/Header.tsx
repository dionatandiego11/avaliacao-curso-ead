import React from 'react';
import GridIcon from './icons/GridIcon';

interface HeaderProps {
  onNavigate: (page: string) => void;
  isLoggedIn: boolean;
  onLogout: () => void;
  isAdmin: boolean;
}

const Header: React.FC<HeaderProps> = ({ onNavigate, isLoggedIn, onLogout, isAdmin }) => {
  const handleReviewClick = () => {
    if (isLoggedIn) {
      onNavigate('review');
    } else {
      onNavigate('login');
    }
  };

  return (
    <header className="w-full p-6">
      <div className="container mx-auto flex justify-between items-center">
        <div 
          className="flex items-center space-x-2 cursor-pointer"
          onClick={() => onNavigate('home')}
          aria-label="Página inicial"
        >
          <GridIcon className="w-8 h-8" />
          <span className="text-2xl font-bold tracking-wider">AVALIAEAD</span>
        </div>
        <nav className="hidden md:flex items-center space-x-8 text-lg">
          <button onClick={() => onNavigate('ranking')} className="hover:text-gray-300 transition-colors">Rankings</button>
          <button onClick={handleReviewClick} className="hover:text-gray-300 transition-colors">Deixar uma avaliação</button>
          {isAdmin && (
             <button onClick={() => onNavigate('admin')} className="hover:text-gray-300 transition-colors">Admin</button>
          )}
        </nav>
        <div className="flex items-center">
          {isLoggedIn ? (
             <button 
              onClick={onLogout}
              className="bg-red-500 text-white px-6 py-2 rounded-md font-semibold hover:bg-red-600 transition-colors"
            >
              Logout
            </button>
          ) : (
            <button 
              onClick={() => onNavigate('login')}
              className="bg-white text-gray-900 px-6 py-2 rounded-md font-semibold hover:bg-gray-200 transition-colors"
            >
              Login
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;