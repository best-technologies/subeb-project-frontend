import React from "react";

const SchoolsHeaderSkeleton: React.FC = () => {
  return (
    <div className="bg-brand-primary-2 rounded-xl p-8 shadow-lg animate-pulse">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-lg bg-brand-primary-2-contrast/20" />
            <div className="h-8 w-64 bg-brand-primary-2-contrast/25 rounded-lg" />
          </div>
          <div className="h-5 w-80 sm:w-96 bg-brand-primary-2-contrast/20 rounded" />
        </div>
        <div className="flex-shrink-0">
          <div className="h-10 w-36 bg-white/25 rounded-lg" />
        </div>
      </div>
    </div>
  );
};

export default SchoolsHeaderSkeleton;
