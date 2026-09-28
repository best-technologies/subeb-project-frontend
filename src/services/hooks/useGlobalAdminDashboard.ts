import { useEffect, useState, useCallback, useRef } from "react";
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
    includeStats?: boolean;
    includePerformance?: boolean;
  }>({
    includeStats: true,
    includePerformance: true,
  });

  const lastFetchedKeyRef = useRef<string | null>(null);

  useEffect(() => {
    // If currently loading, wait for completion
    if (adminDashboard.loading) {
      return;
    }

    const currentKey = `${searchParams.session || ""}_${searchParams.term || ""}`;

    // If already cached and no specific session/term filter requested, mark as fetched and do nothing
    if (!searchParams.session && !searchParams.term && isAdminDashboardCached()) {
      lastFetchedKeyRef.current = currentKey;
      return;
    }

    // Don't make automatic retry calls if there's an active error for the exact same key
    if (adminDashboard.error && lastFetchedKeyRef.current === currentKey) {
      return;
    }

    // Fetch if session/term key changed or if initial fetch hasn't completed
    if (lastFetchedKeyRef.current !== currentKey || !adminDashboard.data) {
      lastFetchedKeyRef.current = currentKey;
      fetchAdminDashboard(searchParams);
    }
  }, [
    searchParams.session,
    searchParams.term,
    adminDashboard.data,
    adminDashboard.loading,
    adminDashboard.error,
    isAdminDashboardCached,
    fetchAdminDashboard,
  ]);

  const refetch = useCallback(() => {
    lastFetchedKeyRef.current = null;
    fetchAdminDashboard(searchParams, true); // Force refresh
  }, [fetchAdminDashboard, searchParams]);

  const updateSearchParams = useCallback(
    (newParams: Partial<typeof searchParams>) => {
      setSearchParams((prev) => ({ ...prev, ...newParams }));
    },
    []
  );

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
