import React, { useState } from 'react';

const StarIcon: React.FC<{ filled: boolean; [key: string]: any }> = ({ filled, ...props }) => (
    <svg 
        className={`w-8 h-8 cursor-pointer transition-colors ${filled ? 'text-yellow-400' : 'text-gray-300 hover:text-yellow-200'}`}
        fill="currentColor" 
        viewBox="0 0 20 20" 
        xmlns="http://www.w3.org/2000/svg"
        {...props}
    >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
    </svg>
);

const StarRatingInput: React.FC<{
    count?: number;
    value: number;
    onChange: (value: number) => void;
}> = ({ count = 5, value, onChange }) => {
    const [hoverValue, setHoverValue] = useState<number | undefined>(undefined);

    const stars = Array(count).fill(0);

    const handleClick = (newValue: number) => {
        // Allow un-selecting by clicking the same star again
        if (newValue === value) {
            onChange(0);
        } else {
            onChange(newValue);
        }
    };
    
    const handleMouseOver = (newHoverValue: number) => setHoverValue(newHoverValue);
    const handleMouseLeave = () => setHoverValue(undefined);

    return (
        <div className="flex space-x-1" role="radiogroup">
            {stars.map((_, index) => {
                const ratingValue = index + 1;
                return (
                    <StarIcon
                        key={index}
                        role="radio"
                        aria-checked={value === ratingValue}
                        aria-label={`${ratingValue} estrelas`}
                        tabIndex={0}
                        onClick={() => handleClick(ratingValue)}
                        onMouseOver={() => handleMouseOver(ratingValue)}
                        onMouseLeave={handleMouseLeave}
                        onKeyDown={(e) => e.key === 'Enter' && handleClick(ratingValue)}
                        filled={(hoverValue || value) >= ratingValue}
                    />
                );
            })}
        </div>
    );
};

export default StarRatingInput;