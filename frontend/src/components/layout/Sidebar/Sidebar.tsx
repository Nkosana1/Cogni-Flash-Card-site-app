import React from 'react';
import { cn } from '@/utils/cn';

export interface SidebarProps {
  children?: React.ReactNode;
  className?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ children, className }) => {
  return (
    <aside
      className={cn(
        'w-64 bg-white shadow-sm border-r border-gray-200 p-4',
        className
      )}
      role="complementary"
      aria-label="Sidebar"
    >
      {children}
    </aside>
  );
};

