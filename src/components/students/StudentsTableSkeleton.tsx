import React from "react";

const ROWS = 10;
const COLS = 5; // Match the actual table columns: Position, Name, School, Class, Score

const StudentsTableSkeleton: React.FC = () => {
  return (
    <div className="bg-brand-accent-background border border-brand-accent/20 rounded-xl overflow-hidden shadow-lg animate-pulse">
      {/* Table Header Skeleton */}
      <div className="px-6 py-4 border-b border-brand-accent/20 bg-brand-accent/10">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-6 w-32 bg-brand-accent/30 rounded mb-2 shimmer" />
            <div className="h-4 w-48 bg-brand-accent/20 rounded shimmer" />
          </div>
        </div>
      </div>

      {/* Table Content Skeleton */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-brand-accent">
            <tr>
              {Array.from({ length: COLS }).map((_, idx) => (
                <th key={idx} className="px-6 py-3">
                  <div className="h-4 w-24 bg-brand-accent-contrast/30 rounded shimmer" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-accent/10">
            {Array.from({ length: ROWS }).map((_, rowIdx) => (
              <tr key={rowIdx}>
                {Array.from({ length: COLS }).map((_, colIdx) => (
                  <td key={colIdx} className="px-6 py-4">
                    <div className="h-4 w-full bg-brand-accent/20 rounded shimmer" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StudentsTableSkeleton;
