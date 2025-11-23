import React from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday } from 'date-fns';

export interface StudyCalendarProps {
  data: Record<string, number>; // date -> count
  className?: string;
}

export const StudyCalendar: React.FC<StudyCalendarProps> = ({ data, className }) => {
  const today = new Date();
  const monthStart = startOfMonth(today);
  const monthEnd = endOfMonth(today);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getIntensity = (count: number): string => {
    if (count === 0) return 'bg-gray-100';
    if (count < 5) return 'bg-green-200';
    if (count < 10) return 'bg-green-400';
    if (count < 20) return 'bg-green-600';
    return 'bg-green-800';
  };

  return (
    <div className={className}>
      <h3 className="text-lg font-semibold mb-4">
        {format(today, 'MMMM yyyy')}
      </h3>
      <div className="grid grid-cols-7 gap-1">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="text-center text-xs font-medium text-gray-600 py-2">
            {day}
          </div>
        ))}
        {days.map((day) => {
          const dateKey = format(day, 'yyyy-MM-dd');
          const count = data[dateKey] || 0;
          const isCurrentMonth = isSameMonth(day, today);
          const isTodayDate = isToday(day);

          return (
            <div
              key={dateKey}
              className={`aspect-square flex flex-col items-center justify-center rounded text-xs ${
                isCurrentMonth ? getIntensity(count) : 'bg-gray-50'
              } ${isTodayDate ? 'ring-2 ring-primary-500' : ''}`}
              title={`${format(day, 'MMM d')}: ${count} reviews`}
            >
              <span className={isCurrentMonth ? 'text-gray-900' : 'text-gray-400'}>
                {format(day, 'd')}
              </span>
              {count > 0 && (
                <span className="text-xs font-bold mt-1">{count}</span>
              )}
            </div>
          );
        })}
      </div>
      <div className="mt-4 flex items-center justify-center gap-4 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-gray-100 rounded" />
          <span>No reviews</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-green-200 rounded" />
          <span>1-4</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-green-400 rounded" />
          <span>5-9</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-green-600 rounded" />
          <span>10-19</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-green-800 rounded" />
          <span>20+</span>
        </div>
      </div>
    </div>
  );
};

