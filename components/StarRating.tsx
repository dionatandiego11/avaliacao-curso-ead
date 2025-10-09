import React from 'react';

interface StarRatingProps {
  rating: number;
  onRatingChange?: (rating: number) => void;
  readOnly?: boolean;
  size?: 'sm' | 'md'; // Novo: tamanhos flexíveis
}

const StarIconFull: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
);

const StarIconEmpty: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

const StarRating: React.FC<StarRatingProps> = ({ rating, onRatingChange, readOnly = true, size = 'md' }) => {
  const sizeClass = size === 'sm' ? 'w-4 h-4' : 'w-6 h-6';
  return (
    <div className="flex items-center">
      {[1, 2, 3, 4, 5].map((star) => {
        const isSelected = star <= rating;
        const isHalf = Math.floor(rating) + 0.5 === rating && star === Math.floor(rating) + 1;

        let starElement;
        if (isHalf) {
          // Meia-estrela: Div com overflow e clip
          starElement = (
            <div key={star} className="relative w-6 h-6 overflow-hidden">
              <StarIconFull className={`${sizeClass} text-amber-400 absolute left-0`} style={{ clipPath: 'inset(0 50% 0 0)' }} />
              <StarIconEmpty className={`${sizeClass} text-amber-400 absolute right-0`} style={{ clipPath: 'inset(0 0 0 50%)' }} />
            </div>
          );
        } else {
          starElement = (
            <div key={star} className="relative">
              {isSelected ? (
                <StarIconFull className={`${sizeClass} text-amber-400`} />
              ) : (
                <StarIconEmpty className={`${sizeClass} text-slate-300 dark:text-slate-500`} />
              )}
            </div>
          );
        }

        if (readOnly) {
          return starElement;
        }

        return (
          <button
            key={star}
            type="button"
            className="focus:outline-none p-1 rounded hover:bg-amber-50 dark:hover:bg-amber-900/20"
            onClick={() => onRatingChange && onRatingChange(star)}
            aria-label={`Avaliar com ${star} estrelas`}
            title={`Avaliar com ${star} estrelas`} // Tooltip para acessibilidade
          >
            {starElement}
          </button>
        );
      })}
    </div>
  );
};

export default StarRating;