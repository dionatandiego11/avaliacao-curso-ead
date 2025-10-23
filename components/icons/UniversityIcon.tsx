
import React from 'react';

interface IconProps {
  className?: string;
}

const UniversityIcon: React.FC<IconProps> = ({ className }) => (
  <svg 
    className={className}
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <path d="M3 10v6c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-6" />
    <path d="M3 10l9-6 9 6" />
    <path d="M12 22v-8" />
  </svg>
);

export default UniversityIcon;
