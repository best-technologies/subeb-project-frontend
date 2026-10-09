"use client";

import React, { useState, use } from "react";
import { useRouter } from "next/navigation";
import { useExamOfficerSchoolResults, useApproveSchoolResults, useRejectSchoolResults } from "@/services/hooks/useExamOfficer";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, CheckCircle, XCircle, Clock, ShieldCheck, Check, X, Search, Filter, Layers } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ApproveClassResultsModal } from "@/components/officer/ApproveClassResultsModal";
import { formatEducationalText } from "@/utils/formatters";

type StatusFilter = "ALL" | "AWAITING_APPROVAL" | "APPROVED" | "REJECTED";

export default function ExamOffierSchoolResultsView({ params }: { params: Promise<{ schoolId: string }> }) {
  const router = useRouter();
  const { schoolId } = use(params);

  const { data: details, isLoading } = useExamOfficerSchoolResults(schoolId);
  const approveMutation = useApproveSchoolResults();
  const rejectMutation = useRejectSchoolResults();

  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>("ALL");
  const [isClassModalOpen, setIsClassModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    type: "APPROVE" | "REJECT";
    target: "ALL" | "SELECTED" | "SINGLE";
    student?: { id: string; name: string };
  }>({
    isOpen: false,
    type: "APPROVE",
    target: "ALL",
  });

  const students = details?.students || [];
  const classesList = details?.classes || [];
  const awaitingStudents = students.filter((s: any) => s.status === "AWAITING_APPROVAL");
  const approvedStudents = students.filter((s: any) => s.status === "APPROVED");
  const rejectedStudents = students.filter((s: any) => s.status === "REJECTED");

  const filteredStudents = students.filter((item: any) => {
    const matchesFilter =
      statusFilter === "ALL" || item.status === statusFilter;
    const matchesClass =
      selectedClassFilter === "ALL" || item.class?.id === selectedClassFilter;
    const fullName = `${item.student.firstName || ""} ${item.student.lastName || ""}`.toLowerCase();
    const admNo = (item.student.admissionNumber || "").toLowerCase();
    const className = (item.class?.name || "").toLowerCase();
    const query = searchTerm.toLowerCase();
    const matchesSearch = fullName.includes(query) || admNo.includes(query) || className.includes(query);
    return matchesFilter && matchesClass && matchesSearch;
  });

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const awaitingIds = filteredStudents
        .filter((s: any) => s.status === "AWAITING_APPROVAL")
        .map((s: any) => s.student.id);
      setSelectedStudentIds(awaitingIds);
    } else {
      setSelectedStudentIds([]);
    }
  };

  const handleToggleStudent = (studentId: string, checked: boolean) => {
    if (checked) {
      setSelectedStudentIds((prev) => [...prev, studentId]);
    } else {
      setSelectedStudentIds((prev) => prev.filter((id) => id !== studentId));
    }
  };

  const openConfirmDialog = (
    type: "APPROVE" | "REJECT",
    target: "ALL" | "SELECTED" | "SINGLE",
    student?: { id: string; name: string }
  ) => {
    setConfirmDialog({
      isOpen: true,
      type,
      target,
      student,
    });
  };

  const confirmAction = () => {
    const isApprove = confirmDialog.type === "APPROVE";
    const mutation = isApprove ? approveMutation : rejectMutation;

    let payload: { schoolId: string; studentIds?: string[] };
    if (confirmDialog.target === "SINGLE" && confirmDialog.student) {
      payload = { schoolId, studentIds: [confirmDialog.student.id] };
    } else if (confirmDialog.target === "SELECTED") {
      payload = { schoolId, studentIds: selectedStudentIds };
    } else {
      payload = { schoolId };
    }

    mutation.mutate(payload, {
      onSuccess: () => {
        setSelectedStudentIds([]);
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!details) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 text-red-600 p-6 rounded-2xl border border-red-200">
          Failed to load school details.
        </div>
      </div>
    );
  }

  const { school, term } = details;
  const isBusy = approveMutation.isPending || rejectMutation.isPending;
  const hasAwaiting = awaitingStudents.length > 0;
  const awaitingCountInFiltered = filteredStudents.filter((s: any) => s.status === "AWAITING_APPROVAL").length;
  const allAwaitingSelected =
    awaitingCountInFiltered > 0 &&
    filteredStudents
      .filter((s: any) => s.status === "AWAITING_APPROVAL")
      .every((s: any) => selectedStudentIds.includes(s.student.id));

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-center gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <Button
          variant="ghost"
          onClick={() => router.push("/officer/results")}
          className="p-2 h-auto hover:bg-gray-100 rounded-lg"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight capitalize">
            {formatEducationalText(school.name)} - Results
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Session: {term.session?.name || "Active Session"} | Term: {term.name?.replace("_", " ") || "Active Term"}
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          type="button"
          onClick={() => setStatusFilter("ALL")}
          className={`p-4 rounded-xl border text-left transition-all ${
            statusFilter === "ALL"
              ? "bg-brand-primary/5 border-brand-primary shadow-sm"
              : "bg-white border-gray-100 hover:border-gray-200"
          }`}
        >
          <p className="text-xs text-gray-500 font-medium">Total Students</p>
          <p className="text-xl font-bold text-gray-900 mt-1">{students.length}</p>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter("AWAITING_APPROVAL")}
          className={`p-4 rounded-xl border text-left transition-all ${
            statusFilter === "AWAITING_APPROVAL"
              ? "bg-amber-50 border-amber-400 shadow-sm"
              : "bg-white border-gray-100 hover:border-gray-200"
          }`}
        >
          <p className="text-xs text-amber-700 font-medium">Awaiting Approval</p>
          <p className="text-xl font-bold text-amber-800 mt-1">{awaitingStudents.length}</p>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter("APPROVED")}
          className={`p-4 rounded-xl border text-left transition-all ${
            statusFilter === "APPROVED"
              ? "bg-emerald-50 border-emerald-400 shadow-sm"
              : "bg-white border-gray-100 hover:border-gray-200"
          }`}
        >
          <p className="text-xs text-emerald-700 font-medium">Approved (Closed)</p>
          <p className="text-xl font-bold text-emerald-800 mt-1">{approvedStudents.length}</p>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter("REJECTED")}
          className={`p-4 rounded-xl border text-left transition-all ${
            statusFilter === "REJECTED"
              ? "bg-rose-50 border-rose-400 shadow-sm"
              : "bg-white border-gray-100 hover:border-gray-200"
          }`}
        >
          <p className="text-xs text-rose-700 font-medium">Rejected</p>
          <p className="text-xl font-bold text-rose-800 mt-1">{rejectedStudents.length}</p>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4 bg-gray-50/50">
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-60">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search student or admission no..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary w-full bg-white"
              />
            </div>

            {classesList.length > 0 && (
              <div className="flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-gray-400" />
                <select
                  value={selectedClassFilter}
                  onChange={(e) => setSelectedClassFilter(e.target.value)}
                  className="py-2 px-3 text-xs border border-gray-200 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary font-medium"
                >
                  <option value="ALL">All Classes ({classesList.length})</option>
                  {classesList.map((c: any) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.awaitingCount || 0} pending)
                    </option>
                  ))}
                </select>
              </div>
            )}

            {selectedStudentIds.length > 0 && (
              <span className="text-xs text-brand-primary font-medium bg-brand-primary/10 px-2.5 py-1.5 rounded-lg whitespace-nowrap">
                {selectedStudentIds.length} selected
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
            {classesList.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsClassModalOpen(true)}
                className="text-xs text-brand-primary border-brand-primary/30 hover:bg-brand-primary/5 rounded-lg h-9 font-medium"
              >
                <Layers className="w-3.5 h-3.5 mr-1.5 text-brand-primary" />
                Approve / Reject by Class
              </Button>
            )}

            {selectedStudentIds.length > 0 ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedStudentIds([])}
                  className="text-xs text-gray-600 rounded-lg h-9"
                >
                  Clear Selection
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => openConfirmDialog("REJECT", "SELECTED")}
                  className="text-xs text-red-600 border-red-200 hover:bg-red-50 rounded-lg h-9"
                  disabled={isBusy}
                >
                  <XCircle className="w-3.5 h-3.5 mr-1.5" />
                  Reject Selected ({selectedStudentIds.length})
                </Button>
                <Button
                  size="sm"
                  onClick={() => openConfirmDialog("APPROVE", "SELECTED")}
                  className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg h-9"
                  disabled={isBusy}
                >
                  <CheckCircle className="w-3.5 h-3.5 mr-1.5" />
                  Approve Selected ({selectedStudentIds.length})
                </Button>
              </>
            ) : hasAwaiting ? (
              <>
                <Button
                  size="sm"
                  onClick={() => openConfirmDialog("REJECT", "ALL")}
                  variant="outline"
                  className="text-xs text-red-600 border-red-200 hover:bg-red-50 rounded-lg h-9"
                  disabled={isBusy}
                >
                  <XCircle className="w-3.5 h-3.5 mr-1.5" />
                  Reject All Awaiting ({awaitingStudents.length})
                </Button>
                <Button
                  size="sm"
                  onClick={() => openConfirmDialog("APPROVE", "ALL")}
                  className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg h-9"
                  disabled={isBusy}
                >
                  <CheckCircle className="w-3.5 h-3.5 mr-1.5" />
                  Approve All Awaiting ({awaitingStudents.length})
                </Button>
              </>
            ) : null}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-gray-50/70">
              <TableRow>
                <TableHead className="w-12 text-center">
                  <Checkbox
                    checked={allAwaitingSelected}
                    disabled={awaitingCountInFiltered === 0}
                    onCheckedChange={(checked) => handleSelectAll(!!checked)}
                    aria-label="Select all awaiting students"
                  />
                </TableHead>
                <TableHead className="text-xs font-semibold text-gray-700">Student Name</TableHead>
                <TableHead className="text-xs font-semibold text-gray-700">Admission No</TableHead>
                <TableHead className="text-xs font-semibold text-gray-700">Class</TableHead>
                <TableHead className="text-xs font-semibold text-gray-700">Assessments</TableHead>
                <TableHead className="text-xs font-semibold text-gray-700">Status</TableHead>
                <TableHead className="text-xs font-semibold text-gray-700 text-right pr-6">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10 text-xs text-gray-500">
                    No students match the current filter.
                  </TableCell>
                </TableRow>
              ) : (
                filteredStudents.map((data: any) => {
                  const studentId = data.student.id;
                  const isAwaiting = data.status === "AWAITING_APPROVAL";
                  const isSelected = selectedStudentIds.includes(studentId);
                  const studentName = `${data.student.firstName || ""} ${data.student.lastName || ""}`.trim();

                  return (
                    <TableRow key={studentId} className="hover:bg-gray-50/70 transition-colors">
                      <TableCell className="text-center">
                        <Checkbox
                          checked={isSelected}
                          disabled={!isAwaiting}
                          onCheckedChange={(checked) => handleToggleStudent(studentId, !!checked)}
                          aria-label={`Select student ${studentName}`}
                        />
                      </TableCell>
                      <TableCell className="font-semibold text-xs text-gray-900">
                        {studentName}
                      </TableCell>
                      <TableCell className="text-xs text-gray-500 font-mono">
                        {data.student.admissionNumber || data.student.studentId || "—"}
                      </TableCell>
                      <TableCell className="text-xs text-gray-700">{data.class?.name || "—"}</TableCell>
                      <TableCell className="text-xs text-gray-700">{data.assessmentCount} subjects</TableCell>
                      <TableCell>
                        {data.status === "AWAITING_APPROVAL" && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                            <Clock className="w-3.5 h-3.5" />
                            Awaiting
                          </span>
                        )}
                        {data.status === "APPROVED" && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                            Approved (Closed)
                          </span>
                        )}
                        {data.status === "REJECTED" && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-100 text-rose-800">
                            <XCircle className="w-3.5 h-3.5 text-rose-600" />
                            Rejected
                          </span>
                        )}
                        {data.status !== "AWAITING_APPROVAL" &&
                          data.status !== "APPROVED" &&
                          data.status !== "REJECTED" && (
                            <span className="text-xs text-gray-400 font-medium">Pending Submission</span>
                          )}
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        {isAwaiting ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openConfirmDialog("APPROVE", "SINGLE", { id: studentId, name: studentName })}
                              className="h-7 px-2.5 text-xs text-emerald-700 border-emerald-300 hover:bg-emerald-50 rounded-lg font-medium"
                              disabled={isBusy}
                            >
                              <Check className="w-3.5 h-3.5 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openConfirmDialog("REJECT", "SINGLE", { id: studentId, name: studentName })}
                              className="h-7 px-2.5 text-xs text-rose-700 border-rose-300 hover:bg-rose-50 rounded-lg font-medium"
                              disabled={isBusy}
                            >
                              <X className="w-3.5 h-3.5 mr-1" />
                              Reject
                            </Button>
                          </div>
                        ) : data.status === "APPROVED" ? (
                          <span className="text-xs text-emerald-600 font-medium">Closed</span>
                        ) : data.status === "REJECTED" ? (
                          <span className="text-xs text-rose-600 font-medium">Awaiting Re-upload</span>
                        ) : null}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialog.isOpen}
        onOpenChange={(isOpen) => !isOpen && setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
      >
        <DialogContent className="sm:max-w-[425px] rounded-2xl bg-white border border-gray-100 shadow-xl p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-gray-900">
              {confirmDialog.type === "APPROVE" ? "Approve Results" : "Reject Results"}
            </DialogTitle>
            <DialogDescription className="text-xs text-gray-600 leading-relaxed pt-2">
              {confirmDialog.target === "SINGLE"
                ? `Are you sure you want to ${
                    confirmDialog.type === "APPROVE" ? "approve" : "reject"
                  } the results for ${confirmDialog.student?.name || "this student"}?`
                : confirmDialog.target === "SELECTED"
                ? `Are you sure you want to ${
                    confirmDialog.type === "APPROVE" ? "approve" : "reject"
                  } results for the ${selectedStudentIds.length} selected students?`
                : `Are you sure you want to ${
                    confirmDialog.type === "APPROVE" ? "approve" : "reject"
                  } all awaiting results for ${formatEducationalText(school.name)}?`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
            <Button
              variant="outline"
              onClick={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
              disabled={isBusy}
              className="rounded-xl text-xs px-4 py-2 h-auto"
            >
              Cancel
            </Button>
            <Button
              className={`rounded-xl text-xs font-semibold px-4 py-2 h-auto ${
                confirmDialog.type === "APPROVE"
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                  : "bg-red-600 hover:bg-red-700 text-white"
              }`}
              onClick={confirmAction}
              disabled={isBusy}
            >
              {isBusy
                ? "Processing..."
                : confirmDialog.type === "APPROVE"
                ? "Yes, Approve"
                : "Yes, Reject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Class Level Actions Modal */}
      <ApproveClassResultsModal
        isOpen={isClassModalOpen}
        onOpenChange={setIsClassModalOpen}
        schoolId={schoolId}
        schoolName={formatEducationalText(school.name)}
        classes={classesList}
      />
    </div>
  );
}
