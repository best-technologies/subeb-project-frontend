import { useState, useCallback } from "react";
import { searchStudents } from "../api";
import { PerformanceStudent, School } from "../types/studentsDashboardResponse";
import {
  useStudentFilterStore,
  SearchParams,
  FilterOptions,
  SchoolStats,
} from "@/store/studentFilterStore";

export type { SearchParams, FilterOptions, SchoolStats };

export const useStudentSearch = () => {
  const {
    searchParams,
    students,
    originalStudents,
    filterOptions,
    schoolStats,
    totalStudents,
    totalPages,
    selectedLgaName,
    selectedSchoolName,
    setSearchParams,
    setStudents,
    setOriginalStudents,
    setFilterOptions,
    setSchoolStats,
    setTotalStudents,
    setTotalPages,
    setSelectedLgaName,
    setSelectedSchoolName,
    resetFilters,
  } = useStudentFilterStore();

  const [error, setError] = useState<string | null>(null);

  // Loading states for different operations (transient, not persisted)
  const [loadingStates, setLoadingStates] = useState({
    lga: false,
    school: false,
    class: false,
    search: false,
  });

  // Initialize with original students data (only populates table if no active filters are stored)
  const initializeStudents = useCallback(
    (initialStudents: PerformanceStudent[]) => {
      setOriginalStudents(initialStudents);
      const hasActive = Boolean(
        searchParams.lgaId ||
        searchParams.schoolId ||
        searchParams.classId ||
        searchParams.search
      );
      if (!hasActive) {
        setStudents(initialStudents);
        setTotalStudents(initialStudents.length);
      }
    },
    [
      searchParams.lgaId,
      searchParams.schoolId,
      searchParams.classId,
      searchParams.search,
      setOriginalStudents,
      setStudents,
      setTotalStudents,
    ]
  );

  // Select LGA - fetch schools
  const selectLGA = useCallback(
    async (lgaId: string, lgaName?: string) => {
      if (!lgaId || lgaId.trim() === "") {
        resetFilters();
        setError(null);
        return;
      }

      setLoadingStates((prev) => ({ ...prev, lga: true }));
      setSelectedLgaName(lgaName || "selected LGA");
      setError(null);

      try {
        const response = await searchStudents({
          lgaId,
        });

        if (response.success && response.data) {
          const schools = response.data.schools || [];
          setFilterOptions({
            schools: schools.map((school: School) => ({
              id: school.id,
              name: school.name,
            })),
            classes: [], // Clear classes when LGA changes
          });

          // Update search params but keep original table data
          setSearchParams((prev) => ({
            ...prev,
            lgaId,
            schoolId: undefined,
            classId: undefined,
          }));

          setStudents(originalStudents);
          setTotalStudents(originalStudents.length);
          setSchoolStats(null);
        } else {
          console.error("Failed to fetch schools:", response.message);
          throw new Error("Unable to load schools. Please try again.");
        }
      } catch (err) {
        console.error("Error fetching schools:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load schools. Please try again."
        );
      } finally {
        setLoadingStates((prev) => ({ ...prev, lga: false }));
      }
    },
    [
      originalStudents,
      resetFilters,
      setError,
      setFilterOptions,
      setLoadingStates,
      setSchoolStats,
      setSearchParams,
      setSelectedLgaName,
      setStudents,
      setTotalStudents,
    ]
  );

  // Select School - fetch classes
  const selectSchool = useCallback(
    async (schoolId: string, schoolName?: string) => {
      if (!schoolId || !searchParams.lgaId) return;

      setLoadingStates((prev) => ({ ...prev, school: true }));
      setSelectedSchoolName(schoolName || "selected school");
      setError(null);

      try {
        const response = await searchStudents({
          lgaId: searchParams.lgaId,
          schoolId,
        });

        if (response.success && response.data) {
          const classes = response.data.classes || [];
          const schoolInfo = response.data.school || {};

          setFilterOptions((prev) => ({
            ...prev,
            classes: classes,
          }));

          setSchoolStats({
            name: schoolInfo.name || schoolName || "",
            code: schoolInfo.code || "",
            totalStudents: schoolInfo.totalStudents || 0,
            genderBreakdown: schoolInfo.genderBreakdown || {
              male: 0,
              female: 0,
            },
          });

          setSearchParams((prev) => ({
            ...prev,
            schoolId,
            classId: undefined,
          }));

          setStudents(originalStudents);
          setTotalStudents(originalStudents.length);
        } else {
          console.error("Failed to fetch classes:", response.message);
          throw new Error("Unable to load classes. Please try again.");
        }
      } catch (err) {
        console.error("Error fetching classes:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load classes. Please try again."
        );
      } finally {
        setLoadingStates((prev) => ({ ...prev, school: false }));
      }
    },
    [
      searchParams.lgaId,
      originalStudents,
      setError,
      setFilterOptions,
      setLoadingStates,
      setSchoolStats,
      setSearchParams,
      setSelectedSchoolName,
      setStudents,
      setTotalStudents,
    ]
  );

  // Select Class - fetch students (final step that updates table)
  const selectClass = useCallback(
    async (classId: string) => {
      if (!classId || !searchParams.lgaId || !searchParams.schoolId) return;

      setLoadingStates((prev) => ({ ...prev, class: true }));
      setError(null);

      try {
        const response = await searchStudents({
          lgaId: searchParams.lgaId,
          schoolId: searchParams.schoolId,
          classId,
          session: searchParams.session,
          term: searchParams.term,
          page: searchParams.page || 1,
          limit: searchParams.limit || 10,
          search: searchParams.search,
          gender: searchParams.gender,
        });

        if (response.success && response.data) {
          const studentsData = response.data.performanceTable || [];
          setStudents(studentsData);

          const pagination = response.data.pagination || {};
          setTotalStudents(pagination.totalItems || studentsData.length);
          setTotalPages(pagination.totalPages || 1);

          setSearchParams((prev) => ({
            ...prev,
            classId,
          }));
        } else {
          console.error("Failed to fetch students:", response.message);
          throw new Error("Unable to load students. Please try again.");
        }
      } catch (err) {
        console.error("Error fetching students:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load students. Please try again."
        );
      } finally {
        setLoadingStates((prev) => ({ ...prev, class: false }));
      }
    },
    [
      searchParams,
      setError,
      setLoadingStates,
      setSearchParams,
      setStudents,
      setTotalPages,
      setTotalStudents,
    ]
  );

  // Clear all filters
  const clearFilters = useCallback(() => {
    resetFilters();
    setError(null);
  }, [resetFilters]);

  const selectSession = useCallback(
    async (sessionId: string) => {
      setSearchParams((prev) => ({ ...prev, session: sessionId, term: undefined }));
      if (!searchParams.classId) return;

      try {
        setLoadingStates((prev) => ({ ...prev, class: true }));
        const response = await searchStudents({
          ...searchParams,
          session: sessionId,
          term: undefined,
        });

        if (response.success && response.data) {
          setStudents(response.data.performanceTable || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingStates((prev) => ({ ...prev, class: false }));
      }
    },
    [searchParams, setSearchParams, setStudents]
  );

  const selectTerm = useCallback(
    async (termId: string) => {
      setSearchParams((prev) => ({ ...prev, term: termId }));
      if (!searchParams.classId) return;

      try {
        setLoadingStates((prev) => ({ ...prev, class: true }));
        const response = await searchStudents({
          ...searchParams,
          term: termId,
        });

        if (response.success && response.data) {
          setStudents(response.data.performanceTable || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingStates((prev) => ({ ...prev, class: false }));
      }
    },
    [searchParams, setSearchParams, setStudents]
  );

  const updateSearch = useCallback(
    async (searchTerm: string, overrideSession?: string, overrideTerm?: string) => {
      const trimmedSearch = searchTerm.trim();
      const sessionToUse = overrideSession !== undefined ? (overrideSession || undefined) : searchParams.session;
      const termToUse = overrideTerm !== undefined ? (overrideTerm || undefined) : searchParams.term;

      if (!searchParams.classId && !trimmedSearch) {
        setSearchParams((prev) => ({
          ...prev,
          search: undefined,
          session: sessionToUse,
          term: termToUse,
          page: 1,
        }));
        setStudents(originalStudents);
        setTotalStudents(originalStudents.length);
        setTotalPages(1);
        return;
      }

      const searchParamValue = trimmedSearch || undefined;
      setSearchParams((prev) => ({
        ...prev,
        search: searchParamValue,
        session: sessionToUse,
        term: termToUse,
        page: 1,
      }));

      try {
        setLoadingStates((prev) => ({ ...prev, search: true }));
        const response = await searchStudents({
          ...searchParams,
          session: sessionToUse,
          term: termToUse,
          search: searchParamValue,
          page: 1,
        });

        if (response.success && response.data) {
          const studentsData = response.data.performanceTable || [];
          setStudents(studentsData);

          const pagination = response.data.pagination || {};
          setTotalStudents(pagination.totalItems || studentsData.length);
          setTotalPages(pagination.totalPages || 1);
        }
      } catch (err) {
        console.error("Error searching students:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Unable to search students. Please try again."
        );
      } finally {
        setLoadingStates((prev) => ({ ...prev, search: false }));
      }
    },
    [
      searchParams,
      originalStudents,
      setSearchParams,
      setStudents,
      setTotalStudents,
      setTotalPages,
    ]
  );

  // Change page
  const changePage = useCallback(
    async (page: number) => {
      if (
        (!searchParams.classId && !searchParams.search) ||
        page === searchParams.page
      )
        return;

      setSearchParams((prev) => ({ ...prev, page }));

      try {
        const response = await searchStudents({
          ...searchParams,
          page,
        });

        if (response.success && response.data) {
          const studentsData = response.data.performanceTable || [];
          setStudents(studentsData);

          const pagination = response.data.pagination || {};
          setTotalStudents(pagination.totalItems || studentsData.length);
          setTotalPages(pagination.totalPages || 1);
        }
      } catch (err) {
        console.error("Error loading page:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load page. Please try again."
        );
      }
    },
    [searchParams, setSearchParams, setStudents, setTotalStudents, setTotalPages]
  );

  return {
    // Data
    students,
    total: totalStudents,
    currentPage: searchParams.page || 1,
    totalPages,

    // States
    loading: Object.values(loadingStates).some(Boolean),
    isSearching: loadingStates.search,
    error,
    searchParams,

    // Loading states for specific operations
    loadingStates,
    selectedLgaName,
    selectedSchoolName,

    // Available filters (progressive)
    availableSchools: filterOptions.schools,
    availableClasses: filterOptions.classes,
    schoolStats,

    // Actions
    selectLGA,
    selectSchool,
    selectClass,
    selectSession,
    selectTerm,
    updateSearch,
    changePage,
    clearFilters,
    initializeStudents,

    // Check if filters are enabled
    isSchoolEnabled: !!searchParams.lgaId,
    isClassEnabled: !!searchParams.schoolId,
    isTermEnabled: !!searchParams.session,
  };
};
