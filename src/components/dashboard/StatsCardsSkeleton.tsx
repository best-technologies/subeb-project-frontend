import React from "react";

const StatsCardsSkeleton: React.FC = () => {
  const skeletonCards = [
    "bg-brand-primary",
    "bg-brand-primary-2",
    "bg-brand-secondary",
    "bg-brand-accent",
    "bg-brand-primary",
    "bg-brand-primary-2",
    "bg-brand-secondary",
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-7 gap-6 mb-8">
      {Array.from({ length: 7 }).map((_, idx) => (
        <div
          key={idx}
          className={`${skeletonCards[idx]} rounded-xl p-6 animate-pulse shadow-lg`}
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="h-4 w-24 bg-white/30 rounded mb-2 shimmer" />
              <div className="h-8 w-20 bg-white/40 rounded mb-1 shimmer" />
              <div className="h-3 w-12 bg-white/20 rounded shimmer" />
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-lg shimmer" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsCardsSkeleton;
