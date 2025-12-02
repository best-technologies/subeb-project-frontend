import { useState, useEffect } from "react";
import { getStudentsDashboard } from "../api";
import {
  StudentsDashboardResponse,
  StudentsDashboardData,
  StudentsFilters,
} from "../types/studentsDashboardResponse";

interface UseStudentsDashboardReturn {
  data: StudentsDashboardData | null;
  loading: boolean;
  error: string | null;
  filters: StudentsFilters;
  setFilters: (filters: StudentsFilters) => void;
  refetch: () => Promise<void>;
}

export const useStudentsDashboard = (
  initialFilters: StudentsFilters = {}
): UseStudentsDashboardReturn => {
  const [data, setData] = useState<StudentsDashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<StudentsFilters>({
    session: "2024/2025",
    ...initialFilters,
  });

  const fetchStudentsData = async (
    currentFilters: StudentsFilters
  ): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      console.log(
        "🔄 Hook - Fetching students data with filters:",
        currentFilters
      );
      console.log(
        "📊 Hook - Active filters count:",
        Object.values(currentFilters).filter((v) => v && v !== "").length
      );

      const response: StudentsDashboardResponse = await getStudentsDashboard(
        currentFilters
      );

      if (response.success) {
        console.log("✅ Hook - Data fetched successfully");
        console.log(
          "📈 Hook - Performance table records:",
          response.data.performanceTable.length
        );
        setData(response.data);
      } else {
        console.error("❌ Hook - API returned error:", response.message);
        setError("Unable to load student data. Please try again.");
      }
    } catch (err) {
      console.error("❌ Hook - Error fetching students dashboard data:", err);
      setError("Unable to load student data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log("🔄 Hook - Filters changed, triggering new request:", filters);
    fetchStudentsData(filters);
  }, [filters]);

  const updateFilters = (newFilters: StudentsFilters) => {
    console.log("🎛️ Hook - Updating filters:", newFilters);
    console.log("🔄 Hook - Previous filters:", filters);
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const refetch = async (): Promise<void> => {
    await fetchStudentsData(filters);
  };

  return {
    data,
    loading,
    error,
    filters,
    setFilters: updateFilters,
    refetch,
  };
};
