"use client";

import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { ClassesChartsSkeleton } from "./charts/ClassesChartsSkeleton";

export const ClassesPageSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header Skeleton */}
      <div className="bg-brand-primary-2 rounded-xl p-6 sm:p-8 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div className="space-y-2">
            <Skeleton className="h-8 w-64 bg-white/20" />
            <Skeleton className="h-4 w-96 bg-white/20" />
          </div>
          <Skeleton className="h-10 w-32 rounded-lg bg-white/30" />
        </div>
      </div>

      {/* Analytics Charts Skeleton */}
      <ClassesChartsSkeleton />

      {/* Filters Skeleton */}
      <div className="bg-white rounded-xl border border-gray-200/90 p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Skeleton className="w-7 h-7 rounded-lg" />
            <div className="space-y-1">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-48" />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-1.5">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-9 w-full rounded-md" />
            </div>
          ))}
        </div>
      </div>

      {/* Table Skeleton */}
      <div className="bg-white rounded-xl border border-gray-200/90 shadow-xs overflow-hidden">
        <div className="py-4 px-4 sm:px-6 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Skeleton className="w-8 h-8 rounded-lg" />
            <div className="space-y-1">
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-3 w-48" />
            </div>
          </div>
          <Skeleton className="h-4 w-24" />
        </div>
        <div className="p-4 space-y-3">
          {[1, 2, 3, 4, 5, 6].map((row) => (
            <div key={row} className="flex items-center justify-between py-2 border-b border-gray-50">
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-4 w-1/6" />
              <Skeleton className="h-4 w-1/6" />
              <Skeleton className="w-8 h-8 rounded-md" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ClassesPageSkeleton;
