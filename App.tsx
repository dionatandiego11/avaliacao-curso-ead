import React, { useState } from 'react';
import Hero from './components/Hero';
import FeaturedReviews from './components/FeaturedReviews';
import Footer from './components/Footer';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import ReviewPage from './pages/ReviewPage';
import RankingPage from './pages/RankingPage';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import GlobalLoader from './components/GlobalLoader';

const HomePage: React.FC<{ onNavigate: (page: string) => void }> = ({ onNavigate }) => (
  <>
    <Hero onNavigate={onNavigate} />
    <FeaturedReviews />
    <Footer />
  </>
);

const AppContent: React.FC = () => {
  const { loading } = useAuth();
  const [currentPage, setCurrentPage] = useState('home');

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  if (loading) {
    return <GlobalLoader />;
  }
  
  const renderPage = () => {
    switch (currentPage) {
      case 'login':
        return <LoginPage onNavigate={handleNavigate} />;
      case 'signup':
        return <SignUpPage onNavigate={handleNavigate} />;
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
    <div className="App">
      {renderPage()}
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
