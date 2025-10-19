import React from 'react';

const Header: React.FC<{
  variant?: 'transparent' | 'solid';
  onNavigate: (page: string) => void;
}> = ({ variant = 'transparent', onNavigate }) => {
  const isTransparent = variant === 'transparent';
  const headerClasses = isTransparent
    ? 'absolute top-0 left-0 right-0 z-10 text-white'
    : 'relative bg-gray-800 text-white shadow-md';
  
  const textColor = isTransparent ? 'text-white' : 'text-black';
  const buttonHoverBg = isTransparent ? 'hover:bg-gray-200' : 'hover:bg-gray-100';
  const forBusinessClasses = isTransparent 
    ? 'border border-white text-white hover:bg-white hover:text-red-500' 
    : 'border border-gray-300 text-gray-700 bg-white hover:bg-gray-50';

  return (
    <header className={headerClasses}>
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-6">
          <div 
            className="flex items-center space-x-2 cursor-pointer"
            onClick={() => onNavigate('home')}
            aria-label="Go to homepage"
          >
             <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="6" cy="12" r="2" fill="currentColor"/>
                <circle cx="12" cy="12" r="2" fill="currentColor"/>
                <circle cx="18" cy="12" r="2" fill="currentColor"/>
                <circle cx="6" cy="18" r="2" fill="currentColor"/>
                <circle cx="12" cy="18" r="2" fill="currentColor"/>
                <circle cx="18" cy="18" r="2" fill="currentColor"/>
                <circle cx="6" cy="6" r="2" fill="currentColor"/>
                <circle cx="12" cy="6" r="2" fill="currentColor"/>
            </svg>
            <span className="font-extrabold text-xl tracking-wider">AVALIA<span className="font-light">EAD</span></span>
          </div>
          <span className="hidden md:block text-sm font-light opacity-80">Ajudando estudantes a tomarem decisões</span>
        </div>
        <nav className="flex items-center space-x-4">
          <a href="#" className="hidden md:block hover:text-gray-200 text-sm font-semibold uppercase">Artigos</a>
          <a onClick={() => onNavigate('login')} className="hidden md:block hover:text-gray-200 text-sm font-semibold uppercase cursor-pointer">Entrar</a>
          <button 
            onClick={() => onNavigate('review')}
            className={`bg-white ${textColor} px-4 py-2 rounded-md font-bold text-sm ${buttonHoverBg} transition-colors`}
          >
            Escrever Avaliação
          </button>
          <button className={`hidden sm:block px-4 py-2 rounded-md font-bold text-sm transition-colors ${forBusinessClasses}`}>
            Para Empresas
          </button>
        </nav>
      </div>
    </header>
  );
};

export default Header;