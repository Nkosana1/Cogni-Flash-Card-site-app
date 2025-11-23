import React, { useEffect } from 'react';
import { cn } from '@/utils/cn';

export interface RatingButtonsProps {
  onRating: (quality: number) => void;
  disabled?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const ratingLabels = ['Again', 'Hard', 'Good', 'Easy', 'Perfect'];
const ratingColors = [
  'bg-red-100 text-red-700 hover:bg-red-200 active:bg-red-300',
  'bg-orange-100 text-orange-700 hover:bg-orange-200 active:bg-orange-300',
  'bg-yellow-100 text-yellow-700 hover:bg-yellow-200 active:bg-yellow-300',
  'bg-green-100 text-green-700 hover:bg-green-200 active:bg-green-300',
  'bg-blue-100 text-blue-700 hover:bg-blue-200 active:bg-blue-300',
];

const sizeClasses = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-base',
  lg: 'px-8 py-4 text-lg',
};

const numberSizes = {
  sm: 'text-xl',
  md: 'text-2xl',
  lg: 'text-3xl',
};

export const RatingButtons: React.FC<RatingButtonsProps> = ({
  onRating,
  disabled = false,
  className,
  size = 'md',
}) => {
  // Haptic feedback on mobile
  const triggerHaptic = () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
  };

  const handleRating = (quality: number) => {
    triggerHaptic();
    onRating(quality);
  };

  return (
    <div
      className={cn(
        'flex flex-wrap justify-center gap-3 md:gap-4',
        className
      )}
      role="group"
      aria-label="Card rating"
    >
      {[0, 1, 2, 3, 4].map((quality) => (
        <button
          key={quality}
          onClick={() => handleRating(quality)}
          disabled={disabled}
          className={cn(
            'rounded-xl font-medium transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation',
            ratingColors[quality],
            sizeClasses[size],
            'shadow-md hover:shadow-lg active:shadow-sm'
          )}
          aria-label={`Rate as ${ratingLabels[quality]} (${quality + 1})`}
        >
          <div className="flex flex-col items-center gap-1">
            <span className={cn('font-bold', numberSizes[size])}>
              {quality + 1}
            </span>
            <span className="text-xs md:text-sm font-medium">
              {ratingLabels[quality]}
            </span>
          </div>
        </button>
      ))}
    </div>
  );
};

