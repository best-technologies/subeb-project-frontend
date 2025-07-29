'use client';
import React, { useState } from 'react';
import { TopStudent } from '@/services/types/adminDashboardResponse';
import { AdminDashboardData } from '@/services/types/adminDashboardResponse';
import Sidebar from './Sidebar';
import { formatEducationalText } from '@/utils/formatters';

interface DashboardLayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
  filters: {
    schoolName: string;
    lga: string;
    class: string;
    gender: string;
    subject: string;
  };
  onFilterChange: (filterType: string, value: string) => void;
  filteredStudents: TopStudent[];
  dashboardData?: AdminDashboardData | null;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  activeTab,
  onTabChange,
  filters,
  onFilterChange,
  filteredStudents,
  dashboardData
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex">
      {/* Sidebar */}
      <Sidebar 
        isOpen={sidebarOpen} 
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        activeTab={activeTab}
        onTabChange={onTabChange}
      />
      
      {/* Main Content */}
      <div className="flex-1 lg:ml-0">
        {/* Header */}
        <header className="bg-black/20 backdrop-blur-lg border-b border-white/10">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden text-white hover:text-gray-300 p-2"
                >
                  ☰
                </button>
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-lg">A</span>
                  </div>
                  <div>
                    <h1 className="text-white text-xl font-bold">ASUBEB</h1>
                    <p className="text-gray-300 text-sm">School Management System</p>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-white text-sm">Total Students</p>
                <p className="text-2xl font-bold text-blue-400">{filteredStudents.length}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Filters Section */}
        <div className="bg-black/10 backdrop-blur-sm border-b border-white/10">
          <div className="px-4 sm:px-6 lg:px-8 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
              {/* LGA Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">LGA</label>
                <select
                  value={filters.lga}
                  onChange={(e) => onFilterChange('lga', e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All LGAs</option>
                  {dashboardData?.lgas.map((lga) => (
                    <option key={lga.id} value={lga.name}>
                      {lga.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* School Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">School</label>
                <select
                  value={filters.schoolName}
                  onChange={(e) => onFilterChange('schoolName', e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Schools</option>
                  {dashboardData?.schools.map((school) => (
                    <option key={school.id} value={school.name}>
                      {formatEducationalText(school.name)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Class Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Class</label>
                <select
                  value={filters.class}
                  onChange={(e) => onFilterChange('class', e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Classes</option>
                  {dashboardData?.classes.map((classItem) => (
                    <option key={classItem.id} value={classItem.name}>
                      {formatEducationalText(classItem.name)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Gender Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Gender</label>
                <select
                  value={filters.gender}
                  onChange={(e) => onFilterChange('gender', e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Genders</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>

              {/* Subject Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Subject</label>
                <select
                  value={filters.subject}
                  onChange={(e) => onFilterChange('subject', e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Subjects</option>
                  {dashboardData?.subjects.map((subject) => (
                    <option key={subject.id} value={subject.name.toLowerCase().replace(/\s+/g, '')}>
                      {formatEducationalText(subject.name)}
                    </option>
                  )) || (
                    <>
                      <option value="english">English Language</option>
                      <option value="maths">Mathematics</option>
                      <option value="basicScience">Basic Science</option>
                      <option value="socialStudies">Social Studies</option>
                      <option value="culturalCreativeArts">Cultural & Creative Arts</option>
                      <option value="crs">Christian Religious Studies</option>
                      <option value="civic">Civic Education</option>
                      <option value="igbo">Igbo Language</option>
                      <option value="computerStudies">Computer Studies</option>
                      <option value="agriculturalScience">Agricultural Science</option>
                      <option value="homeEconomics">Home Economics</option>
                      <option value="physicalHealthEducation">Physical & Health Education</option>
                    </>
                  )}
                </select>
              </div>

              {/* Clear Filters */}
              <div className="flex items-end">
                <button
                  onClick={() => {
                    onFilterChange('schoolName', '');
                    onFilterChange('lga', '');
                    onFilterChange('class', '');
                    onFilterChange('gender', '');
                    onFilterChange('subject', '');
                  }}
                  className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <main className="px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout; 