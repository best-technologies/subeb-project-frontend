import React, { useState } from 'react';
import { TopStudent } from '@/services/types/adminDashboardResponse';
import { formatEducationalText } from '@/utils/formatters';

interface StudentsTableProps {
  topStudents: TopStudent[];
}

const StudentsTable: React.FC<StudentsTableProps> = ({ topStudents }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField] = useState<keyof TopStudent>('position');
  const [sortDirection] = useState<'asc' | 'desc'>('asc');
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const itemsPerPage = 10;

  // Debug logging
  console.log('StudentsTable - Received students:', topStudents?.length || 0);
  console.log('StudentsTable - First student:', topStudents?.[0]);

  const sortedStudents = [...topStudents].sort((a, b) => {
    let aValue: string | number = a[sortField] || '';
    let bValue: string | number = b[sortField] || '';
    
    if (sortField === 'totalScore') {
      aValue = a.totalScore || 0;
      bValue = b.totalScore || 0;
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
    <div>
      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="px-6 py-4 border-b border-white/10 bg-white/5">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-300">
              Showing {startIndex + 1}-{Math.min(endIndex, topStudents.length)} of {topStudents.length} students
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage <= 1}
                className="px-3 py-1 bg-white/10 border border-white/20 rounded text-white hover:bg-white/20 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                Previous
              </button>
              <span className="text-sm text-gray-300">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage >= totalPages}
                className="px-3 py-1 bg-white/10 border border-white/20 rounded text-white hover:bg-white/20 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
      
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
                      {student.position || '-'}
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
                    {student.totalScore || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`font-bold ${getScoreColor(Math.round((student.totalScore || 0) / 7))}`}>
                      {student.totalScore ? Math.round(student.totalScore / 7) + '%' : '-'}
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
                        <p className="text-white">School Code: {student.schoolCode}</p>
                        <p className="text-white">Total Score: {student.totalScore || 'Not available'}</p>
                        <p className="text-white">Average Score: {student.totalScore ? Math.round(student.totalScore / 7) + '%' : 'Not available'}</p>
                        <p className="text-white">Position: {student.position || 'Not ranked'}</p>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
};

export default StudentsTable; 