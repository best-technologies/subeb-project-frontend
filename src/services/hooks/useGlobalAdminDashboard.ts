import { useEffect, useState, useCallback } from "react";
import { useData } from "@/context/DataContext";

export const useGlobalAdminDashboard = () => {
  const {
    state: { adminDashboard },
    fetchAdminDashboard,
    isAdminDashboardCached,
  } = useData();

  const [searchParams, setSearchParams] = useState<{
    session?: string;
    term?: string;
    page?: number;
    limit?: number;
    search?: string;
    schoolId?: string;
    classId?: string;
    gender?: string;
    schoolLevel?: string;
    lgaId?: string;
    sortBy?: string;
    sortOrder?: string;
    includeStats?: boolean;
    includePerformance?: boolean;
  }>({});

  useEffect(() => {
    // STOP THE INFINITE LOOP - Don't make API calls if there's an error
    if (adminDashboard.error) {
      // console.log('🚫 STOPPING - Skipping API call due to existing error:', adminDashboard.error);
      return;
    }

    // Always fetch when search params change, but use cache for initial load
    const hasSearchParams = Object.values(searchParams).some(
      (val) => val !== undefined && val !== ""
    );

    // Only fetch if we have search params or if there's no cached data
    if (hasSearchParams || !isAdminDashboardCached()) {
      // console.log('🔄 useGlobalAdminDashboard - Triggering API call:', { hasSearchParams, isCached: isAdminDashboardCached() });
      fetchAdminDashboard(searchParams);
    }
  }, [
    fetchAdminDashboard,
    isAdminDashboardCached,
    searchParams,
    adminDashboard.error,
  ]);

  const refetch = useCallback(() => {
    fetchAdminDashboard(searchParams, true); // Force refresh
  }, [fetchAdminDashboard, searchParams]);

  const updateSearchParams = useCallback((newParams: typeof searchParams) => {
    setSearchParams((prev) => ({ ...prev, ...newParams }));
  }, []);

  return {
    data: adminDashboard.data,
    loading: adminDashboard.loading,
    error: adminDashboard.error,
    refetch,
    updateSearchParams,
    searchParams,
    isCached: isAdminDashboardCached(),
  };
};
