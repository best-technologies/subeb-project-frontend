import React from 'react';
import { AdminDashboardData } from '@/services/types/adminDashboardResponse';

interface StatsCardsProps {
  dashboardData: AdminDashboardData | null;
}

const StatsCards: React.FC<StatsCardsProps> = ({ dashboardData }) => {
  // Use real API data
  const totalStudents = dashboardData?.totalStudents || 0;
  const maleStudents = dashboardData?.totalMale || 0;
  const femaleStudents = dashboardData?.totalFemale || 0;
  const averageScore = dashboardData?.topStudents && dashboardData.topStudents.length > 0
    ? Math.round(dashboardData.topStudents.reduce((sum, s) => sum + s.totalScore, 0) / dashboardData.topStudents.length / 7) // Assuming 7 subjects
    : 0;
  const topPerformers = dashboardData?.topStudents?.length || 0;

  const stats = [
    {
      title: 'Total Students',
      value: totalStudents,
      change: '+12%',
      changeType: 'positive',
      icon: '👥',
      color: 'from-blue-500 to-blue-600'
    },
    {
      title: 'Male Students',
      value: maleStudents,
      percentage: Math.round((maleStudents / totalStudents) * 100) || 0,
      icon: '👨',
      color: 'from-green-500 to-green-600'
    },
    {
      title: 'Female Students',
      value: femaleStudents,
      percentage: Math.round((femaleStudents / totalStudents) * 100) || 0,
      icon: '👩',
      color: 'from-pink-500 to-pink-600'
    },
    {
      title: 'Average Score',
      value: averageScore,
      unit: '%',
      icon: '📊',
      color: 'from-purple-500 to-purple-600'
    },
    {
      title: 'Top 10 Students',
      value: topPerformers,
      icon: '🏆',
      color: 'from-yellow-500 to-yellow-600'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
      {stats.map((stat, index) => (
        <div
          key={index}
          className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 hover:bg-white/15 transition-all duration-300 group"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-300 text-sm font-medium">{stat.title}</p>
              <div className="flex items-baseline space-x-2">
                <p className="text-2xl font-bold text-white">
                  {stat.value}
                  {stat.unit && <span className="text-lg">{stat.unit}</span>}
                </p>
                {stat.percentage && (
                  <span className="text-sm text-gray-400">({stat.percentage}%)</span>
                )}
              </div>
              {stat.change && (
                <p className={`text-sm ${stat.changeType === 'positive' ? 'text-green-400' : 'text-red-400'}`}>
                  {stat.change}
                </p>
              )}
            </div>
            <div className={`w-12 h-12 bg-gradient-to-r ${stat.color} rounded-lg flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-300`}>
              {stat.icon}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsCards; 