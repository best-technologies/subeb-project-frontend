'use client';
import React from 'react';
import { PerformanceStudent } from '@/services/types/studentsDashboardResponse';
import { formatEducationalText } from '@/utils/formatters';

interface StudentRowProps {
  student: PerformanceStudent;
  getScoreColor: (score: number) => string;
  getScoreBgColor: (score: number) => string;
  getPositionBadge: (position: number) => string;
  onViewDetails: (student: PerformanceStudent) => void;
}

const StudentRow: React.FC<StudentRowProps> = ({
  student,
  getScoreColor,
  getScoreBgColor,
  getPositionBadge,
  onViewDetails
}) => {
  return (
    <tr key={`${student.examNo}-${student.position}`} className="hover:bg-white/5 transition-all duration-200 group">
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getPositionBadge(student.position)}`}>
          {student.position}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center space-x-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
            student.gender === 'MALE' ? 'bg-blue-500/20 text-blue-300' : 'bg-pink-500/20 text-pink-300'
          }`}>
            {student.gender === 'MALE' ? '👨' : '👩'}
          </div>
          <div>
            <div className="text-sm font-semibold text-white group-hover:text-blue-300 transition-colors duration-200">
              {formatEducationalText(student.studentName)}
            </div>
            <div className="text-sm text-gray-400">{student.gender === 'MALE' ? 'Male' : 'Female'}</div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm font-mono text-gray-300 bg-black/20 px-2 py-1 rounded">{student.examNo}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div>
          <div className="text-sm font-medium text-white">{formatEducationalText(student.school)}</div>
          <div className="text-sm text-gray-400">{formatEducationalText(student.class)}</div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-500/20 text-purple-300 border border-purple-500/30">
          {formatEducationalText(student.class)}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className={`inline-flex items-center px-3 py-1 rounded-lg text-sm font-semibold ${getScoreBgColor(student.total)}`}>
          <span className={`${getScoreColor(student.total)}`}>{student.total}</span>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className={`inline-flex items-center px-3 py-1 rounded-lg text-sm font-semibold ${getScoreBgColor(student.average)}`}>
          <span className={`${getScoreColor(student.average)}`}>{student.average}%</span>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
        <button
          onClick={() => onViewDetails(student)}
          className="text-blue-400 hover:text-blue-300 transition-colors duration-200 font-medium hover:underline"
        >
          View Details →
        </button>
      </td>
    </tr>
  );
};

export default StudentRow;
