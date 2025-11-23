import React from 'react';
import { cn } from '@/utils/cn';

export interface RatingButtonsProps {
  onRating: (quality: number) => void;
  disabled?: boolean;
  className?: string;
}

const ratingLabels = ['Again', 'Hard', 'Good', 'Easy', 'Perfect'];
const ratingColors = [
  'bg-red-100 text-red-700 hover:bg-red-200',
  'bg-orange-100 text-orange-700 hover:bg-orange-200',
  'bg-yellow-100 text-yellow-700 hover:bg-yellow-200',
  'bg-green-100 text-green-700 hover:bg-green-200',
  'bg-blue-100 text-blue-700 hover:bg-blue-200',
];

export const RatingButtons: React.FC<RatingButtonsProps> = ({
  onRating,
  disabled = false,
  className,
}) => {
  return (
    <div className={cn('flex flex-wrap justify-center gap-2', className)} role="group" aria-label="Card rating">
      {[0, 1, 2, 3, 4].map((quality) => (
        <button
          key={quality}
          onClick={() => onRating(quality)}
          disabled={disabled}
          className={cn(
            'px-6 py-3 rounded-lg font-medium transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed',
            ratingColors[quality]
          )}
          aria-label={`Rate as ${ratingLabels[quality]}`}
        >
          <div className="flex flex-col items-center">
            <span className="text-2xl font-bold">{quality + 1}</span>
            <span className="text-xs mt-1">{ratingLabels[quality]}</span>
          </div>
        </button>
      ))}
    </div>
  );
};

