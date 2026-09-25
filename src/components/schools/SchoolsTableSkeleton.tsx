import React from "react";

const ROWS = 8;

const SchoolsTableSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden animate-pulse">
      {/* Table Header Card */}
      <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100/80" />
          <div className="space-y-1.5">
            <div className="h-5 w-40 bg-gray-200 rounded" />
            <div className="h-3 w-64 bg-gray-100 rounded" />
          </div>
        </div>
        <div className="h-7 w-28 bg-gray-100 rounded-full border border-gray-200/60" />
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50/80 border-b border-gray-100">
            <tr>
              <th className="w-12 px-6 py-4 text-center">
                <div className="h-3.5 w-6 bg-gray-200 rounded mx-auto" />
              </th>
              <th className="px-6 py-4 text-left min-w-[200px]">
                <div className="h-3.5 w-36 bg-gray-200 rounded" />
              </th>
              <th className="px-6 py-4 text-left">
                <div className="h-3.5 w-16 bg-gray-200 rounded" />
              </th>
              <th className="px-6 py-4 text-center">
                <div className="h-3.5 w-12 bg-gray-200 rounded mx-auto" />
              </th>
              <th className="px-6 py-4 text-center">
                <div className="h-3.5 w-16 bg-gray-200 rounded mx-auto" />
              </th>
              <th className="px-6 py-4 text-center">
                <div className="h-3.5 w-16 bg-gray-200 rounded mx-auto" />
              </th>
              <th className="px-6 py-4 text-center">
                <div className="h-3.5 w-20 bg-gray-200 rounded mx-auto" />
              </th>
              <th className="px-6 py-4 text-center w-24">
                <div className="h-3.5 w-14 bg-gray-200 rounded mx-auto" />
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100/70">
            {Array.from({ length: ROWS }).map((_, index) => (
              <tr key={index}>
                {/* S/N */}
                <td className="px-6 py-4 text-center">
                  <div className="h-4 w-6 bg-gray-200/80 rounded mx-auto" />
                </td>
                {/* School Name & Code */}
                <td className="px-6 py-4">
                  <div className="space-y-1.5">
                    <div className="h-4 w-52 bg-gray-200/80 rounded" />
                    <div className="h-3 w-20 bg-gray-100 rounded" />
                  </div>
                </td>
                {/* LGA */}
                <td className="px-6 py-4">
                  <div className="h-4 w-28 bg-gray-200/80 rounded" />
                </td>
                {/* Level */}
                <td className="px-6 py-4 text-center">
                  <div className="h-5 w-16 bg-gray-200/80 rounded-full mx-auto" />
                </td>
                {/* Enrollment */}
                <td className="px-6 py-4 text-center">
                  <div className="h-4 w-12 bg-gray-200/80 rounded mx-auto" />
                </td>
                {/* Assessed */}
                <td className="px-6 py-4 text-center">
                  <div className="h-4 w-12 bg-gray-200/80 rounded mx-auto" />
                </td>
                {/* Average Score */}
                <td className="px-6 py-4 text-center">
                  <div className="h-4 w-14 bg-gray-200/80 rounded mx-auto" />
                </td>
                {/* Actions */}
                <td className="px-6 py-4 text-center">
                  <div className="h-7 w-16 bg-gray-200/80 rounded-lg mx-auto" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-4 border-t border-gray-100 flex items-center justify-between">
        <div className="h-4 w-48 bg-gray-200 rounded" />
        <div className="flex items-center gap-2">
          <div className="h-8 w-20 bg-gray-200 rounded-lg" />
          <div className="h-8 w-20 bg-gray-200 rounded-lg" />
        </div>
      </div>
    </div>
  );
};

export default SchoolsTableSkeleton;
