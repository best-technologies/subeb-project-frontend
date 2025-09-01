import { useState, useEffect, useCallback } from 'react';
import { searchStudents } from '../api';
import { PerformanceStudent } from '../types/studentsDashboardResponse';

interface SearchParams {
  lgaId?: string;
  schoolId?: string;
  classId?: string;
  gender?: string;
  subject?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

interface SearchResponse {
  students: PerformanceStudent[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  filters: {
    availableSchools?: Array<{ id: string; name: string }>;
    availableClasses?: Array<{ id: string; name: string }>;
    availableGenders?: string[];
  };
}

export const useStudentSearch = () => {
  const [searchParams, setSearchParams] = useState<SearchParams>({
    page: 1,
    limit: 10,
    sortBy: 'position',
    sortOrder: 'asc'
  });
  
  const [data, setData] = useState<SearchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Progressive filter states
  const [availableSchools, setAvailableSchools] = useState<Array<{ id: string; name: string }>>([]);
  const [availableClasses, setAvailableClasses] = useState<Array<{ id: string; name: string }>>([]);
  const [availableGenders, setAvailableGenders] = useState<string[]>([]);

  const performSearch = useCallback(async (params: SearchParams) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await searchStudents(params);
      setData(response);
      
      // Update available filters based on response
      if (response.filters) {
        if (response.filters.availableSchools) {
          setAvailableSchools(response.filters.availableSchools);
        }
        if (response.filters.availableClasses) {
          setAvailableClasses(response.filters.availableClasses);
        }
        if (response.filters.availableGenders) {
          setAvailableGenders(response.filters.availableGenders);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search students');
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Update search parameters and trigger search
  const updateSearchParams = useCallback((newParams: Partial<SearchParams>) => {
    const updatedParams = { ...searchParams, ...newParams, page: 1 }; // Reset to page 1 when filters change
    setSearchParams(updatedParams);
    performSearch(updatedParams);
  }, [searchParams, performSearch]);

  // Progressive filter functions
  const selectLGA = useCallback((lgaId: string) => {
    updateSearchParams({ lgaId, schoolId: undefined, classId: undefined, gender: undefined });
  }, [updateSearchParams]);

  const selectSchool = useCallback((schoolId: string) => {
    updateSearchParams({ schoolId, classId: undefined, gender: undefined });
  }, [updateSearchParams]);

  const selectClass = useCallback((classId: string) => {
    updateSearchParams({ classId, gender: undefined });
  }, [updateSearchParams]);

  const selectGender = useCallback((gender: string) => {
    updateSearchParams({ gender });
  }, [updateSearchParams]);

  const updateSearch = useCallback((search: string) => {
    updateSearchParams({ search });
  }, [updateSearchParams]);

  const updateAnySearchParam = useCallback((params: Partial<SearchParams>) => {
    updateSearchParams(params);
  }, [updateSearchParams]);

  const updateSorting = useCallback((sortBy: string, sortOrder: 'asc' | 'desc') => {
    updateSearchParams({ sortBy, sortOrder });
  }, [updateSearchParams]);

  const changePage = useCallback((page: number) => {
    updateSearchParams({ page });
  }, [updateSearchParams]);

  const clearFilters = useCallback(() => {
    const clearedParams = {
      page: 1,
      limit: 10,
      sortBy: 'position',
      sortOrder: 'asc' as const
    };
    setSearchParams(clearedParams);
    setAvailableSchools([]);
    setAvailableClasses([]);
    setAvailableGenders([]);
    performSearch(clearedParams);
  }, [performSearch]);

  // Don't perform initial search on mount - let the component handle initial data
  // useEffect(() => {
  //   performSearch(searchParams);
  // }, []); // Only run on mount

  return {
    // Data
    students: data?.students || [],
    total: data?.total || 0,
    currentPage: data?.page || 1,
    totalPages: data?.totalPages || 0,
    limit: data?.limit || 10,
    
    // States
    loading,
    error,
    searchParams,
    
    // Available filters (progressive)
    availableSchools,
    availableClasses,
    availableGenders,
    
    // Actions
    selectLGA,
    selectSchool,
    selectClass,
    selectGender,
    updateSearch,
    updateAnySearchParam,
    updateSorting,
    changePage,
    clearFilters,
    
    // Check if filters are enabled
    isSchoolEnabled: !!searchParams.lgaId,
    isClassEnabled: !!searchParams.schoolId,
    isGenderEnabled: !!searchParams.classId,
  };
};
