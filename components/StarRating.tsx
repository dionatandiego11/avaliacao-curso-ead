
import React from 'react';

interface StarRatingProps {
  rating: number;
  onRatingChange?: (rating: number) => void;
  readOnly?: boolean;
}

const StarIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
);


const StarRating: React.FC<StarRatingProps> = ({ rating, onRatingChange, readOnly = true }) => {
  return (
    <div className="flex items-center">
      {[1, 2, 3, 4, 5].map((star) => {
        const isSelected = star <= rating;
        const isHalf = star - 0.5 === rating;

        const starElement = (
          <div key={star} className="relative">
             <StarIcon className={`w-6 h-6 ${isHalf || isSelected ? 'text-amber-400 fill-amber-400' : 'text-slate-300 dark:text-slate-500'}`} />
          </div>
        );

        if (readOnly) {
          return starElement;
        }

        return (
          <button
            key={star}
            type="button"
            className="focus:outline-none"
            onClick={() => onRatingChange && onRatingChange(star)}
            aria-label={`Rate ${star} stars`}
          >
            <StarIcon className={`w-6 h-6 transition-colors ${isSelected ? 'text-amber-400 fill-amber-400' : 'text-slate-300 dark:text-slate-500 hover:text-amber-300'}`} />
          </button>
        );
      })}
    </div>
  );
};

export default StarRating;
