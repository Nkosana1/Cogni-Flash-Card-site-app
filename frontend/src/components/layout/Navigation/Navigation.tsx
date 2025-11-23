import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/utils/cn';

export interface NavigationProps {
  user?: {
    username: string;
    email: string;
  };
  onLogout?: () => void;
  className?: string;
}

export const Navigation: React.FC<NavigationProps> = ({ user, onLogout, className }) => {
  return (
    <nav
      className={cn(
        'bg-white shadow-sm border-b border-gray-200',
        className
      )}
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <span className="text-2xl font-bold text-primary-600">NeuroFlash</span>
            </Link>
            <div className="hidden md:ml-10 md:flex md:space-x-4">
              <Link
                to="/dashboard"
                className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-100"
              >
                Dashboard
              </Link>
              <Link
                to="/study"
                className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-100"
              >
                Study
              </Link>
              <Link
                to="/decks"
                className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-100"
              >
                Decks
              </Link>
              <Link
                to="/analytics"
                className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-100"
              >
                Analytics
              </Link>
            </div>
          </div>
          <div className="flex items-center">
            {user ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-700">{user.username}</span>
                {onLogout && (
                  <button
                    onClick={onLogout}
                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-primary-600"
                  >
                    Logout
                  </button>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="px-4 py-2 text-sm font-medium text-primary-600 hover:text-primary-700"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

