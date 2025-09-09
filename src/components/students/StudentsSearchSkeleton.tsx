"use client";
import React from "react";

const StudentsSearchSkeleton: React.FC = () => {
  return (
    <div className="bg-brand-accent-background border border-brand-accent/20 rounded-xl p-6 shadow-lg animate-pulse">
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1">
          <div className="h-4 w-28 bg-brand-accent/30 rounded mb-3 shimmer"></div>
          <div className="relative">
            <div className="h-12 w-full bg-brand-accent/20 rounded-lg shimmer"></div>
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <div className="h-4 w-4 bg-brand-accent/30 rounded shimmer"></div>
            </div>
          </div>
        </div>

        {/* Pagination Controls Skeleton */}
        <div className="flex items-end">
          <div className="flex items-center gap-2">
            <div className="h-8 w-16 bg-brand-primary/30 rounded-md shimmer"></div>
            <div className="h-8 w-8 bg-brand-secondary/30 rounded-md shimmer"></div>
            <div className="h-8 w-16 bg-brand-primary/30 rounded-md shimmer"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentsSearchSkeleton;
