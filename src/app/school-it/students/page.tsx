"use client";

import React, { useState } from "react";
import {
  useSchoolItStudents,
  useEnrolSchoolItStudent,
  useUpdateSchoolItStudent,
  useUpdateSchoolItStudentStatus,
  useSchoolItDashboard,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/label";
import {
  ChevronLeft,
  ChevronRight,
  Search,
  Plus,
  Edit2,
  MoreVertical,
  AlertTriangle,
  GraduationCap,
  UserCheck,
  UserX,
  Loader2,
  X,
} from "lucide-react";
import { SchoolItStudentModal } from "@/components/school-it/SchoolItStudentModal";
import { capitalizeInitials, cn } from "@/utils/formatters";
import { toast } from "react-hot-toast";

export default function SchoolItStudentsPage() {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [classId, setClassId] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "SUSPENDED">("ALL");
  const limit = 20;

  const timerRef = React.useRef<NodeJS.Timeout | null>(null);

  const applySearch = React.useCallback((query: string) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    const trimmed = query.trim();
    setDebouncedSearch(trimmed);
    if (trimmed) {
      setStatusFilter("ALL");
      setClassId("ALL");
    }
    setPage(1);
  }, []);

  // 3-second debounce while typing
  React.useEffect(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      applySearch(searchInput);
    }, 3000);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [searchInput, applySearch]);

  const handleBlur = () => {
    // Immediate search on unfocus (no need to wait for 3s if user clicks out)
    if (searchInput.trim() !== debouncedSearch) {
      applySearch(searchInput);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      applySearch(searchInput);
    }
  };

  const handleClearSearch = () => {
    setSearchInput("");
    applySearch("");
  };

  const isSearching = Boolean(debouncedSearch);

  const { data, isLoading } = useSchoolItStudents({
    page,
    limit,
    search: isSearching ? debouncedSearch : undefined,
    classId: isSearching ? undefined : (classId === "ALL" ? undefined : classId),
    status: isSearching ? undefined : statusFilter,
  });

  // When search results return from backend, ensure status tab is switched back to All
  React.useEffect(() => {
    if (debouncedSearch && data) {
      setStatusFilter("ALL");
      setClassId("ALL");
    }
  }, [debouncedSearch, data]);

  const dashboardQuery = useSchoolItDashboard();
  const enrolMutation = useEnrolSchoolItStudent();
  const updateMutation = useUpdateSchoolItStudent();
  const statusMutation = useUpdateSchoolItStudentStatus();

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);

  // Suspend Dialog
  const [suspendModalOpen, setSuspendModalOpen] = useState(false);
  const [studentToSuspend, setStudentToSuspend] = useState<any>(null);
  const [suspendReason, setSuspendReason] = useState("");

  // Graduate/Left Dialog
  const [graduateModalOpen, setGraduateModalOpen] = useState(false);
  const [studentToGraduate, setStudentToGraduate] = useState<any>(null);

  // Unsuspend Dialog
  const [unsuspendModalOpen, setUnsuspendModalOpen] = useState(false);
  const [studentToUnsuspend, setStudentToUnsuspend] = useState<any>(null);

  const students = data?.data || [];
  const pagination = data?.pagination;
  const totalPages = pagination?.totalPages || 1;
  const total = pagination?.total || 0;
  const counts = data?.counts || { all: total, active: 0, suspended: 0 };
  const classes = dashboardQuery.data?.classes || [];

  const selectedClassName =
    classId !== "ALL"
      ? classes.find((c: any) => c.id === classId)?.name || "Selected Class"
      : null;

  const handleOpenEnrol = () => {
    setSelectedStudent(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (student: any) => {
    setSelectedStudent(student);
    setIsModalOpen(true);
  };

  const handleModalSubmit = (formData: any) => {
    if (selectedStudent) {
      updateMutation.mutate(
        { id: selectedStudent.id, data: formData },
        { onSuccess: () => setIsModalOpen(false) }
      );
    } else {
      enrolMutation.mutate(formData, { onSuccess: () => setIsModalOpen(false) });
    }
  };

  // Suspend handlers
  const handleOpenSuspend = (student: any) => {
    setStudentToSuspend(student);
    setSuspendReason("");
    setSuspendModalOpen(true);
  };

  const handleConfirmSuspend = () => {
    if (!studentToSuspend) return;
    if (!suspendReason.trim()) {
      toast.error("Please provide a reason for suspension");
      return;
    }

    statusMutation.mutate(
      {
        id: studentToSuspend.id,
        data: { isActive: false, reason: suspendReason.trim() },
      },
      {
        onSuccess: () => {
          setSuspendModalOpen(false);
          setStudentToSuspend(null);
        },
      }
    );
  };

  // Graduate handlers
  const handleOpenGraduate = (student: any) => {
    setStudentToGraduate(student);
    setGraduateModalOpen(true);
  };

  const handleConfirmGraduate = () => {
    if (!studentToGraduate) return;

    statusMutation.mutate(
      {
        id: studentToGraduate.id,
        data: {
          isActive: false,
          reason: "The student has either left or graduated",
        },
      },
      {
        onSuccess: () => {
          setGraduateModalOpen(false);
          setStudentToGraduate(null);
        },
      }
    );
  };

  // Unsuspend handlers
  const handleOpenUnsuspend = (student: any) => {
    setStudentToUnsuspend(student);
    setUnsuspendModalOpen(true);
  };

  const handleConfirmUnsuspend = () => {
    if (!studentToUnsuspend) return;

    statusMutation.mutate(
      {
        id: studentToUnsuspend.id,
        data: { isActive: true },
      },
      {
        onSuccess: () => {
          setUnsuspendModalOpen(false);
          setStudentToUnsuspend(null);
        },
      }
    );
  };

  const fromRecord = total > 0 ? (page - 1) * limit + 1 : 0;
  const toRecord = Math.min(page * limit, total);

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Manage Students</h1>
          <p className="text-sm text-gray-500 mt-1">
            Total Enrolled: <span className="font-semibold text-gray-800">{total}</span>
            {selectedClassName && (
              <span className="ml-2 text-xs font-semibold text-brand-primary bg-brand-primary/10 px-2.5 py-0.5 rounded-md">
                {selectedClassName}: {total}
              </span>
            )}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
            <Input
              placeholder="Search by name or ID..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              className="pl-9 pr-8 w-full sm:w-[260px] rounded-xl text-sm border-gray-200 focus:border-brand-primary h-10 py-0"
            />
            {searchInput && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5 rounded-full hover:bg-gray-100 transition-colors"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <Button
            onClick={handleOpenEnrol}
            className="flex items-center justify-center gap-2 rounded-xl px-5 h-10 py-0 text-sm font-medium shadow-xs"
          >
            <Plus size={16} />
            <span>Enrol Student</span>
          </Button>
        </div>
      </div>

      {/* Filter Toolbar: Status Tabs & Class Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 sm:p-4 rounded-xl border border-gray-100 shadow-sm">
        {/* Status Tabs: All, Active, Suspended */}
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
              setStatusFilter("ACTIVE");
              setPage(1);
            }}
            className={cn(
              "px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer",
              statusFilter === "ACTIVE"
                ? "bg-white text-emerald-700 shadow-xs"
                : "text-gray-500 hover:text-gray-900"
            )}
          >
            <span>Active</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-50 text-emerald-700 font-medium">
              {counts.active}
            </span>
          </button>
          <button
            type="button"
            onClick={() => {
              setStatusFilter("SUSPENDED");
              setPage(1);
            }}
            className={cn(
              "px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer",
              statusFilter === "SUSPENDED"
                ? "bg-white text-amber-700 shadow-xs"
                : "text-gray-500 hover:text-gray-900"
            )}
          >
            <span>Suspended</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-50 text-amber-700 font-medium">
              {counts.suspended}
            </span>
          </button>
        </div>

        {/* Class Dropdown Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-gray-500 whitespace-nowrap">Filter Class:</span>
          <Select
            value={classId}
            onValueChange={(val) => {
              setClassId(val);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-[180px] h-9 text-xs rounded-xl border-gray-200 focus:border-brand-primary bg-white">
              <SelectValue placeholder="All Classes" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="ALL">All Classes</SelectItem>
              {classes.map((cls: any) => (
                <SelectItem key={cls.id} value={cls.id}>
                  {cls.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Students Table */}
      <Card className="overflow-hidden border border-gray-100 shadow-sm rounded-xl">
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader className="bg-gray-50/75 border-b border-gray-100">
              <TableRow>
                <TableHead className="w-[80px]">Profile</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Student ID</TableHead>
                <TableHead>Class</TableHead>
                <TableHead>Gender</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Enrolled Date</TableHead>
                <TableHead className="text-right w-[70px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-gray-500 py-10">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin text-brand-primary" />
                      <span className="text-xs font-medium">Loading students...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : students.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-gray-500 py-10">
                    <p className="text-sm font-medium text-gray-600">No students found.</p>
                    <p className="text-xs text-gray-400 mt-1">Try adjusting your filters or search keyword.</p>
                  </TableCell>
                </TableRow>
              ) : (
                students.map((student: any) => (
                  <TableRow key={student.id} className="hover:bg-gray-50/80 transition-colors">
                    {/* Profile */}
                    <TableCell>
                      {student.profilePicture ? (
                        <img
                          src={student.profilePicture}
                          alt="Profile"
                          className="w-10 h-10 rounded-full object-cover border border-gray-100"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-brand-primary/10 text-brand-primary flex items-center justify-center font-bold uppercase text-xs">
                          {(student.firstName?.[0] || "")}{(student.lastName?.[0] || "")}
                        </div>
                      )}
                    </TableCell>

                    {/* Name */}
                    <TableCell className="font-semibold text-gray-900 capitalize">
                      {capitalizeInitials(`${student.firstName || ""} ${student.lastName || ""}`.trim())}
                    </TableCell>

                    {/* Student ID */}
                    <TableCell>
                      <span className="font-mono text-xs font-medium text-gray-600 bg-gray-50 px-2 py-0.5 rounded border border-gray-200/60">
                        {student.studentId}
                      </span>
                    </TableCell>

                    {/* Class */}
                    <TableCell className="text-sm font-medium text-gray-700">
                      {student.class?.name || <span className="text-gray-400 italic">Unassigned</span>}
                    </TableCell>

                    {/* Gender (Sentence Case) */}
                    <TableCell className="text-sm text-gray-600">
                      {student.gender === "MALE"
                        ? "Male"
                        : student.gender === "FEMALE"
                        ? "Female"
                        : student.gender
                        ? student.gender.charAt(0).toUpperCase() + student.gender.slice(1).toLowerCase()
                        : "N/A"}
                    </TableCell>

                    {/* Status */}
                    <TableCell>
                      <span
                        className={cn(
                          "px-2.5 py-0.5 inline-flex text-xs font-semibold rounded-full",
                          student.isActive
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                            : "bg-amber-50 text-amber-700 border border-amber-200/60"
                        )}
                      >
                        {student.isActive ? "Active" : "Suspended"}
                      </span>
                    </TableCell>

                    {/* Enrolled Date */}
                    <TableCell className="text-xs text-gray-500">
                      {new Date(student.createdAt).toLocaleDateString()}
                    </TableCell>

                    {/* Actions Dropdown */}
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
                            <DropdownMenuItem
                              onClick={() => handleOpenEdit(student)}
                              className="flex items-center gap-2 text-xs font-medium cursor-pointer rounded-lg px-2.5 py-2 text-gray-700 hover:bg-gray-100"
                            >
                              <Edit2 className="w-3.5 h-3.5 text-gray-500" />
                              <span>Edit Details</span>
                            </DropdownMenuItem>

                            {student.isActive ? (
                              <>
                                <DropdownMenuItem
                                  onClick={() => handleOpenSuspend(student)}
                                  className="flex items-center gap-2 text-xs font-medium cursor-pointer rounded-lg px-2.5 py-2 text-amber-600 hover:bg-amber-50"
                                >
                                  <UserX className="w-3.5 h-3.5 text-amber-500" />
                                  <span>Suspend Student</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleOpenGraduate(student)}
                                  className="flex items-center gap-2 text-xs font-medium cursor-pointer rounded-lg px-2.5 py-2 text-purple-600 hover:bg-purple-50"
                                >
                                  <GraduationCap className="w-3.5 h-3.5 text-purple-500" />
                                  <span>Graduate / Left</span>
                                </DropdownMenuItem>
                              </>
                            ) : (
                              <DropdownMenuItem
                                onClick={() => handleOpenUnsuspend(student)}
                                className="flex items-center gap-2 text-xs font-medium cursor-pointer rounded-lg px-2.5 py-2 text-emerald-600 hover:bg-emerald-50"
                              >
                                <UserCheck className="w-3.5 h-3.5 text-emerald-500" />
                                <span>Unsuspend Student</span>
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
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

      {/* Enrol / Edit Modal */}
      <SchoolItStudentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit}
        isLoading={enrolMutation.isPending || updateMutation.isPending}
        student={selectedStudent}
        classes={classes}
        schoolId={dashboardQuery.data?.school?.id || ""}
      />

      {/* Suspend Confirmation Dialog */}
      <Dialog open={suspendModalOpen} onOpenChange={setSuspendModalOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl bg-white border border-gray-100 shadow-xl p-6">
          <DialogHeader>
            <div className="w-11 h-11 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mb-3">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <DialogTitle className="text-lg font-bold text-gray-900">
              Suspend Student
            </DialogTitle>
            <DialogDescription className="text-xs text-gray-500 mt-1">
              Are you sure you want to suspend{" "}
              <strong className="text-gray-800">
                {studentToSuspend
                  ? capitalizeInitials(
                      `${studentToSuspend.firstName || ""} ${studentToSuspend.lastName || ""}`.trim()
                    )
                  : "this student"}
              </strong>{" "}
              ({studentToSuspend?.studentId})? Suspended students will be marked inactive and excluded from active school operations.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-1.5 my-4">
            <Label htmlFor="suspendReason" className="text-xs font-semibold text-gray-700">
              Reason for Suspension <span className="text-red-500">*</span>
            </Label>
            <Input
              id="suspendReason"
              placeholder="e.g. Prolonged absence, disciplinary sanction..."
              value={suspendReason}
              onChange={(e) => setSuspendReason(e.target.value)}
              className="text-xs rounded-xl border-gray-200 focus:border-amber-500"
            />
          </div>

          <DialogFooter className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => setSuspendModalOpen(false)}
              disabled={statusMutation.isPending}
              className="rounded-xl text-xs px-4 py-2 h-auto"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleConfirmSuspend}
              disabled={statusMutation.isPending || !suspendReason.trim()}
              className="bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold px-4 py-2 h-auto flex items-center gap-2"
            >
              {statusMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Suspending...</span>
                </>
              ) : (
                <>
                  <UserX className="w-4 h-4" />
                  <span>Confirm Suspension</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Graduate / Left Dialog */}
      <Dialog open={graduateModalOpen} onOpenChange={setGraduateModalOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl bg-white border border-gray-100 shadow-xl p-6">
          <DialogHeader>
            <div className="w-11 h-11 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center mb-3">
              <GraduationCap className="w-6 h-6" />
            </div>
            <DialogTitle className="text-lg font-bold text-gray-900">
              Mark Student as Graduated / Left
            </DialogTitle>
            <DialogDescription className="text-xs text-gray-500 mt-1">
              Confirm status change for{" "}
              <strong className="text-gray-800">
                {studentToGraduate
                  ? capitalizeInitials(
                      `${studentToGraduate.firstName || ""} ${studentToGraduate.lastName || ""}`.trim()
                    )
                  : "this student"}
              </strong>{" "}
              ({studentToGraduate?.studentId})? The student will be deactivated and marked as:{" "}
              <em className="text-gray-700">&quot;The student has either left or graduated&quot;</em>.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="flex items-center justify-end gap-2 pt-4 border-t border-gray-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => setGraduateModalOpen(false)}
              disabled={statusMutation.isPending}
              className="rounded-xl text-xs px-4 py-2 h-auto"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleConfirmGraduate}
              disabled={statusMutation.isPending}
              className="bg-brand-primary text-white hover:bg-brand-primary-2 rounded-xl text-xs font-semibold px-4 py-2 h-auto flex items-center gap-2"
            >
              {statusMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Updating...</span>
                </>
              ) : (
                <>
                  <GraduationCap className="w-4 h-4" />
                  <span>Confirm Status Change</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Unsuspend Confirmation Dialog */}
      <Dialog open={unsuspendModalOpen} onOpenChange={setUnsuspendModalOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl bg-white border border-gray-100 shadow-xl p-6">
          <DialogHeader>
            <div className="w-11 h-11 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-3">
              <UserCheck className="w-6 h-6" />
            </div>
            <DialogTitle className="text-lg font-bold text-gray-900">
              Unsuspend Student
            </DialogTitle>
            <DialogDescription className="text-xs text-gray-500 mt-1">
              Are you sure you want to reactivate{" "}
              <strong className="text-gray-800">
                {studentToUnsuspend
                  ? capitalizeInitials(
                      `${studentToUnsuspend.firstName || ""} ${studentToUnsuspend.lastName || ""}`.trim()
                    )
                  : "this student"}
              </strong>{" "}
              ({studentToUnsuspend?.studentId})? The student will be restored to active status.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="flex items-center justify-end gap-2 pt-4 border-t border-gray-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => setUnsuspendModalOpen(false)}
              disabled={statusMutation.isPending}
              className="rounded-xl text-xs px-4 py-2 h-auto"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleConfirmUnsuspend}
              disabled={statusMutation.isPending}
              className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold px-4 py-2 h-auto flex items-center gap-2"
            >
              {statusMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Reactivating...</span>
                </>
              ) : (
                <>
                  <UserCheck className="w-4 h-4" />
                  <span>Confirm Reactivation</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
