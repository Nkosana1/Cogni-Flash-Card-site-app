import React from 'react';
import { Flashcard3D } from './Flashcard3D';
import { RatingButtons } from '../RatingButtons';
import { Card } from '@/types';

export interface CardReviewAreaProps {
  card: Card | undefined;
  isFlipped: boolean;
  onFlip: () => void;
  onRating: (quality: number) => void;
  disabled?: boolean;
}

export const CardReviewArea: React.FC<CardReviewAreaProps> = ({
  card,
  isFlipped,
  onFlip,
  onRating,
  disabled = false,
}) => {
  if (!card) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-gray-500">No card available</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8">
      <div className="w-full max-w-4xl">
        {/* Flashcard */}
        <div className="mb-8">
          <Flashcard3D
            card={card}
            isFlipped={isFlipped}
            onFlip={onFlip}
          />
        </div>

        {/* Rating Buttons - Only show when flipped */}
        {isFlipped && (
          <div className="mt-8 animate-fade-in">
            <RatingButtons
              onRating={onRating}
              disabled={disabled}
              size="lg"
            />
            <p className="text-center text-sm text-gray-500 mt-4">
              Press 1-4 to rate, or click the buttons above
            </p>
          </div>
        )}

        {/* Flip hint when not flipped */}
        {!isFlipped && (
          <div className="text-center mt-8">
            <p className="text-gray-500 text-sm">
              Click the card or press Space to flip
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

