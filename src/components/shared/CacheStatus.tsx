"use client";
import React from "react";
import { useData } from "@/context/DataContext";
import { ArrowPathIcon } from "@heroicons/react/24/outline";

interface CacheStatusProps {
  className?: string;
}

export const CacheStatus: React.FC<CacheStatusProps> = ({ className = "" }) => {
  const { clearCache } = useData();

  return (
    <div className={`flex items-center gap-2 text-sm ${className}`}>
      {/* Refresh Button */}
      <button
        onClick={clearCache}
        className="flex items-center gap-1 text-brand-primary hover:text-brand-accent transition-colors duration-200 cursor-pointer"
        title="Clear cache and refresh all data"
      >
        <ArrowPathIcon className="w-4 h-4" />
        <span>Refresh</span>
      </button>
    </div>
  );
};
