import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAnalytics } from '@/store/hooks';

export default function DashboardPage() {
  const { overview, streak } = useAnalytics();

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>
        
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Due Cards</h3>
            <p className="text-3xl font-bold text-primary-600">
              {overview?.due_cards || 0}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">New Cards</h3>
            <p className="text-3xl font-bold text-blue-600">
              {overview?.new_cards || 0}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Reviewed Today</h3>
            <p className="text-3xl font-bold text-green-600">
              {overview?.reviewed_today || 0}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Streak</h3>
            <p className="text-3xl font-bold text-orange-600">
              🔥 {streak?.current || 0} days
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <a
                href="/study"
                className="block w-full px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-center font-medium"
              >
                Start Studying
              </a>
              <a
                href="/decks"
                className="block w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-center font-medium"
              >
                Browse Decks
              </a>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
            <p className="text-gray-500">No recent activity</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

