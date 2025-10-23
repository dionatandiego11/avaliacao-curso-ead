import React from 'react';
import Header from '../components/Header';
import SearchBar from '../components/SearchBar';
import CategoryButtons from '../components/CategoryButtons';
import CheckmarkIcon from '../components/icons/CheckmarkIcon';

interface AppUser {
  uid: string;
  nome: string;
  email: string | null;
  isAdmin: boolean;
}

interface HomePageProps {
  onNavigate: (page: string) => void;
  isLoggedIn: boolean;
  onLogout: () => void;
  user: AppUser | null;
}

const HomePage: React.FC<HomePageProps> = ({ onNavigate, isLoggedIn, onLogout, user }) => {
  return (
    <div className="relative w-full h-screen bg-gray-900 text-white">
      <div
        className="absolute inset-0 bg-cover bg-center filter grayscale"
        style={{ backgroundImage: "url('https://picsum.photos/1920/1080?random=1')" }}
      ></div>
      <div className="absolute inset-0 bg-black opacity-60"></div>
      
      <div className="relative z-10 flex flex-col h-full">
        <Header 
          onNavigate={onNavigate} 
          isLoggedIn={isLoggedIn} 
          onLogout={onLogout} 
          isAdmin={isLoggedIn && !!user?.isAdmin} 
        />
        
        <main className="flex-grow flex items-center justify-center">
          <div className="container mx-auto px-4 text-center -mt-16">
            <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-4 flex items-center justify-center flex-wrap">
              Leia avaliações autênticas
              <br />
              de estudantes verificados
              <span className="ml-2 mt-2">
                <CheckmarkIcon className="w-10 h-10 md:w-12 md:h-12" />
              </span>
            </h1>
            
            <div className="max-w-3xl mx-auto my-8">
              <SearchBar />
            </div>
            
            <p className="text-gray-300 text-sm md:text-base mb-8">
              AvaliaEAD é a única plataforma de avaliação com todas as opções
            </p>
            
            <CategoryButtons />
          </div>
        </main>
      </div>
    </div>
  );
};

export default HomePage;
