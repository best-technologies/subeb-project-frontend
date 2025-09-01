'use client';
import React from 'react';
import { useGlobalStudentsDashboard } from '@/services';
import StudentsTab from '@/components/students/StudentsTab';

export default function StudentsPage() {
  const { data, loading, error } = useGlobalStudentsDashboard();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-white mb-2">Loading Students Data</h2>
          <p className="text-gray-400">Please wait while we fetch the latest information...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-white mb-4">Error Loading Data</h2>
          <p className="text-gray-400 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">📊</div>
          <h2 className="text-2xl font-bold text-white mb-4">No Data Available</h2>
          <p className="text-gray-400">No students data found. Please check your connection and try again.</p>
        </div>
      </div>
    );
  }

  return (
    <StudentsTab
      performanceTable={data.performanceTable}
      lgas={data.lgas}
      subjects={data.subjects.map(subject => subject.name)}
    />
  );
} 