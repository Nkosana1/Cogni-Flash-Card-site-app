import React from 'react';
import { cn } from '@/utils/cn';

export interface ProgressBarProps {
  current: number;
  total: number;
  label?: string;
  showPercentage?: boolean;
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  current,
  total,
  label,
  showPercentage = true,
  className,
}) => {
  const percentage = total > 0 ? Math.min((current / total) * 100, 100) : 0;

  return (
    <div className={cn('w-full', className)}>
      <div className="flex items-center justify-between mb-2">
        {label && <span className="text-sm font-medium text-gray-700">{label}</span>}
        {showPercentage && (
          <span className="text-sm font-medium text-gray-700">{Math.round(percentage)}%</span>
        )}
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
        <div
          className="bg-primary-600 h-2.5 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={current}
          aria-valuemin={0}
          aria-valuemax={total}
          aria-label={label || `Progress: ${current} of ${total}`}
        />
      </div>
    </div>
  );
};

