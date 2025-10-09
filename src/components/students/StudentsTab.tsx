"use client";
import React, { useState, useMemo } from "react";
import { TriangleAlert } from "lucide-react";
import { PerformanceStudent } from "@/services/types/studentsDashboardResponse";
import { StudentsFilters as StudentsFiltersType } from "@/services/types/studentsDashboardResponse";

// Import smaller components
import StudentsHeader from "./StudentsHeader";
import StudentsFilters from "./StudentsFilters";
import StudentsTable from "./StudentsTable";
import StudentDetailsModal from "./StudentDetailsModal";
import EditStudentDialog from "./EditStudentDialog";
import { Button } from "@/components/ui/Button";

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
  const [selectedStudent, setSelectedStudent] =
    useState<PerformanceStudent | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [studentToEdit, setStudentToEdit] = useState<PerformanceStudent | null>(
    null
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("position");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  // const [filters] = useState<StudentsFiltersType>({});
  const studentsPerPage = 10;

  // Use the new search hook
  const {
    // Data
    students: searchStudents,
    total: searchTotal,

    // States
    loading: searchLoading,
    error: searchError,
    searchParams,

    // Available filters (progressive)
    availableSchools,
    availableClasses,

    // Actions
    selectLGA,
    selectSchool,
    selectClass,
    updateSearch,
    updateSorting,
    clearFilters,

    // Check if filters are enabled
    isSchoolEnabled,
    isClassEnabled,
  } = useStudentSearch();

  // Determine if we should use search results or initial data
  const hasActiveFilters = useMemo(() => {
    return (
      searchParams.lgaId ||
      searchParams.schoolId ||
      searchParams.classId ||
      searchParams.search
    );
  }, [searchParams]);

  // Use search results if filters are active, otherwise use initial data
  const students = hasActiveFilters ? searchStudents : performanceTable;
  const total = hasActiveFilters ? searchTotal : performanceTable.length;
  // const currentPageValue = hasActiveFilters ? searchCurrentPage : currentPage;
  // const totalPages = hasActiveFilters
  //   ? searchTotalPages
  //   : Math.ceil(performanceTable.length / studentsPerPage);
  const loading = hasActiveFilters ? searchLoading : false;
  const error = hasActiveFilters ? searchError : null;

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

  const handleViewDetails = (student: PerformanceStudent) => {
    setSelectedStudent(student);
    setShowDetails(true);
  };

  const handleEditStudent = (student: PerformanceStudent) => {
    setStudentToEdit(student);
    setShowEditDialog(true);
  };

  const handleCloseModal = () => {
    setShowDetails(false);
    setSelectedStudent(null);
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
    if (hasActiveFilters) {
      const currentSortOrder = searchParams.sortOrder || "asc";
      const newSortOrder =
        searchParams.sortBy === field && currentSortOrder === "asc"
          ? "desc"
          : "asc";
      updateSorting(field, newSortOrder);
    } else {
      if (sortBy === field) {
        setSortOrder(sortOrder === "asc" ? "desc" : "asc");
      } else {
        setSortBy(field);
        setSortOrder("asc");
      }
    }
  };

  const handleSearch = (search: string) => {
    if (hasActiveFilters) {
      updateSearch(search);
    } else {
      setSearchTerm(search);
      setCurrentPage(1);
    }
  };

  const handleClearFilters = () => {
    if (hasActiveFilters) {
      clearFilters();
    } else {
      setSearchTerm("");
      setSortBy("position");
      setSortOrder("asc");
      setCurrentPage(1);
    }
  };

  // Wrapper functions to handle special "all-*" values
  const handleLgaChange = (value: string) => {
    const lgaId = value === "all-lgas" ? "" : value;
    selectLGA(lgaId);
  };

  const handleSchoolChange = (value: string) => {
    const schoolId = value === "all-schools" ? "" : value;
    selectSchool(schoolId);
  };

  const handleClassChange = (value: string) => {
    const classId = value === "all-classes" ? "" : value;
    selectClass(classId);
  };

  // Convert searchParams to filters format for the components
  const filtersForComponent: StudentsFiltersType = {
    lga: searchParams.lgaId || "all-lgas",
    school: searchParams.schoolId || "all-schools",
    class: searchParams.classId || "all-classes",
  };

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
        searchTerm={hasActiveFilters ? searchParams.search || "" : searchTerm}
        onSearchChange={handleSearch}
        isSchoolEnabled={isSchoolEnabled}
        isClassEnabled={isClassEnabled}
        onLgaChange={handleLgaChange}
        onSchoolChange={handleSchoolChange}
        onClassChange={handleClassChange}
        onClearFilters={handleClearFilters}
      />

      {/* Table Component */}
      <StudentsTable
        students={paginatedStudents}
        sortBy={hasActiveFilters ? searchParams.sortBy || "position" : sortBy}
        sortOrder={
          hasActiveFilters ? searchParams.sortOrder || "asc" : sortOrder
        }
        onSort={handleSort}
        getScoreColor={getScoreColor}
        getScoreBgColor={getScoreBgColor}
        getPositionBadge={getPositionBadge}
        onViewDetails={handleViewDetails}
        onEditStudent={handleEditStudent}
      />

      {/* Student Details Modal */}
      <StudentDetailsModal
        student={selectedStudent}
        isOpen={showDetails}
        onClose={handleCloseModal}
        getScoreColor={getScoreColor}
        getPositionBadge={getPositionBadge}
      />

      {/* Edit Student Dialog */}
      <EditStudentDialog
        open={showEditDialog}
        student={studentToEdit}
        onOpenChange={handleCloseEditDialog}
        onSave={handleSaveStudent}
      />
    </div>
  );
};

export default StudentsTab;
