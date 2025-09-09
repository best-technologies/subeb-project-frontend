import React from "react";

const ROWS = 8;
const COLS = 6; // School, LGA, Students, Average, Top Score, Actions

const SchoolsTableSkeleton: React.FC = () => {
  return (
    <div className="bg-brand-accent-background border border-brand-accent/20 rounded-xl overflow-hidden shadow-lg animate-pulse">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-brand-primary-2">
            <tr>
              {/* School Column */}
              <th className="px-6 py-4">
                <div className="h-4 w-16 bg-brand-primary-2-contrast/30 rounded shimmer" />
              </th>
              {/* LGA Column */}
              <th className="px-6 py-4">
                <div className="h-4 w-12 bg-brand-primary-2-contrast/30 rounded shimmer" />
              </th>
              {/* Students Column */}
              <th className="px-6 py-4">
                <div className="h-4 w-16 bg-brand-primary-2-contrast/30 rounded shimmer" />
              </th>
              {/* Average Column */}
              <th className="px-6 py-4">
                <div className="h-4 w-16 bg-brand-primary-2-contrast/30 rounded shimmer" />
              </th>
              {/* Top Score Column */}
              <th className="px-6 py-4">
                <div className="h-4 w-20 bg-brand-primary-2-contrast/30 rounded shimmer" />
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
                {/* School Cell */}
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-brand-primary/30 rounded-full shimmer" />
                    <div>
                      <div className="h-4 w-32 bg-brand-accent/20 rounded mb-1 shimmer" />
                      <div className="h-3 w-20 bg-brand-accent/15 rounded shimmer" />
                    </div>
                  </div>
                </td>
                {/* LGA Cell */}
                <td className="px-6 py-4">
                  <div className="h-6 w-20 bg-brand-accent/25 rounded-full shimmer" />
                </td>
                {/* Students Cell */}
                <td className="px-6 py-4">
                  <div className="h-5 w-12 bg-brand-primary/25 rounded shimmer" />
                </td>
                {/* Average Cell */}
                <td className="px-6 py-4">
                  <div className="h-6 w-16 bg-brand-accent/25 rounded-lg shimmer" />
                </td>
                {/* Top Score Cell */}
                <td className="px-6 py-4">
                  <div>
                    <div className="h-4 w-12 bg-brand-accent/20 rounded mb-1 shimmer" />
                    <div className="h-3 w-16 bg-brand-accent/15 rounded shimmer" />
                  </div>
                </td>
                {/* Actions Cell */}
                <td className="px-6 py-4">
                  <div className="h-4 w-16 bg-brand-primary/25 rounded shimmer" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SchoolsTableSkeleton;
