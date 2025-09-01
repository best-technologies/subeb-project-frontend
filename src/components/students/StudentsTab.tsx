'use client';
import React, { useState, useMemo } from 'react';
import { PerformanceStudent } from '@/services/types/studentsDashboardResponse';
import { StudentsFilters as StudentsFiltersType } from '@/services/types/studentsDashboardResponse';

// Import smaller components
import StudentsHeader from './StudentsHeader';
import StudentsFilters from './StudentsFilters';
import StudentsSearch from './StudentsSearch';
import StudentsTable from './StudentsTable';
import StudentDetailsModal from './StudentDetailsModal';

// Import utility functions
import { getScoreColor, getScoreBgColor, getPositionBadge } from './utils/studentUtils';

// Import the new search hook
import { useStudentSearch } from '@/services/hooks/useStudentSearch';

interface StudentsTabProps {
  // Initial data from dashboard
  performanceTable: PerformanceStudent[];
  lgas: Array<{ id: string; name: string }>;
  subjects: string[];
}

const StudentsTab: React.FC<StudentsTabProps> = ({ 
  performanceTable,
  lgas, 
  subjects
}) => {
  const [selectedStudent, setSelectedStudent] = useState<PerformanceStudent | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('position');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<StudentsFiltersType>({});
  const studentsPerPage = 10;

  // Use the new search hook
  const {
    // Data
    students: searchStudents,
    total: searchTotal,
    currentPage: searchCurrentPage,
    totalPages: searchTotalPages,
    limit,
    
    // States
    loading: searchLoading,
    error: searchError,
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
    isSchoolEnabled,
    isClassEnabled,
    isGenderEnabled,
  } = useStudentSearch();

  // Determine if we should use search results or initial data
  const hasActiveFilters = useMemo(() => {
    return searchParams.lgaId || searchParams.schoolId || searchParams.classId || 
           searchParams.gender || searchParams.subject || searchParams.search;
  }, [searchParams]);

  // Use search results if filters are active, otherwise use initial data
  const students = hasActiveFilters ? searchStudents : performanceTable;
  const total = hasActiveFilters ? searchTotal : performanceTable.length;
  const currentPageValue = hasActiveFilters ? searchCurrentPage : currentPage;
  const totalPages = hasActiveFilters ? searchTotalPages : Math.ceil(performanceTable.length / studentsPerPage);
  const loading = hasActiveFilters ? searchLoading : false;
  const error = hasActiveFilters ? searchError : null;

  // Client-side filtering for initial data
  const filteredAndSortedStudents = useMemo(() => {
    if (hasActiveFilters) return students; // Use search results

    if (!performanceTable || !Array.isArray(performanceTable)) {
      return [];
    }
    
    const filtered = performanceTable.filter(student => {
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

      if (sortBy === 'position') {
        aValue = a.position;
        bValue = b.position;
      } else if (sortBy === 'studentName') {
        aValue = a.studentName;
        bValue = b.studentName;
      } else if (sortBy === 'examNo') {
        aValue = a.examNo;
        bValue = b.examNo;
      } else if (sortBy === 'school') {
        aValue = a.school;
        bValue = b.school;
      } else if (sortBy === 'class') {
        aValue = a.class;
        bValue = b.class;
      } else if (sortBy === 'total') {
        aValue = a.total;
        bValue = b.total;
      } else if (sortBy === 'average') {
        aValue = a.average;
        bValue = b.average;
      } else if (sortBy === 'percentage') {
        aValue = a.percentage;
        bValue = b.percentage;
      } else {
        aValue = a[sortBy as keyof PerformanceStudent] as string | number;
        bValue = b[sortBy as keyof PerformanceStudent] as string | number;
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortOrder === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      return sortOrder === 'asc' ? (aValue as number) - (bValue as number) : (bValue as number) - (aValue as number);
    });

    return filtered;
  }, [performanceTable, searchTerm, sortBy, sortOrder, hasActiveFilters, students]);

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

  const handleCloseModal = () => {
    setShowDetails(false);
    setSelectedStudent(null);
  };

  const handleSort = (field: string) => {
    if (hasActiveFilters) {
      const currentSortOrder = searchParams.sortOrder || 'asc';
      const newSortOrder = searchParams.sortBy === field && currentSortOrder === 'asc' ? 'desc' : 'asc';
      updateSorting(field, newSortOrder);
    } else {
      if (sortBy === field) {
        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
      } else {
        setSortBy(field);
        setSortOrder('asc');
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

  const handlePageChange = (page: number) => {
    if (hasActiveFilters) {
      changePage(page);
    } else {
      setCurrentPage(page);
    }
  };

  const handleClearFilters = () => {
    if (hasActiveFilters) {
      clearFilters();
    } else {
      setSearchTerm('');
      setSortBy('position');
      setSortOrder('asc');
      setCurrentPage(1);
      setFilters({});
    }
  };

  // Convert searchParams to filters format for the components
  const filtersForComponent: StudentsFiltersType = {
    lga: searchParams.lgaId,
    school: searchParams.schoolId,
    class: searchParams.classId,
    gender: searchParams.gender,
    subject: searchParams.subject,
  };

  const averageScore = Math.round(
    students.length > 0 
      ? students.reduce((sum, student) => sum + student.average, 0) / students.length
      : 0
  );

  // Show loading state only for search operations
  if (loading && hasActiveFilters && students.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-white mb-2">Loading Students Data</h2>
          <p className="text-gray-400">Please wait while we fetch the latest information...</p>
        </div>
      </div>
    );
  }

  // Show error state only for search operations
  if (error && hasActiveFilters && students.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-white mb-4">Error Loading Data</h2>
          <p className="text-gray-400 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
          >
            Try Again
          </button>
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
        availableGenders={availableGenders}
        subjects={subjects}
        isSchoolEnabled={isSchoolEnabled}
        isClassEnabled={isClassEnabled}
        isGenderEnabled={isGenderEnabled}
        onLgaChange={selectLGA}
        onSchoolChange={selectSchool}
        onClassChange={selectClass}
        onGenderChange={selectGender}
        onSubjectChange={(subject) => updateAnySearchParam({ subject: subject || undefined })}
        onClearFilters={handleClearFilters}
      />

      {/* Search and Pagination Component */}
      <StudentsSearch
        searchTerm={hasActiveFilters ? (searchParams.search || '') : searchTerm}
        onSearchChange={handleSearch}
        currentPage={currentPageValue}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        loading={loading}
      />

      {/* Table Component */}
      <StudentsTable
        students={paginatedStudents}
        sortBy={hasActiveFilters ? (searchParams.sortBy || 'position') : sortBy}
        sortOrder={hasActiveFilters ? (searchParams.sortOrder || 'asc') : sortOrder}
        onSort={handleSort}
        getScoreColor={getScoreColor}
        getScoreBgColor={getScoreBgColor}
        getPositionBadge={getPositionBadge}
        onViewDetails={handleViewDetails}
      />

      {/* Student Details Modal */}
      <StudentDetailsModal
        student={selectedStudent}
        isOpen={showDetails}
        onClose={handleCloseModal}
        getScoreColor={getScoreColor}
        getPositionBadge={getPositionBadge}
      />
    </div>
  );
};

export default StudentsTab; 