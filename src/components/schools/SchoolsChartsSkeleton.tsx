import React from "react";

const SchoolsChartsSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs mb-6 overflow-hidden animate-pulse">
      {/* Header Bar */}
      <div className="px-6 py-4 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-emerald-50/40 via-white to-gray-50/40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100/80" />
          <div className="space-y-1.5">
            <div className="h-5 w-72 bg-gray-200 rounded" />
            <div className="h-3 w-96 bg-gray-100 rounded" />
          </div>
        </div>

        {/* Right side: Session & Term filters skeleton */}
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-36 bg-gray-100 rounded-lg border border-gray-200/60" />
          <div className="h-8 w-32 bg-gray-100 rounded-lg border border-gray-200/60" />
          <div className="h-8 w-8 bg-gray-100 rounded-lg" />
        </div>
      </div>

      {/* Main Body */}
      <div className="p-6">
        {/* 4 KPI Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Card 1: Total Schools */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border border-emerald-200/60 flex items-center justify-between">
            <div className="space-y-2">
              <div className="h-3 w-20 bg-gray-200 rounded" />
              <div className="h-7 w-16 bg-gray-300 rounded" />
              <div className="h-2.5 w-24 bg-emerald-100 rounded" />
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-100/80" />
          </div>

          {/* Card 2: Statewide School Average */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-200/60 flex items-center justify-between">
            <div className="space-y-2">
              <div className="h-3 w-28 bg-gray-200 rounded" />
              <div className="h-7 w-16 bg-gray-300 rounded" />
              <div className="h-2.5 w-20 bg-blue-100 rounded" />
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-100/80" />
          </div>

          {/* Card 3: Average School Size */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-teal-500/10 to-teal-500/5 border border-teal-200/60 flex items-center justify-between">
            <div className="space-y-2">
              <div className="h-3 w-24 bg-gray-200 rounded" />
              <div className="h-7 w-16 bg-gray-300 rounded" />
              <div className="h-2.5 w-20 bg-teal-100 rounded" />
            </div>
            <div className="w-10 h-10 rounded-xl bg-teal-100/80" />
          </div>

          {/* Card 4: Top Performing LGA */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-amber-500/10 to-amber-500/5 border border-amber-200/60 flex items-center justify-between">
            <div className="space-y-2">
              <div className="h-3 w-24 bg-gray-200 rounded" />
              <div className="h-6 w-28 bg-gray-300 rounded" />
              <div className="h-2.5 w-32 bg-amber-100 rounded" />
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-100/80" />
          </div>
        </div>

        {/* Row 1: 17 LGAs Performance Chart Skeleton */}
        <div className="mb-6 p-5 rounded-2xl border border-gray-100 bg-gray-50/60">
          <div className="flex items-center justify-between mb-4">
            <div className="space-y-1.5">
              <div className="h-4 w-48 bg-gray-200 rounded" />
              <div className="h-3 w-72 bg-gray-100 rounded" />
            </div>
            <div className="h-6 w-24 bg-gray-200 rounded-full" />
          </div>
          <div className="h-64 w-full bg-white/70 rounded-xl flex items-end gap-2 p-4">
            {Array.from({ length: 17 }).map((_, i) => (
              <div
                key={i}
                className="flex-1 bg-emerald-100/60 rounded-t"
                style={{ height: `${30 + ((i * 19) % 60)}%` }}
              />
            ))}
          </div>
        </div>

        {/* Row 2: Top Schools, Performance Bands, and Size Distribution */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Chart 1 */}
          <div className="p-5 rounded-2xl border border-gray-100 bg-gray-50/60 space-y-3">
            <div className="h-4 w-36 bg-gray-200 rounded" />
            <div className="h-3 w-48 bg-gray-100 rounded mb-4" />
            <div className="space-y-2.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-white/80">
                  <div className="h-3.5 w-32 bg-gray-200 rounded" />
                  <div className="h-3.5 w-12 bg-emerald-100 rounded" />
                </div>
              ))}
            </div>
          </div>

          {/* Chart 2 */}
          <div className="p-5 rounded-2xl border border-gray-100 bg-gray-50/60 space-y-3">
            <div className="h-4 w-40 bg-gray-200 rounded" />
            <div className="h-3 w-52 bg-gray-100 rounded mb-4" />
            <div className="h-44 w-full bg-white/80 rounded-xl flex items-center justify-center">
              <div className="w-28 h-28 rounded-full border-8 border-gray-200/70 border-t-emerald-200" />
            </div>
          </div>

          {/* Chart 3 */}
          <div className="p-5 rounded-2xl border border-gray-100 bg-gray-50/60 space-y-3">
            <div className="h-4 w-36 bg-gray-200 rounded" />
            <div className="h-3 w-44 bg-gray-100 rounded mb-4" />
            <div className="h-44 w-full bg-white/80 rounded-xl flex items-end justify-around p-4 gap-3">
              <div className="w-12 bg-blue-100/70 rounded-t h-3/5" />
              <div className="w-12 bg-emerald-100/70 rounded-t h-4/5" />
              <div className="w-12 bg-amber-100/70 rounded-t h-2/5" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SchoolsChartsSkeleton;
