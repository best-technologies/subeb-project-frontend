'use client';
import React, { useState, useEffect } from 'react';
import StatsCards from './StatsCards';
import CollapsibleCharts from './CollapsibleCharts';
import StudentsTable from '@/components/students/StudentsTable';
import { GlobalSearchFilter } from '@/components/shared/GlobalSearchFilter';
import { useGlobalSearchFilter } from '@/services';
import { AdminDashboardData } from '@/services/types/adminDashboardResponse';

interface DashboardProps {
  dashboardData: AdminDashboardData | null;
  onSearchParamsChange?: (params: {
    session?: string;
    term?: string;
    page?: number;
    limit?: number;
    search?: string;
    schoolId?: string;
    classId?: string;
    gender?: string;
    schoolLevel?: string;
    lgaId?: string;
    sortBy?: string;
    sortOrder?: string;
    includeStats?: boolean;
    includePerformance?: boolean;
  }) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ dashboardData, onSearchParamsChange }) => {
  // Debug logging
  console.log('Dashboard - Received data:', dashboardData);
  console.log('Dashboard - Students:', dashboardData?.data?.students?.length || 0);
  console.log('Dashboard - Top Students:', dashboardData?.performance?.topStudents?.length || 0);
  console.log('Dashboard - LGAs:', dashboardData?.data?.lgas?.length || 0);
  console.log('Dashboard - Schools:', dashboardData?.data?.schools?.length || 0);
  console.log('Dashboard - Available sessions:', dashboardData?.availableSessions?.length || 0);
  console.log('Dashboard - Available terms:', dashboardData?.availableTerms?.length || 0);

  const [lgaFilter, setLgaFilter] = useState('');
  const [schoolFilter, setSchoolFilter] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  const {
    searchTerm,
    selectedSession,
    selectedTerm,
    handleSearchChange,
    handleSessionChange,
    handleTermChange,
    availableSessions,
    availableTerms,
  } = useGlobalSearchFilter({
    availableSessions: dashboardData?.availableSessions || [],
    availableTerms: dashboardData?.availableTerms || [],
  });

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500); // 500ms debounce

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Call API when search parameters change
  useEffect(() => {
    if (onSearchParamsChange) {
      const params = {
        search: debouncedSearchTerm || undefined,
        session: selectedSession?.id || undefined,
        term: selectedTerm?.id || undefined,
        lgaId: lgaFilter ? dashboardData?.data?.lgas?.find(l => l.name === lgaFilter)?.id : undefined,
        schoolId: schoolFilter ? dashboardData?.data?.schools?.find(s => s.name === schoolFilter)?.id : undefined,
        includeStats: true,
        includePerformance: true,
      };
      
      // Debug: Log the search parameters being sent to backend
      console.log('🔍 Dashboard - Search parameters being sent to backend:', params);
      console.log('🔍 Dashboard - Search term:', debouncedSearchTerm);
      console.log('🔍 Dashboard - Selected session:', selectedSession?.id);
      console.log('🔍 Dashboard - Selected term:', selectedTerm?.id);
      
      // Only call if we have meaningful changes and valid session/term
      const hasValidParams = Object.values(params).some(val => val !== undefined);
      const hasValidSession = selectedSession?.id && selectedSession.id !== '';
      const hasValidTerm = selectedTerm?.id && selectedTerm.id !== '';
      
      if (hasValidParams && hasValidSession && hasValidTerm) {
        console.log('🚀 Dashboard - Calling backend API with params:', params);
        onSearchParamsChange(params);
      } else {
        console.log('⚠️ Dashboard - Skipping API call due to invalid session/term:', { 
          hasValidSession, 
          hasValidTerm, 
          sessionId: selectedSession?.id, 
          termId: selectedTerm?.id 
        });
      }
    }
  }, [debouncedSearchTerm, selectedSession?.id, selectedTerm?.id, lgaFilter, schoolFilter, onSearchParamsChange, dashboardData?.data?.lgas, dashboardData?.data?.schools]);

  // Get unique LGAs and schools from the dashboard data
  const availableLgas = dashboardData?.data?.lgas?.map(lga => lga.name) || [];
  const availableSchools = dashboardData?.data?.schools?.map(school => school.name) || [];
  
  // Debug the filters
  console.log('Available LGAs:', availableLgas);
  console.log('Available Schools:', availableSchools);
  
  // Get students from the backend - the backend should handle all filtering
  const students = dashboardData?.performance?.topStudents || dashboardData?.data?.students || [];
  
  // Debug: Log the students data received from backend
  console.log('📊 Dashboard - Students received from backend:', students.length);
  console.log('📊 Dashboard - Search term in UI:', searchTerm);
  console.log('📊 Dashboard - Debounced search term:', debouncedSearchTerm);

  return (
    <div className="space-y-8">
      
      {/* Current Session and Term Header */}
      <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-3 text-center">
        <div className="flex items-center justify-center gap-6">
          <div className="text-center">
            <h3 className="text-xs font-medium text-gray-300 mb-0.5">Session</h3>
            <p className="text-lg font-bold text-white">
              {dashboardData?.currentSession?.name || 'Not Set'}
            </p>
            {dashboardData?.currentSession?.isCurrent && (
              <span className="inline-block mt-0.5 px-1.5 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full">
                Active
              </span>
            )}
          </div>
          
          <div className="w-px h-8 bg-white/20"></div>
          
          <div className="text-center">
            <h3 className="text-xs font-medium text-gray-300 mb-0.5">Term</h3>
            <p className="text-lg font-bold text-white">
              {dashboardData?.currentTerm?.name?.replace('_', ' ') || 'Not Set'}
            </p>
            {dashboardData?.currentTerm?.isCurrent && (
              <span className="inline-block mt-0.5 px-1.5 py-0.5 bg-blue-500/20 text-blue-400 text-xs rounded-full">
                Active
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <StatsCards dashboardData={dashboardData} />
      
      {/* Collapsible Performance Charts */}
      <CollapsibleCharts dashboardData={dashboardData} />
      
      {/* Students Table */}
      <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">Top 10 Students</h2>
              <p className="text-gray-300 text-sm">
                Showing {students.length} students
                {searchTerm && ` matching "${searchTerm}"`}
                {lgaFilter && ` • LGA: ${lgaFilter}`}
                {schoolFilter && ` • School: ${schoolFilter}`}
              </p>
            </div>
            
            {/* Pagination Controls */}
            {students.length > 10 && (
              <div className="flex items-center gap-2">
                <button
                  className="px-3 py-1.5 bg-white/10 border border-white/20 rounded-lg text-white hover:bg-white/20 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  disabled={true} // TODO: Implement pagination state
                >
                  Previous
                </button>
                
                <div className="flex items-center gap-1">
                  <span className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium">
                    1
                  </span>
                  <span className="text-gray-300 text-sm">of</span>
                  <span className="text-gray-300 text-sm font-medium">
                    {Math.ceil(students.length / 10)}
                  </span>
                </div>
                
                <button
                  className="px-3 py-1.5 bg-white/10 border border-white/20 rounded-lg text-white hover:bg-white/20 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  disabled={students.length <= 10} // TODO: Implement pagination state
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
        
        {students.length === 0 ? (
          <div className="px-6 py-8 text-center">
            <p className="text-gray-400">No student data available</p>
          </div>
        ) : students.length === 0 ? (
          <div className="px-6 py-8 text-center">
            <p className="text-gray-400">No students match the current filters</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Position</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Student Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">School</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Class</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Total Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {students.map((student, index) => (
                  <tr key={student.id} className="hover:bg-white/5 transition-colors duration-200">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {student.position || index + 1}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white font-medium">
                      {student.studentName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {student.school || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {student.class || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-white">
                      {student.totalScore || 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard; 