"use client";
import React, { useState, useEffect } from "react";
import StatsCards from "./StatsCards";
import StatsCardsSkeleton from "./StatsCardsSkeleton";
import StudentsTableSkeleton from "@/components/students/StudentsTableSkeleton";
import CollapsibleCharts from "./CollapsibleCharts";
import { useGlobalSearchFilter } from "@/services";
import { AdminDashboardData } from "@/services/types/adminDashboardResponse";
import { capitalizeInitials } from "@/utils/formatters";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Trophy, ChevronLeft, ChevronRight } from "lucide-react";

interface DashboardProps {
  dashboardData: AdminDashboardData | null;
  loading?: boolean;
  onSearchParamsChange?: (params: {
    session?: string;
    term?: string;
    page?: number;
    limit?: number;
    search?: string;
    schoolId?: string;
    classId?: string;
    gender?: string;
    schoolLevel?: string;
    lgaId?: string;
    sortBy?: string;
    sortOrder?: string;
    includeStats?: boolean;
    includePerformance?: boolean;
  }) => void;
}

const Dashboard: React.FC<DashboardProps> = ({
  dashboardData,
  loading = false,
  onSearchParamsChange,
}) => {
  const [lgaFilter] = useState("");
  const [schoolFilter] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const { searchTerm, selectedSession, selectedTerm } = useGlobalSearchFilter({
    availableSessions: dashboardData?.availableSessions || [],
    availableTerms: dashboardData?.availableTerms || [],
  });

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Call API when search parameters change
  useEffect(() => {
    if (onSearchParamsChange) {
      const params = {
        search: debouncedSearchTerm || undefined,
        session: selectedSession?.id || undefined,
        term: selectedTerm?.id || undefined,
        lgaId: lgaFilter
          ? dashboardData?.data?.lgas?.find((l) => l.name === lgaFilter)?.id
          : undefined,
        schoolId: schoolFilter
          ? dashboardData?.data?.schools?.find((s) => s.name === schoolFilter)
              ?.id
          : undefined,
        includeStats: true,
        includePerformance: true,
      };

      const hasValidParams = Object.values(params).some(
        (val) => val !== undefined
      );
      const hasValidSession = selectedSession?.id && selectedSession.id !== "";
      const hasValidTerm = selectedTerm?.id && selectedTerm.id !== "";

      if (hasValidParams && hasValidSession && hasValidTerm) {
        onSearchParamsChange(params);
      }
    }
  }, [
    debouncedSearchTerm,
    selectedSession?.id,
    selectedTerm?.id,
    lgaFilter,
    schoolFilter,
    onSearchParamsChange,
    dashboardData?.data?.lgas,
    dashboardData?.data?.schools,
  ]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedSession?.id, selectedTerm?.id, lgaFilter, schoolFilter, debouncedSearchTerm]);

  // Get ranked students (up to top 100)
  const students =
    dashboardData?.performance?.topStudents ||
    dashboardData?.data?.students ||
    [];

  const totalPages = Math.max(1, Math.ceil(students.length / pageSize));
  const paginatedStudents = students.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const renderPositionBadge = (pos: number) => {
    if (pos === 1) {
      return (
        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-100 text-amber-900 font-bold text-xs border border-amber-300 shadow-2xs">
          🥇 1
        </span>
      );
    }
    if (pos === 2) {
      return (
        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-200 text-slate-800 font-bold text-xs border border-slate-300 shadow-2xs">
          🥈 2
        </span>
      );
    }
    if (pos === 3) {
      return (
        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-orange-100 text-orange-900 font-bold text-xs border border-orange-300 shadow-2xs">
          🥉 3
        </span>
      );
    }
    return (
      <span className="inline-flex items-center justify-center min-w-6 h-6 px-1.5 rounded-md text-xs font-semibold bg-gray-100 text-gray-700">
        #{pos}
      </span>
    );
  };

  const renderGenderBadge = (gender?: string) => {
    const g = (gender || "").toUpperCase();
    if (g === "FEMALE") {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-pink-50 text-pink-700 border border-pink-200/60">
          Female
        </span>
      );
    }
    if (g === "MALE") {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200/60">
          Male
        </span>
      );
    }
    return <span className="text-gray-400 text-xs">N/A</span>;
  };

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      {loading || !dashboardData ? (
        <StatsCardsSkeleton />
      ) : (
        <StatsCards dashboardData={dashboardData} />
      )}

      {/* Collapsible Performance Charts */}
      <CollapsibleCharts dashboardData={dashboardData} />

      {/* Top Students Ranking Table */}
      {loading || !dashboardData ? (
        <StudentsTableSkeleton />
      ) : (
        <Card className="border-gray-200 shadow-xs overflow-hidden">
          <CardHeader className="bg-gray-50/80 border-b border-gray-100 px-6 py-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center shadow-2xs">
                  <Trophy className="w-5 h-5 text-emerald-700" />
                </div>
                <div>
                  <CardTitle className="text-lg font-bold text-gray-900">
                    Top Ranked Students
                  </CardTitle>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Showing {paginatedStudents.length} of {students.length} top ranked students across the state
                    {searchTerm && ` matching "${searchTerm}"`}
                    {lgaFilter && ` • LGA: ${lgaFilter}`}
                    {schoolFilter && ` • School: ${schoolFilter}`}
                  </p>
                </div>
              </div>

              {/* Pagination Controls */}
              {students.length > 0 && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-150 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-medium shadow-2xs"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    Previous
                  </button>

                  <span className="px-2.5 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-md text-xs font-semibold">
                    Page {currentPage} of {totalPages}
                  </span>

                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-150 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-medium shadow-2xs"
                  >
                    Next
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {students.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <Trophy className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500 font-medium text-sm">
                  No student assessment data available for the selected session and term.
                </p>
                <p className="text-gray-400 text-xs mt-1">
                  Upload assessments or select a past term with recorded results to view rankings.
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader className="bg-gray-50/50">
                  <TableRow className="border-b border-gray-200 hover:bg-transparent">
                    <TableHead className="w-[90px] text-xs font-semibold text-gray-600 uppercase tracking-wider text-center">
                      Position
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Student Name
                    </TableHead>
                    <TableHead className="w-[100px] text-xs font-semibold text-gray-600 uppercase tracking-wider text-center">
                      Gender
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      School
                    </TableHead>
                    <TableHead className="w-[110px] text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Class
                    </TableHead>
                    <TableHead className="w-[120px] text-right text-xs font-semibold text-gray-600 uppercase tracking-wider pr-6">
                      Total Score
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedStudents.map((student, index) => {
                    const pos = student.position || (currentPage - 1) * pageSize + index + 1;
                    return (
                      <TableRow
                        key={student.id || index}
                        className="hover:bg-emerald-50/30 transition-colors duration-150 border-b border-gray-100"
                      >
                        <TableCell className="text-center font-medium">
                          {renderPositionBadge(pos)}
                        </TableCell>
                        <TableCell className="font-semibold text-gray-900 text-sm">
                          {capitalizeInitials(student.studentName)}
                          {student.examNumber && (
                            <span className="block text-xs font-normal text-gray-400">
                              {student.examNumber}
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {renderGenderBadge(student.gender)}
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {student.school
                            ? capitalizeInitials(student.school)
                            : "N/A"}
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {student.class || "N/A"}
                        </TableCell>
                        <TableCell className="text-right pr-6">
                          <span className="inline-block font-bold text-sm text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200/60">
                            {student.totalScore?.toLocaleString() || "0"}
                          </span>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Dashboard;
