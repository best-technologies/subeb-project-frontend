"use client";
import React, { useState, useMemo, useEffect } from "react";
import { TriangleAlert } from "lucide-react";
import { PerformanceStudent } from "@/services/types/studentsDashboardResponse";
import { StudentsFilters as StudentsFiltersType } from "@/services/types/studentsDashboardResponse";

// Import smaller components
import StudentsHeader from "./StudentsHeader";
import StudentsFilters from "./StudentsFilters";
import StudentsTable from "./StudentsTable";
import EditStudentDialog from "./EditStudentDialog";
import FilterContextMessage from "./FilterContextMessage";
import { Button } from "@/components/ui/Button";
import { LoadingModal } from "@/components/ui/LoadingModal";

// Import utility functions
import {
  getScoreColor,
  getScoreBgColor,
  getPositionBadge,
} from "./utils/studentUtils";

// Import the new search hook
import { useStudentSearch } from "@/services/hooks/useStudentSearch";

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
  const [studentToEdit, setStudentToEdit] = useState<PerformanceStudent | null>(
    null
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("position");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // Use the new search hook
  const {
    // Data
    students: searchStudents,
    total: searchTotal,
    // currentPage, // Not used since we removed pagination

    // States
    loading: searchLoading,
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
    updateSearch,
    clearFilters,
    initializeStudents,

    // Check if filters are enabled
    isSchoolEnabled,
    isClassEnabled,
  } = useStudentSearch();

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
    return searchParams.classId ? searchStudents : [];
  }, [searchParams.classId, searchStudents]);

  const total = searchParams.classId ? searchTotal : 0;
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

  const handleSearch = (search: string) => {
    setSearchTerm(search);
    if (searchParams.classId) {
      // Use server-side search when class is selected
      updateSearch(search);
    }
  };

  const handleClearFilters = () => {
    clearFilters();
    setSearchTerm("");
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
  };

  // Get selected class name for the filter context message
  const selectedClassName = useMemo(() => {
    if (!searchParams.classId) return undefined;
    const selectedClass = availableClasses.find(
      (cls) => cls.id === searchParams.classId
    );
    return selectedClass?.name;
  }, [searchParams.classId, availableClasses]);

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
      />

      {/* Filters Component */}
      <StudentsFilters
        filters={filtersForComponent}
        lgas={lgas}
        availableSchools={availableSchools}
        availableClasses={availableClasses}
        searchTerm={
          searchParams.classId ? searchParams.search || "" : searchTerm
        }
        onSearchChange={handleSearch}
        isSchoolEnabled={isSchoolEnabled}
        isClassEnabled={isClassEnabled}
        onLgaChange={handleLgaChange}
        onSchoolChange={handleSchoolChange}
        onClassChange={handleClassChange}
        onClearFilters={handleClearFilters}
      />

      {/* Filter Context Message */}
      <FilterContextMessage
        lgaName={selectedLgaName}
        schoolName={selectedSchoolName}
        className={selectedClassName}
        searchTerm={searchParams.classId ? searchParams.search : searchTerm}
        isVisible={shouldShowFilterContext}
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
      />

      {/* Edit Student Dialog */}
      <EditStudentDialog
        open={showEditDialog}
        student={studentToEdit}
        onOpenChange={handleCloseEditDialog}
        onSave={handleSaveStudent}
      />

      {/* Loading Modal for progressive filtering and search */}
      <LoadingModal
        isOpen={
          !!(
            loadingStates.lga ||
            loadingStates.school ||
            loadingStates.class ||
            (loading && hasActiveFilters && students.length === 0)
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
