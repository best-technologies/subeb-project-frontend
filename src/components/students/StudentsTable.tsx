"use client";
import React from "react";
import {
  Users,
  UserX,
  ChevronLeft,
  ChevronRight,
  Info,
  Loader2,
  Calendar,
  Layers,
  MapPin,
  School as SchoolIcon,
  GraduationCap,
  Search,
} from "lucide-react";
import { PerformanceStudent } from "@/services/types/studentsDashboardResponse";
import StudentRow from "./StudentRow";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";

interface StudentsTableProps {
  students: PerformanceStudent[];
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  onSort?: (field: string) => void;
  getScoreColor?: (score: number) => string;
  getScoreBgColor?: (score: number) => string;
  getPositionBadge?: (position: number) => string;
  onEditStudent: (student: PerformanceStudent) => void;
  hasActiveFilters?: boolean;
  isSearching?: boolean;
  filterContextMessage?: string;
  currentPage?: number;
  totalPages?: number;
  totalItems?: number;
  itemsPerPage?: number;
  isTableLoading?: boolean;
  onPageChange?: (page: number) => void;

  // Progressive guidance props
  filterStage?: 1 | 2 | 3 | 4 | 5 | 6;
  selectedSessionName?: string;
  selectedTermName?: string;
  selectedLgaName?: string;
  selectedSchoolName?: string;
  selectedClassName?: string;
  searchTerm?: string;
}

