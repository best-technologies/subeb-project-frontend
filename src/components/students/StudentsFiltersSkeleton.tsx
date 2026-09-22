"use client";
import React from "react";

const StudentsFiltersSkeleton: React.FC = () => {
  return (
    <div className="bg-brand-secondary border border-emerald-200/60 rounded-xl p-4 shadow-xs animate-pulse">
      {/* 5 Filters Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-3.5">
        {/* Session Filter */}
        <div>
          <div className="h-3.5 w-12 bg-emerald-800/20 rounded mb-1.5" />
          <div className="h-9 w-full bg-white/80 border border-gray-200/80 rounded-lg" />
        </div>

        {/* Term Filter */}
        <div>
          <div className="h-3.5 w-10 bg-emerald-800/20 rounded mb-1.5" />
          <div className="h-9 w-full bg-white/80 border border-gray-200/80 rounded-lg" />
        </div>

        {/* LGA Filter */}
        <div>
          <div className="h-3.5 w-8 bg-emerald-800/20 rounded mb-1.5" />
          <div className="h-9 w-full bg-white/80 border border-gray-200/80 rounded-lg" />
        </div>

        {/* School Filter */}
        <div>
          <div className="h-3.5 w-12 bg-emerald-800/20 rounded mb-1.5" />
          <div className="h-9 w-full bg-white/80 border border-gray-200/80 rounded-lg" />
        </div>

        {/* Class Filter */}
        <div>
          <div className="h-3.5 w-10 bg-emerald-800/20 rounded mb-1.5" />
          <div className="h-9 w-full bg-white/80 border border-gray-200/80 rounded-lg" />
        </div>
      </div>

      {/* Search & Clear Row */}
      <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-3">
        <div>
          <div className="h-3.5 w-24 bg-emerald-800/20 rounded mb-1.5" />
          <div className="h-9 w-full bg-white/80 border border-gray-200/80 rounded-lg" />
        </div>
        <div className="flex items-end">
          <div className="h-9 w-24 bg-emerald-700/40 rounded-lg" />
        </div>
      </div>
    </div>
  );
};

export default StudentsFiltersSkeleton;
