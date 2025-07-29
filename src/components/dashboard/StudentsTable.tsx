import React, { useState } from 'react';
import { TopStudent } from '@/services/types/adminDashboardResponse';
import { formatEducationalText } from '@/utils/formatters';

interface StudentsTableProps {
  topStudents: TopStudent[];
}

const StudentsTable: React.FC<StudentsTableProps> = ({ topStudents }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<keyof TopStudent>('position');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const itemsPerPage = 10;

  const sortedStudents = [...topStudents].sort((a, b) => {
    let aValue = a[sortField];
    let bValue = b[sortField];
    
    if (sortField === 'totalScore') {
      aValue = a.totalScore;
      bValue = b.totalScore;
    }
    
    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const totalPages = Math.ceil(sortedStudents.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentStudents = sortedStudents.slice(startIndex, endIndex);

  const toggleRowExpansion = (studentId: string) => {
    const newExpandedRows = new Set(expandedRows);
    if (newExpandedRows.has(studentId)) {
      newExpandedRows.delete(studentId);
    } else {
      newExpandedRows.add(studentId);
    }
    setExpandedRows(newExpandedRows);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 70) return 'text-yellow-400';
    if (score >= 60) return 'text-orange-400';
    return 'text-red-400';
  };

  return (
    <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl overflow-hidden">
      <div className="px-6 py-4 border-b border-white/10">
        <h2 className="text-xl font-bold text-white">Students Performance</h2>
        <p className="text-gray-300 text-sm">Showing {startIndex + 1}-{Math.min(endIndex, topStudents.length)} of {topStudents.length} students</p>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-white/5">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Position
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Student Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Exam Number
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                School
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Class
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Gender
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Total Score
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Average
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {currentStudents.map((student) => (
              <React.Fragment key={student.id}>
                <tr className="hover:bg-white/5 transition-colors duration-200">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {student.position}
                    </span>
                  </td>
                                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white font-medium">
                      {formatEducationalText(student.studentName)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {student.examNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {formatEducationalText(student.school || 'N/A')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {formatEducationalText(student.class || 'N/A')}
                    </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      student.gender === 'MALE' 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-pink-100 text-pink-800'
                    }`}>
                      {student.gender === 'MALE' ? 'Male' : 'Female'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-white">
                    {student.totalScore}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`font-bold ${getScoreColor(Math.round(student.totalScore / 7))}`}>
                      {Math.round(student.totalScore / 7)}%
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    <button
                      onClick={() => toggleRowExpansion(student.id)}
                      className="text-blue-400 hover:text-blue-300 transition-colors duration-200"
                    >
                      {expandedRows.has(student.id) ? 'Hide Details' : 'Show Details'}
                    </button>
                  </td>
                </tr>
                {expandedRows.has(student.id) && (
                  <tr>
                    <td colSpan={9} className="px-6 py-4 bg-white/5">
                      <div className="text-center">
                        <p className="text-sm text-gray-400 mb-2">Student Details</p>
                        <p className="text-white">Total Score: {student.totalScore}</p>
                        <p className="text-white">Average Score: {Math.round(student.totalScore / 7)}%</p>
                        <p className="text-white">Position: {student.position}</p>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-6 py-4 border-t border-white/10 flex items-center justify-between">
          <div className="text-sm text-gray-300">
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 text-sm bg-white/10 border border-white/20 rounded text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/20 transition-colors duration-200"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 text-sm bg-white/10 border border-white/20 rounded text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/20 transition-colors duration-200"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentsTable; 