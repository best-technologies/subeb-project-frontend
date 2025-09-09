import React from "react";
import StudentsHeaderSkeleton from "./StudentsHeaderSkeleton";
import StudentsFiltersSkeleton from "./StudentsFiltersSkeleton";
import StudentsSearchSkeleton from "./StudentsSearchSkeleton";
import StudentsTableSkeleton from "./StudentsTableSkeleton";

const StudentsPageSkeleton: React.FC = () => {
  return (
    <div className="container mx-auto p-6">
      {/* Header Section */}
      <StudentsHeaderSkeleton />

      {/* Filters Section */}
      <div className="mt-6">
        <StudentsFiltersSkeleton />
      </div>

      {/* Search and Table Section */}
      <div className="mt-6 space-y-6">
        {/* Search and Pagination Controls */}
        <StudentsSearchSkeleton />

        {/* Main Table */}
        <StudentsTableSkeleton />
      </div>
    </div>
  );
};

export default StudentsPageSkeleton;
