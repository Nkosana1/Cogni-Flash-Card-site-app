import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { Card } from '@/types';
import { cn } from '@/utils/cn';

export interface FlashcardProps {
  card: Card;
  isFlipped?: boolean;
  onFlip?: () => void;
  onRating?: (quality: number) => void;
  showRatingButtons?: boolean;
  className?: string;
}

export const Flashcard: React.FC<FlashcardProps> = ({
  card,
  isFlipped: controlledFlipped,
  onFlip,
  onRating,
  showRatingButtons = true,
  className,
}) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const flipped = controlledFlipped !== undefined ? controlledFlipped : isFlipped;

  const handleFlip = () => {
    if (controlledFlipped === undefined) {
      setIsFlipped(!isFlipped);
    }
    onFlip?.();
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        handleFlip();
      } else if (e.key >= '1' && e.key <= '5' && onRating) {
        e.preventDefault();
        onRating(parseInt(e.key) - 1);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [flipped, onRating]);

  // Touch gestures
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe || isRightSwipe) {
      handleFlip();
    }
  };

  const renderContent = (content: string) => {
    return (
      <ReactMarkdown
        remarkPlugins={[remarkMath]}
        rehypePlugins={[rehypeKatex]}
        className="prose prose-sm max-w-none"
      >
        {content}
      </ReactMarkdown>
    );
  };

  const renderMedia = () => {
    if (!card.media_attachments || card.media_attachments.length === 0) {
      return null;
    }

    return (
      <div className="mt-4 space-y-2">
        {card.media_attachments.map((media, index) => (
          <div key={index} className="rounded-lg overflow-hidden">
            {media.type === 'image' && (
              <img
                src={media.url}
                alt={`Card media ${index + 1}`}
                className="w-full h-auto max-h-64 object-contain"
              />
            )}
            {media.type === 'audio' && (
              <audio controls className="w-full">
                <source src={media.url} />
              </audio>
            )}
            {media.type === 'video' && (
              <video controls className="w-full max-h-64">
                <source src={media.url} />
              </video>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className={cn('perspective-1000', className)}>
      <div
        ref={cardRef}
        className={cn(
          'relative w-full h-96 cursor-pointer preserve-3d transition-transform duration-600',
          flipped && 'rotate-y-180'
        )}
        onClick={handleFlip}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        role="button"
        tabIndex={0}
        aria-label={flipped ? 'Flip card to front' : 'Flip card to back'}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleFlip();
          }
        }}
      >
        {/* Front */}
        <div
          className={cn(
            'absolute inset-0 backface-hidden rounded-lg shadow-lg p-6 bg-white border-2 border-gray-200 flex flex-col',
            flipped && 'hidden'
          )}
        >
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center w-full">
              {renderContent(card.front_content)}
              {renderMedia()}
            </div>
          </div>
          <div className="text-xs text-gray-500 mt-4 text-center">
            Click or press Space to flip
          </div>
        </div>

        {/* Back */}
        <div
          className={cn(
            'absolute inset-0 backface-hidden rotate-y-180 rounded-lg shadow-lg p-6 bg-primary-50 border-2 border-primary-200 flex flex-col',
            !flipped && 'hidden'
          )}
        >
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center w-full">
              {renderContent(card.back_content)}
              {renderMedia()}
            </div>
          </div>
          {showRatingButtons && onRating && (
            <div className="mt-6 flex justify-center gap-2">
              {[0, 1, 2, 3, 4].map((quality) => (
                <button
                  key={quality}
                  onClick={(e) => {
                    e.stopPropagation();
                    onRating(quality);
                  }}
                  className={cn(
                    'px-4 py-2 rounded-lg font-medium transition-colors',
                    quality < 2
                      ? 'bg-red-100 text-red-700 hover:bg-red-200'
                      : quality < 4
                      ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                      : 'bg-green-100 text-green-700 hover:bg-green-200'
                  )}
                  aria-label={`Rate ${quality + 1} out of 5`}
                >
                  {quality + 1}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        .preserve-3d {
          transform-style: preserve-3d;
        }
        .backface-hidden {
          backface-visibility: hidden;
        }
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
        .duration-600 {
          transition-duration: 600ms;
        }
      `}</style>
    </div>
  );
};

