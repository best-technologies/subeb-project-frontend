import React from "react";

const ROWS = 10;
// const COLS = 8; // Match actual table columns: Position, Student, Exam No, School, Class, Total, Average, Actions

const StudentsTableSkeleton: React.FC = () => {
  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-xs animate-pulse">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50/80 border-b border-gray-200">
            <tr>
              {/* Position Column */}
              <th className="px-6 py-4">
                <div className="h-3.5 w-16 bg-gray-300/70 rounded" />
              </th>
              {/* Student Column */}
              <th className="px-6 py-4">
                <div className="h-3.5 w-20 bg-gray-300/70 rounded" />
              </th>
              {/* Exam No Column */}
              <th className="px-6 py-4">
                <div className="h-3.5 w-16 bg-gray-300/70 rounded" />
              </th>
              {/* School Column */}
              <th className="px-6 py-4">
                <div className="h-3.5 w-20 bg-gray-300/70 rounded" />
              </th>
              {/* Class Column */}
              <th className="px-6 py-4">
                <div className="h-3.5 w-14 bg-gray-300/70 rounded" />
              </th>
              {/* Total Column */}
              <th className="px-6 py-4">
                <div className="h-3.5 w-12 bg-gray-300/70 rounded" />
              </th>
              {/* Average Column */}
              <th className="px-6 py-4">
                <div className="h-3.5 w-16 bg-gray-300/70 rounded" />
              </th>
              {/* Actions Column */}
              <th className="px-6 py-4">
                <div className="h-3.5 w-16 bg-gray-300/70 rounded" />
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {Array.from({ length: ROWS }).map((_, rowIdx) => (
              <tr key={rowIdx} className="hover:bg-transparent">
                {/* Position Cell */}
                <td className="px-6 py-4">
                  <div className="w-8 h-6 bg-gray-200/80 rounded-md" />
                </td>
                {/* Student Cell */}
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 bg-gray-200/80 rounded-full" />
                    <div>
                      <div className="h-4 w-32 bg-gray-300/70 rounded mb-1" />
                      <div className="h-3 w-16 bg-gray-200/60 rounded" />
                    </div>
                  </div>
                </td>
                {/* Exam No Cell */}
                <td className="px-6 py-4">
                  <div className="h-5 w-20 bg-gray-200/70 rounded" />
                </td>
                {/* School Cell */}
                <td className="px-6 py-4">
                  <div>
                    <div className="h-4 w-28 bg-gray-300/70 rounded mb-1" />
                    <div className="h-3 w-16 bg-gray-200/60 rounded" />
                  </div>
                </td>
                {/* Class Cell */}
                <td className="px-6 py-4">
                  <div className="h-5 w-16 bg-gray-200/70 rounded-full" />
                </td>
                {/* Total Cell */}
                <td className="px-6 py-4">
                  <div className="h-5 w-12 bg-gray-200/70 rounded" />
                </td>
                {/* Average Cell */}
                <td className="px-6 py-4">
                  <div className="h-5 w-14 bg-gray-200/70 rounded" />
                </td>
                {/* Actions Cell */}
                <td className="px-6 py-4">
                  <div className="h-5 w-16 bg-gray-200/70 rounded" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StudentsTableSkeleton;
