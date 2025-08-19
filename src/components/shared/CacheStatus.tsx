'use client';
import React from 'react';
import { useData } from '@/context/DataContext';
import { ArrowPathIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

interface CacheStatusProps {
  className?: string;
}

export const CacheStatus: React.FC<CacheStatusProps> = ({ className = '' }) => {
  const { 
    state: { adminDashboard, studentsDashboard }, 
    clearCache,
    isAdminDashboardCached,
    isStudentsDashboardCached 
  } = useData();

  const adminCached = isAdminDashboardCached();
  const studentsCached = isStudentsDashboardCached();
  const anyCached = adminCached || studentsCached;

  const getCacheTime = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    if (minutes > 0) {
      return `${minutes}m ${seconds}s ago`;
    }
    return `${seconds}s ago`;
  };

  if (!anyCached) {
    return null;
  }

  return (
    <div className={`flex items-center gap-2 text-sm ${className}`}>
      {/* Admin Dashboard Cache Status */}
      {adminCached && (
        <div className="flex items-center gap-1 text-green-400">
          <CheckCircleIcon className="w-4 h-4" />
          <span>Dashboard: {getCacheTime(adminDashboard.timestamp)}</span>
        </div>
      )}

      {/* Students Dashboard Cache Status */}
      {studentsCached && (
        <div className="flex items-center gap-1 text-blue-400">
          <CheckCircleIcon className="w-4 h-4" />
          <span>Students: {getCacheTime(studentsDashboard.timestamp)}</span>
        </div>
      )}

      {/* Refresh Button */}
      <button
        onClick={clearCache}
        className="flex items-center gap-1 text-gray-400 hover:text-white transition-colors duration-200"
        title="Clear cache and refresh all data"
      >
        <ArrowPathIcon className="w-4 h-4" />
        <span>Refresh</span>
      </button>
    </div>
  );
};
