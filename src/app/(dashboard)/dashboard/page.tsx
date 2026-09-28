"use client";
import React, { useState, useEffect } from "react";
import { TriangleAlert, RefreshCw } from "lucide-react";
import { useGlobalAdminDashboard } from "@/services";
import Dashboard from "@/components/dashboard/Dashboard";
import { Button } from "@/components/ui/Button";
import { useAccessStore } from "@/store/accessStore";

const DashboardPage: React.FC = () => {
  const [mounted, setMounted] = useState(false);
  const { isAccessReady } = useAccessStore();

  const {
    data: dashboardData,
    loading,
    error,
    refetch,
    updateSearchParams,
    isCached,
  } = useGlobalAdminDashboard();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !isAccessReady) {
    return null;
  }

  if (error) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <div className="text-center max-w-md mx-auto bg-white rounded-2xl p-8 border border-gray-200/80 shadow-sm">
          <div className="flex justify-center mb-4">
            <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center text-red-600">
              <TriangleAlert className="w-7 h-7" />
            </div>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Unable to Load Dashboard
          </h2>
          <p className="text-gray-600 text-sm mb-6">{error}</p>
          <div className="flex gap-3 justify-center">
            <Button
              onClick={() => refetch()}
              className="bg-brand-primary hover:bg-brand-primary-2 text-white text-xs px-4 py-2 rounded-lg inline-flex items-center gap-2 cursor-pointer shadow-xs"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Try Again
            </Button>
            {isCached && (
              <Button
                onClick={() => refetch()}
                variant="outline"
                className="text-xs px-4 py-2 rounded-lg cursor-pointer"
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
        onRefresh={() => refetch()}
      />
    </div>
  );
};

export default DashboardPage;
