'use client';
import React from 'react';
import { PerformanceStudent } from '@/services/types/studentsDashboardResponse';
import { formatEducationalText } from '@/utils/formatters';

interface StudentDetailsModalProps {
  student: PerformanceStudent | null;
  isOpen: boolean;
  onClose: () => void;
  getScoreColor: (score: number) => string;
  getPositionBadge: (position: number) => string;
}

const StudentDetailsModal: React.FC<StudentDetailsModalProps> = ({
  student,
  isOpen,
  onClose,
  getScoreColor,
  getPositionBadge
}) => {
  if (!isOpen || !student) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-800/95 backdrop-blur-xl rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto border border-white/10 shadow-2xl">
        <div className="sticky top-0 bg-slate-800/95 backdrop-blur-xl p-6 border-b border-white/10 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg ${
                student.gender === 'MALE' ? 'bg-blue-500/20 text-blue-300' : 'bg-pink-500/20 text-pink-300'
              }`}>
                {student.gender === 'MALE' ? '👨' : '👩'}
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">{formatEducationalText(student.studentName)}</h3>
                <p className="text-gray-400">{student.examNo}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white p-2 hover:bg-white/10 rounded-lg transition-all duration-200"
            >
              <span className="text-xl">✕</span>
            </button>
          </div>
        </div>
        
        <div className="p-8 space-y-8">
          {/* Performance Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 rounded-xl p-6 border border-blue-500/20">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <span className="text-xl">📊</span>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${getPositionBadge(student.position)}`}>
                  Position {student.position}
                </span>
              </div>
              <div className={`text-3xl font-bold ${getScoreColor(student.total)}`}>
                {student.total}
              </div>
              <div className="text-sm text-gray-400">Total Score</div>
            </div>
            
            <div className="bg-gradient-to-br from-green-500/10 to-green-600/10 rounded-xl p-6 border border-green-500/20">
              <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center mb-4">
                <span className="text-xl">📈</span>
              </div>
              <div className={`text-3xl font-bold ${getScoreColor(student.average)}`}>
                {student.average}%
              </div>
              <div className="text-sm text-gray-400">Average Score</div>
            </div>
            
            <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 rounded-xl p-6 border border-purple-500/20">
              <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center mb-4">
                <span className="text-xl">🏆</span>
              </div>
              <div className="text-3xl font-bold text-purple-400">
                {student.position}
              </div>
              <div className="text-sm text-gray-400">Class Position</div>
            </div>
          </div>

          {/* Basic Info and School Info */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-black/20 rounded-xl p-6 border border-white/10">
              <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
                <span className="mr-2">👤</span>
                Basic Information
              </h4>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-white/5">
                  <span className="text-gray-400">Student Name</span>
                  <span className="text-white font-medium">{formatEducationalText(student.studentName)}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-white/5">
                  <span className="text-gray-400">Exam Number</span>
                  <span className="text-white font-mono">{student.examNo}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-white/5">
                  <span className="text-gray-400">Gender</span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    student.gender === 'MALE' ? 'bg-blue-500/20 text-blue-300' : 'bg-pink-500/20 text-pink-300'
                  }`}>
                    {student.gender === 'MALE' ? 'Male' : 'Female'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-400">Class</span>
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    {formatEducationalText(student.class)}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="bg-black/20 rounded-xl p-6 border border-white/10">
              <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
                <span className="mr-2">🏫</span>
                School Information
              </h4>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-white/5">
                  <span className="text-gray-400">School Name</span>
                  <span className="text-white font-medium text-right">{formatEducationalText(student.school)}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-white/5">
                  <span className="text-gray-400">Class</span>
                  <span className="text-white font-medium">{formatEducationalText(student.class)}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-400">Position in Class</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getPositionBadge(student.position)}`}>
                    {student.position}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Performance Summary */}
          <div className="bg-black/20 rounded-xl p-6 border border-white/10">
            <h4 className="text-lg font-semibold text-white mb-6 flex items-center">
              <span className="mr-2">📊</span>
              Performance Summary
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 rounded-lg p-4 border border-blue-500/20">
                <div className="text-sm text-gray-400 mb-2">Total Score</div>
                <div className="text-2xl font-bold text-blue-400">{student.total}</div>
              </div>
              <div className="bg-gradient-to-br from-green-500/10 to-green-600/10 rounded-lg p-4 border border-green-500/20">
                <div className="text-sm text-gray-400 mb-2">Average Score</div>
                <div className="text-2xl font-bold text-green-400">{student.average}%</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDetailsModal;
