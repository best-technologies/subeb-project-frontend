import { useEffect, useState, useMemo } from "react";
import { useData } from "@/context/DataContext";
import { StudentsFilters } from "@/services/types/studentsDashboardResponse";

export const useGlobalStudentsDashboard = (
  initialFilters: StudentsFilters = {}
) => {
  const {
    state: { studentsDashboard },
    fetchStudentsDashboard,
    isStudentsDashboardCached,
    getStudentsDataFromAdmin,
    hasAdminDataForStudents,
  } = useData();

  const [filters, setFilters] = useState<StudentsFilters>({
    session: "2024/2025",
    ...initialFilters,
  });

  // Get data from admin dashboard if available, otherwise use students dashboard
  const data = useMemo(() => {
    if (hasAdminDataForStudents()) {
      console.log("📦 Using admin dashboard data for students page");
      return getStudentsDataFromAdmin();
    }
    return studentsDashboard.data;
  }, [
    hasAdminDataForStudents,
    getStudentsDataFromAdmin,
    studentsDashboard.data,
  ]);

  // Determine loading state
  const loading = useMemo(() => {
    // If we can use admin data, we're not loading
    if (hasAdminDataForStudents()) {
      return false;
    }
    return studentsDashboard.loading;
  }, [hasAdminDataForStudents, studentsDashboard.loading]);

  // Determine error state
  const error = useMemo(() => {
    // If we can use admin data, no error
    if (hasAdminDataForStudents()) {
      return null;
    }
    return studentsDashboard.error;
  }, [hasAdminDataForStudents, studentsDashboard.error]);

  useEffect(() => {
    // Only fetch if we don't have admin data and students data is not cached
    if (!hasAdminDataForStudents() && !isStudentsDashboardCached()) {
      console.log("🚀 Fetching students dashboard data");
      fetchStudentsDashboard(filters);
    }
  }, [
    hasAdminDataForStudents,
    isStudentsDashboardCached,
    fetchStudentsDashboard,
    filters,
  ]);

  const updateFilters = (newFilters: StudentsFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const refetch = () => {
    fetchStudentsDashboard(filters, true); // Force refresh
  };

  return {
    data,
    loading,
    error,
    filters,
    setFilters: updateFilters,
    refetch,
    isCached: hasAdminDataForStudents() || isStudentsDashboardCached(),
    isUsingAdminData: hasAdminDataForStudents(),
  };
};
