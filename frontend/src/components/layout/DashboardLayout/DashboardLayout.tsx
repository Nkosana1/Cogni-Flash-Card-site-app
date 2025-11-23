import React from 'react';
import { Navigation } from '../Navigation';
import { Sidebar } from '../Sidebar';
import { cn } from '@/utils/cn';

export interface DashboardLayoutProps {
  children: React.ReactNode;
  sidebarContent?: React.ReactNode;
  className?: string;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  sidebarContent,
  className,
}) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="flex">
        <Sidebar>{sidebarContent}</Sidebar>
        <main className={cn('flex-1 p-6', className)}>{children}</main>
      </div>
    </div>
  );
};

