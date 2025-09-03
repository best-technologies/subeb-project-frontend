"use client";
import React from "react";
import { useGlobalAdminDashboard } from "@/services";
import Dashboard from "@/components/dashboard/Dashboard";

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
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-400 text-6xl mb-4">⚠️</div>
          <h2 className="text-white text-xl font-bold mb-2">
            Error Loading Dashboard
          </h2>
          <p className="text-gray-300 mb-4">{error}</p>
          <div className="flex gap-2 justify-center">
            <button
              onClick={() => refetch()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Try Again
            </button>
            {isCached && (
              <button
                onClick={() => refetch()}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition-colors"
              >
                Force Refresh
              </button>
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
