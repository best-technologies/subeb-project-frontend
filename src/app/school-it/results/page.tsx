"use client";

import React, { useState } from "react";
import {
  useSchoolItResults,
  useUploadSchoolItResults,
  useSchoolItDashboard,
  useSubmitSchoolItResults,
  useSchoolItSubjects,
} from "@/services/hooks/useSchoolIt";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/Button";
import {
  ChevronLeft,
  ChevronRight,
  Upload,
  Edit2,
  AlertCircle,
  MoreVertical,
  Eye,
  Send,
  Loader2,
  Lock,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/label";
import { ManualResultEntry } from "@/components/school-it/ManualResultEntry";
import { BulkResultUpload } from "@/components/school-it/BulkResultUpload";
import { SubmitClassResultsModal } from "@/components/school-it/SubmitClassResultsModal";
import { SubmitSingleStudentModal } from "@/components/school-it/SubmitSingleStudentModal";
import { useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { schoolItApi } from "@/services/api/school-it";
import { toast } from "react-hot-toast";
import { capitalizeInitials, cn } from "@/utils/formatters";

function getGradeRank(cls: { name?: string; grade?: string }): number {
  const str = `${cls.grade || ""} ${cls.name || ""}`.toLowerCase();
  const numMatch = str.match(/\d+/);
  const num = numMatch ? parseInt(numMatch[0], 10) : 0;

  if (str.includes("creche") || str.includes("daycare")) return 0 + num;
  if (
    str.includes("eccde") ||
    str.includes("nursery") ||
    str.includes("kg") ||
    str.includes("kindergarten")
  ) {
    return 10 + num;
  }
  if (
    str.includes("primary") ||
    str.includes("pry") ||
    str.includes("basic") ||
    str.includes("class")
  ) {
    return 20 + num;
  }
  if (str.includes("jss") || str.includes("junior")) return 40 + num;
  if (str.includes("sss") || str.includes("senior")) return 60 + num;

  return 30 + num;
}

export default function SchoolItResultsPage() {
  const [page, setPage] = useState(1);
  const [classId, setClassId] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "GRADED" | "UNGRADED">("ALL");
  const limit = 20;

  const dashboardQuery = useSchoolItDashboard();
  const classes = dashboardQuery.data?.classes || [];

  // Sort classes starting from the lowest grade level
  const sortedClasses = React.useMemo(() => {
    return [...classes].sort((a: any, b: any) => {
      const rankA = getGradeRank(a);
      const rankB = getGradeRank(b);
      if (rankA !== rankB) return rankA - rankB;
      return (a.name || "").localeCompare(b.name || "", undefined, {
        numeric: true,
        sensitivity: "base",
      });
    });
  }, [classes]);

  // Ensure a class is always selected, defaulting to the lowest grade level
  React.useEffect(() => {
    if (sortedClasses.length > 0) {
      const exists = sortedClasses.some((c: any) => c.id === classId);
      if (!exists) {
        setClassId(sortedClasses[0].id);
      }
    }
  }, [sortedClasses, classId]);

  const activeClassId = classId || sortedClasses[0]?.id || "";

  const { data, isLoading } = useSchoolItResults(
    activeClassId
      ? {
          classId: activeClassId,
          status: statusFilter,
          page,
          limit,
        }
      : undefined
  );
  const { data: subjectsData } = useSchoolItSubjects();
  const uploadMutation = useUploadSchoolItResults();
  const submitMutation = useSubmitSchoolItResults();

  const queryClient = useQueryClient();
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [selectedStudentForSubmit, setSelectedStudentForSubmit] = useState<{
    id: string;
    name: string;
    studentId: string;
    className: string;
  } | null>(null);
  const [isSingleStudentModalOpen, setIsSingleStudentModalOpen] = useState(false);
  const [isCsvMode, setIsCsvMode] = useState(true);

  const results = data?.data || [];
  const pagination = data?.pagination;
  const totalPages = pagination?.totalPages || 1;
  const total = pagination?.total || 0;
  const counts = data?.counts || { all: total, graded: 0, ungraded: 0 };

  const selectedClassName =
    sortedClasses.find((c: any) => c.id === activeClassId)?.name || "Select Class";

  // Mock Manual Submission Handler
  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dashboardQuery.data?.school) return;

    const mockPayload = {
      sessionId: "mock-session-id",
      termId: "mock-term-id",
      lgaId: dashboardQuery.data.school.lgaId || "mock-lga-id",
      schoolId: dashboardQuery.data.school.id,
      classId: "mock-class-id",
      students: [
        {
          studentId: "mock-student-id",
          subjects: [{ subjectId: "mock-subject-id", score: 85 }],
        },
      ],
    };

    uploadMutation.mutate(mockPayload, {
      onSuccess: () => setIsUploadModalOpen(false),
    });
  };

  const handleOpenSubmitModal = () => {
    setIsSubmitModalOpen(true);
  };

  const fromRecord = total > 0 ? (page - 1) * limit + 1 : 0;
  const toRecord = Math.min(page * limit, total);

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Manage Results</h1>
          <p className="text-sm text-gray-500 mt-1 flex items-center gap-1.5 flex-wrap">
            <span>Class:</span>
            <span className="font-semibold text-gray-800">{selectedClassName}</span>
            <span className="text-gray-300">&bull;</span>
            <span>Total Enrolled:</span>
            <span className="font-semibold text-gray-800">{total}</span>
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <Button
            variant="outline"
            onClick={handleOpenSubmitModal}
            disabled={sortedClasses.length === 0}
            className="flex items-center justify-center gap-2 rounded-xl px-5 h-10 py-0 text-sm font-medium border-brand-primary text-brand-primary hover:bg-brand-primary/5 transition-colors shadow-xs"
          >
            <Send size={16} />
            <span>Submit for Approval</span>
          </Button>
          <Button
            onClick={() => setIsUploadModalOpen(true)}
            className="flex items-center justify-center gap-2 rounded-xl px-5 h-10 py-0 text-sm font-medium shadow-xs"
          >
            <Upload size={16} />
            <span>Upload Results</span>
          </Button>
        </div>
      </div>

      {/* Active Academic Period Banner */}
      {dashboardQuery.data?.activeSession && dashboardQuery.data?.activeTerm && (
        <div className="bg-blue-50/80 border border-blue-200/80 text-blue-900 px-4 py-3 rounded-xl flex items-start gap-3 shadow-xs">
          <AlertCircle className="mt-0.5 shrink-0 text-blue-600" size={18} />
          <div className="text-xs">
            <span className="font-bold">Active Academic Period:</span> Results uploaded will automatically be recorded for{" "}
            <strong>{dashboardQuery.data.activeSession.name}</strong> &mdash;{" "}
            <strong>{dashboardQuery.data.activeTerm.name.replace("_", " ")}</strong>.
          </div>
        </div>
      )}

      {/* Filter Toolbar: Pill Filters (All, Graded, Ungraded) & Class Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 sm:p-4 rounded-xl border border-gray-100 shadow-sm">
        {/* Pill Filters */}
        <div className="flex items-center gap-1.5 p-1 bg-gray-100/80 rounded-xl">
          <button
            type="button"
            onClick={() => {
              setStatusFilter("ALL");
              setPage(1);
            }}
            className={cn(
              "px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer",
              statusFilter === "ALL"
                ? "bg-white text-gray-900 shadow-xs"
                : "text-gray-500 hover:text-gray-900"
            )}
          >
            <span>All</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-gray-100 font-medium text-gray-600">
              {counts.all}
            </span>
          </button>
          <button
            type="button"
            onClick={() => {
              setStatusFilter("GRADED");
              setPage(1);
            }}
            className={cn(
              "px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer",
              statusFilter === "GRADED"
                ? "bg-white text-emerald-700 shadow-xs"
                : "text-gray-500 hover:text-gray-900"
            )}
          >
            <span>Graded</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-50 text-emerald-700 font-medium">
              {counts.graded}
            </span>
          </button>
          <button
            type="button"
            onClick={() => {
              setStatusFilter("UNGRADED");
              setPage(1);
            }}
            className={cn(
              "px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer",
              statusFilter === "UNGRADED"
                ? "bg-white text-amber-700 shadow-xs"
                : "text-gray-500 hover:text-gray-900"
            )}
          >
            <span>Ungraded</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-50 text-amber-700 font-medium">
              {counts.ungraded}
            </span>
          </button>
        </div>

        {/* Class Dropdown Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-gray-500 whitespace-nowrap">Class:</span>
          <Select
            value={activeClassId}
            onValueChange={(val) => {
              setClassId(val);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-[180px] h-9 text-xs rounded-xl border-gray-200 focus:border-brand-primary bg-white font-medium">
              <SelectValue placeholder={sortedClasses.length === 0 ? "No classes" : "Select class..."} />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              {sortedClasses.map((cls: any) => (
                <SelectItem key={cls.id} value={cls.id} className="text-xs">
                  {cls.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Results Table */}
      <Card className="overflow-hidden border border-gray-100 shadow-sm rounded-xl">
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader className="bg-gray-50/75 border-b border-gray-100">
              <TableRow>
                <TableHead className="w-[130px]">Student ID</TableHead>
                <TableHead>Student Name</TableHead>
                <TableHead>Class</TableHead>
                <TableHead>Subjects Graded</TableHead>
                <TableHead>Overall Status</TableHead>
                <TableHead className="text-right w-[70px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-gray-500 py-10">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin text-brand-primary" />
                      <span className="text-xs font-medium">Loading results...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : results.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-gray-500 py-10">
                    <p className="text-sm font-medium text-gray-600">No students found.</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {statusFilter === "GRADED"
                        ? "No results have been uploaded for students in this selection yet."
                        : statusFilter === "UNGRADED"
                        ? "All students in this selection have results recorded."
                        : "No students enrolled in this selection yet."}
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                results.map((student: any) => {
                  const assessments = student.assessments || [];
                  const totalSubjects = subjectsData?.length || 0;
                  const isSuspended = student.isActive === false;

                  let status = "Not Graded";
                  let statusBadgeClass = "bg-gray-100 text-gray-700 border border-gray-200/60";

                  if (isSuspended) {
                    status = "Suspended";
                    statusBadgeClass = "bg-rose-50 text-rose-700 border border-rose-200/60";
                  } else if (assessments.length > 0) {
                    if (assessments.some((a: any) => a.status === "REJECTED")) {
                      status = "Rejected";
                      statusBadgeClass = "bg-red-50 text-red-700 border border-red-200/60";
                    } else if (assessments.some((a: any) => a.status === "PENDING_SUBMISSION")) {
                      status = "Pending Submission";
                      statusBadgeClass = "bg-blue-50 text-blue-700 border border-blue-200/60";
                    } else if (assessments.some((a: any) => a.status === "AWAITING_APPROVAL")) {
                      status = "Awaiting Approval";
                      statusBadgeClass = "bg-amber-50 text-amber-700 border border-amber-200/60";
                    } else {
                      status = "Approved";
                      statusBadgeClass = "bg-emerald-50 text-emerald-700 border border-emerald-200/60";
                    }
                  }

                  return (
                    <TableRow
                      key={student.id}
                      className={cn(
                        isSuspended
                          ? "opacity-60 bg-gray-50/80 hover:bg-gray-100/70"
                          : "hover:bg-gray-50/80 transition-colors"
                      )}
                    >
                      {/* Student ID */}
                      <TableCell>
                        <span className="font-mono text-xs font-medium text-gray-600 bg-gray-50 px-2 py-0.5 rounded border border-gray-200/60">
                          {student.studentId}
                        </span>
                      </TableCell>

                      {/* Student Name */}
                      <TableCell className="font-semibold text-gray-900 capitalize">
                        <div className="flex items-center gap-1.5">
                          <span>
                            {capitalizeInitials(
                              `${student.firstName || ""} ${student.lastName || ""}`.trim()
                            )}
                          </span>
                          {isSuspended && (
                            <span className="text-[10px] font-semibold text-rose-700 bg-rose-50 border border-rose-200 px-1.5 py-0.2 rounded-full uppercase tracking-wider">
                              Suspended
                            </span>
                          )}
                        </div>
                      </TableCell>

                      {/* Class */}
                      <TableCell className="text-sm font-medium text-gray-700">
                        {student.class?.name || (
                          <span className="text-gray-400 italic">Unassigned</span>
                        )}
                      </TableCell>

                      {/* Subjects Graded */}
                      <TableCell>
                        <div className="flex items-center gap-1.5 text-xs text-gray-600">
                          <span className="font-semibold text-gray-900">
                            {assessments.length}
                          </span>
                          <span className="text-gray-400">/</span>
                          <span>{totalSubjects} subjects</span>
                        </div>
                      </TableCell>

                      {/* Overall Status */}
                      <TableCell>
                        <span
                          className={cn(
                            "px-2.5 py-0.5 inline-flex text-xs font-semibold rounded-full",
                            statusBadgeClass
                          )}
                        >
                          {status}
                        </span>
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="text-right">
                        <div className="flex justify-end">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                              >
                                <MoreVertical className="h-4 w-4" />
                                <span className="sr-only">Actions</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              align="end"
                              className="w-48 rounded-xl p-1.5 shadow-lg border border-gray-100 bg-white"
                            >
                              <Link href={`/school-it/results/${student.id}`}>
                                <DropdownMenuItem className="flex items-center gap-2 text-xs font-medium cursor-pointer rounded-lg px-2.5 py-2 text-gray-700 hover:bg-gray-100">
                                  <Eye className="w-3.5 h-3.5 text-gray-500" />
                                  <span>View Results</span>
                                </DropdownMenuItem>
                              </Link>
                              {isSuspended ? (
                                <DropdownMenuItem disabled className="flex items-center gap-2 text-xs font-medium rounded-lg px-2.5 py-2 text-rose-700 bg-rose-50/60 cursor-not-allowed opacity-80">
                                  <Lock className="w-3.5 h-3.5 text-rose-600" />
                                  <span>Suspended (Cannot edit)</span>
                                </DropdownMenuItem>
                              ) : status === "Approved" ? (
                                <DropdownMenuItem disabled className="flex items-center gap-2 text-xs font-medium rounded-lg px-2.5 py-2 text-emerald-700 bg-emerald-50/50 cursor-default opacity-80">
                                  <Lock className="w-3.5 h-3.5 text-emerald-600" />
                                  <span>Approved (Closed)</span>
                                </DropdownMenuItem>
                              ) : (
                                <>
                                  <Link href={`/school-it/results/${student.id}`}>
                                    <DropdownMenuItem className="flex items-center gap-2 text-xs font-medium cursor-pointer rounded-lg px-2.5 py-2 text-gray-700 hover:bg-gray-100">
                                      <Edit2 className="w-3.5 h-3.5 text-gray-500" />
                                      <span>Edit Results</span>
                                    </DropdownMenuItem>
                                  </Link>
                                  {(status === "Pending Submission" || status === "Rejected") && (
                                    <DropdownMenuItem
                                      onClick={() => {
                                        setSelectedStudentForSubmit({
                                          id: student.id,
                                          name: `${student.firstName || ""} ${student.lastName || ""}`.trim(),
                                          studentId: student.studentId,
                                          className: student.class?.name || selectedClassName,
                                        });
                                        setIsSingleStudentModalOpen(true);
                                      }}
                                      className="flex items-center gap-2 text-xs font-medium cursor-pointer rounded-lg px-2.5 py-2 text-brand-primary hover:bg-brand-primary/10"
                                    >
                                      <Send className="w-3.5 h-3.5 text-brand-primary" />
                                      <span>Submit for Approval</span>
                                    </DropdownMenuItem>
                                  )}
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white px-5 py-3.5 rounded-xl border border-gray-100 shadow-sm">
        <div className="text-xs text-gray-600">
          Showing <span className="font-semibold text-gray-900">{fromRecord}</span> to{" "}
          <span className="font-semibold text-gray-900">{toRecord}</span> of{" "}
          <span className="font-semibold text-gray-900">{total}</span> students
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1 || isLoading}
            className="rounded-xl text-xs px-3 py-1.5 h-auto"
          >
            <ChevronLeft size={14} className="mr-1" />
            Previous
          </Button>
          <span className="text-xs font-medium text-gray-600 px-2">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages || isLoading}
            className="rounded-xl text-xs px-3 py-1.5 h-auto"
          >
            Next
            <ChevronRight size={14} className="ml-1" />
          </Button>
        </div>
      </div>

      {/* Upload Results Modal */}
      <Dialog open={isUploadModalOpen} onOpenChange={setIsUploadModalOpen}>
        <DialogContent className={cn("max-h-[90vh] overflow-y-auto rounded-2xl bg-white border border-gray-100 shadow-xl p-6 transition-all duration-300", isCsvMode ? "sm:max-w-[920px]" : "sm:max-w-[500px]")}>
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-gray-900">Upload Results</DialogTitle>
          </DialogHeader>

          <div className="flex bg-gray-100 p-1 rounded-xl mb-4">
            <button
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                isCsvMode ? "bg-white shadow-xs text-gray-900" : "text-gray-500 hover:text-gray-900"
              }`}
              onClick={() => setIsCsvMode(true)}
            >
              Bulk Upload (CSV)
            </button>
            <button
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                !isCsvMode ? "bg-white shadow-xs text-gray-900" : "text-gray-500 hover:text-gray-900"
              }`}
              onClick={() => setIsCsvMode(false)}
            >
              Manual Entry
            </button>
          </div>

          {isCsvMode ? (
            <BulkResultUpload
              classId={activeClassId}
              dashboardData={dashboardQuery.data}
              onSuccess={() => setIsUploadModalOpen(false)}
              onCancel={() => setIsUploadModalOpen(false)}
            />
          ) : (
            <ManualResultEntry
              dashboardData={dashboardQuery.data}
              existingResults={results}
              onSuccess={() => setIsUploadModalOpen(false)}
              onCancel={() => setIsUploadModalOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Submit by Classes Dialog */}
      <SubmitClassResultsModal
        isOpen={isSubmitModalOpen}
        onOpenChange={setIsSubmitModalOpen}
        currentClassId={activeClassId}
        classes={sortedClasses}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ["school-it", "results"] });
          queryClient.invalidateQueries({ queryKey: ["school-it", "dashboard"] });
        }}
      />

      {/* Submit Single Student Dialog */}
      <SubmitSingleStudentModal
        isOpen={isSingleStudentModalOpen}
        onOpenChange={setIsSingleStudentModalOpen}
        student={selectedStudentForSubmit}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ["school-it", "results"] });
          queryClient.invalidateQueries({ queryKey: ["school-it", "dashboard"] });
        }}
      />
    </div>
  );
}
