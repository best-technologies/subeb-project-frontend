"use client";
import React from "react";

const StudentsFiltersSkeleton: React.FC = () => {
  return (
    <div className="bg-brand-secondary rounded-xl p-6 shadow-lg animate-pulse">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        {/* LGA Filter Skeleton */}
        <div>
          <div className="h-4 w-8 bg-brand-secondary-contrast/20 rounded mb-2 shimmer"></div>
          <div className="h-10 w-full bg-brand-secondary-contrast/15 rounded-lg shimmer"></div>
        </div>

        {/* School Filter Skeleton */}
        <div>
          <div className="h-4 w-12 bg-brand-secondary-contrast/20 rounded mb-2 shimmer"></div>
          <div className="h-10 w-full bg-brand-secondary-contrast/10 rounded-lg shimmer"></div>
        </div>

        {/* Class Filter Skeleton */}
        <div>
          <div className="h-4 w-10 bg-brand-secondary-contrast/20 rounded mb-2 shimmer"></div>
          <div className="h-10 w-full bg-brand-secondary-contrast/10 rounded-lg shimmer"></div>
        </div>

        {/* Gender Filter Skeleton */}
        <div>
          <div className="h-4 w-14 bg-brand-secondary-contrast/20 rounded mb-2 shimmer"></div>
          <div className="h-10 w-full bg-brand-secondary-contrast/10 rounded-lg shimmer"></div>
        </div>

        {/* Subject Filter Skeleton */}
        <div>
          <div className="h-4 w-16 bg-brand-secondary-contrast/20 rounded mb-2 shimmer"></div>
          <div className="h-10 w-full bg-brand-secondary-contrast/15 rounded-lg shimmer"></div>
        </div>

        {/* Clear Filters Button Skeleton */}
        <div className="flex items-end">
          <div className="h-10 w-full bg-brand-primary/30 rounded-lg shimmer"></div>
        </div>
      </div>
    </div>
  );
};

export default StudentsFiltersSkeleton;
