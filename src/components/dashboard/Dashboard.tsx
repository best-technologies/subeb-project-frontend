'use client';
import React from 'react';
import StatsCards from './StatsCards';
import CollapsibleCharts from './CollapsibleCharts';
import StudentsTable from './StudentsTable';
import { AdminDashboardData } from '@/services/types/adminDashboardResponse';

interface DashboardProps {
  dashboardData: AdminDashboardData | null;
}

const Dashboard: React.FC<DashboardProps> = ({ dashboardData }) => {
  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <StatsCards dashboardData={dashboardData} />
      
      {/* Collapsible Performance Charts */}
      <CollapsibleCharts dashboardData={dashboardData} />
      
      {/* Students Table */}
      <StudentsTable topStudents={dashboardData?.topStudents || []} />
    </div>
  );
};

export default Dashboard; 