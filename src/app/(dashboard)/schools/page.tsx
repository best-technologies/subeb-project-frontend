"use client";
import React, { useEffect } from "react";
import SchoolsTab from "@/components/schools/SchoolsTab";
import SchoolsPageSkeleton from "@/components/schools/SchoolsPageSkeleton";
import { useData } from "@/context/DataContext";
import { AlertTriangle } from "lucide-react";

const SchoolsPage: React.FC = () => {
  const {
    state: { adminDashboard },
    fetchAdminDashboard,
    isAdminDashboardCached,
  } = useData();

  useEffect(() => {
    // Only fetch if not cached
    if (!isAdminDashboardCached()) {
      console.log("🚀 Fetching admin dashboard data for schools page");
      fetchAdminDashboard();
    }
  }, [isAdminDashboardCached, fetchAdminDashboard]);

  // Show skeleton while loading or when no data is available yet
  if (adminDashboard.loading || !adminDashboard.data) {
    return <SchoolsPageSkeleton />;
  }

  if (adminDashboard.error) {
    return (
      <div className="min-h-screen bg-brand-accent-background flex items-center justify-center">
        <div className="text-center max-w-md mx-auto">
          <div className="w-16 h-16 mx-auto mb-4 text-red-500">
            <AlertTriangle className="w-full h-full" />
          </div>
          <h2 className="text-2xl font-bold text-brand-heading mb-4">
            Error Loading Data
          </h2>
          <p className="text-brand-light-accent-1 mb-6">
            {adminDashboard.error}
          </p>
          <button
            onClick={() => fetchAdminDashboard({}, true)}
            className="px-6 py-3 bg-brand-primary hover:bg-brand-primary-2 text-brand-primary-contrast rounded-lg transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Guard clause - ensure adminDashboard.data exists before rendering
  if (!adminDashboard.data) {
    return <SchoolsPageSkeleton />;
  }

  return <SchoolsTab dashboardData={adminDashboard.data} />;
};

export default SchoolsPage;
