import React from 'react';

interface IconProps {
  className?: string;
  fill?: string;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

const StarIcon: React.FC<IconProps> = ({ className, fill = 'none', onMouseEnter, onMouseLeave }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill={fill}
    stroke={fill}
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    onMouseEnter={onMouseEnter}
    onMouseLeave={onMouseLeave}
  >
    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
  </svg>
);

export default StarIcon;
