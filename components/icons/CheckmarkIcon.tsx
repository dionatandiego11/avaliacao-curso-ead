
import React from 'react';

interface IconProps {
  className?: string;
}

const CheckmarkIcon: React.FC<IconProps> = ({ className }) => (
  <svg 
    className={className}
    viewBox="0 0 24 24" 
    xmlns="http://www.w3.org/2000/svg"
  >
    <g fill="none" stroke="none">
      <circle cx="12" cy="12" r="12" fill="#3B82F6" />
      <path d="M8 12.5l3 3l5-6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </g>
  </svg>
);

export default CheckmarkIcon;
