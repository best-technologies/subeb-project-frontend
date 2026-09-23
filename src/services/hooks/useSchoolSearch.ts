import { useState, useCallback, useEffect, useRef } from "react";
import { getSchoolsDirectory } from "../api";
import {
  SchoolDirectoryItem,
  SchoolQueryParams,
  SchoolsPagination,
} from "../types/schoolsDirectoryResponse";

export type SchoolFilterStage = "STAGE_1_NEEDS_SESSION" | "STAGE_2_NEEDS_TERM" | "STAGE_3_READY";

export interface SchoolFilterParams {
  session?: string;
  term?: string;
  lgaId?: string;
  search?: string;
  page: number;
  limit: number;
}

export const useSchoolSearch = () => {
  const [params, setParams] = useState<SchoolFilterParams>({
    session: undefined,
    term: undefined,
    lgaId: undefined,
    search: undefined,
    page: 1,
    limit: 10,
  });

  const [schools, setSchools] = useState<SchoolDirectoryItem[]>([]);
  const [pagination, setPagination] = useState<SchoolsPagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
    nextPage: null,
    previousPage: null,
    startIndex: 0,
    endIndex: 0,
  });

  const [loading, setLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // LGA metadata for friendly messages
  const [selectedLgaName, setSelectedLgaName] = useState<string>("");

  // Determine stage of filtering
  const filterStage: SchoolFilterStage = (params.search && params.search.trim().length > 0)
    ? "STAGE_3_READY"
    : !params.session
    ? "STAGE_1_NEEDS_SESSION"
    : !params.term
    ? "STAGE_2_NEEDS_TERM"
    : "STAGE_3_READY";

  const isSessionEnabled = true;
  const isTermEnabled = Boolean(params.session);
  const isLgaEnabled = Boolean(params.session && params.term);

  // Fetch function
  const fetchSchools = useCallback(
    async (queryParams: SchoolFilterParams) => {
      // If neither searching nor stage 3 ready, don't query
      const isSearchActive = Boolean(queryParams.search && queryParams.search.trim().length > 0);
      const isPeriodSelected = Boolean(queryParams.session && queryParams.term);

      if (!isSearchActive && !isPeriodSelected) {
        setSchools([]);
        setPagination({
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
          nextPage: null,
          previousPage: null,
          startIndex: 0,
          endIndex: 0,
        });
        return;
      }

      try {
        setLoading(true);
        setError(null);
        if (isSearchActive) {
          setIsSearching(true);
        }

        const res = await getSchoolsDirectory({
          session: queryParams.session,
          term: queryParams.term,
          lgaId: queryParams.lgaId && queryParams.lgaId !== "all-lgas" ? queryParams.lgaId : undefined,
          search: queryParams.search?.trim() || undefined,
          page: queryParams.page,
          limit: queryParams.limit,
        });

        if (res.success && res.data) {
          setSchools(res.data.data || []);
          setPagination(res.data.pagination);
        }
      } catch (err: any) {
        console.error("Failed to load schools:", err);
        setError(err.message || "Failed to load schools.");
      } finally {
        setLoading(false);
        setIsSearching(false);
      }
    },
    []
  );

  // Debounce ref for search queries
  const searchDebounceRef = useRef<NodeJS.Timeout | null>(null);

  // Re-fetch when params change
  useEffect(() => {
    if (params.search !== undefined) {
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
      searchDebounceRef.current = setTimeout(() => {
        fetchSchools(params);
      }, 350);
      return () => {
        if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
      };
    } else {
      fetchSchools(params);
    }
  }, [params, fetchSchools]);

  // Actions
  const selectSession = useCallback((sessionId: string) => {
    setParams((prev) => ({
      ...prev,
      session: sessionId || undefined,
      term: undefined,
      lgaId: undefined,
      page: 1,
    }));
    setSelectedLgaName("");
  }, []);

  const selectTerm = useCallback((termId: string) => {
    setParams((prev) => ({
      ...prev,
      term: termId || undefined,
      lgaId: undefined,
      page: 1,
    }));
    setSelectedLgaName("");
  }, []);

  const selectLga = useCallback((lgaId: string, lgaName?: string) => {
    setParams((prev) => ({
      ...prev,
      lgaId: lgaId && lgaId !== "all-lgas" ? lgaId : undefined,
      page: 1,
    }));
    setSelectedLgaName(lgaId && lgaId !== "all-lgas" ? (lgaName || "") : "");
  }, []);

  const updateSearch = useCallback((searchTerm: string) => {
    setParams((prev) => ({
      ...prev,
      search: searchTerm.trim() ? searchTerm : undefined,
      page: 1,
    }));
  }, []);

  const changePage = useCallback((newPage: number) => {
    setParams((prev) => ({
      ...prev,
      page: newPage,
    }));
  }, []);

  const clearFilters = useCallback(() => {
    setParams({
      session: undefined,
      term: undefined,
      lgaId: undefined,
      search: undefined,
      page: 1,
      limit: 10,
    });
    setSelectedLgaName("");
    setSchools([]);
  }, []);

  return {
    schools,
    pagination,
    params,
    filterStage,
    loading,
    isSearching,
    error,
    selectedLgaName,
    isSessionEnabled,
    isTermEnabled,
    isLgaEnabled,
    selectSession,
    selectTerm,
    selectLga,
    updateSearch,
    changePage,
    clearFilters,
    refetch: () => fetchSchools(params),
  };
};
