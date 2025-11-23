import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { CircularProgress } from './CircularProgress';
import { Button } from '@/components/ui/Button';

export interface SessionHeaderProps {
  progress: {
    current: number;
    total: number;
    correct: number;
    incorrect: number;
    accuracy: number;
  };
  stats: {
    startTime: Date | null;
    completed: number;
  };
  onEnd: () => void;
  sessionStarted: boolean;
}

export const SessionHeader: React.FC<SessionHeaderProps> = ({
  progress,
  stats,
  onEnd,
  sessionStarted,
}) => {
  const elapsedTime = stats.startTime
    ? formatDistanceToNow(stats.startTime, { addSuffix: false })
    : '0 seconds';

  const remaining = progress.total - progress.current;
  const percentage = progress.total > 0 ? (progress.current / progress.total) * 100 : 0;

  // Estimate time remaining (assuming average 30 seconds per card)
  const avgTimePerCard = 30; // seconds
  const estimatedSeconds = remaining * avgTimePerCard;
  const estimatedMinutes = Math.ceil(estimatedSeconds / 60);

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
      <div className="flex items-center justify-between">
        {/* Left: Progress */}
        <div className="flex items-center gap-6">
          <CircularProgress
            value={percentage}
            size={60}
            strokeWidth={6}
            label={`${progress.current}/${progress.total}`}
          />
          <div>
            <div className="flex items-center gap-4">
              <div>
                <p className="text-sm text-gray-600">Cards Remaining</p>
                <p className="text-2xl font-bold text-gray-900">{remaining}</p>
              </div>
              <div className="h-12 w-px bg-gray-300" />
              <div>
                <p className="text-sm text-gray-600">Accuracy</p>
                <p className="text-2xl font-bold text-green-600">
                  {progress.accuracy.toFixed(0)}%
                </p>
              </div>
              <div className="h-12 w-px bg-gray-300" />
              <div>
                <p className="text-sm text-gray-600">Time Elapsed</p>
                <p className="text-lg font-semibold text-gray-900">{elapsedTime}</p>
              </div>
              {remaining > 0 && (
                <>
                  <div className="h-12 w-px bg-gray-300" />
                  <div>
                    <p className="text-sm text-gray-600">Est. Remaining</p>
                    <p className="text-lg font-semibold text-gray-900">
                      ~{estimatedMinutes} min
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right: Controls */}
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={onEnd} disabled={!sessionStarted}>
            End Session
          </Button>
        </div>
      </div>
    </header>
  );
};

