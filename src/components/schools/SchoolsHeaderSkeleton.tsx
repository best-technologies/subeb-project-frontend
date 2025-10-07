import React from "react";

const SchoolsHeaderSkeleton: React.FC = () => {
  return (
    <div className="bg-brand-primary-2 rounded-xl p-8 border border-brand-primary-2/20 shadow-lg animate-pulse">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div>
          <div className="h-8 w-64 bg-brand-primary-2-contrast/30 rounded mb-2 shimmer" />
          <div className="h-5 w-96 bg-brand-primary-2-contrast/20 rounded shimmer" />
        </div>
        <div className="flex items-center gap-6">
          <div className="text-center">
            <div className="h-8 w-12 bg-brand-secondary/30 rounded mb-1 shimmer" />
            <div className="h-4 w-20 bg-brand-primary-2-contrast/20 rounded shimmer" />
          </div>
          <div className="text-center">
            <div className="h-8 w-16 bg-brand-secondary/30 rounded mb-1 shimmer" />
            <div className="h-4 w-24 bg-brand-primary-2-contrast/20 rounded shimmer" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SchoolsHeaderSkeleton;
