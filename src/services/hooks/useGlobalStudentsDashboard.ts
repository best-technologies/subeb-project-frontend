import { useEffect, useState } from 'react';
import { useData } from '@/context/DataContext';
import { StudentsFilters } from '@/services/types/studentsDashboardResponse';

export const useGlobalStudentsDashboard = (initialFilters: StudentsFilters = {}) => {
  const { 
    state: { studentsDashboard }, 
    fetchStudentsDashboard, 
    isStudentsDashboardCached 
  } = useData();

  const [filters, setFilters] = useState<StudentsFilters>({
    session: '2024/2025',
    ...initialFilters
  });

  useEffect(() => {
    // Only fetch if not cached or filters changed
    if (!isStudentsDashboardCached()) {
      fetchStudentsDashboard(filters);
    }
  }, [fetchStudentsDashboard, isStudentsDashboardCached, filters]);

  const updateFilters = (newFilters: StudentsFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const refetch = () => {
    fetchStudentsDashboard(filters, true); // Force refresh
  };

  return {
    data: studentsDashboard.data,
    loading: studentsDashboard.loading,
    error: studentsDashboard.error,
    filters,
    setFilters: updateFilters,
    refetch,
    isCached: isStudentsDashboardCached(),
  };
};
