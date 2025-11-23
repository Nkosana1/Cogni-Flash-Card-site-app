import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ProgressChart } from '@/components/analytics/ProgressChart';
import { RetentionGraph } from '@/components/analytics/RetentionGraph';
import { StudyCalendar } from '@/components/analytics/StudyCalendar';
import { useAnalytics } from '@/store/hooks';

export default function AnalyticsPage() {
  const { overview, streak } = useAnalytics();

  // Mock data for charts
  const progressData = [
    { date: 'Mon', reviewed: 20, correct: 18, accuracy: 90 },
    { date: 'Tue', reviewed: 35, correct: 32, accuracy: 91 },
    { date: 'Wed', reviewed: 28, correct: 25, accuracy: 89 },
    { date: 'Thu', reviewed: 42, correct: 38, accuracy: 90 },
    { date: 'Fri', reviewed: 30, correct: 27, accuracy: 90 },
    { date: 'Sat', reviewed: 25, correct: 23, accuracy: 92 },
    { date: 'Sun', reviewed: 18, correct: 16, accuracy: 89 },
  ];

  const retentionData = [
    { date: 'Week 1', retention: 85, ease_factor: 2.5 },
    { date: 'Week 2', retention: 88, ease_factor: 2.6 },
    { date: 'Week 3', retention: 90, ease_factor: 2.7 },
    { date: 'Week 4', retention: 92, ease_factor: 2.8 },
  ];

  const calendarData: Record<string, number> = {
    '2024-01-15': 20,
    '2024-01-16': 35,
    '2024-01-17': 28,
    '2024-01-18': 42,
    '2024-01-19': 30,
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Analytics</h1>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Total Cards</h3>
            <p className="text-3xl font-bold text-gray-900">
              {overview?.total_cards || 0}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Average Accuracy</h3>
            <p className="text-3xl font-bold text-green-600">
              {overview?.average_accuracy_today?.toFixed(1) || 0}%
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Study Time Today</h3>
            <p className="text-3xl font-bold text-blue-600">
              {overview?.study_time_today_minutes || 0} min
            </p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <ProgressChart data={progressData} />
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <RetentionGraph data={retentionData} />
          </div>
        </div>

        {/* Calendar */}
        <div className="bg-white rounded-lg shadow p-6">
          <StudyCalendar data={calendarData} />
        </div>
      </div>
    </DashboardLayout>
  );
}

