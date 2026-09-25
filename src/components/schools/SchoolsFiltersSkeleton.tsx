import React from "react";

const SchoolsFiltersSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-xs mb-6 animate-pulse">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-200 rounded" />
          <div className="h-4 w-44 bg-gray-200 rounded" />
          <div className="h-3 w-56 bg-gray-100 rounded hidden md:block" />
        </div>
      </div>

      {/* Grid of 4 Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Search */}
        <div>
          <div className="h-3 w-24 bg-gray-200 rounded mb-2" />
          <div className="h-10 w-full bg-gray-100 rounded-lg border border-gray-200/60" />
        </div>

        {/* Session */}
        <div>
          <div className="h-3 w-32 bg-gray-200 rounded mb-2" />
          <div className="h-10 w-full bg-gray-100 rounded-lg border border-gray-200/60" />
        </div>

        {/* Term */}
        <div>
          <div className="h-3 w-28 bg-gray-200 rounded mb-2" />
          <div className="h-10 w-full bg-gray-100 rounded-lg border border-gray-200/60" />
        </div>

        {/* LGA */}
        <div>
          <div className="h-3 w-36 bg-gray-200 rounded mb-2" />
          <div className="h-10 w-full bg-gray-100 rounded-lg border border-gray-200/60" />
        </div>
      </div>
    </div>
  );
};

export default SchoolsFiltersSkeleton;
