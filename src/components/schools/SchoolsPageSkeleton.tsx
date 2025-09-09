import React from "react";
import SchoolsHeaderSkeleton from "./SchoolsHeaderSkeleton";
import SchoolsTopPerformersSkeleton from "./SchoolsTopPerformersSkeleton";
import SchoolsFiltersSkeleton from "./SchoolsFiltersSkeleton";
import SchoolsSummaryCardsSkeleton from "./SchoolsSummaryCardsSkeleton";
import SchoolsTableSkeleton from "./SchoolsTableSkeleton";

const SchoolsPageSkeleton: React.FC = () => {
  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header Section */}
      <SchoolsHeaderSkeleton />

      {/* Top Performers Section */}
      <SchoolsTopPerformersSkeleton />

      {/* Filters Section */}
      <SchoolsFiltersSkeleton />

      {/* Summary Cards Section */}
      <SchoolsSummaryCardsSkeleton />

      {/* Table Section */}
      <SchoolsTableSkeleton />
    </div>
  );
};

export default SchoolsPageSkeleton;
