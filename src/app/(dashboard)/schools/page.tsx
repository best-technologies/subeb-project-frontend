"use client";
import React, { useEffect } from "react";
import SchoolsTab from "@/components/schools/SchoolsTab";
import SchoolsPageSkeleton from "@/components/schools/SchoolsPageSkeleton";
import { useData } from "@/context/DataContext";
import { useAccessStore } from "@/store/accessStore";
import { TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/Button";

const SchoolsPage: React.FC = () => {
  const { isAccessReady } = useAccessStore();
  const {
    state: { adminDashboard },
    fetchAdminDashboard,
    shouldFetchAdminDashboard,
  } = useData();

  useEffect(() => {
    // Only fetch if we should (prevents infinite loops after errors)
    if (shouldFetchAdminDashboard()) {
      fetchAdminDashboard();
    }
  }, [shouldFetchAdminDashboard, fetchAdminDashboard]);

  // 1. While access verification overlay is active, keep page clear so no skeleton flashes before access dialog
  if (!isAccessReady) {
    return null;
  }

  // 2. If data arrived fast during verification (e.g. backend cache hit), go straight to displaying the data!
  if (adminDashboard.data) {
    return <SchoolsTab dashboardData={adminDashboard.data} />;
  }

  const error = !adminDashboard.data ? adminDashboard.error : null;
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

  // 3. Only if access is ready but data hasn't arrived yet, show skeleton
  return <SchoolsPageSkeleton />;
};

export default SchoolsPage;
