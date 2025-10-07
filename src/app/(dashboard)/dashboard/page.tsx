"use client";
import React from "react";
import { TriangleAlert } from "lucide-react";
import { useGlobalAdminDashboard } from "@/services";
import Dashboard from "@/components/dashboard/Dashboard";
import { Button } from "@/components/ui/Button";

const DashboardPage: React.FC = () => {
  const {
    data: dashboardData,
    loading,
    error,
    refetch,
    updateSearchParams,
    isCached,
  } = useGlobalAdminDashboard();

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto">
          <div className="flex justify-center mb-4">
            <TriangleAlert className="w-16 h-16 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-brand-primary mb-4">
            Error Loading Dashboard
          </h2>
          <p className="text-brand-accent-text mb-6">{error}</p>
          <div className="flex gap-2 justify-center">
            <Button
              onClick={() => refetch()}
              className="bg-brand-primary hover:bg-brand-primary-2 text-brand-primary-contrast"
              size="lg"
            >
              Try Again
            </Button>
            {isCached && (
              <Button
                onClick={() => refetch()}
                className="bg-brand-primary hover:bg-brand-primary-2 text-brand-primary-contrast"
                size="lg"
              >
                Force Refresh
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Dashboard
        dashboardData={dashboardData}
        loading={loading}
        onSearchParamsChange={updateSearchParams}
      />
    </div>
  );
};

export default DashboardPage;
