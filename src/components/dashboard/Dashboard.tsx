"use client";
import React, { useState, useEffect, useRef } from "react";
import StatsCards from "./StatsCards";
import StatsCardsSkeleton from "./StatsCardsSkeleton";
import DashboardTableSkeleton from "./DashboardTableSkeleton";
import CollapsibleCharts from "./CollapsibleCharts";
import { useGlobalSearchFilter } from "@/services";
import { getAdminDashboardPerformanceTable } from "@/services/api";
import { AdminDashboardData, TopStudent, Pagination } from "@/services/types/adminDashboardResponse";
import { capitalizeInitials, formatEducationalText } from "@/utils/formatters";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Trophy, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import StudentPerformanceSheet from "./StudentPerformanceSheet";

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
  const pageSize = 10;

  // Dedicated state for top students table so paginating never reloads the whole dashboard/cards
  const [tableStudents, setTableStudents] = useState<TopStudent[]>([]);
  const [tablePagination, setTablePagination] = useState<Pagination>({
    page: 1,
    limit: pageSize,
    total: 0,
    totalPages: 1,
  });
  const [isTableLoading, setIsTableLoading] = useState(false);

  // State for slide-in sheet showing student's subject breakdown
  const [selectedStudentForSheet, setSelectedStudentForSheet] = useState<TopStudent | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const handleRowClick = (student: TopStudent) => {
    setSelectedStudentForSheet(student);
    setIsSheetOpen(true);
  };

  const { searchTerm, selectedSession, selectedTerm } = useGlobalSearchFilter({
    availableSessions: dashboardData?.availableSessions || [],
    availableTerms: dashboardData?.availableTerms || [],
  });

  // Sync table state whenever dashboardData.performance arrives (initial load or session/term change)
  useEffect(() => {
    if (dashboardData?.performance) {
      setTableStudents(dashboardData.performance.topStudents || []);
      if (dashboardData.performance.pagination) {
        setTablePagination(dashboardData.performance.pagination);
      } else {
        const total = dashboardData.performance.topStudents?.length || 0;
        setTablePagination({
          page: 1,
          limit: pageSize,
          total,
          totalPages: Math.max(1, Math.ceil(total / pageSize)),
        });
      }
    }
  }, [dashboardData?.performance, pageSize]);

  // Dedicated state for term dropdown on the top students table
  const [tableTermFilter, setTableTermFilter] = useState<string>("");

  const currentTermName = dashboardData?.currentTerm?.name;
  const normalizedCurrentTerm = currentTermName
    ? currentTermName.toUpperCase().replace(/\s+/g, "_")
    : "SECOND_TERM";
  const activeTermFilter = tableTermFilter || normalizedCurrentTerm;

  const getTermDisplayLabel = (termVal: string) => {
    if (termVal === "COMBINED") return "Combined";
    if (termVal === "FIRST_TERM") return "First Term";
    if (termVal === "SECOND_TERM") return "Second Term";
    if (termVal === "THIRD_TERM") return "Third Term";
    return formatEducationalText(termVal.replace(/_/g, " "));
  };

  // Handle global academic session / term dropdown changes (refreshes entire dashboard including cards)
  const lastSessionTermRef = useRef<{ session?: string; term?: string }>({});
  useEffect(() => {
    const sessionVal = selectedSession?.id;
    const termVal = selectedTerm?.id;

    if (!sessionVal && !termVal) return;

    if (
      (sessionVal && sessionVal !== lastSessionTermRef.current.session) ||
      (termVal && termVal !== lastSessionTermRef.current.term)
    ) {
      lastSessionTermRef.current = { session: sessionVal, term: termVal };
      setTableTermFilter("");
      if (onSearchParamsChange) {
        onSearchParamsChange({
          session: sessionVal,
          term: termVal,
          includeStats: true,
          includePerformance: true,
        });
      }
    }
  }, [selectedSession?.id, selectedTerm?.id, onSearchParamsChange]);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch only table data when paginating, searching, or changing term within the table (cards are NOT refreshed!)
  const fetchTablePage = async (page: number, search?: string, termOverride?: string) => {
    setIsTableLoading(true);
    try {
      const activeSession = selectedSession?.id || dashboardData?.currentSession?.id;
      const termToUse = termOverride !== undefined ? termOverride : activeTermFilter;
      const res = await getAdminDashboardPerformanceTable({
        session: activeSession,
        term: termToUse,
        page,
        limit: pageSize,
        search: search !== undefined ? search : debouncedSearchTerm || undefined,
        lgaId: lgaFilter
          ? dashboardData?.data?.lgas?.find((l) => l.name === lgaFilter)?.id
          : undefined,
        schoolId: schoolFilter
          ? dashboardData?.data?.schools?.find((s) => s.name === schoolFilter)?.id
          : undefined,
      });

      if (res?.success && res.data) {
        setTableStudents(res.data.topStudents || []);
        if (res.data.pagination) {
          setTablePagination(res.data.pagination);
        }
      }
    } catch (err) {
      console.error("Failed to fetch performance table page:", err);
    } finally {
      setIsTableLoading(false);
    }
  };

  const handleTermChange = (newTerm: string) => {
    setTableTermFilter(newTerm);
    fetchTablePage(1, debouncedSearchTerm, newTerm);
  };

  // Re-fetch table when search term changes (after initial mount)
  const isInitialMount = useRef(true);
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    fetchTablePage(1, debouncedSearchTerm, activeTermFilter);
  }, [debouncedSearchTerm]);

  // Handle server-side page navigation (ONLY fetches table data)
  const handlePageChange = (targetPage: number) => {
    fetchTablePage(targetPage, debouncedSearchTerm, activeTermFilter);
  };

  const totalItems = tablePagination.total;
  const totalPages = tablePagination.totalPages;
  const activePage = tablePagination.page;
  const startRank = totalItems === 0 ? 0 : (activePage - 1) * pageSize + 1;
  const endRank = Math.min(activePage * pageSize, totalItems);

  // Get ranked students for the active page directly from server response
  const students = tableStudents;

  const renderPositionBadge = (pos: number) => {
    if (pos === 1) {
      return (
        <span className="inline-flex items-center justify-center min-w-7 h-7 px-1.5 rounded-md bg-amber-100 text-amber-900 font-bold text-xs border border-amber-300">
          #1
        </span>
      );
    }
    if (pos === 2) {
      return (
        <span className="inline-flex items-center justify-center min-w-7 h-7 px-1.5 rounded-md bg-slate-200 text-slate-800 font-bold text-xs border border-slate-300">
          #2
        </span>
      );
    }
    if (pos === 3) {
      return (
        <span className="inline-flex items-center justify-center min-w-7 h-7 px-1.5 rounded-md bg-orange-100 text-orange-900 font-bold text-xs border border-orange-300">
          #3
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
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-50 text-gray-600 border border-gray-200">
        {gender || "N/A"}
      </span>
    );
  };

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      {loading && !dashboardData ? (
        <StatsCardsSkeleton />
      ) : (
        <StatsCards dashboardData={dashboardData} />
      )}

      {/* Collapsible Performance Charts */}
      <CollapsibleCharts dashboardData={dashboardData} />

      {/* Top Students Ranking Table */}
      {!dashboardData && loading ? (
        <DashboardTableSkeleton />
      ) : (
        <Card className="border-gray-200 shadow-xs overflow-hidden">
          <CardHeader className="bg-gray-50/80 border-b border-gray-100 px-6 py-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center shadow-2xs">
                  <Trophy className="w-5 h-5 text-emerald-700" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-lg font-bold text-gray-900 whitespace-nowrap">
                      Top Ranked Students
                    </CardTitle>
                    <Select
                      value={activeTermFilter}
                      onValueChange={handleTermChange}
                      disabled={isTableLoading}
                    >
                      <SelectTrigger className="h-7 w-[125px] px-2.5 py-0 text-xs bg-white border-gray-200 text-gray-800 shadow-2xs rounded-lg font-medium focus:ring-1 focus:ring-emerald-500 cursor-pointer shrink-0">
                        <SelectValue placeholder="Select term" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-gray-200 shadow-md">
                        <SelectItem value="FIRST_TERM" className="text-xs font-medium cursor-pointer">
                          First Term
                        </SelectItem>
                        <SelectItem value="SECOND_TERM" className="text-xs font-medium cursor-pointer">
                          Second Term
                        </SelectItem>
                        <SelectItem value="THIRD_TERM" className="text-xs font-medium cursor-pointer">
                          Third Term
                        </SelectItem>
                        <SelectItem value="COMBINED" className="text-xs font-medium cursor-pointer">
                          Combined
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Showing {startRank} to {endRank} of {totalItems} top ranked students across the state
                    {activeTermFilter === "COMBINED"
                      ? " (Cumulative across all terms)"
                      : ` (${getTermDisplayLabel(activeTermFilter)})`}
                    {debouncedSearchTerm && ` matching "${debouncedSearchTerm}"`}
                    {lgaFilter && ` • LGA: ${lgaFilter}`}
                    {schoolFilter && ` • School: ${schoolFilter}`}
                  </p>
                </div>
              </div>

              {/* Pagination Controls */}
              {totalItems > 0 && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(Math.max(1, activePage - 1))}
                    disabled={activePage <= 1 || isTableLoading}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-150 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-medium shadow-2xs"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    Previous
                  </button>

                  <span className="px-2.5 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-md text-xs font-semibold flex items-center gap-1.5">
                    {isTableLoading && <Loader2 className="w-3 h-3 animate-spin text-emerald-600" />}
                    Page {activePage} of {totalPages}
                  </span>

                  <button
                    onClick={() => handlePageChange(Math.min(totalPages, activePage + 1))}
                    disabled={activePage >= totalPages || isTableLoading}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-150 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-medium shadow-2xs"
                  >
                    Next
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </CardHeader>

          <CardContent className="p-0 relative">
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
                      LGA
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      School
                    </TableHead>
                    <TableHead className="w-[110px] text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Class
                    </TableHead>
                    <TableHead className="w-[140px] text-right text-xs font-semibold text-gray-600 uppercase tracking-wider pr-6">
                      Total Score
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((student, index) => {
                    const pos = student.position || (activePage - 1) * pageSize + index + 1;
                    return (
                      <TableRow
                        key={student.id || index}
                        onClick={() => handleRowClick(student)}
                        className="cursor-pointer hover:bg-gray-100/80 transition-colors duration-150 border-b border-gray-100 group"
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
                          {student.lga ? capitalizeInitials(student.lga) : "N/A"}
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {student.school
                            ? capitalizeInitials(student.school)
                            : "N/A"}
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {student.class
                            ? formatEducationalText(student.class)
                            : "N/A"}
                        </TableCell>
                        <TableCell className="text-right pr-6">
                          {(() => {
                            const score = student.totalScore ?? 0;
                            const rawMax = student.totalMaxScore;
                            const defaultMax = activeTermFilter === "COMBINED" ? 3000 : 1000;
                            const maxScore = rawMax && rawMax >= score
                              ? rawMax
                              : Math.max(score > 0 ? Math.ceil(score / 100) * 100 : defaultMax, defaultMax);

                            return (
                              <span className="inline-block font-bold text-sm text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200/60 whitespace-nowrap">
                                {score.toLocaleString()}
                                <span className="text-emerald-600/80 font-medium text-xs">
                                  /{maxScore.toLocaleString()}
                                </span>
                              </span>
                            );
                          })()}
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

      {/* Student Performance Breakdown Slide-In Sheet */}
      <StudentPerformanceSheet
        student={selectedStudentForSheet}
        isOpen={isSheetOpen}
        onClose={() => {
          setIsSheetOpen(false);
          setSelectedStudentForSheet(null);
        }}
        sessionName={dashboardData?.currentSession?.name}
        termName={
          activeTermFilter === "COMBINED"
            ? "Combined (All Terms)"
            : getTermDisplayLabel(activeTermFilter)
        }
        sessionId={selectedSession?.id || dashboardData?.currentSession?.id}
        termId={
          activeTermFilter === "COMBINED"
            ? "COMBINED"
            : dashboardData?.availableTerms?.find(
                (t) => t.name.toUpperCase().replace(/\s+/g, "_") === activeTermFilter
              )?.id || activeTermFilter
        }
      />
    </div>
  );
};

export default Dashboard;
