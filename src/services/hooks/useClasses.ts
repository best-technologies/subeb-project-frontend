import { useState, useCallback, useEffect, useRef } from "react";
import {
  getClasses,
  getClassAnalytics,
  createClass as apiCreateClass,
  updateClass as apiUpdateClass,
  deleteClass as apiDeleteClass,
} from "../api/classes";
import {
  ClassItem,
  ClassPagination,
  ClassQueryParams,
  ClassAnalyticsData,
  ClassAnalyticsQueryParams,
  CreateClassRequest,
  UpdateClassRequest,
} from "../types/classResponse";

export interface ClassFilterParams {
  page: number;
  limit: number;
  search?: string;
  lgaId?: string;
  schoolId?: string;
  grade?: string;
  academicYear?: string;
}

export const useClasses = () => {
  const [params, setParams] = useState<ClassFilterParams>({
    page: 1,
    limit: 10,
    search: undefined,
    lgaId: undefined,
    schoolId: undefined,
    grade: undefined,
    academicYear: undefined,
  });

  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [pagination, setPagination] = useState<ClassPagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });

  const [loading, setLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Friendly names for filter tags
  const [selectedLgaName, setSelectedLgaName] = useState<string>("");
  const [selectedSchoolName, setSelectedSchoolName] = useState<string>("");

  const searchDebounceRef = useRef<NodeJS.Timeout | null>(null);

  const fetchClassesData = useCallback(
    async (currentParams: ClassFilterParams) => {
      setLoading(true);
      setError(null);

      try {
        const queryParams: ClassQueryParams = {
          page: currentParams.page,
          limit: currentParams.limit,
          search: currentParams.search,
          lgaId: currentParams.lgaId,
          schoolId: currentParams.schoolId,
          grade: currentParams.grade,
          academicYear: currentParams.academicYear,
        };

        const response = await getClasses(queryParams);

        if (response.success && response.data) {
          setClasses(response.data.classes || []);
          setPagination(
            response.data.pagination || {
              page: currentParams.page,
              limit: currentParams.limit,
              total: 0,
              totalPages: 1,
            }
          );
        } else {
          setClasses([]);
          setError(response.message || "Failed to load classes.");
        }
      } catch (err: any) {
        console.error("Classes fetch error:", err);
        setError(err.message || "Unable to load classes directory.");
        setClasses([]);
      } finally {
        setLoading(false);
        setIsSearching(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchClassesData(params);
  }, [params, fetchClassesData]);

  const selectLga = useCallback((lgaId?: string, lgaName?: string) => {
    setSelectedLgaName(lgaName || "");
    // Reset school when LGA changes
    setSelectedSchoolName("");
    setParams((prev) => ({
      ...prev,
      lgaId: lgaId || undefined,
      schoolId: undefined,
      page: 1,
    }));
  }, []);

  const selectSchool = useCallback((schoolId?: string, schoolName?: string) => {
    setSelectedSchoolName(schoolName || "");
    setParams((prev) => ({
      ...prev,
      schoolId: schoolId || undefined,
      page: 1,
    }));
  }, []);

  const selectGrade = useCallback((grade?: string) => {
    setParams((prev) => ({
      ...prev,
      grade: grade && grade !== "ALL_GRADES" ? grade : undefined,
      page: 1,
    }));
  }, []);

  const selectAcademicYear = useCallback((year?: string) => {
    setParams((prev) => ({
      ...prev,
      academicYear: year && year !== "ALL_YEARS" ? year : undefined,
      page: 1,
    }));
  }, []);

  const updateSearch = useCallback(
    (term: string) => {
      setIsSearching(true);
      if (searchDebounceRef.current) {
        clearTimeout(searchDebounceRef.current);
      }

      searchDebounceRef.current = setTimeout(() => {
        setParams((prev) => ({
          ...prev,
          search: term.trim() ? term.trim() : undefined,
          page: 1,
        }));
      }, 400);
    },
    []
  );

  const changePage = useCallback((newPage: number) => {
    setParams((prev) => ({
      ...prev,
      page: newPage,
    }));
  }, []);

  const changeLimit = useCallback((newLimit: number) => {
    setParams((prev) => ({
      ...prev,
      limit: newLimit,
      page: 1,
    }));
  }, []);

  const clearFilters = useCallback(() => {
    setSelectedLgaName("");
    setSelectedSchoolName("");
    setParams({
      page: 1,
      limit: 10,
      search: undefined,
      lgaId: undefined,
      schoolId: undefined,
      grade: undefined,
      academicYear: undefined,
    });
  }, []);

  const refetch = useCallback(() => {
    fetchClassesData(params);
  }, [fetchClassesData, params]);

  return {
    classes,
    pagination,
    params,
    loading,
    isSearching,
    error,
    selectedLgaName,
    selectedSchoolName,
    selectLga,
    selectSchool,
    selectGrade,
    selectAcademicYear,
    updateSearch,
    changePage,
    changeLimit,
    clearFilters,
    refetch,
  };
};

/**
 * Hook for fetching class analytics
 */
export const useClassAnalytics = (params: ClassAnalyticsQueryParams = {}) => {
  const [data, setData] = useState<ClassAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getClassAnalytics(params);
      if (response.success && response.data) {
        setData(response.data);
      } else {
        setError(response.message || "Failed to load class analytics");
      }
    } catch (err: any) {
      console.error("Class analytics hook error:", err);
      setError(err.message || "Error loading class analytics");
    } finally {
      setLoading(false);
    }
  }, [params.session, params.term, params.lgaId, params.schoolId]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return {
    data,
    loading,
    error,
    refetch: fetchAnalytics,
  };
};
