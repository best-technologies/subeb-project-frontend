import React from "react";

const SchoolsSummaryCardsSkeleton: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
      {/* Total Schools Card */}
      <div className="bg-brand-primary-2 rounded-xl p-6 border border-brand-primary-2/20 shadow-lg">
        <div className="flex items-center">
          <div className="w-12 h-12 bg-brand-secondary/30 rounded-xl shimmer" />
          <div className="ml-4">
            <div className="h-4 w-20 bg-brand-primary-2-contrast/30 rounded mb-2 shimmer" />
            <div className="h-8 w-12 bg-brand-secondary/30 rounded shimmer" />
          </div>
        </div>
      </div>

      {/* Total Students Card */}
      <div className="bg-brand-accent rounded-xl p-6 border border-brand-accent/20 shadow-lg">
        <div className="flex items-center">
          <div className="w-12 h-12 bg-brand-accent-contrast/30 rounded-xl shimmer" />
          <div className="ml-4">
            <div className="h-4 w-24 bg-brand-accent-contrast/30 rounded mb-2 shimmer" />
            <div className="h-8 w-16 bg-brand-accent-contrast/30 rounded shimmer" />
          </div>
        </div>
      </div>

      {/* Overall Average Card */}
      <div className="bg-brand-secondary rounded-xl p-6 border border-brand-secondary/20 shadow-lg">
        <div className="flex items-center">
          <div className="w-12 h-12 bg-brand-secondary-contrast/30 rounded-xl shimmer" />
          <div className="ml-4">
            <div className="h-4 w-28 bg-brand-secondary-contrast/30 rounded mb-2 shimmer" />
            <div className="h-8 w-14 bg-brand-secondary-contrast/30 rounded shimmer" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SchoolsSummaryCardsSkeleton;
