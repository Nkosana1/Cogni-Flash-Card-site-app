import React, { useState, useEffect, useCallback } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { Flashcard } from '@/components/cards/Flashcard';
import { ProgressBar } from '../ProgressBar';
import { RatingButtons } from '../RatingButtons';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Card, StudySession as StudySessionType } from '@/types';
import { formatDistanceToNow } from 'date-fns';

export interface StudySessionProps {
  cards: Card[];
  onReview: (cardId: number, quality: number) => Promise<void>;
  onEndSession: () => void;
  session?: StudySessionType;
  streak?: number;
}

interface SessionStats {
  total: number;
  completed: number;
  correct: number;
  incorrect: number;
  startTime: Date;
}

export const StudySession: React.FC<StudySessionProps> = ({
  cards,
  onReview,
  onEndSession,
  session,
  streak,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [stats, setStats] = useState<SessionStats>({
    total: cards.length,
    completed: 0,
    correct: 0,
    incorrect: 0,
    startTime: new Date(),
  });
  const [showSummary, setShowSummary] = useState(false);
  const [isReviewing, setIsReviewing] = useState(false);

  const currentCard = cards[currentIndex];
  const progress = stats.total > 0 ? (stats.completed / stats.total) * 100 : 0;
  const remaining = stats.total - stats.completed;

  const handleRating = useCallback(
    async (quality: number) => {
      if (!currentCard || isReviewing) return;

      setIsReviewing(true);
      try {
        await onReview(currentCard.id, quality);
        
        const isCorrect = quality >= 3;
        setStats((prev) => ({
          ...prev,
          completed: prev.completed + 1,
          correct: isCorrect ? prev.correct + 1 : prev.correct,
          incorrect: !isCorrect ? prev.incorrect + 1 : prev.incorrect,
        }));

        if (currentIndex < cards.length - 1) {
          setCurrentIndex(currentIndex + 1);
          setIsFlipped(false);
        } else {
          setShowSummary(true);
        }
      } catch (error) {
        console.error('Error submitting review:', error);
      } finally {
        setIsReviewing(false);
      }
    },
    [currentCard, currentIndex, cards.length, onReview, isReviewing]
  );

  const handleEndSession = () => {
    setShowSummary(true);
  };

  const handleCloseSummary = () => {
    setShowSummary(false);
    onEndSession();
  };

  const accuracy = stats.completed > 0 ? (stats.correct / stats.completed) * 100 : 0;
  const sessionDuration = formatDistanceToNow(stats.startTime, { addSuffix: false });

  if (!currentCard && cards.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No cards to study</p>
      </div>
    );
  }

  if (!currentCard) {
    return null;
  }

  return (
    <ErrorBoundary
      fallback={
        <div className="text-center py-12">
          <p className="text-red-600">Something went wrong. Please refresh the page.</p>
        </div>
      }
    >
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Study Session</h2>
              {streak && (
                <p className="text-sm text-gray-600 mt-1">
                  🔥 {streak} day streak
                </p>
              )}
            </div>
            <Button variant="outline" onClick={handleEndSession}>
              End Session
            </Button>
          </div>
          <ProgressBar
            current={stats.completed}
            total={stats.total}
            label={`${remaining} remaining`}
          />
        </div>

        {/* Card Counter */}
        <div className="text-center mb-6">
          <p className="text-lg text-gray-600">
            Card {stats.completed + 1} of {stats.total}
          </p>
        </div>

        {/* Flashcard */}
        <div className="mb-6">
          <Flashcard
            card={currentCard}
            isFlipped={isFlipped}
            onFlip={() => setIsFlipped(!isFlipped)}
            onRating={handleRating}
            showRatingButtons={false}
          />
        </div>

        {/* Rating Buttons (shown when flipped) */}
        {isFlipped && (
          <div className="flex justify-center">
            <RatingButtons onRating={handleRating} disabled={isReviewing} />
          </div>
        )}

        {/* Session Summary Modal */}
        <Modal
          isOpen={showSummary}
          onClose={handleCloseSummary}
          title="Session Complete!"
          size="md"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-3xl font-bold text-primary-600">{stats.completed}</p>
                <p className="text-sm text-gray-600">Cards Studied</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-3xl font-bold text-green-600">{stats.correct}</p>
                <p className="text-sm text-gray-600">Correct</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-3xl font-bold text-red-600">{stats.incorrect}</p>
                <p className="text-sm text-gray-600">Incorrect</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-3xl font-bold text-blue-600">{accuracy.toFixed(1)}%</p>
                <p className="text-sm text-gray-600">Accuracy</p>
              </div>
            </div>
            <div className="text-center text-sm text-gray-600">
              Duration: {sessionDuration}
            </div>
          </div>
          <div className="mt-6 flex justify-end">
            <Button onClick={handleCloseSummary}>Done</Button>
          </div>
        </Modal>
      </div>
    </ErrorBoundary>
  );
};

