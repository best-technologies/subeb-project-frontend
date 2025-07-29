'use client';
import React, { useState, useMemo } from 'react';
import { useAdminDashboard } from '@/services';
import DashboardLayout from './DashboardLayout';
import Dashboard from './Dashboard';
import StudentsTab from './StudentsTab';
import SchoolsTab from './SchoolsTab';

const MainLayout: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [filters, setFilters] = useState({
    schoolName: '',
    lga: '',
    class: '',
    gender: '',
    subject: ''
  });

  // Fetch real data from API
  const { data: dashboardData, loading, error, refetch } = useAdminDashboard();

  // Use real API data directly
  const topStudents = dashboardData?.topStudents || [];

  const handleFilterChange = (filterType: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard dashboardData={dashboardData} />;
      case 'students':
        return <StudentsTab topStudents={topStudents} />;
      case 'schools':
        return <SchoolsTab />;
      default:
        return <Dashboard dashboardData={dashboardData} />;
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-400 text-6xl mb-4">⚠️</div>
          <h2 className="text-white text-xl font-bold mb-2">Error Loading Dashboard</h2>
          <p className="text-gray-300 mb-4">{error}</p>
          <button
            onClick={refetch}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout
      activeTab={activeTab}
      onTabChange={setActiveTab}
      filters={filters}
      onFilterChange={handleFilterChange}
      filteredStudents={topStudents}
      dashboardData={dashboardData}
    >
      {renderActiveTab()}
    </DashboardLayout>
  );
};

export default MainLayout; 