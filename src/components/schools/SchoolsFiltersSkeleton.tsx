import React from "react";

const SchoolsFiltersSkeleton: React.FC = () => {
  return (
    <div className="bg-brand-secondary rounded-xl p-6 border border-brand-secondary/20 shadow-lg animate-pulse">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Search Field */}
        <div>
          <div className="h-4 w-24 bg-brand-secondary-contrast/30 rounded mb-3 shimmer" />
          <div className="relative">
            <div className="h-12 w-full bg-brand-secondary-contrast/20 rounded-lg shimmer" />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
              <div className="w-4 h-4 bg-brand-secondary-contrast/30 rounded shimmer" />
            </div>
          </div>
        </div>

        {/* LGA Filter */}
        <div>
          <div className="h-4 w-20 bg-brand-secondary-contrast/30 rounded mb-3 shimmer" />
          <div className="h-12 w-full bg-brand-secondary-contrast/20 rounded-lg shimmer" />
        </div>

        {/* Clear Button */}
        <div className="flex items-end">
          <div className="h-12 w-full bg-brand-primary/30 rounded-lg shimmer" />
        </div>
      </div>
    </div>
  );
};

export default SchoolsFiltersSkeleton;
