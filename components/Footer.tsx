import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-800 text-gray-300">
      <div className="container mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
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
            <span className="font-extrabold text-xl tracking-wider">AVALIA<span className="font-light">EAD</span></span>
          </div>
          <div className="text-center md:text-right">
            <p className="text-sm">&copy; {new Date().getFullYear()} AvaliaEAD. Todos os direitos reservados.</p>
            <p className="text-xs text-gray-500">Este é um projeto para fins educacionais.</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;