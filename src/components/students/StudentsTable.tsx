'use client';
import React from 'react';
import { PerformanceStudent } from '@/services/types/studentsDashboardResponse';
import StudentRow from './StudentRow';

interface StudentsTableProps {
  students: PerformanceStudent[];
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  onSort: (field: string) => void;
  getScoreColor: (score: number) => string;
  getScoreBgColor: (score: number) => string;
  getPositionBadge: (position: number) => string;
  onViewDetails: (student: PerformanceStudent) => void;
}

const StudentsTable: React.FC<StudentsTableProps> = ({
  students,
  sortBy,
  sortOrder,
  onSort,
  getScoreColor,
  getScoreBgColor,
  getPositionBadge,
  onViewDetails
}) => {
  return (
    <div className="bg-black/20 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden shadow-2xl">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gradient-to-r from-black/40 to-black/20">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider cursor-pointer hover:text-white transition-colors duration-200" onClick={() => onSort('position')}>
                <div className="flex items-center gap-2">
                  <span>🏆 Position</span>
                  {sortBy === 'position' && (
                    <span className="text-blue-400">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                  )}
                </div>
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider cursor-pointer hover:text-white transition-colors duration-200" onClick={() => onSort('studentName')}>
                <div className="flex items-center gap-2">
                  <span>👤 Student</span>
                  {sortBy === 'studentName' && (
                    <span className="text-blue-400">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                  )}
                </div>
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider cursor-pointer hover:text-white transition-colors duration-200" onClick={() => onSort('examNo')}>
                <div className="flex items-center gap-2">
                  <span>🆔 Exam No.</span>
                  {sortBy === 'examNo' && (
                    <span className="text-blue-400">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                  )}
                </div>
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider cursor-pointer hover:text-white transition-colors duration-200" onClick={() => onSort('school')}>
                <div className="flex items-center gap-2">
                  <span>🏫 School</span>
                  {sortBy === 'school' && (
                    <span className="text-blue-400">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                  )}
                </div>
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider cursor-pointer hover:text-white transition-colors duration-200" onClick={() => onSort('class')}>
                <div className="flex items-center gap-2">
                  <span>📚 Class</span>
                  {sortBy === 'class' && (
                    <span className="text-blue-400">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                  )}
                </div>
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider cursor-pointer hover:text-white transition-colors duration-200" onClick={() => onSort('total')}>
                <div className="flex items-center gap-2">
                  <span>📊 Total</span>
                  {sortBy === 'total' && (
                    <span className="text-blue-400">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                  )}
                </div>
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider cursor-pointer hover:text-white transition-colors duration-200" onClick={() => onSort('average')}>
                <div className="flex items-center gap-2">
                  <span>📈 Average</span>
                  {sortBy === 'average' && (
                    <span className="text-blue-400">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                  )}
                </div>
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {students && students.length > 0 ? (
              students.map((student) => (
                <StudentRow
                  key={`${student.examNo}-${student.position}`}
                  student={student}
                  getScoreColor={getScoreColor}
                  getScoreBgColor={getScoreBgColor}
                  getPositionBadge={getPositionBadge}
                  onViewDetails={onViewDetails}
                />
              ))
            ) : (
              <tr>
                <td colSpan={8} className="px-6 py-8 text-center">
                  <div className="text-gray-400">
                    <div className="text-4xl mb-4">📊</div>
                    <p className="text-lg font-medium">No students found</p>
                    <p className="text-sm">Try adjusting your filters or search terms</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StudentsTable; 