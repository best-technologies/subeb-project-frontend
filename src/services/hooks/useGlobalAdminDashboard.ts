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
    // STOP THE INFINITE LOOP - Don't make API calls if there's an error
    if (adminDashboard.error) {
      return;
    }

    const currentKey = `${searchParams.session || ""}_${searchParams.term || ""}`;

    // If already cached and no specific session/term filter requested, mark as fetched and do nothing
    if (!searchParams.session && !searchParams.term && isAdminDashboardCached()) {
      lastFetchedKeyRef.current = currentKey;
      return;
    }

    // Only fetch if session/term key changed or if initial fetch hasn't occurred
    if (lastFetchedKeyRef.current !== currentKey) {
      lastFetchedKeyRef.current = currentKey;
      fetchAdminDashboard(searchParams);
    }
  }, [
    searchParams.session,
    searchParams.term,
    adminDashboard.error,
    isAdminDashboardCached,
    fetchAdminDashboard,
  ]);

  const refetch = useCallback(() => {
    lastFetchedKeyRef.current = `${searchParams.session || ""}_${searchParams.term || ""}`;
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
