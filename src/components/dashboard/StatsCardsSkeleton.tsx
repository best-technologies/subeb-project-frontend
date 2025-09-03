import React from "react";

const StatsCardsSkeleton: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-7 gap-6 mb-8">
      {Array.from({ length: 7 }).map((_, idx) => (
        <div
          key={idx}
          className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 animate-pulse"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="h-4 w-24 bg-gray-400/30 rounded mb-2 shimmer" />
              <div className="h-8 w-20 bg-gray-400/40 rounded mb-1 shimmer" />
              <div className="h-3 w-12 bg-gray-400/20 rounded shimmer" />
            </div>
            <div className="w-12 h-12 bg-gray-400/30 rounded-lg shimmer" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsCardsSkeleton;
