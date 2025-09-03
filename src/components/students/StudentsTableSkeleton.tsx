import React from "react";

const ROWS = 10;
const COLS = 7; // Adjust to match your table columns

const StudentsTableSkeleton: React.FC = () => {
  return (
    <div className="overflow-x-auto rounded-xl border border-white/20 bg-white/10 mb-8 animate-pulse">
      <table className="min-w-full divide-y divide-gray-200">
        <thead>
          <tr>
            {Array.from({ length: COLS }).map((_, idx) => (
              <th key={idx} className="px-6 py-3">
                <div className="h-4 w-24 bg-gray-400/30 rounded shimmer" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: ROWS }).map((_, rowIdx) => (
            <tr key={rowIdx}>
              {Array.from({ length: COLS }).map((_, colIdx) => (
                <td key={colIdx} className="px-6 py-4">
                  <div className="h-4 w-full bg-gray-400/20 rounded shimmer" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StudentsTableSkeleton;
