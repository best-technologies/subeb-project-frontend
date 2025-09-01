'use client';
import React from 'react';

interface StudentsHeaderProps {
  totalStudents: number;
  averageScore: number;
  getScoreColor: (score: number) => string;
}

const StudentsHeader: React.FC<StudentsHeaderProps> = ({ 
  totalStudents, 
  averageScore, 
  getScoreColor 
}) => {
  return (
    <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-sm rounded-xl p-8 border border-white/10">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Students Management</h1>
          <p className="text-gray-300 text-lg">Comprehensive student records and performance analytics</p>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400">{totalStudents}</div>
            <div className="text-sm text-gray-400">Total Students</div>
          </div>
          <div className="text-center">
            <div className={`text-2xl font-bold ${getScoreColor(averageScore)}`}>{averageScore}%</div>
            <div className="text-sm text-gray-400">Average Score</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentsHeader;
