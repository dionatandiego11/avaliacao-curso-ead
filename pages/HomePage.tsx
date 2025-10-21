
import React from 'react';
import Hero from '../components/Hero';
import FeaturedReviews from '../components/FeaturedReviews';
import Footer from '../components/Footer';

const HomePage: React.FC<{ onNavigate: (page: string) => void }> = ({ onNavigate }) => (
  <>
    <Hero onNavigate={onNavigate} />
    <FeaturedReviews />
    <Footer />
  </>
);

export default HomePage;
