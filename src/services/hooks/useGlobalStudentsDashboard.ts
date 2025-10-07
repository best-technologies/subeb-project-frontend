import { useEffect, useState, useMemo } from "react";
import { useData } from "@/context/DataContext";
import { StudentsFilters } from "@/services/types/studentsDashboardResponse";

export const useGlobalStudentsDashboard = (
  initialFilters: StudentsFilters = {}
) => {
  const {
    state: { adminDashboard },
    fetchAdminDashboard,
    isAdminDashboardCached,
    getStudentsDataFromAdmin,
    hasAdminDataForStudents,
  } = useData();

  const [filters, setFilters] = useState<StudentsFilters>({
    session: "2024/2025",
    ...initialFilters,
  });

  // Get data from admin dashboard if available
  const data = useMemo(() => {
    if (hasAdminDataForStudents()) {
      console.log("📦 Using admin dashboard data for students page");
      return getStudentsDataFromAdmin();
    }
    return null; // No fallback data available
  }, [hasAdminDataForStudents, getStudentsDataFromAdmin]);

  // Determine loading state
  const loading = useMemo(() => {
    // If we can use admin data, we're not loading
    if (hasAdminDataForStudents()) {
      return false;
    }
    return adminDashboard.loading;
  }, [hasAdminDataForStudents, adminDashboard.loading]);

  // Determine error state
  const error = useMemo(() => {
    // If we can use admin data, no error
    if (hasAdminDataForStudents()) {
      return null;
    }
    return adminDashboard.error;
  }, [hasAdminDataForStudents, adminDashboard.error]);

  useEffect(() => {
    // Only fetch if we don't have admin data and admin data is not cached
    if (!hasAdminDataForStudents() && !isAdminDashboardCached()) {
      console.log("🚀 Fetching admin dashboard data for students");
      fetchAdminDashboard();
    }
  }, [hasAdminDataForStudents, isAdminDashboardCached, fetchAdminDashboard]);

  const updateFilters = (newFilters: StudentsFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const refetch = () => {
    fetchAdminDashboard({}, true); // Force refresh
  };

  return {
    data,
    loading,
    error,
    filters,
    setFilters: updateFilters,
    refetch,
    isCached: hasAdminDataForStudents() || isAdminDashboardCached(),
    isUsingAdminData: hasAdminDataForStudents(),
  };
};
