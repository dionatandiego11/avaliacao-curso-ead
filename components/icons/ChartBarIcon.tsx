import React from 'react';

interface IconProps {
  className?: string;
}

const ChartBarIcon: React.FC<IconProps> = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 20V10"></path>
    <path d="M18 20V4"></path>
    <path d="M6 20V16"></path>
  </svg>
);

export default ChartBarIcon;