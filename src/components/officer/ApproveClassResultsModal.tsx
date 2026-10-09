"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  CheckCircle2,
  XCircle,
  Clock,
  ShieldCheck,
  Layers,
  Loader2,
  Building2,
  AlertTriangle,
  GraduationCap,
} from "lucide-react";
import {
  useApproveSchoolResults,
  useRejectSchoolResults,
  useExamOfficerSchoolResults,
} from "@/services/hooks/useExamOfficer";
import { cn } from "@/lib/utils";
import { formatEducationalText } from "@/utils/formatters";

export interface ClassSummaryItem {
  id: string;
  name: string;
  totalStudents: number;
  awaitingCount: number;
  approvedCount: number;
  rejectedCount: number;
}

interface ApproveClassResultsModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  schoolId: string;
  schoolName?: string;
  classes?: ClassSummaryItem[];
  onSuccess?: () => void;
}

export function ApproveClassResultsModal({
  isOpen,
  onOpenChange,
  schoolId,
  schoolName: initialSchoolName,
  classes: providedClasses,
  onSuccess,
}: ApproveClassResultsModalProps) {
  // If classes were not passed directly, fetch them via hook
  const { data: details, isLoading: isFetching } = useExamOfficerSchoolResults(
    isOpen && !providedClasses ? schoolId : ""
  );

  const approveMutation = useApproveSchoolResults();
  const rejectMutation = useRejectSchoolResults();

  const [selectedClassIds, setSelectedClassIds] = useState<string[]>([]);
  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean;
    type: "APPROVE" | "REJECT";
  }>({
    isOpen: false,
    type: "APPROVE",
  });

  // Resolve classes list
  const classesList: ClassSummaryItem[] = useMemo(() => {
    if (providedClasses && providedClasses.length > 0) {
      return providedClasses;
    }
    if (details?.classes && Array.isArray(details.classes)) {
      return details.classes;
    }
    // Fallback: compute from details.students if classes array is empty
    if (details?.students && Array.isArray(details.students)) {
      const classMap = new Map<string, ClassSummaryItem>();
      for (const item of details.students) {
        const clsId = item.class?.id;
        if (!clsId) continue;
        if (!classMap.has(clsId)) {
          classMap.set(clsId, {
            id: clsId,
            name: item.class.name,
            totalStudents: 0,
            awaitingCount: 0,
            approvedCount: 0,
            rejectedCount: 0,
          });
        }
        const cls = classMap.get(clsId)!;
        cls.totalStudents++;
        if (item.status === "AWAITING_APPROVAL") cls.awaitingCount++;
        else if (item.status === "APPROVED") cls.approvedCount++;
        else if (item.status === "REJECTED") cls.rejectedCount++;
      }
      return Array.from(classMap.values()).sort((a, b) =>
        a.name.localeCompare(b.name)
      );
    }
    return [];
  }, [providedClasses, details]);

  const schoolName =
    initialSchoolName || details?.school?.name || "School";

  // When modal opens, auto-select all classes that have pending awaiting approvals
  useEffect(() => {
    if (isOpen && classesList.length > 0) {
      const classesWithPending = classesList
        .filter((c) => c.awaitingCount > 0)
        .map((c) => c.id);
      setSelectedClassIds(classesWithPending);
    } else if (!isOpen) {
      setSelectedClassIds([]);
      setConfirmState({ isOpen: false, type: "APPROVE" });
    }
  }, [isOpen, classesList]);

  const toggleClass = (classId: string) => {
    setSelectedClassIds((prev) =>
      prev.includes(classId)
        ? prev.filter((id) => id !== classId)
        : [...prev, classId]
    );
  };

  const handleSelectAllPending = () => {
    const pendingIds = classesList
      .filter((c) => c.awaitingCount > 0)
      .map((c) => c.id);
    setSelectedClassIds(pendingIds);
  };

  const handleClearSelection = () => {
    setSelectedClassIds([]);
  };

  const selectedClasses = classesList.filter((c) =>
    selectedClassIds.includes(c.id)
  );
  const totalSelectedPending = selectedClasses.reduce(
    (sum, c) => sum + c.awaitingCount,
    0
  );

  const isBusy =
    approveMutation.isPending || rejectMutation.isPending || isFetching;

  const handleExecuteAction = () => {
    if (selectedClassIds.length === 0) return;

    const mutation =
      confirmState.type === "APPROVE" ? approveMutation : rejectMutation;

    mutation.mutate(
      { schoolId, classIds: selectedClassIds },
      {
        onSuccess: () => {
          setConfirmState({ isOpen: false, type: "APPROVE" });
          onOpenChange(false);
          if (onSuccess) onSuccess();
        },
      }
    );
  };

  return (
    <>
      <Dialog open={isOpen && !confirmState.isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
          {/* Header */}
          <DialogHeader className="p-6 pb-4 border-b border-gray-100 bg-gray-50/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-primary/10 flex items-center justify-center text-brand-primary">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold text-gray-900">
                  Approve / Reject by Class
                </DialogTitle>
                <DialogDescription className="text-sm text-gray-500 mt-0.5 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-gray-400" />
                  <span className="font-semibold text-gray-700 capitalize">
                    {formatEducationalText(schoolName)}
                  </span>
                  <span>• Review results in class batches</span>
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {isFetching ? (
              <div className="py-12 flex flex-col items-center justify-center gap-3 text-gray-500">
                <Loader2 className="w-8 h-8 animate-spin text-brand-primary" />
                <p className="text-sm">Loading classes summary...</p>
              </div>
            ) : classesList.length === 0 ? (
              <div className="py-10 text-center text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                <GraduationCap className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-700">No classes found</p>
                <p className="text-xs text-gray-500 mt-1">
                  There are no submitted assessments available for any class in this school.
                </p>
              </div>
            ) : (
              <>
                {/* Controls Bar */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-gray-50 p-3 rounded-xl border border-gray-100 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-700">
                      {classesList.length} total classes
                    </span>
                    <span className="text-gray-300">•</span>
                    <span className="text-amber-700 font-medium">
                      {classesList.filter((c) => c.awaitingCount > 0).length} with pending submissions
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleSelectAllPending}
                      className="text-brand-primary hover:text-brand-primary/80 font-medium transition-colors"
                    >
                      Select all pending
                    </button>
                    <span className="text-gray-300">|</span>
                    <button
                      type="button"
                      onClick={handleClearSelection}
                      className="text-gray-500 hover:text-gray-700 font-medium transition-colors"
                    >
                      Clear selection
                    </button>
                  </div>
                </div>

                {/* Class List */}
                <div className="space-y-2.5">
                  {classesList.map((cls) => {
                    const isSelected = selectedClassIds.includes(cls.id);
                    const hasPending = cls.awaitingCount > 0;
                    const allApproved = cls.approvedCount > 0 && cls.awaitingCount === 0;

                    return (
                      <div
                        key={cls.id}
                        onClick={() => {
                          if (hasPending) toggleClass(cls.id);
                        }}
                        className={cn(
                          "flex items-center justify-between p-3.5 rounded-xl border transition-all select-none",
                          hasPending ? "cursor-pointer" : "opacity-80 bg-gray-50/50 cursor-default",
                          isSelected
                            ? "bg-brand-primary/5 border-brand-primary/40 shadow-xs"
                            : "bg-white border-gray-200 hover:border-gray-300"
                        )}
                      >
                        <div className="flex items-center gap-3.5">
                          <Checkbox
                            checked={isSelected}
                            disabled={!hasPending}
                            onCheckedChange={() => toggleClass(cls.id)}
                            aria-label={`Select ${cls.name}`}
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-sm text-gray-900">
                                {cls.name}
                              </span>
                              {hasPending ? (
                                <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                                  <Clock className="w-3 h-3" />
                                  {cls.awaitingCount} pending
                                </span>
                              ) : allApproved ? (
                                <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                                  All Approved
                                </span>
                              ) : (
                                <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                                  No pending results
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                              <span>{cls.totalStudents} students evaluated</span>
                              {cls.approvedCount > 0 && (
                                <span className="text-emerald-700">
                                  {cls.approvedCount} approved
                                </span>
                              )}
                              {cls.rejectedCount > 0 && (
                                <span className="text-rose-600">
                                  {cls.rejectedCount} rejected
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-xs font-semibold text-gray-700">
                            {cls.awaitingCount} awaiting
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          {/* Footer */}
          <DialogFooter className="p-4 sm:p-6 border-t border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs text-gray-600 text-center sm:text-left">
              {selectedClassIds.length > 0 ? (
                <span>
                  Selected <strong className="text-gray-900">{selectedClassIds.length}</strong> class
                  {selectedClassIds.length > 1 ? "es" : ""} (
                  <strong className="text-gray-900">{totalSelectedPending}</strong> awaiting student
                  {totalSelectedPending !== 1 ? "s" : ""})
                </span>
              ) : (
                <span className="text-gray-400">Select at least one class to take action</span>
              )}
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onOpenChange(false)}
                disabled={isBusy}
                className="text-xs h-9"
              >
                Cancel
              </Button>

              <Button
                size="sm"
                variant="outline"
                onClick={() => setConfirmState({ isOpen: true, type: "REJECT" })}
                disabled={isBusy || selectedClassIds.length === 0 || totalSelectedPending === 0}
                className="text-xs text-red-600 border-red-200 hover:bg-red-50 h-9"
              >
                <XCircle className="w-3.5 h-3.5 mr-1.5" />
                Reject Selected Classes
              </Button>

              <Button
                size="sm"
                onClick={() => setConfirmState({ isOpen: true, type: "APPROVE" })}
                disabled={isBusy || selectedClassIds.length === 0 || totalSelectedPending === 0}
                className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white h-9"
              >
                <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                Approve Selected Classes
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Step Dialog */}
      <Dialog
        open={confirmState.isOpen}
        onOpenChange={(open) => {
          if (!open) setConfirmState((prev) => ({ ...prev, isOpen: false }));
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center",
                  confirmState.type === "APPROVE"
                    ? "bg-emerald-100 text-emerald-600"
                    : "bg-rose-100 text-rose-600"
                )}
              >
                {confirmState.type === "APPROVE" ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : (
                  <AlertTriangle className="w-5 h-5" />
                )}
              </div>
              <DialogTitle className="text-lg font-bold text-gray-900">
                {confirmState.type === "APPROVE"
                  ? "Approve Class Results"
                  : "Reject Class Results"}
              </DialogTitle>
            </div>
            <DialogDescription className="text-sm text-gray-600 mt-2">
              {confirmState.type === "APPROVE" ? (
                <>
                  Are you sure you want to approve results for{" "}
                  <strong>{selectedClassIds.length}</strong> class
                  {selectedClassIds.length > 1 ? "es" : ""} (
                  <strong>{totalSelectedPending}</strong> students) in{" "}
                  <strong className="capitalize">{formatEducationalText(schoolName)}</strong>? Once approved, they will be
                  marked as Closed and visible to students.
                </>
              ) : (
                <>
                  Are you sure you want to reject results for{" "}
                  <strong>{selectedClassIds.length}</strong> class
                  {selectedClassIds.length > 1 ? "es" : ""} (
                  <strong>{totalSelectedPending}</strong> students) in{" "}
                  <strong className="capitalize">{formatEducationalText(schoolName)}</strong>? The school IT personnel will
                  need to review and re-upload the results.
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          {/* Selected classes badge summary */}
          <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 my-2">
            <p className="text-xs font-semibold text-gray-700 mb-2">Affected Classes:</p>
            <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
              {selectedClasses.map((cls) => (
                <span
                  key={cls.id}
                  className="text-xs bg-white px-2 py-1 rounded-md border border-gray-200 font-medium text-gray-800 shadow-2xs"
                >
                  {cls.name} ({cls.awaitingCount} pending)
                </span>
              ))}
            </div>
          </div>

          <DialogFooter className="mt-4 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setConfirmState((prev) => ({ ...prev, isOpen: false }))}
              disabled={isBusy}
              className="text-xs h-9"
            >
              Back
            </Button>
            <Button
              size="sm"
              onClick={handleExecuteAction}
              disabled={isBusy}
              className={cn(
                "text-xs text-white h-9",
                confirmState.type === "APPROVE"
                  ? "bg-emerald-600 hover:bg-emerald-700"
                  : "bg-rose-600 hover:bg-rose-700"
              )}
            >
              {isBusy
                ? "Processing..."
                : confirmState.type === "APPROVE"
                ? `Confirm Approval (${totalSelectedPending})`
                : `Confirm Rejection (${totalSelectedPending})`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
