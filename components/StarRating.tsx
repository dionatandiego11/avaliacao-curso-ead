import React, { useState } from 'react';
import StarIcon from './icons/StarIcon';

interface StarRatingProps {
  count: number;
  value: number;
  onChange: (rating: number) => void;
}

const StarRating: React.FC<StarRatingProps> = ({ count, value, onChange }) => {
  const [hover, setHover] = useState(0);

  return (
    <div className="flex items-center space-x-1">
      {[...Array(count)].map((_, index) => {
        const ratingValue = index + 1;
        return (
          <label key={index} className="cursor-pointer">
            <input
              type="radio"
              name="rating"
              className="hidden"
              value={ratingValue}
              onClick={() => onChange(ratingValue)}
            />
            <StarIcon
              className="w-8 h-8 transition-colors duration-200"
              fill={ratingValue <= (hover || value) ? '#FBBF24' : '#E5E7EB'}
              onMouseEnter={() => setHover(ratingValue)}
              onMouseLeave={() => setHover(0)}
            />
          </label>
        );
      })}
    </div>
  );
};

export default StarRating;
