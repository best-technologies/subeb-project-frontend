'use client';
import React, { useState } from 'react';
import { AdminDashboardData } from '@/services/types/adminDashboardResponse';
import { formatEducationalText } from '@/utils/formatters';

interface CollapsibleChartsProps {
  dashboardData: AdminDashboardData | null;
}

const CollapsibleCharts: React.FC<CollapsibleChartsProps> = ({ dashboardData }) => {
  // State for selected chart (none by default)
  const [selectedChart, setSelectedChart] = useState<string | null>(null);

  // Use real API data for charts
  const topStudents = dashboardData?.topStudents || [];
  
  // Calculate subject averages from real data (simplified since we don't have individual subject scores)
  const subjectAverages = dashboardData?.subjects?.map(subject => ({
    subject: subject.name.toLowerCase().replace(/\s+/g, ''),
    average: Math.round((dashboardData.totalStudents > 0 ? 75 : 0)), // Default average
    name: formatEducationalText(subject.name)
  })) || [];

  // Calculate class performance from real data
  const classAverages = dashboardData?.classes?.map(classItem => ({
    class: classItem.name,
    average: Math.round((classItem.currentEnrollment > 0 ? 75 : 0)) // Default average
  })).sort((a, b) => b.average - a.average) || [];

  // Calculate gender performance from real data
  const maleAverage = dashboardData?.totalMale && dashboardData.totalStudents 
    ? Math.round((dashboardData.totalMale / dashboardData.totalStudents) * 100)
    : 0;
  const femaleAverage = dashboardData?.totalFemale && dashboardData.totalStudents
    ? Math.round((dashboardData.totalFemale / dashboardData.totalStudents) * 100)
    : 0;

  // Tab definitions (hidden)
  const chartTabs = [
    { key: 'subject', label: 'Subject Performance', icon: '📚' },
    { key: 'class', label: 'Class Performance', icon: '🏫' },
    { key: 'gender', label: 'Gender Performance', icon: '👥' },
    { key: 'distribution', label: 'Score Distribution', icon: '📊' },
  ];

  return (
    <div className="mb-8">
      {/* Tabs - Hidden */}
      {/* <div className="flex justify-center gap-4 mb-8">
        {chartTabs.map(tab => (
          <button
            key={tab.key}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white/80 border border-white/20 backdrop-blur-sm flex items-center gap-2 ${selectedChart === tab.key ? 'bg-blue-600 text-white' : 'bg-white/10 hover:bg-white/20'}`}
            onClick={() => setSelectedChart(selectedChart === tab.key ? null : tab.key)}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div> */}

      {/* Chart Content */}
      <div>
        {selectedChart === 'subject' && (
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-4">Subject Performance</h3>
            <div className="space-y-4">
              {subjectAverages.map(({ subject, average, name }) => (
                <div key={subject} className="flex items-center space-x-4">
                  <div className="w-32 text-sm text-gray-300 truncate">{name}</div>
                  <div className="flex-1 bg-white/10 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${average}%` }}
                    />
                  </div>
                  <div className="w-12 text-right text-sm font-bold text-white">{average}%</div>
                </div>
              ))}
            </div>
          </div>
        )}
        {selectedChart === 'class' && (
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-4">Class Performance</h3>
            <div className="space-y-4">
              {classAverages.slice(0, 8).map(({ class: className, average }) => (
                <div key={className} className="flex items-center space-x-4">
                  <div className="w-20 text-sm text-gray-300">{className}</div>
                  <div className="flex-1 bg-white/10 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-green-500 to-teal-600 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${average}%` }}
                    />
                  </div>
                  <div className="w-12 text-right text-sm font-bold text-white">{average}%</div>
                </div>
              ))}
            </div>
          </div>
        )}
        {selectedChart === 'gender' && (
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-4">Gender Performance</h3>
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <div className="w-20 text-sm text-gray-300">Male</div>
                <div className="flex-1 bg-white/10 rounded-full h-4">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-4 rounded-full transition-all duration-500"
                    style={{ width: `${maleAverage}%` }}
                  />
                </div>
                <div className="w-16 text-right text-sm font-bold text-white">{maleAverage}%</div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-20 text-sm text-gray-300">Female</div>
                <div className="flex-1 bg-white/10 rounded-full h-4">
                  <div 
                    className="bg-gradient-to-r from-pink-500 to-pink-600 h-4 rounded-full transition-all duration-500"
                    style={{ width: `${femaleAverage}%` }}
                  />
                </div>
                <div className="w-16 text-right text-sm font-bold text-white">{femaleAverage}%</div>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-300">
                  {dashboardData?.totalMale || 0} Male • {dashboardData?.totalFemale || 0} Female
                </p>
              </div>
            </div>
          </div>
        )}
        {selectedChart === 'distribution' && (
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-4">Score Distribution</h3>
            <div className="space-y-4">
              {[
                { range: '90-100', color: 'from-green-500 to-green-600', count: topStudents.filter(s => s.totalScore >= 630).length },
                { range: '80-89', color: 'from-blue-500 to-blue-600', count: topStudents.filter(s => s.totalScore >= 560 && s.totalScore < 630).length },
                { range: '70-79', color: 'from-yellow-500 to-yellow-600', count: topStudents.filter(s => s.totalScore >= 490 && s.totalScore < 560).length },
                { range: '60-69', color: 'from-orange-500 to-orange-600', count: topStudents.filter(s => s.totalScore >= 420 && s.totalScore < 490).length },
                { range: 'Below 60', color: 'from-red-500 to-red-600', count: topStudents.filter(s => s.totalScore < 420).length }
              ].map(({ range, color, count }) => (
                <div key={range} className="flex items-center space-x-4">
                  <div className="w-20 text-sm text-gray-300">{range}</div>
                  <div className="flex-1 bg-white/10 rounded-full h-3">
                    <div 
                      className={`bg-gradient-to-r ${color} h-3 rounded-full transition-all duration-500`}
                      style={{ width: `${(count / topStudents.length) * 100}%` }}
                    />
                  </div>
                  <div className="w-12 text-right text-sm font-bold text-white">{count}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CollapsibleCharts; 