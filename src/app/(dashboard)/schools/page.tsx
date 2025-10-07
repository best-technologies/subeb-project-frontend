"use client";
import React, { useEffect } from "react";
import SchoolsTab from "@/components/schools/SchoolsTab";
import SchoolsPageSkeleton from "@/components/schools/SchoolsPageSkeleton";
import { useData } from "@/context/DataContext";
import { TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/Button";

const SchoolsPage: React.FC = () => {
  const {
    state: { adminDashboard },
    fetchAdminDashboard,
    shouldFetchAdminDashboard,
  } = useData();

  useEffect(() => {
    // Only fetch if we should (prevents infinite loops after errors)
    if (shouldFetchAdminDashboard()) {
      console.log("Fetching admin dashboard data for schools page");
      fetchAdminDashboard();
    }
  }, [shouldFetchAdminDashboard, fetchAdminDashboard]);

  // Determine loading and error states similar to students page
  const loading = adminDashboard.loading;
  const error = !adminDashboard.data ? adminDashboard.error : null;

  // Show skeleton while loading or when no data is available yet (but no error)
  if (loading || (!adminDashboard.data && !error)) {
    return <SchoolsPageSkeleton />;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto">
          <div className="flex justify-center mb-4">
            <TriangleAlert className="w-16 h-16 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-brand-primary mb-4">
            Error Loading Data
          </h2>
          <p className="text-brand-accent-text mb-6">{error}</p>
          <Button
            onClick={() => fetchAdminDashboard({}, true)}
            className="bg-brand-primary hover:bg-brand-primary-2 text-brand-primary-contrast"
            size="lg"
          >
            Try Again
          </Button>
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
