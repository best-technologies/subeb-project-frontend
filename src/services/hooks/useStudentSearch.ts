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

  // Initialize: save original data, but do NOT populate table initially unless full filter or search is active
  const initializeStudents = useCallback(
    (initialStudents: PerformanceStudent[]) => {
      setOriginalStudents(initialStudents);
      const hasActiveResult = Boolean(
        searchParams.search?.trim() ||
        (searchParams.session && searchParams.term && searchParams.lgaId && searchParams.schoolId && searchParams.classId)
      );
      if (!hasActiveResult) {
        setStudents([]);
        setTotalStudents(0);
      }
    },
    [
      searchParams.search,
      searchParams.session,
      searchParams.term,
      searchParams.lgaId,
      searchParams.schoolId,
      searchParams.classId,
      setOriginalStudents,
      setStudents,
      setTotalStudents,
    ]
  );

  // 1. Select Session - clears dependent filters down the chain
  const selectSession = useCallback(
    async (sessionId: string) => {
      setSearchParams((prev) => ({
        ...prev,
        session: sessionId || undefined,
        term: undefined,
        lgaId: undefined,
        schoolId: undefined,
        classId: undefined,
        page: 1,
      }));
      setFilterOptions({ schools: [], classes: [] });
      setSelectedLgaName("");
      setSelectedSchoolName("");
      setSchoolStats(null);
      setStudents([]);
      setTotalStudents(0);
      setTotalPages(1);
    },
    [setSearchParams, setFilterOptions, setSelectedLgaName, setSelectedSchoolName, setSchoolStats, setStudents, setTotalStudents, setTotalPages]
  );

  // 2. Select Term - clears dependent filters down the chain
  const selectTerm = useCallback(
    async (termId: string) => {
      setSearchParams((prev) => ({
        ...prev,
        term: termId || undefined,
        lgaId: undefined,
        schoolId: undefined,
        classId: undefined,
        page: 1,
      }));
      setFilterOptions({ schools: [], classes: [] });
      setSelectedLgaName("");
      setSelectedSchoolName("");
      setSchoolStats(null);
      setStudents([]);
      setTotalStudents(0);
      setTotalPages(1);
    },
    [setSearchParams, setFilterOptions, setSelectedLgaName, setSelectedSchoolName, setSchoolStats, setStudents, setTotalStudents, setTotalPages]
  );

  // 3. Select LGA - fetch schools and clear downstream school/class
  const selectLGA = useCallback(
    async (lgaId: string, lgaName?: string) => {
      if (!lgaId || lgaId.trim() === "" || lgaId === "all-lgas") {
        setSearchParams((prev) => ({
          ...prev,
          lgaId: undefined,
          schoolId: undefined,
          classId: undefined,
          page: 1,
        }));
        setFilterOptions({ schools: [], classes: [] });
        setSelectedLgaName("");
        setSelectedSchoolName("");
        setSchoolStats(null);
        setStudents([]);
        setTotalStudents(0);
        return;
      }

      setLoadingStates((prev) => ({ ...prev, lga: true }));
      setSelectedLgaName(lgaName || "selected LGA");
      setSelectedSchoolName("");
      setSchoolStats(null);
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

          setSearchParams((prev) => ({
            ...prev,
            lgaId,
            schoolId: undefined,
            classId: undefined,
            page: 1,
          }));

          // Keep table clean and guided towards selecting a school
          setStudents([]);
          setTotalStudents(0);
          setTotalPages(1);
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
      setError,
      setFilterOptions,
      setLoadingStates,
      setSchoolStats,
      setSearchParams,
      setSelectedLgaName,
      setSelectedSchoolName,
      setStudents,
      setTotalPages,
      setTotalStudents,
    ]
  );

  // 4. Select School - fetch classes and clear downstream class
  const selectSchool = useCallback(
    async (schoolId: string, schoolName?: string) => {
      if (!schoolId || schoolId === "all-schools") {
        setSearchParams((prev) => ({
          ...prev,
          schoolId: undefined,
          classId: undefined,
          page: 1,
        }));
        setFilterOptions((prev) => ({ ...prev, classes: [] }));
        setSelectedSchoolName("");
        setSchoolStats(null);
        setStudents([]);
        setTotalStudents(0);
        return;
      }

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
            page: 1,
          }));

          // Keep table clean and guided towards selecting a class
          setStudents([]);
          setTotalStudents(0);
          setTotalPages(1);
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
      setError,
      setFilterOptions,
      setLoadingStates,
      setSchoolStats,
      setSearchParams,
      setSelectedSchoolName,
      setStudents,
      setTotalPages,
      setTotalStudents,
    ]
  );

  // 5. Select Class - loads student records into the table
  const selectClass = useCallback(
    async (classId: string) => {
      if (!classId || classId === "all-classes") {
        setSearchParams((prev) => ({
          ...prev,
          classId: undefined,
          page: 1,
        }));
        setStudents([]);
        setTotalStudents(0);
        return;
      }

      setLoadingStates((prev) => ({ ...prev, class: true }));
      setError(null);

      try {
        const response = await searchStudents({
          lgaId: searchParams.lgaId,
          schoolId: searchParams.schoolId,
          classId,
          session: searchParams.session,
          term: searchParams.term,
          page: 1,
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
            page: 1,
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

  // Clear all filters and return to initial unpopulated state
  const clearFilters = useCallback(() => {
    resetFilters();
    setError(null);
  }, [resetFilters]);

  // Search students (by name, exam number, etc.)
  const updateSearch = useCallback(
    async (searchTerm: string, overrideSession?: string, overrideTerm?: string) => {
      const trimmedSearch = searchTerm.trim();
      const sessionToUse = overrideSession !== undefined ? (overrideSession || undefined) : searchParams.session;
      const termToUse = overrideTerm !== undefined ? (overrideTerm || undefined) : searchParams.term;

      if (!trimmedSearch) {
        setSearchParams((prev) => ({
          ...prev,
          search: undefined,
          session: sessionToUse,
          term: termToUse,
          page: 1,
        }));

        // If class is selected, reload class students
        if (searchParams.classId && searchParams.lgaId && searchParams.schoolId) {
          selectClass(searchParams.classId);
        } else {
          // Revert to empty guided state
          setStudents([]);
          setTotalStudents(0);
          setTotalPages(1);
        }
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
      selectClass,
      setSearchParams,
      setStudents,
      setTotalStudents,
      setTotalPages,
    ]
  );

  // Change page
  const changePage = useCallback(
    async (page: number) => {
      if (page === searchParams.page || page < 1 || (totalPages && page > totalPages)) {
        return;
      }

      setSearchParams((prev) => ({ ...prev, page }));

      try {
        setLoadingStates((prev) => ({ ...prev, search: true }));
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
      } finally {
        setLoadingStates((prev) => ({ ...prev, search: false }));
      }
    },
    [searchParams, totalPages, setSearchParams, setStudents, setTotalStudents, setTotalPages]
  );

  // Progressive filter enablement chain:
  // Session -> Term -> LGA -> School -> Class
  const isSessionEnabled = true;
  const isTermEnabled = Boolean(searchParams.session);
  const isLgaEnabled = Boolean(searchParams.session && searchParams.term);
  const isSchoolEnabled = Boolean(searchParams.session && searchParams.term && searchParams.lgaId);
  const isClassEnabled = Boolean(searchParams.session && searchParams.term && searchParams.lgaId && searchParams.schoolId);

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
    isSessionEnabled,
    isTermEnabled,
    isLgaEnabled,
    isSchoolEnabled,
    isClassEnabled,
  };
};
