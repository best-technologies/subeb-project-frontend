import React from 'react';
import { Student, subjectNames } from '@/data/mockData';

interface PerformanceChartsProps {
  students: Student[];
}

const PerformanceCharts: React.FC<PerformanceChartsProps> = ({ students }) => {
  // Calculate subject averages
  const subjectAverages = Object.keys(subjectNames).map(subject => {
    const scores = students.map(s => s.subjects[subject as keyof typeof s.subjects]);
    const average = scores.length > 0 ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length) : 0;
    return { subject, average, name: subjectNames[subject as keyof typeof subjectNames] };
  });

  // Calculate class performance
  const classPerformance = students.reduce((acc, student) => {
    if (!acc[student.class]) {
      acc[student.class] = { total: 0, count: 0 };
    }
    acc[student.class].total += student.averageScore;
    acc[student.class].count += 1;
    return acc;
  }, {} as Record<string, { total: number; count: number }>);

  const classAverages = Object.entries(classPerformance).map(([className, data]) => ({
    class: className,
    average: Math.round(data.total / data.count)
  })).sort((a, b) => b.average - a.average);

  // Calculate gender performance
  const maleStudents = students.filter(s => s.gender === 'Male');
  const femaleStudents = students.filter(s => s.gender === 'Female');
  const maleAverage = maleStudents.length > 0 
    ? Math.round(maleStudents.reduce((sum, s) => sum + s.averageScore, 0) / maleStudents.length)
    : 0;
  const femaleAverage = femaleStudents.length > 0
    ? Math.round(femaleStudents.reduce((sum, s) => sum + s.averageScore, 0) / femaleStudents.length)
    : 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
      {/* Subject Performance Chart */}
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

      {/* Class Performance Chart */}
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

      {/* Gender Performance Comparison */}
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
        </div>
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-300">
            {maleStudents.length} Male • {femaleStudents.length} Female
          </p>
        </div>
      </div>

      {/* Score Distribution */}
      <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6">
        <h3 className="text-lg font-bold text-white mb-4">Score Distribution</h3>
        <div className="space-y-4">
          {[
            { range: '90-100', color: 'from-green-500 to-green-600', count: students.filter(s => s.averageScore >= 90).length },
            { range: '80-89', color: 'from-blue-500 to-blue-600', count: students.filter(s => s.averageScore >= 80 && s.averageScore < 90).length },
            { range: '70-79', color: 'from-yellow-500 to-yellow-600', count: students.filter(s => s.averageScore >= 70 && s.averageScore < 80).length },
            { range: '60-69', color: 'from-orange-500 to-orange-600', count: students.filter(s => s.averageScore >= 60 && s.averageScore < 70).length },
            { range: 'Below 60', color: 'from-red-500 to-red-600', count: students.filter(s => s.averageScore < 60).length }
          ].map(({ range, color, count }) => (
            <div key={range} className="flex items-center space-x-4">
              <div className="w-20 text-sm text-gray-300">{range}</div>
              <div className="flex-1 bg-white/10 rounded-full h-3">
                <div 
                  className={`bg-gradient-to-r ${color} h-3 rounded-full transition-all duration-500`}
                  style={{ width: `${(count / students.length) * 100}%` }}
                />
              </div>
              <div className="w-12 text-right text-sm font-bold text-white">{count}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PerformanceCharts; 