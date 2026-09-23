"use client";
import React, { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { TriangleAlert } from "lucide-react";
import { PerformanceStudent } from "@/services/types/studentsDashboardResponse";
import { StudentsFilters as StudentsFiltersType } from "@/services/types/studentsDashboardResponse";

// Import smaller components
import StudentsHeader from "./StudentsHeader";
import StudentsFilters from "./StudentsFilters";
import StudentsTable from "./StudentsTable";
import EditStudentDialog from "./EditStudentDialog";
import AddStudentDialog from "./AddStudentDialog";
import { buildFilterContextMessage } from "./FilterContextMessage";
import { Button } from "@/components/ui/Button";
import { LoadingModal } from "@/components/ui/LoadingModal";

// Import utility functions
import {
  getScoreColor,
  getScoreBgColor,
  getPositionBadge,
} from "./utils/studentUtils";

import { useStudentSearch } from "@/services/hooks/useStudentSearch";
import { useSessions, useTerms } from "@/services/hooks/useAcademic";

interface StudentsTabProps {
  // Initial data from dashboard
  performanceTable: PerformanceStudent[];
  lgas: Array<{ id: string; name: string }>;
}

const StudentsTab: React.FC<StudentsTabProps> = ({
  performanceTable,
  lgas,
}) => {
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [studentToEdit, setStudentToEdit] = useState<PerformanceStudent | null>(
    null
  );
  // Use the new search hook
  const {
    // Data
    students: searchStudents,
    total: searchTotal,
    // currentPage, // Not used since we removed pagination

    // States
    loading: searchLoading,
    isSearching,
    error: searchError,
    searchParams,

    // Loading states for specific operations
    loadingStates,
    selectedLgaName,
    selectedSchoolName,

    // Available filters (progressive)
    availableSchools,
    availableClasses,

    // Actions
    selectLGA,
    selectSchool,
    selectClass,
    selectSession,
    selectTerm,
    updateSearch,
    clearFilters,
    initializeStudents,

    // Check if filters are enabled
    isSchoolEnabled,
    isClassEnabled,
    isTermEnabled,
  } = useStudentSearch();

  const [searchTerm, setSearchTerm] = useState(searchParams.search || "");
  const [searchSession, setSearchSession] = useState<string>("");
  const [searchTermId, setSearchTermId] = useState<string>("");
  const [sortBy, setSortBy] = useState("position");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  useEffect(() => {
    setSearchTerm(searchParams.search || "");
  }, [searchParams.search]);

  const { data: sessionsData } = useSessions();
  const { data: termsData } = useTerms(searchParams.session);
  const { data: searchTermsData } = useTerms(searchSession || undefined);

  const availableSessions = useMemo(() => sessionsData?.data || [], [sessionsData]);
  const availableTerms = useMemo(() => termsData?.data || [], [termsData]);
  const availableSearchTerms = useMemo(
    () => searchTermsData?.data || [],
    [searchTermsData]
  );

  // Set default searchSession to current/active session
  useEffect(() => {
    if (!searchSession && sessionsData?.data && sessionsData.data.length > 0) {
      const currentSession =
        sessionsData.data.find((s) => s.isCurrent) ||
        sessionsData.data.find((s) => s.status === "OPEN") ||
        sessionsData.data[0];
      if (currentSession) {
        setSearchSession(currentSession.id);
      }
    }
  }, [sessionsData, searchSession]);

  // Set default searchTermId to current/active term within searchSession
  useEffect(() => {
    if (availableSearchTerms.length > 0) {
      const exists = availableSearchTerms.some((t) => t.id === searchTermId);
      if (!searchTermId || !exists) {
        const currentTerm =
          availableSearchTerms.find((t) => t.isCurrent) ||
          availableSearchTerms.find((t) => t.status === "OPEN") ||
          availableSearchTerms[0];
        if (currentTerm) {
          setSearchTermId(currentTerm.id);
        }
      }
    }
  }, [availableSearchTerms, searchTermId]);

  // Initialize with original data on mount
  useEffect(() => {
    initializeStudents(performanceTable);
  }, [performanceTable, initializeStudents]); // Determine if we should use search results or initial data
  const hasActiveFilters = useMemo(() => {
    return (
      searchParams.lgaId ||
      searchParams.schoolId ||
      searchParams.classId ||
      searchParams.search
    );
  }, [searchParams]);

  // Only use search results when filters are applied, otherwise show empty
  const students = useMemo(() => {
    return searchParams.classId || searchParams.search ? searchStudents : [];
  }, [searchParams.classId, searchParams.search, searchStudents]);

  const total = searchParams.classId || searchParams.search ? searchTotal : 0;
  const loading = searchLoading;
  const error = searchError;

  const handleEditStudent = (student: PerformanceStudent) => {
    setStudentToEdit(student);
    setShowEditDialog(true);
  };

  const handleCloseEditDialog = () => {
    setShowEditDialog(false);
    setStudentToEdit(null);
  };

  const handleSaveStudent = (updatedStudent: PerformanceStudent) => {
    // Update the student in the local state
    // This will update the UI immediately while the API call completes
    setStudentToEdit(null);
    setShowEditDialog(false);

    // TODO: You may want to refresh the data or update the students list
    // For now, we'll just close the dialog as the API call handles the update
    console.log("Student updated:", updatedStudent);
  };

  const handleSort = () => {
    // Sorting is disabled when no data is loaded
    // For server-side sorting when class is selected, this can be implemented later
    return;
  };

  const SEARCH_DEBOUNCE_MS = 3000;
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastExecutedSearchRef = useRef<string | undefined>(searchParams.search);

  useEffect(() => {
    lastExecutedSearchRef.current = searchParams.search;
  }, [searchParams.search]);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  const triggerSearchImmediately = useCallback(
    (termToSearch: string, sessionOverride?: string, termOverride?: string) => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
        searchTimeoutRef.current = null;
      }

      const activeSession =
        sessionOverride !== undefined ? sessionOverride : searchSession;
      const activeTerm =
        termOverride !== undefined ? termOverride : searchTermId;

      lastExecutedSearchRef.current = termToSearch;
      updateSearch(termToSearch, activeSession, activeTerm);
    },
    [updateSearch, searchSession, searchTermId]
  );

  const handleSearch = (search: string) => {
    setSearchTerm(search);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      triggerSearchImmediately(search);
    }, SEARCH_DEBOUNCE_MS);
  };

  const handleSearchBlur = (e?: React.FocusEvent<HTMLInputElement>) => {
    const relatedTarget = e?.relatedTarget as HTMLElement | null;
    if (
      relatedTarget?.closest('[data-clear-filters="true"]') ||
      relatedTarget?.closest('[data-clear-search="true"]') ||
      relatedTarget?.closest('[role="listbox"]') ||
      relatedTarget?.closest('[data-radix-popper-content-wrapper]')
    ) {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
        searchTimeoutRef.current = null;
      }
      return;
    }

    if (searchTimeoutRef.current) {
      triggerSearchImmediately(searchTerm);
    }
  };

  const handleSearchClickOutside = (e: MouseEvent | PointerEvent) => {
    const target = e.target as HTMLElement | null;
    if (
      target?.closest('[data-clear-filters="true"]') ||
      target?.closest('[data-clear-search="true"]') ||
      target?.closest('[role="listbox"]') ||
      target?.closest('[data-radix-popper-content-wrapper]')
    ) {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
        searchTimeoutRef.current = null;
      }
      return;
    }

    if (searchTimeoutRef.current) {
      triggerSearchImmediately(searchTerm);
    }
  };

  const handleSearchSubmit = () => {
    triggerSearchImmediately(searchTerm);
  };

  const handleSearchSessionChange = (sessionId: string) => {
    setSearchSession(sessionId);
    setSearchTermId("");
    if (searchTerm.trim()) {
      triggerSearchImmediately(searchTerm, sessionId, "");
    }
  };

  const handleSearchTermChange = (termId: string) => {
    setSearchTermId(termId);
    if (searchTerm.trim()) {
      triggerSearchImmediately(searchTerm, searchSession, termId);
    }
  };

  const handleClearSearch = () => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
      searchTimeoutRef.current = null;
    }
    setSearchTerm("");
    lastExecutedSearchRef.current = "";
    updateSearch("", searchSession, searchTermId);
  };

  const handleClearFilters = () => {
    clearFilters();
    setSortBy("position");
    setSortOrder("asc");
  };

  // Wrapper functions to handle special "all-*" values
  const handleLgaChange = (value: string, name?: string) => {
    if (value === "all-lgas") {
      clearFilters();
    } else {
      const selectedLga = lgas.find((lga) => lga.id === value);
      selectLGA(value, selectedLga?.name || name);
    }
  };

  const handleSchoolChange = (value: string, name?: string) => {
    if (value === "all-schools") {
      // Reset to LGA level - keep LGA selected but clear school/class
      const currentLga = lgas.find((lga) => lga.id === searchParams.lgaId);
      if (currentLga && searchParams.lgaId) {
        selectLGA(searchParams.lgaId, currentLga.name);
      }
    } else {
      const selectedSchool = availableSchools.find(
        (school) => school.id === value
      );
      selectSchool(value, selectedSchool?.name || name);
    }
  };

  const handleClassChange = (value: string) => {
    if (value === "all-classes") {
      // Reset to school level - keep school selected but clear class
      const currentSchool = availableSchools.find(
        (school) => school.id === searchParams.schoolId
      );
      if (currentSchool && searchParams.schoolId) {
        selectSchool(searchParams.schoolId, currentSchool.name);
      }
    } else {
      selectClass(value);
    }
  };

  // Convert searchParams to filters format for the components
  const filtersForComponent: StudentsFiltersType = {
    lga: searchParams.lgaId || "all-lgas",
    school: searchParams.schoolId || "all-schools",
    class: searchParams.classId || "all-classes",
    session: searchParams.session || "all-sessions",
    term: searchParams.term || "all-terms",
  };

  // Get selected class name for the filter context message
  const selectedClassName = useMemo(() => {
    if (!searchParams.classId) return undefined;
    const selectedClass = availableClasses.find(
      (cls) => cls.id === searchParams.classId
    );
    return selectedClass?.name;
  }, [searchParams.classId, availableClasses]);

  const selectedSessionName = useMemo(() => {
    if (!searchParams.session) return undefined;
    const session = availableSessions?.find(s => s.id === searchParams.session);
    return session?.name || searchParams.session;
  }, [searchParams.session, availableSessions]);

  const selectedTermName = useMemo(() => {
    if (!searchParams.term) return undefined;
    const term = availableTerms?.find(t => t.id === searchParams.term);
    return term?.name || searchParams.term;
  }, [searchParams.term, availableTerms]);

  const searchSessionName = useMemo(() => {
    if (!searchSession) return undefined;
    const session = availableSessions?.find((s) => s.id === searchSession);
    return session?.name || searchSession;
  }, [searchSession, availableSessions]);

  const searchTermName = useMemo(() => {
    if (!searchTermId) return undefined;
    const term = availableSearchTerms?.find((t) => t.id === searchTermId);
    return term?.name || searchTermId;
  }, [searchTermId, availableSearchTerms]);

  // Determine if filter context message should be shown
  const shouldShowFilterContext = useMemo(() => {
    // Show when class is selected (full filter path) OR when search is used
    const hasFullFilters =
      searchParams.classId &&
      selectedLgaName &&
      selectedSchoolName &&
      selectedClassName;
    const hasSearchOnly = searchParams.search && searchParams.search.trim();

    return !!(hasFullFilters || hasSearchOnly);
  }, [
    searchParams.classId,
    searchParams.search,
    selectedLgaName,
    selectedSchoolName,
    selectedClassName,
  ]);

  const averageScore = Math.round(
    students.length > 0
      ? students.reduce((sum, student) => sum + student.average, 0) /
          students.length
      : 0
  );

  // Show error state only for search operations
  if (error && hasActiveFilters && students.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto">
          <div className="flex justify-center mb-4">
            <TriangleAlert className="w-16 h-16 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-brand-primary mb-4">
            Error Loading Data
          </h2>
          <p className="text-brand-accent-text mb-6">{error}</p>
          <Button
            onClick={() => window.location.reload()}
            className="bg-brand-primary hover:bg-brand-primary-2 text-brand-primary-contrast"
            size="lg"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Component */}
      <StudentsHeader
        totalStudents={total}
        averageScore={averageScore}
        getScoreColor={getScoreColor}
        onAddStudent={() => setShowAddDialog(true)}
      />

      {/* Filters Component */}
      <StudentsFilters
        filters={filtersForComponent}
        lgas={lgas}
        availableSchools={availableSchools}
        availableClasses={availableClasses}
        availableSessions={availableSessions}
        availableTerms={availableTerms}
        searchTerm={searchTerm}
        isSearching={isSearching}
        onSearchChange={handleSearch}
        onSearchBlur={handleSearchBlur}
        onSearchSubmit={handleSearchSubmit}
        onSearchClickOutside={handleSearchClickOutside}
        searchSession={searchSession}
        searchTermId={searchTermId}
        availableSearchTerms={availableSearchTerms}
        isSearchTermEnabled={Boolean(searchSession && availableSearchTerms.length > 0)}
        onSearchSessionChange={handleSearchSessionChange}
        onSearchTermChange={handleSearchTermChange}
        onClearSearch={handleClearSearch}
        isSchoolEnabled={isSchoolEnabled}
        isClassEnabled={isClassEnabled}
        isTermEnabled={isTermEnabled}
        onLgaChange={handleLgaChange}
        onSchoolChange={handleSchoolChange}
        onClassChange={handleClassChange}
        onSessionChange={selectSession}
        onTermChange={selectTerm}
        onClearFilters={handleClearFilters}
      />

      {/* Table Component */}
      <StudentsTable
        students={students}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSort={handleSort}
        getScoreColor={getScoreColor}
        getScoreBgColor={getScoreBgColor}
        getPositionBadge={getPositionBadge}
        onEditStudent={handleEditStudent}
        hasActiveFilters={!!hasActiveFilters}
        isSearching={isSearching}
        filterContextMessage={
          shouldShowFilterContext
            ? buildFilterContextMessage({
                lgaName: selectedLgaName,
                schoolName: selectedSchoolName,
                className: selectedClassName,
                sessionName: searchParams.search ? searchSessionName : selectedSessionName,
                termName: searchParams.search ? searchTermName : selectedTermName,
                searchTerm: searchParams.search,
              })
            : undefined
        }
      />

      {/* Edit Student Dialog */}
      <EditStudentDialog
        open={showEditDialog}
        student={studentToEdit}
        onOpenChange={handleCloseEditDialog}
        onSave={handleSaveStudent}
      />

      {/* Add Student Dialog */}
      <AddStudentDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
      />

      {/* Loading Modal for progressive filtering and search */}
      <LoadingModal
        isOpen={
          !!(
            loadingStates.lga ||
            loadingStates.school ||
            loadingStates.class ||
            (loading && hasActiveFilters && students.length === 0 && !isSearching)
          )
        }
        message={
          loadingStates.lga
            ? `Fetching the schools under ${selectedLgaName}`
            : loadingStates.school
            ? `Fetching the classes under ${selectedSchoolName}`
            : loadingStates.class
            ? "Fetching students in the selected class"
            : loading && hasActiveFilters
            ? "Loading students data..."
            : "Loading..."
        }
      />
    </div>
  );
};

export default StudentsTab;
