"use client";
import React from "react";
import { Users, UserX, ArrowUpDown, ChevronUp, ChevronDown, Info } from "lucide-react";
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
  sortBy: string;
  sortOrder: "asc" | "desc";
  onSort: (field: string) => void;
  getScoreColor: (score: number) => string;
  getScoreBgColor: (score: number) => string;
  getPositionBadge: (position: number) => string;
  onEditStudent: (student: PerformanceStudent) => void;
  hasActiveFilters?: boolean;
  filterContextMessage?: string;
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
  filterContextMessage,
}) => {
  const renderSortIndicator = (field: string) => {
    if (sortBy === field) {
      return sortOrder === "asc" ? (
        <ChevronUp className="w-3.5 h-3.5 text-emerald-700" />
      ) : (
        <ChevronDown className="w-3.5 h-3.5 text-emerald-700" />
      );
    }
    return <ArrowUpDown className="w-3 h-3 text-gray-400 opacity-60 group-hover:opacity-100 transition-opacity" />;
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
                {students && students.length > 0
                  ? `Showing ${students.length} student${students.length === 1 ? "" : "s"} in directory`
                  : hasActiveFilters
                  ? "No students match your active filters"
                  : "Select LGA, School, and Class above to view students"}
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
                <TableHead
                  className="w-[90px] text-xs font-semibold text-gray-600 uppercase tracking-wider text-center cursor-pointer select-none hover:text-gray-900 group"
                  onClick={() => onSort("position")}
                >
                  <div className="flex items-center justify-center gap-1.5">
                    <span>Position</span>
                    {renderSortIndicator("position")}
                  </div>
                </TableHead>
                <TableHead
                  className="text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer select-none hover:text-gray-900 group"
                  onClick={() => onSort("studentName")}
                >
                  <div className="flex items-center gap-1.5">
                    <span>Student</span>
                    {renderSortIndicator("studentName")}
                  </div>
                </TableHead>
                <TableHead
                  className="w-[120px] text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer select-none hover:text-gray-900 group"
                  onClick={() => onSort("examNo")}
                >
                  <div className="flex items-center gap-1.5">
                    <span>Exam No.</span>
                    {renderSortIndicator("examNo")}
                  </div>
                </TableHead>
                <TableHead
                  className="text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer select-none hover:text-gray-900 group"
                  onClick={() => onSort("school")}
                >
                  <div className="flex items-center gap-1.5">
                    <span>School</span>
                    {renderSortIndicator("school")}
                  </div>
                </TableHead>
                <TableHead
                  className="w-[110px] text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer select-none hover:text-gray-900 group"
                  onClick={() => onSort("class")}
                >
                  <div className="flex items-center gap-1.5">
                    <span>Class</span>
                    {renderSortIndicator("class")}
                  </div>
                </TableHead>
                <TableHead
                  className="w-[100px] text-xs font-semibold text-gray-600 uppercase tracking-wider text-right cursor-pointer select-none hover:text-gray-900 group"
                  onClick={() => onSort("total")}
                >
                  <div className="flex items-center justify-end gap-1.5">
                    <span>Total</span>
                    {renderSortIndicator("total")}
                  </div>
                </TableHead>
                <TableHead
                  className="w-[100px] text-xs font-semibold text-gray-600 uppercase tracking-wider text-right cursor-pointer select-none hover:text-gray-900 group"
                  onClick={() => onSort("average")}
                >
                  <div className="flex items-center justify-end gap-1.5">
                    <span>Average</span>
                    {renderSortIndicator("average")}
                  </div>
                </TableHead>
                <TableHead className="w-[100px] text-xs font-semibold text-gray-600 uppercase tracking-wider text-center">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students && students.length > 0 ? (
                students.map((student) => (
                  <StudentRow
                    key={`${student.examNo}-${student.position}`}
                    student={student}
                    getScoreColor={getScoreColor}
                    getScoreBgColor={getScoreBgColor}
                    getPositionBadge={getPositionBadge}
                    onEditStudent={onEditStudent}
                  />
                ))
              ) : hasActiveFilters ? (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={8} className="py-16 text-center">
                    <div className="max-w-md mx-auto">
                      <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                        <UserX className="w-6 h-6 text-gray-400" />
                      </div>
                      <p className="text-base font-semibold text-gray-800 mb-1">
                        No Students Found
                      </p>
                      <p className="text-xs text-gray-500 mb-1">
                        There are no students matching your selected filters.
                      </p>
                      <p className="text-xs text-gray-400">
                        Try adjusting the Session, Term, or clearing the search query.
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={8} className="py-16 text-center">
                    <div className="max-w-md mx-auto">
                      <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center mx-auto mb-3">
                        <Users className="w-6 h-6 text-emerald-600" />
                      </div>
                      <p className="text-base font-semibold text-gray-800 mb-1">
                        Select Filters to View Students
                      </p>
                      <p className="text-xs text-gray-500 mb-1">
                        Please use the filters above to select an LGA, School, and Class.
                      </p>
                      <p className="text-xs text-gray-400">
                        This will automatically query and display the student records.
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default StudentsTable;
