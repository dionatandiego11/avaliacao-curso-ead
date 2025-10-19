import React, { useState } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import FeaturedReviews from './components/FeaturedReviews';
import Footer from './components/Footer';
import LoginPage from './pages/LoginPage';
import ReviewPage from './pages/ReviewPage';


const App: React.FC = () => {
  const [page, setPage] = useState('home');

  const navigate = (targetPage: string) => {
    setPage(targetPage);
    window.scrollTo(0, 0);
  };

  return (
    <div className="min-h-screen bg-[#f8f8f8] flex flex-col">
      {page !== 'home' && <Header onNavigate={navigate} variant="solid" />}
      
      <main className="flex-grow">
        {page === 'home' && (
          <>
            <Hero onNavigate={navigate} />
            <FeaturedReviews />
          </>
        )}
        {page === 'login' && <LoginPage onNavigate={navigate} />}
        {page === 'review' && <ReviewPage />}
      </main>

      <Footer />
    </div>
  );
};

export default App;
