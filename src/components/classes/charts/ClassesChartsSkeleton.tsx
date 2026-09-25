"use client";

import React from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const ClassesChartsSkeleton: React.FC = () => {
  return (
    <Card className="border border-gray-200/90 shadow-xs bg-white overflow-hidden">
      <CardHeader className="py-3 px-4 sm:px-6 border-b border-gray-100 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <Skeleton className="w-5 h-5 rounded-md" />
          <Skeleton className="h-5 w-48" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-28 rounded-lg" />
          <Skeleton className="w-8 h-8 rounded-lg" />
        </div>
      </CardHeader>
      <CardContent className="p-4 sm:p-6 space-y-6">
        {/* 4 KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="p-3.5 sm:p-4 rounded-xl border border-gray-100 bg-gray-50/50 space-y-2.5"
            >
              <div className="flex items-center justify-between">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="w-7 h-7 rounded-lg" />
              </div>
              <Skeleton className="h-7 w-24" />
              <Skeleton className="h-2.5 w-32" />
            </div>
          ))}
        </div>

        {/* Main Grade Distribution Chart Skeleton */}
        <div className="p-4 rounded-xl border border-gray-100 bg-white space-y-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-44" />
            <Skeleton className="h-4 w-28" />
          </div>
          <div className="h-64 flex items-end gap-3 pt-6 px-4">
            {[45, 65, 80, 50, 70, 90, 60, 40, 75, 55].map((h, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <Skeleton
                  className="w-full rounded-t-md"
                  style={{ height: `${h}%` }}
                />
                <Skeleton className="h-2.5 w-8" />
              </div>
            ))}
          </div>
        </div>

        {/* 3 Bottom Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((card) => (
            <div
              key={card}
              className="p-4 rounded-xl border border-gray-100 bg-white space-y-3"
            >
              <div className="flex items-center gap-2 mb-2">
                <Skeleton className="w-8 h-8 rounded-lg" />
                <div className="space-y-1">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-2.5 w-24" />
                </div>
              </div>
              <div className="space-y-2 pt-1">
                {[1, 2, 3, 4, 5].map((row) => (
                  <Skeleton key={row} className="h-8 w-full rounded-lg" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
