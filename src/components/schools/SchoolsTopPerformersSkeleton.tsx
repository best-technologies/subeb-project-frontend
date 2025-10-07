import React from "react";

const SchoolsTopPerformersSkeleton: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={index}
          className="bg-brand-accent-background border border-brand-accent/20 rounded-xl p-6 shadow-lg"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-8 h-8 bg-brand-accent/30 rounded-full shimmer" />
            <div className="h-5 w-24 bg-brand-primary/20 rounded-full shimmer" />
          </div>
          <div className="h-5 w-40 bg-brand-accent/25 rounded mb-1 shimmer" />
          <div className="h-4 w-24 bg-brand-accent/20 rounded mb-3 shimmer" />
          <div className="flex items-center justify-between">
            <div>
              <div className="h-6 w-12 bg-brand-accent/30 rounded mb-1 shimmer" />
              <div className="h-3 w-20 bg-brand-accent/20 rounded shimmer" />
            </div>
            <div>
              <div className="h-6 w-8 bg-brand-accent/30 rounded mb-1 shimmer" />
              <div className="h-3 w-16 bg-brand-accent/20 rounded shimmer" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SchoolsTopPerformersSkeleton;
