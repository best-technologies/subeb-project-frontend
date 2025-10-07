"use client";
import React from "react";

const StudentsHeaderSkeleton: React.FC = () => {
  return (
    <div className="bg-brand-primary-2 rounded-xl p-8 shadow-lg animate-pulse">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div>
          <div className="h-8 w-64 bg-brand-primary-2-contrast/20 rounded mb-2 shimmer"></div>
          <div className="h-5 w-96 bg-brand-primary-2-contrast/15 rounded shimmer"></div>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-center">
            <div className="h-8 w-16 bg-brand-primary-2-contrast/20 rounded mb-1 shimmer"></div>
            <div className="h-4 w-20 bg-brand-primary-2-contrast/15 rounded shimmer"></div>
          </div>
          <div className="text-center">
            <div className="h-8 w-20 bg-brand-primary-2-contrast/20 rounded mb-1 shimmer"></div>
            <div className="h-4 w-24 bg-brand-primary-2-contrast/15 rounded shimmer"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentsHeaderSkeleton;
