import React from 'react';
import { formatDistanceToNow } from 'date-fns';

export interface SessionSidebarProps {
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
    accuracy: number;
  };
}

export const SessionSidebar: React.FC<SessionSidebarProps> = ({ stats, progress }) => {
  const elapsedTime = stats.startTime
    ? formatDistanceToNow(stats.startTime, { addSuffix: false })
    : '0 seconds';

  const pace = stats.startTime
    ? Math.round((stats.completed / (Date.now() - stats.startTime.getTime()) / 1000) * 60)
    : 0;

  const confidenceDistribution = [
    { label: 'Perfect (5)', count: 0, color: 'bg-blue-500' },
    { label: 'Easy (4)', count: 0, color: 'bg-green-500' },
    { label: 'Good (3)', count: 0, color: 'bg-yellow-500' },
    { label: 'Hard (2)', count: 0, color: 'bg-orange-500' },
    { label: 'Again (1)', count: 0, color: 'bg-red-500' },
  ];

  return (
    <aside className="w-80 bg-white border-l border-gray-200 p-6 overflow-y-auto">
      <div className="space-y-6">
        {/* Session Stats */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Session Stats</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Cards Completed</span>
              <span className="text-lg font-semibold text-gray-900">
                {stats.completed} / {stats.total}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Correct</span>
              <span className="text-lg font-semibold text-green-600">{stats.correct}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Incorrect</span>
              <span className="text-lg font-semibold text-red-600">{stats.incorrect}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Accuracy</span>
              <span className="text-lg font-semibold text-primary-600">
                {progress.accuracy.toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Pace</span>
              <span className="text-lg font-semibold text-gray-900">{pace} cards/min</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Time Elapsed</span>
              <span className="text-sm font-medium text-gray-700">{elapsedTime}</span>
            </div>
          </div>
        </div>

        {/* Keyboard Shortcuts */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Shortcuts</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Flip card</span>
              <kbd className="px-2 py-1 bg-gray-100 rounded text-gray-700">Space</kbd>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Rate 1-4</span>
              <kbd className="px-2 py-1 bg-gray-100 rounded text-gray-700">1-4</kbd>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">End session</span>
              <kbd className="px-2 py-1 bg-gray-100 rounded text-gray-700">Esc</kbd>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Progress</h3>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className="bg-primary-600 h-3 rounded-full transition-all duration-300"
              style={{
                width: `${(stats.completed / stats.total) * 100}%`,
              }}
              role="progressbar"
              aria-valuenow={stats.completed}
              aria-valuemin={0}
              aria-valuemax={stats.total}
            />
          </div>
          <p className="text-xs text-gray-500 mt-2 text-center">
            {stats.completed} of {stats.total} cards
          </p>
        </div>
      </div>
    </aside>
  );
};

