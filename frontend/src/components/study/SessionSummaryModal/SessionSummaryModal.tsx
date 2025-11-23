import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { ProgressChart } from '@/components/analytics/ProgressChart';

export interface SessionSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: {
    total: number;
    completed: number;
    correct: number;
    incorrect: number;
    startTime: Date | null;
  };
  progress: {
    current: number;
    total: number;
    correct: number;
    incorrect: number;
    accuracy: number;
  };
}

export const SessionSummaryModal: React.FC<SessionSummaryModalProps> = ({
  isOpen,
  onClose,
  stats,
  progress,
}) => {
  const duration = stats.startTime
    ? formatDistanceToNow(stats.startTime, { addSuffix: false })
    : '0 seconds';

  const pace = stats.startTime && stats.completed > 0
    ? Math.round((stats.completed / (Date.now() - stats.startTime.getTime()) / 1000) * 60)
    : 0;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Session Complete!"
      size="lg"
      showCloseButton={false}
    >
      <div className="space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-3xl font-bold text-primary-600">{stats.completed}</p>
            <p className="text-sm text-gray-600 mt-1">Cards Studied</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-3xl font-bold text-green-600">{stats.correct}</p>
            <p className="text-sm text-gray-600 mt-1">Correct</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-3xl font-bold text-red-600">{stats.incorrect}</p>
            <p className="text-sm text-gray-600 mt-1">Incorrect</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-3xl font-bold text-blue-600">{progress.accuracy.toFixed(1)}%</p>
            <p className="text-sm text-gray-600 mt-1">Accuracy</p>
          </div>
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Duration</p>
            <p className="text-lg font-semibold text-gray-900">{duration}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Pace</p>
            <p className="text-lg font-semibold text-gray-900">{pace} cards/min</p>
          </div>
        </div>

        {/* Performance Message */}
        <div className="p-4 rounded-lg bg-primary-50 border border-primary-200">
          {progress.accuracy >= 80 ? (
            <p className="text-primary-800 text-center font-medium">
              🎉 Excellent work! You're mastering these cards!
            </p>
          ) : progress.accuracy >= 60 ? (
            <p className="text-primary-800 text-center font-medium">
              👍 Good progress! Keep practicing!
            </p>
          ) : (
            <p className="text-primary-800 text-center font-medium">
              💪 Keep going! Review helps strengthen your memory!
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button onClick={onClose}>
            Continue Studying
          </Button>
        </div>
      </div>
    </Modal>
  );
};

