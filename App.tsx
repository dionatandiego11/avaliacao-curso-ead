import React, { useState } from 'react';
import Hero from './components/Hero';
import FeaturedReviews from './components/FeaturedReviews';
import Footer from './components/Footer';
import LoginPage from './pages/LoginPage';
import ReviewPage from './pages/ReviewPage';
import RankingPage from './pages/RankingPage';
import { AuthProvider } from './contexts/AuthContext';

const HomePage: React.FC<{ onNavigate: (page: string) => void }> = ({ onNavigate }) => (
  <>
    <Hero onNavigate={onNavigate} />
    <FeaturedReviews />
    <Footer />
  </>
);

function App() {
  const [currentPage, setCurrentPage] = useState('home');

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };
  
  const renderPage = () => {
    switch (currentPage) {
      case 'login':
        return <LoginPage onNavigate={handleNavigate} />;
      case 'review':
        return <ReviewPage onNavigate={handleNavigate} />;
      case 'ranking':
        return <RankingPage onNavigate={handleNavigate} />;
      case 'home':
      default:
        return <HomePage onNavigate={handleNavigate} />;
    }
  };

  return (
    <AuthProvider>
      <div className="App">
        {renderPage()}
      </div>
    </AuthProvider>
  );
}

export default App;
