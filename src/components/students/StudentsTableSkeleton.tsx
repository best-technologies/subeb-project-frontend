import React from "react";

const ROWS = 10;
// const COLS = 8; // Match actual table columns: Position, Student, Exam No, School, Class, Total, Average, Actions

const StudentsTableSkeleton: React.FC = () => {
  return (
    <div className="bg-brand-accent-background border border-brand-accent/20 rounded-xl overflow-hidden shadow-lg animate-pulse">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-brand-primary-2">
            <tr>
              {/* Position Column */}
              <th className="px-6 py-4">
                <div className="h-4 w-20 bg-brand-primary-2-contrast/30 rounded shimmer" />
              </th>
              {/* Student Column */}
              <th className="px-6 py-4">
                <div className="h-4 w-16 bg-brand-primary-2-contrast/30 rounded shimmer" />
              </th>
              {/* Exam No Column */}
              <th className="px-6 py-4">
                <div className="h-4 w-20 bg-brand-primary-2-contrast/30 rounded shimmer" />
              </th>
              {/* School Column */}
              <th className="px-6 py-4">
                <div className="h-4 w-16 bg-brand-primary-2-contrast/30 rounded shimmer" />
              </th>
              {/* Class Column */}
              <th className="px-6 py-4">
                <div className="h-4 w-12 bg-brand-primary-2-contrast/30 rounded shimmer" />
              </th>
              {/* Total Column */}
              <th className="px-6 py-4">
                <div className="h-4 w-12 bg-brand-primary-2-contrast/30 rounded shimmer" />
              </th>
              {/* Average Column */}
              <th className="px-6 py-4">
                <div className="h-4 w-16 bg-brand-primary-2-contrast/30 rounded shimmer" />
              </th>
              {/* Actions Column */}
              <th className="px-6 py-4">
                <div className="h-4 w-16 bg-brand-primary-2-contrast/30 rounded shimmer" />
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-accent/10">
            {Array.from({ length: ROWS }).map((_, rowIdx) => (
              <tr key={rowIdx} className="hover:bg-brand-accent/5">
                {/* Position Cell */}
                <td className="px-6 py-4">
                  <div className="w-8 h-6 bg-brand-accent/30 rounded-full shimmer" />
                </td>
                {/* Student Cell */}
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-brand-accent/30 rounded-full shimmer" />
                    <div>
                      <div className="h-4 w-32 bg-brand-accent/20 rounded mb-1 shimmer" />
                      <div className="h-3 w-16 bg-brand-accent/15 rounded shimmer" />
                    </div>
                  </div>
                </td>
                {/* Exam No Cell */}
                <td className="px-6 py-4">
                  <div className="h-6 w-20 bg-brand-accent/20 rounded shimmer" />
                </td>
                {/* School Cell */}
                <td className="px-6 py-4">
                  <div>
                    <div className="h-4 w-28 bg-brand-accent/20 rounded mb-1 shimmer" />
                    <div className="h-3 w-16 bg-brand-accent/15 rounded shimmer" />
                  </div>
                </td>
                {/* Class Cell */}
                <td className="px-6 py-4">
                  <div className="h-6 w-16 bg-brand-accent/25 rounded-full shimmer" />
                </td>
                {/* Total Cell */}
                <td className="px-6 py-4">
                  <div className="h-6 w-12 bg-brand-accent/25 rounded shimmer" />
                </td>
                {/* Average Cell */}
                <td className="px-6 py-4">
                  <div className="h-6 w-14 bg-brand-accent/25 rounded shimmer" />
                </td>
                {/* Actions Cell */}
                <td className="px-6 py-4">
                  <div className="h-4 w-20 bg-brand-primary/25 rounded shimmer" />
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
