import React from "react";

const StatsCardsSkeleton: React.FC = () => {
  // Session & Term Skeleton Card
  const SessionTermSkeleton = () => (
    <div className="bg-brand-accent rounded-xl p-6 animate-pulse shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div className="h-5 w-32 bg-white/30 rounded shimmer" />
        <div className="w-8 h-8 bg-white/20 rounded-lg shimmer" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center">
          <div className="h-4 w-16 bg-white/30 rounded mb-2 mx-auto shimmer" />
          <div className="h-5 w-20 bg-white/40 rounded mb-2 mx-auto shimmer" />
          <div className="h-5 w-12 bg-green-400/40 rounded-full mx-auto shimmer" />
        </div>
        <div className="text-center border-l border-white/20">
          <div className="h-4 w-12 bg-white/30 rounded mb-2 mx-auto shimmer" />
          <div className="h-5 w-16 bg-white/40 rounded mb-2 mx-auto shimmer" />
          <div className="h-5 w-12 bg-green-400/40 rounded-full mx-auto shimmer" />
        </div>
      </div>
    </div>
  );

  // Overview Totals Skeleton Card
  const TotalsSkeleton = () => (
    <div className="bg-brand-primary rounded-xl p-6 animate-pulse shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div className="h-5 w-24 bg-white/30 rounded shimmer" />
        <div className="w-8 h-8 bg-white/20 rounded-lg shimmer" />
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center">
          <div className="w-5 h-5 bg-white/30 rounded mb-2 mx-auto shimmer" />
          <div className="h-3 w-8 bg-white/30 rounded mb-1 mx-auto shimmer" />
          <div className="h-6 w-12 bg-white/40 rounded mx-auto shimmer" />
        </div>
        <div className="text-center border-l border-r border-white/20">
          <div className="w-5 h-5 bg-white/30 rounded mb-2 mx-auto shimmer" />
          <div className="h-3 w-12 bg-white/30 rounded mb-1 mx-auto shimmer" />
          <div className="h-6 w-10 bg-white/40 rounded mx-auto shimmer" />
        </div>
        <div className="text-center">
          <div className="w-5 h-5 bg-white/30 rounded mb-2 mx-auto shimmer" />
          <div className="h-3 w-14 bg-white/30 rounded mb-1 mx-auto shimmer" />
          <div className="h-6 w-16 bg-white/40 rounded mx-auto shimmer" />
        </div>
      </div>
    </div>
  );

  // Students by Gender Skeleton Card
  const GenderSkeleton = () => (
    <div className="bg-brand-secondary rounded-xl p-6 animate-pulse shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div className="h-5 w-36 bg-white/30 rounded shimmer" />
        <div className="w-8 h-8 bg-white/20 rounded-lg shimmer" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center">
          <div className="h-4 w-10 bg-white/30 rounded mb-2 mx-auto shimmer" />
          <div className="h-6 w-16 bg-white/40 rounded mb-1 mx-auto shimmer" />
          <div className="h-3 w-12 bg-white/20 rounded mx-auto shimmer" />
        </div>
        <div className="text-center border-l border-white/20">
          <div className="h-4 w-14 bg-white/30 rounded mb-2 mx-auto shimmer" />
          <div className="h-6 w-16 bg-white/40 rounded mb-1 mx-auto shimmer" />
          <div className="h-3 w-12 bg-white/20 rounded mx-auto shimmer" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
      <SessionTermSkeleton />
      <TotalsSkeleton />
      <GenderSkeleton />
    </div>
  );
};

export default StatsCardsSkeleton;
