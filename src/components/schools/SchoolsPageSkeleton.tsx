import React from "react";
import SchoolsHeaderSkeleton from "./SchoolsHeaderSkeleton";
import SchoolsChartsSkeleton from "./SchoolsChartsSkeleton";
import SchoolsFiltersSkeleton from "./SchoolsFiltersSkeleton";
import SchoolsTableSkeleton from "./SchoolsTableSkeleton";

const SchoolsPageSkeleton: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* 1. Page Header Card */}
      <SchoolsHeaderSkeleton />

      {/* 2. Visual Demographic & Performance Analytics Suite */}
      <SchoolsChartsSkeleton />

      {/* 3. Progressive Cascading Filters & Direct Search */}
      <SchoolsFiltersSkeleton />

      {/* 4. Schools Directory Table */}
      <SchoolsTableSkeleton />
    </div>
  );
};

export default SchoolsPageSkeleton;
