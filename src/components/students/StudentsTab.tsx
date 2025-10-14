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
  // const [filters] = useState<StudentsFiltersType>({});
  const studentsPerPage = 10;

  // Use the new search hook
  const {
    // Data
    students: searchStudents,
    total: searchTotal,
    currentPage,
    // totalPages, // Unused variable

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
    // schoolStats, // Unused variable

    // Actions
    selectLGA,
    selectSchool,
    selectClass,
    updateSearch,
    // changePage, // Unused variable
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

  // Use search results if class is selected, otherwise use initial data
  const students = searchParams.classId ? searchStudents : performanceTable;
  const total = searchParams.classId ? searchTotal : performanceTable.length;
  const loading = searchLoading;
  const error = searchError;

  // Client-side filtering for initial data
  const filteredAndSortedStudents = useMemo(() => {
    if (hasActiveFilters) return students; // Use search results

    if (!performanceTable || !Array.isArray(performanceTable)) {
      return [];
    }

    const filtered = performanceTable.filter((student) => {
      const search = searchTerm.trim().toLowerCase();
      return (
        student.studentName.trim().toLowerCase().includes(search) ||
        student.examNo.trim().toLowerCase().includes(search) ||
        student.school.trim().toLowerCase().includes(search) ||
        student.class.trim().toLowerCase().includes(search)
      );
    });

    // Sort students
    filtered.sort((a, b) => {
      let aValue: string | number, bValue: string | number;

      if (sortBy === "position") {
        aValue = a.position;
        bValue = b.position;
      } else if (sortBy === "studentName") {
        aValue = a.studentName;
        bValue = b.studentName;
      } else if (sortBy === "examNo") {
        aValue = a.examNo;
        bValue = b.examNo;
      } else if (sortBy === "school") {
        aValue = a.school;
        bValue = b.school;
      } else if (sortBy === "class") {
        aValue = a.class;
        bValue = b.class;
      } else if (sortBy === "total") {
        aValue = a.total;
        bValue = b.total;
      } else if (sortBy === "average") {
        aValue = a.average;
        bValue = b.average;
      } else if (sortBy === "percentage") {
        aValue = a.percentage;
        bValue = b.percentage;
      } else {
        aValue = a[sortBy as keyof PerformanceStudent] as string | number;
        bValue = b[sortBy as keyof PerformanceStudent] as string | number;
      }

      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortOrder === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      return sortOrder === "asc"
        ? (aValue as number) - (bValue as number)
        : (bValue as number) - (aValue as number);
    });

    return filtered;
  }, [
    performanceTable,
    searchTerm,
    sortBy,
    sortOrder,
    hasActiveFilters,
    students,
  ]);

  // Pagination for client-side data
  const paginatedStudents = useMemo(() => {
    if (hasActiveFilters) return students; // Use search results

    const startIndex = (currentPage - 1) * studentsPerPage;
    const endIndex = startIndex + studentsPerPage;
    return filteredAndSortedStudents.slice(startIndex, endIndex);
  }, [filteredAndSortedStudents, currentPage, hasActiveFilters, students]);

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

  const handleSort = (field: string) => {
    // Only do client-side sorting when no class is selected
    if (!searchParams.classId) {
      if (sortBy === field) {
        setSortOrder(sortOrder === "asc" ? "desc" : "asc");
      } else {
        setSortBy(field);
        setSortOrder("asc");
      }
    }
    // For server-side sorting when class is selected, this can be implemented later
  };

  const handleSearch = (search: string) => {
    setSearchTerm(search);
    if (searchParams.classId) {
      // Use server-side search when class is selected
      updateSearch(search);
    }
    // For client-side search, the useMemo will handle the filtering
  };

  const handleClearFilters = () => {
    if (searchParams.classId || searchParams.lgaId || searchParams.schoolId) {
      clearFilters();
    } else {
      setSearchTerm("");
      setSortBy("position");
      setSortOrder("asc");
    }
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
    const hasClientSideSearch =
      !searchParams.classId && searchTerm && searchTerm.trim();

    return !!(hasFullFilters || hasSearchOnly || hasClientSideSearch);
  }, [
    searchParams.classId,
    searchParams.search,
    selectedLgaName,
    selectedSchoolName,
    selectedClassName,
    searchTerm,
  ]);

  const averageScore = Math.round(
    students.length > 0
      ? students.reduce((sum, student) => sum + student.average, 0) /
          students.length
      : 0
  );

  // Show loading state only for search operations
  if (loading && hasActiveFilters && students.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-brand-primary mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-brand-primary mb-2">
            Loading Students Data
          </h2>
          <p className="text-brand-accent-text">
            Please wait while we fetch the latest information...
          </p>
        </div>
      </div>
    );
  }

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
        students={paginatedStudents}
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

      {/* Loading Modal for progressive filtering */}
      <LoadingModal
        isOpen={
          loadingStates.lga || loadingStates.school || loadingStates.class
        }
        message={
          loadingStates.lga
            ? `Fetching the schools under ${selectedLgaName}`
            : loadingStates.school
            ? `Fetching the classes under ${selectedSchoolName}`
            : loadingStates.class
            ? "Fetching students in the selected class"
            : "Loading..."
        }
      />
    </div>
  );
};

export default StudentsTab;