const StudentsTable: React.FC<StudentsTableProps> = ({
  students,
  sortBy,
  sortOrder,
  onSort,
  getScoreColor,
  getScoreBgColor,
  getPositionBadge,
  onEditStudent,
  hasActiveFilters,
  isSearching = false,
  filterContextMessage,
  currentPage = 1,
  totalPages = 1,
  totalItems = 0,
  itemsPerPage = 10,
  isTableLoading = false,
  onPageChange,
  filterStage = 1,
  selectedSessionName,
  selectedTermName,
  selectedLgaName,
  selectedSchoolName,
  selectedClassName,
  searchTerm,
}) => {
  const startItem = totalItems > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const renderEmptyPrompt = () => {
    switch (filterStage) {
      case 1:
        return (
          <div className="max-w-lg mx-auto py-8 text-center flex flex-col items-center">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold mb-3">
              Step 1 of 5 • Session
            </span>
            <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mb-3 text-emerald-700 shadow-2xs">
              <Calendar className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-1">
              Select an Academic Session
            </h3>
            <p className="text-xs text-gray-500 max-w-md leading-relaxed mb-4">
              To begin exploring student performance records, select an academic session from the filters above.
            </p>
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-emerald-50/70 border border-emerald-200/60 text-xs text-emerald-900 font-medium">
              <Search className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>
                <strong>Quick search:</strong> You can also search for a student directly by name, exam number, or school below.
              </span>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="max-w-lg mx-auto py-8 text-center flex flex-col items-center">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold mb-3">
              Step 2 of 5 • Term
            </span>
            <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mb-3 text-emerald-700 shadow-2xs">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-1">
              Select an Academic Term
            </h3>
            <p className="text-xs text-gray-500 max-w-md leading-relaxed mb-4">
              Session <strong className="text-gray-800">"{selectedSessionName || 'Selected'}"</strong> is active. Now select an academic term above to proceed, or search for a student.
            </p>
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-emerald-50/70 border border-emerald-200/60 text-xs text-emerald-900 font-medium">
              <Search className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>
                <strong>Quick search:</strong> You can also search for a student directly by name, exam number, or school below.
              </span>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="max-w-lg mx-auto py-8 text-center flex flex-col items-center">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold mb-3">
              Step 3 of 5 • LGA
            </span>
            <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mb-3 text-emerald-700 shadow-2xs">
              <MapPin className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-1">
              Select a Local Government Area (LGA)
            </h3>
            <p className="text-xs text-gray-500 max-w-md leading-relaxed mb-4">
              <strong className="text-gray-800">{selectedSessionName || 'Session'} • {selectedTermName || 'Term'}</strong> active. Select an LGA above to view its educational institutions, or search for a student.
            </p>
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-emerald-50/70 border border-emerald-200/60 text-xs text-emerald-900 font-medium">
              <Search className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>
                <strong>Quick search:</strong> You can also search for a student directly by name, exam number, or school below.
              </span>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="max-w-lg mx-auto py-8 text-center flex flex-col items-center">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold mb-3">
              Step 4 of 5 • School
            </span>
            <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mb-3 text-emerald-700 shadow-2xs">
              <SchoolIcon className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-1">
              Select a School
            </h3>
            <p className="text-xs text-gray-500 max-w-md leading-relaxed mb-4">
              Filtering within <strong className="text-gray-800">{selectedLgaName || 'selected LGA'} LGA</strong>. Select a school above to view available classes, or search for a student.
            </p>
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-emerald-50/70 border border-emerald-200/60 text-xs text-emerald-900 font-medium">
              <Search className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>
                <strong>Quick search:</strong> You can also search for a student directly by name, exam number, or school below.
              </span>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="max-w-lg mx-auto py-8 text-center flex flex-col items-center">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold mb-3">
              Step 5 of 5 • Class
            </span>
            <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mb-3 text-emerald-700 shadow-2xs">
              <GraduationCap className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-1">
              Select a Class to View Enrolled Students
            </h3>
            <p className="text-xs text-gray-500 max-w-md leading-relaxed mb-4">
              Filtering in <strong className="text-gray-800">{selectedSchoolName || 'selected School'}</strong>. Select a class above to load and display enrolled student records, or search for a student.
            </p>
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-emerald-50/70 border border-emerald-200/60 text-xs text-emerald-900 font-medium">
              <Search className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>
                <strong>Quick search:</strong> You can also search for a student directly by name, exam number, or school below.
              </span>
            </div>
          </div>
        );

      case 6:
      default:
        return (
          <div className="max-w-md mx-auto py-10 text-center">
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
              <UserX className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-base font-semibold text-gray-800 mb-1">
              No Students Found
            </p>
            <p className="text-xs text-gray-500 mb-1">
              There are no students matching your selected criteria.
            </p>
            <p className="text-xs text-gray-400">
              Try adjusting your search query, or selecting a different session, term, or class.
            </p>
          </div>
        );
    }
  };

  return (
    <Card className="border-gray-200 shadow-xs overflow-hidden">
      <CardHeader className="bg-gray-50/80 border-b border-gray-100 px-6 py-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center shadow-2xs shrink-0">
              <Users className="w-5 h-5 text-emerald-700" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold text-gray-900">
                Enrolled Students
              </CardTitle>
              <p className="text-xs text-gray-500 mt-0.5">
                {isSearching ? (
                  <span className="inline-flex items-center gap-1.5 text-emerald-700 font-medium">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    (Searching...)
                  </span>
                ) : totalItems > 0 ? (
                  `Showing ${startItem} to ${endItem} of ${totalItems.toLocaleString()} students in directory`
                ) : students && students.length > 0 ? (
                  `Showing ${students.length} student${students.length === 1 ? "" : "s"} in directory`
                ) : filterStage && filterStage < 6 ? (
                  "Follow the progressive filters above or search below to display students"
                ) : hasActiveFilters ? (
                  "No students match your active filters"
                ) : (
                  "No students available"
                )}
              </p>
            </div>
          </div>

          {filterContextMessage && (
            <div className="flex items-center gap-2 bg-emerald-50/90 border border-emerald-200/80 text-emerald-800 px-3 py-1.5 rounded-lg text-xs font-medium max-w-2xl shadow-2xs self-start lg:self-auto">
              <Info className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
              <span className="leading-snug">
                {filterContextMessage}
              </span>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-gray-50/60">
              <TableRow className="border-b border-gray-200 hover:bg-transparent">
                {/* S/N Column */}
                <TableHead className="w-[60px] pl-6 pr-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  S/N
                </TableHead>

                {/* Student Column (Static) */}
                <TableHead className="text-xs font-semibold text-gray-600 uppercase tracking-wider pr-4">
                  Student
                </TableHead>

                {/* Exam No. (Static) */}
                <TableHead className="w-[120px] text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Exam No.
                </TableHead>

                {/* LGA Column (Between Exam No. and School) */}
                <TableHead className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  LGA
                </TableHead>

                {/* School (Static) */}
                <TableHead className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  School
                </TableHead>

                {/* Class (Static) */}
                <TableHead className="w-[110px] text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Class
                </TableHead>

                {/* Total Score (Static) */}
                <TableHead className="w-[140px] text-xs font-semibold text-gray-600 uppercase tracking-wider text-right pr-6">
                  Total Score
                </TableHead>

                {/* Average (Static) */}
                <TableHead className="w-[100px] text-xs font-semibold text-gray-600 uppercase tracking-wider text-right">
                  Average
                </TableHead>

                {/* Actions (Static) */}
                <TableHead className="w-[80px] text-xs font-semibold text-gray-600 uppercase tracking-wider pr-6 pl-2 text-center">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isSearching || isTableLoading ? (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={9} className="py-16 text-center">
                    <div className="max-w-md mx-auto">
                      <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center mx-auto mb-3">
                        <Loader2 className="w-6 h-6 text-emerald-600 animate-spin" />
                      </div>
                      <p className="text-base font-semibold text-gray-800 mb-1">
                        {isSearching ? "(Searching...)" : "Loading Students..."}
                      </p>
                      <p className="text-xs text-gray-500">
                        {isSearching
                          ? "Finding student records matching your query..."
                          : "Fetching student directory records..."}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : students && students.length > 0 ? (
                students.map((student, index) => (
                  <StudentRow
                    key={student.id || student.examNo}
                    student={student}
                    serialNumber={startItem + index}
                    getScoreColor={getScoreColor}
                    getScoreBgColor={getScoreBgColor}
                    getPositionBadge={getPositionBadge}
                    onEditStudent={onEditStudent}
                  />
                ))
              ) : (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={9} className="py-12 text-center">
                    {renderEmptyPrompt()}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination Footer */}
        {totalItems > 0 && (
          <div className="px-6 py-3.5 bg-gray-50/70 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs text-gray-500 font-medium">
              Showing {startItem} to {endItem} of {totalItems.toLocaleString()} students
            </div>

            {totalPages > 1 && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onPageChange?.(Math.max(1, currentPage - 1))}
                  disabled={currentPage <= 1 || isTableLoading}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-150 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-medium shadow-2xs cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  Previous
                </button>

                <span className="px-2.5 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-md text-xs font-semibold flex items-center gap-1.5">
                  {isTableLoading && <Loader2 className="w-3 h-3 animate-spin text-emerald-600" />}
                  Page {currentPage} of {totalPages}
                </span>

                <button
                  type="button"
                  onClick={() => onPageChange?.(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage >= totalPages || isTableLoading}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-150 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-medium shadow-2xs cursor-pointer"
                >
                  Next
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StudentsTable;
