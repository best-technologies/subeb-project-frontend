import { useState, useCallback } from "react";
import { searchStudents } from "../api";
import { PerformanceStudent } from "../types/studentsDashboardResponse";

interface SearchParams {
  session?: string;
  term?: string;
  lgaId?: string;
  schoolId?: string;
  classId?: string;
  gender?: string;
  search?: string;
  page?: number;
  limit?: number;
}

interface FilterOptions {
  schools: Array<{ id: string; name: string; code?: string }>;
  classes: Array<{ id: string; name: string }>;
}

interface SchoolStats {
  name: string;
  code: string;
  totalStudents: number;
  genderBreakdown: {
    male: number;
    female: number;
  };
}

export const useStudentSearch = () => {
  const [searchParams, setSearchParams] = useState<SearchParams>({
    session: "2024/2025",
    term: "FIRST_TERM",
    page: 1,
    limit: 10,
  });

  const [students, setStudents] = useState<PerformanceStudent[]>([]);
  const [originalStudents, setOriginalStudents] = useState<
    PerformanceStudent[]
  >([]);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    schools: [],
    classes: [],
  });
  const [schoolStats, setSchoolStats] = useState<SchoolStats | null>(null);
  // const [loading, setLoading] = useState(false); // Unused variable
  const [error, setError] = useState<string | null>(null);
  const [totalStudents, setTotalStudents] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Loading states for different operations
  const [loadingStates, setLoadingStates] = useState({
    lga: false,
    school: false,
    class: false,
  });

  // Store names for loading messages
  const [selectedLgaName, setSelectedLgaName] = useState<string>("");
  const [selectedSchoolName, setSelectedSchoolName] = useState<string>("");

  // Initialize with original students data
  const initializeStudents = useCallback(
    (initialStudents: PerformanceStudent[]) => {
      setOriginalStudents(initialStudents);
      setStudents(initialStudents);
      setTotalStudents(initialStudents.length);
    },
    []
  );

  // Select LGA - fetch schools
  const selectLGA = useCallback(
    async (lgaId: string, lgaName?: string) => {
      if (!lgaId || lgaId.trim() === "") {
        // Clear filters and reset to original data
        setFilterOptions({ schools: [], classes: [] });
        setSchoolStats(null);
        setStudents(originalStudents);
        setTotalStudents(originalStudents.length);
        setSearchParams((prev) => ({
          session: prev.session,
          term: prev.term,
          page: 1,
          limit: 10,
        }));
        setSelectedLgaName("");
        setSelectedSchoolName("");
        return;
      }

      setLoadingStates((prev) => ({ ...prev, lga: true }));
      setSelectedLgaName(lgaName || "selected LGA");
      setError(null);

      try {
        const response = await searchStudents({
          session: searchParams.session,
          term: searchParams.term,
          lgaId,
        });

        if (response.success && response.data) {
          // Extract schools from the response
          const schools = response.data.schools || [];
          setFilterOptions((prev) => ({
            ...prev,
            schools: schools,
            classes: [], // Clear classes when LGA changes
          }));

          // Update search params but keep original table data
          setSearchParams((prev) => ({
            ...prev,
            lgaId,
            schoolId: undefined,
            classId: undefined,
          }));

          // Keep original students data visible
          setStudents(originalStudents);
          setTotalStudents(originalStudents.length);
          setSchoolStats(null);
        } else {
          throw new Error(response.message || "Failed to fetch schools");
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch schools"
        );
        console.error("Error fetching schools:", err);
      } finally {
        setLoadingStates((prev) => ({ ...prev, lga: false }));
      }
    },
    [originalStudents, searchParams.session, searchParams.term]
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
          session: searchParams.session,
          term: searchParams.term,
          lgaId: searchParams.lgaId,
          schoolId,
        });

        if (response.success && response.data) {
          // Extract classes and school stats from the response
          const classes = response.data.classes || [];
          const schoolInfo = response.data.school || {};

          setFilterOptions((prev) => ({
            ...prev,
            classes: classes,
          }));

          // Set school statistics
          setSchoolStats({
            name: schoolInfo.name || schoolName || "",
            code: schoolInfo.code || "",
            totalStudents: schoolInfo.totalStudents || 0,
            genderBreakdown: schoolInfo.genderBreakdown || {
              male: 0,
              female: 0,
            },
          });

          // Update search params but keep original table data
          setSearchParams((prev) => ({
            ...prev,
            schoolId,
            classId: undefined,
          }));

          // Keep original students data visible
          setStudents(originalStudents);
          setTotalStudents(originalStudents.length);
        } else {
          throw new Error(response.message || "Failed to fetch classes");
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch classes"
        );
        console.error("Error fetching classes:", err);
      } finally {
        setLoadingStates((prev) => ({ ...prev, school: false }));
      }
    },
    [
      searchParams.lgaId,
      searchParams.session,
      searchParams.term,
      originalStudents,
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
          session: searchParams.session,
          term: searchParams.term,
          lgaId: searchParams.lgaId,
          schoolId: searchParams.schoolId,
          classId,
          page: searchParams.page || 1,
          limit: searchParams.limit || 10,
          search: searchParams.search,
          gender: searchParams.gender,
        });

        if (response.success && response.data) {
          // NOW update the table with filtered students
          const studentsData = response.data.students || [];
          setStudents(studentsData);
          setTotalStudents(response.data.total || studentsData.length);
          setTotalPages(response.data.totalPages || 1);

          setSearchParams((prev) => ({
            ...prev,
            classId,
          }));
        } else {
          throw new Error(response.message || "Failed to fetch students");
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch students"
        );
        console.error("Error fetching students:", err);
      } finally {
        setLoadingStates((prev) => ({ ...prev, class: false }));
      }
    },
    [searchParams]
  );

  // Clear all filters
  const clearFilters = useCallback(() => {
    setFilterOptions({ schools: [], classes: [] });
    setSchoolStats(null);
    setStudents(originalStudents);
    setTotalStudents(originalStudents.length);
    setTotalPages(1);
    setSearchParams({
      session: "2024/2025",
      term: "FIRST_TERM",
      page: 1,
      limit: 10,
    });
    setSelectedLgaName("");
    setSelectedSchoolName("");
    setError(null);
  }, [originalStudents]);

  // Update search within class
  const updateSearch = useCallback(
    async (searchTerm: string) => {
      if (!searchParams.classId) return;

      setSearchParams((prev) => ({ ...prev, search: searchTerm, page: 1 }));

      try {
        const response = await searchStudents({
          ...searchParams,
          search: searchTerm,
          page: 1,
        });

        if (response.success && response.data) {
          setStudents(response.data.students || []);
          setTotalStudents(response.data.total || 0);
          setTotalPages(response.data.totalPages || 1);
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to search students"
        );
      }
    },
    [searchParams]
  );

  // Change page
  const changePage = useCallback(
    async (page: number) => {
      if (!searchParams.classId || page === searchParams.page) return;

      setSearchParams((prev) => ({ ...prev, page }));

      try {
        const response = await searchStudents({
          ...searchParams,
          page,
        });

        if (response.success && response.data) {
          setStudents(response.data.students || []);
          setTotalStudents(response.data.total || 0);
          setTotalPages(response.data.totalPages || 1);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load page");
      }
    },
    [searchParams]
  );

  return {
    // Data
    students,
    total: totalStudents,
    currentPage: searchParams.page || 1,
    totalPages,

    // States
    loading: Object.values(loadingStates).some(Boolean),
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
    updateSearch,
    changePage,
    clearFilters,
    initializeStudents,

    // Check if filters are enabled
    isSchoolEnabled: !!searchParams.lgaId,
    isClassEnabled: !!searchParams.schoolId,
  };
};
