import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStudySession } from '@/store/hooks';
import { useDecks } from '@/store/hooks';
import { SessionHeader } from '@/components/study/SessionHeader';
import { CardReviewArea } from '@/components/study/CardReviewArea';
import { SessionSidebar } from '@/components/study/SessionSidebar';
import { SessionSummaryModal } from '@/components/study/SessionSummaryModal';
import { Loading } from '@/components/ui/Loading';
import { ErrorBoundary } from 'react-error-boundary';

export const StudySessionPage: React.FC = () => {
  const { deckId } = useParams<{ deckId?: string }>();
  const navigate = useNavigate();
  const parsedDeckId = deckId ? parseInt(deckId) : undefined;
  
  const { currentDeck, selectDeck } = useDecks();
  const {
    currentCard,
    queue,
    sessionStarted,
    stats,
    progress,
    isLoading,
    handleStartSession,
    handleEndSession,
    handleRating,
    reset,
  } = useStudySession(parsedDeckId);

  const [isFlipped, setIsFlipped] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [sessionConfig, setSessionConfig] = useState<{
    deckId: number;
    cardLimit?: number;
    timeLimit?: number;
  } | null>(null);

  // Load deck if deckId provided
  useEffect(() => {
    if (parsedDeckId && !currentDeck) {
      // Deck should be loaded via useDecks hook
      // This is a placeholder - you'd fetch the deck here
    }
  }, [parsedDeckId, currentDeck]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Don't handle shortcuts if typing in input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      if (sessionStarted && currentCard) {
        if (e.key >= '1' && e.key <= '4') {
          e.preventDefault();
          if (isFlipped) {
            handleRating(parseInt(e.key) - 1);
            setIsFlipped(false);
          }
        } else if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          setIsFlipped(!isFlipped);
        } else if (e.key === 'Escape') {
          e.preventDefault();
          handleEndSession();
          setShowSummary(true);
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [sessionStarted, currentCard, isFlipped, handleRating, handleEndSession]);

  // Auto-flip back when new card loads
  useEffect(() => {
    setIsFlipped(false);
  }, [currentCard?.id]);

  // Show summary when session ends
  useEffect(() => {
    if (!sessionStarted && stats.completed > 0) {
      setShowSummary(true);
    }
  }, [sessionStarted, stats.completed]);

  const handleStart = async (config: { deckId: number; cardLimit?: number; timeLimit?: number }) => {
    setSessionConfig(config);
    const result = await handleStartSession(config.deckId);
    if (result.success) {
      // Session started
    }
  };

  const handleEnd = async () => {
    await handleEndSession();
    setShowSummary(true);
  };

  const handleCloseSummary = () => {
    setShowSummary(false);
    reset();
    navigate('/dashboard');
  };

  if (!sessionStarted && !sessionConfig) {
    return (
      <SessionSetup
        onStart={handleStart}
        defaultDeckId={parsedDeckId}
        currentDeck={currentDeck}
      />
    );
  }

  if (isLoading && !currentCard) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading size="lg" text="Loading study session..." />
      </div>
    );
  }

  if (!currentCard && queue.length === 0 && sessionStarted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">All done!</h2>
          <p className="text-gray-600 mb-6">You've completed all cards in this session.</p>
          <button
            onClick={handleEnd}
            className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            End Session
          </button>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-600 mb-4">Something went wrong</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg"
            >
              Reload
            </button>
          </div>
        </div>
      }
    >
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="flex h-screen">
          {/* Main Content */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <SessionHeader
              progress={progress}
              stats={stats}
              onEnd={handleEnd}
              sessionStarted={sessionStarted}
            />

            <div className="flex-1 overflow-auto">
              <CardReviewArea
                card={currentCard}
                isFlipped={isFlipped}
                onFlip={() => setIsFlipped(!isFlipped)}
                onRating={handleRating}
                disabled={!isFlipped}
              />
            </div>
          </div>

          {/* Sidebar */}
          <SessionSidebar stats={stats} progress={progress} />
        </div>

        {/* Summary Modal */}
        <SessionSummaryModal
          isOpen={showSummary}
          onClose={handleCloseSummary}
          stats={stats}
          progress={progress}
        />
      </div>
    </ErrorBoundary>
  );
};

// Session Setup Component
interface SessionSetupProps {
  onStart: (config: { deckId: number; cardLimit?: number; timeLimit?: number }) => void;
  defaultDeckId?: number;
  currentDeck?: any;
}

const SessionSetup: React.FC<SessionSetupProps> = ({ onStart, defaultDeckId, currentDeck }) => {
  const { decks } = useDecks();
  const [selectedDeckId, setSelectedDeckId] = useState<number>(defaultDeckId || decks[0]?.id || 0);
  const [cardLimit, setCardLimit] = useState<number | undefined>(undefined);
  const [timeLimit, setTimeLimit] = useState<number | undefined>(undefined);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedDeckId) {
      onStart({
        deckId: selectedDeckId,
        cardLimit: cardLimit || undefined,
        timeLimit: timeLimit || undefined,
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Start Study Session</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Deck
            </label>
            <select
              value={selectedDeckId}
              onChange={(e) => setSelectedDeckId(parseInt(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required
            >
              {decks.map((deck) => (
                <option key={deck.id} value={deck.id}>
                  {deck.title} ({deck.card_count} cards)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Card Limit (optional)
            </label>
            <input
              type="number"
              min="1"
              value={cardLimit || ''}
              onChange={(e) => setCardLimit(e.target.value ? parseInt(e.target.value) : undefined)}
              placeholder="No limit"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Time Limit (minutes, optional)
            </label>
            <input
              type="number"
              min="1"
              value={timeLimit || ''}
              onChange={(e) => setTimeLimit(e.target.value ? parseInt(e.target.value) : undefined)}
              placeholder="No limit"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <button
            type="submit"
            className="w-full px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium transition-colors"
          >
            Start Session
          </button>
        </form>
      </div>
    </div>
  );
};

