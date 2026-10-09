"use client";

import React, { useState, useEffect, useTransition } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/Button";
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Layers,
  Loader2,
  Send,
  ShieldAlert,
  Users,
  X,
} from "lucide-react";
import { schoolItApi } from "@/services/api/school-it";
import { useSubmitSchoolItResults } from "@/services/hooks/useSchoolIt";
import { cn } from "@/lib/utils";

interface ClassItem {
  id: string;
  name: string;
  _count?: {
    students?: number;
  };
}

interface BlockerItem {
  studentId: string;
  studentCode: string;
  studentName: string;
  className: string;
  uploadedSubjects: number;
  expectedSubjects: number;
  missingSubjects: string[];
  message: string;
}

interface WarningItem {
  classId?: string;
  className?: string;
  totalEnrolled?: number;
  readyCount?: number;
  approvedCount?: number;
  unuploadedCount?: number;
  message: string;
}

interface CheckResponse {
  canSubmit: boolean;
  blockers: BlockerItem[];
  warnings: WarningItem[];
  classesSummary: Array<{
    classId: string;
    className: string;
    totalEnrolled: number;
    readyCount: number;
    approvedCount: number;
    noResultsCount: number;
    incompleteStudentsCount: number;
  }>;
  totalReadyStudents: number;
  expectedSubjectCount: number;
}

interface SubmitClassResultsModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  currentClassId: string;
  classes: ClassItem[];
  onSuccess: () => void;
}

export function SubmitClassResultsModal({
  isOpen,
  onOpenChange,
  currentClassId,
  classes,
  onSuccess,
}: SubmitClassResultsModalProps) {
  const [selectedClassIds, setSelectedClassIds] = useState<string[]>([]);
  const [isChecking, setIsChecking] = useState(false);
  const [checkResult, setCheckResult] = useState<CheckResponse | null>(null);
  const [checkError, setCheckError] = useState<string | null>(null);

  const submitMutation = useSubmitSchoolItResults();

  // Initialize selected classes with currentClassId when modal opens
  useEffect(() => {
    if (isOpen) {
      if (currentClassId && currentClassId !== "ALL") {
        setSelectedClassIds([currentClassId]);
      } else if (classes.length > 0) {
        setSelectedClassIds([classes[0].id]);
      } else {
        setSelectedClassIds([]);
      }
    }
  }, [isOpen, currentClassId, classes]);

  // Run validation whenever selected classes change
  useEffect(() => {
    if (!isOpen || selectedClassIds.length === 0) {
      setCheckResult(null);
      return;
    }

    let isMounted = true;
    setIsChecking(true);
    setCheckError(null);

    schoolItApi
      .checkSubmission({ classIds: selectedClassIds })
      .then((res) => {
        if (isMounted) {
          setCheckResult(res.data);
          setIsChecking(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setCheckError(
            err.response?.data?.message || "Failed to validate submission requirements."
          );
          setIsChecking(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, selectedClassIds]);

  const toggleClass = (classId: string) => {
    setSelectedClassIds((prev) =>
      prev.includes(classId)
        ? prev.filter((id) => id !== classId)
        : [...prev, classId]
    );
  };

  const handleSelectAll = () => {
    setSelectedClassIds(classes.map((c) => c.id));
  };

  const handleSelectCurrentOnly = () => {
    if (currentClassId && currentClassId !== "ALL") {
      setSelectedClassIds([currentClassId]);
    } else if (classes.length > 0) {
      setSelectedClassIds([classes[0].id]);
    }
  };

  const handleConfirmSubmit = () => {
    if (!checkResult?.canSubmit || selectedClassIds.length === 0) return;

    submitMutation.mutate(
      { classIds: selectedClassIds },
      {
        onSuccess: () => {
          onSuccess();
          onOpenChange(false);
        },
      }
    );
  };

  const hasBlockers = (checkResult?.blockers?.length || 0) > 0;
  const hasWarnings = (checkResult?.warnings?.length || 0) > 0;
  const canSubmit = Boolean(checkResult?.canSubmit && !isChecking && !submitMutation.isPending);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto rounded-2xl bg-white border border-gray-100 shadow-xl p-6">
        <DialogHeader className="pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-brand-primary/10 rounded-xl text-brand-primary">
              <Send size={18} />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-gray-900">
                Submit Results for Approval
              </DialogTitle>
              <DialogDescription className="text-xs text-gray-500 mt-0.5">
                Results are submitted by class for LGA Exam Officer review and approval.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-5 py-4">
          {/* Class Selection Section */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                <Layers size={14} className="text-brand-primary" />
                <span>Select Target Classes ({selectedClassIds.length} selected)</span>
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSelectCurrentOnly}
                  className="text-[11px] font-semibold text-brand-primary hover:underline cursor-pointer"
                >
                  Current Class
                </button>
                <span className="text-gray-300">&bull;</span>
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="text-[11px] font-semibold text-brand-primary hover:underline cursor-pointer"
                >
                  Select All Classes
                </button>
              </div>
            </div>

            {/* Class Pill Grid */}
            <div className="flex flex-wrap gap-2 p-3 bg-gray-50/80 rounded-xl border border-gray-200/70 max-h-36 overflow-y-auto">
              {classes.map((cls) => {
                const isSelected = selectedClassIds.includes(cls.id);
                const isCurrent = cls.id === currentClassId;
                return (
                  <button
                    key={cls.id}
                    type="button"
                    onClick={() => toggleClass(cls.id)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer border",
                      isSelected
                        ? "bg-brand-primary text-white border-brand-primary shadow-xs"
                        : "bg-white text-gray-700 border-gray-200 hover:border-brand-primary/50 hover:bg-gray-50"
                    )}
                  >
                    <span>{cls.name}</span>
                    {cls._count?.students !== undefined && (
                      <span
                        className={cn(
                          "text-[10px] px-1.5 py-0.2 rounded-full",
                          isSelected
                            ? "bg-white/20 text-white"
                            : "bg-gray-100 text-gray-500"
                        )}
                      >
                        {cls._count.students}
                      </span>
                    )}
                    {isCurrent && (
                      <span
                        className={cn(
                          "text-[9px] uppercase tracking-wider px-1 py-0.2 rounded font-bold",
                          isSelected ? "bg-white text-brand-primary" : "bg-brand-primary/10 text-brand-primary"
                        )}
                      >
                        Current
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Validation Status & Content */}
          {selectedClassIds.length === 0 ? (
            <div className="p-6 text-center rounded-xl bg-gray-50 border border-dashed border-gray-200 text-gray-500 text-xs">
              Please select at least one class to validate and submit results.
            </div>
          ) : isChecking ? (
            <div className="p-8 text-center rounded-xl bg-gray-50/70 border border-gray-100 flex flex-col items-center justify-center gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-brand-primary" />
              <p className="text-xs font-medium text-gray-600">
                Verifying student subject completeness and class readiness...
              </p>
            </div>
          ) : checkError ? (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-2.5">
              <AlertCircle size={16} className="text-red-600 mt-0.5 shrink-0" />
              <span>{checkError}</span>
            </div>
          ) : checkResult ? (
            <div className="space-y-3.5">
              {/* Summary Stats Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                <div className="bg-emerald-50/80 border border-emerald-200/80 p-3 rounded-xl">
                  <div className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider">
                    Ready for Approval
                  </div>
                  <div className="text-xl font-bold text-emerald-900 mt-0.5">
                    {checkResult.totalReadyStudents}{" "}
                    <span className="text-xs font-normal text-emerald-700">students</span>
                  </div>
                </div>

                <div className="bg-blue-50/80 border border-blue-200/80 p-3 rounded-xl">
                  <div className="text-[11px] font-semibold text-blue-700 uppercase tracking-wider">
                    Required Subjects
                  </div>
                  <div className="text-xl font-bold text-blue-900 mt-0.5">
                    {checkResult.expectedSubjectCount}{" "}
                    <span className="text-xs font-normal text-blue-700">per student</span>
                  </div>
                </div>

                <div className="bg-gray-50 border border-gray-200 p-3 rounded-xl col-span-2 sm:col-span-1">
                  <div className="text-[11px] font-semibold text-gray-600 uppercase tracking-wider">
                    Already Approved
                  </div>
                  <div className="text-xl font-bold text-gray-800 mt-0.5">
                    {checkResult.classesSummary.reduce((acc, c) => acc + c.approvedCount, 0)}{" "}
                    <span className="text-xs font-normal text-gray-500">closed</span>
                  </div>
                </div>
              </div>

              {/* STRICT BLOCKERS (Hard stop: Students with incomplete subject scores) */}
              {hasBlockers && (
                <div className="bg-red-50 border border-red-200 text-red-900 p-4 rounded-xl flex flex-col gap-2.5">
                  <div className="flex items-center gap-2 font-bold text-xs text-red-700">
                    <ShieldAlert size={16} className="shrink-0 text-red-600" />
                    <span>Submission Blocked: Incomplete Subject Scores ({checkResult.blockers.length})</span>
                  </div>
                  <p className="text-xs leading-relaxed text-red-800">
                    Submission cannot proceed because some students have missing subject scores. Every student must have all {checkResult.expectedSubjectCount} subject scores recorded before going for approval.
                  </p>

                  <div className="space-y-1.5 mt-1 max-h-40 overflow-y-auto pr-1">
                    {checkResult.blockers.map((b, i) => (
                      <div
                        key={i}
                        className="bg-white/90 p-2.5 rounded-lg border border-red-200/80 text-xs flex flex-col gap-1 shadow-2xs"
                      >
                        <div className="flex items-center justify-between font-semibold text-gray-900">
                          <span>
                            {b.studentName} <span className="text-gray-500 font-normal">({b.studentCode})</span>
                          </span>
                          <span className="text-[11px] px-2 py-0.5 rounded-md bg-red-100 text-red-800 font-bold">
                            {b.uploadedSubjects}/{b.expectedSubjects} subjects
                          </span>
                        </div>
                        <div className="text-[11px] text-gray-600">
                          <span className="font-semibold text-gray-700">Class:</span> {b.className} &bull;{" "}
                          <span className="font-semibold text-red-700">Missing:</span>{" "}
                          <span className="text-red-800 font-medium">
                            {b.missingSubjects.length > 0 ? b.missingSubjects.join(", ") : "Empty scores"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* NON-BLOCKING WARNINGS (Incomplete class enrollment notice) */}
              {hasWarnings && (
                <div className="bg-amber-50/90 border border-amber-200 text-amber-900 p-4 rounded-xl flex flex-col gap-2">
                  <div className="flex items-center gap-2 font-bold text-xs text-amber-800">
                    <AlertTriangle size={15} className="shrink-0 text-amber-600" />
                    <span>Class Enrollment Notice (Submission Permitted)</span>
                  </div>
                  <p className="text-xs leading-relaxed text-amber-800">
                    Some classes have fewer results uploaded than total enrolled students. This does not block submission — ready students will be submitted now, and you can upload the remaining students later.
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-xs text-amber-900 font-medium mt-1">
                    {checkResult.warnings.map((w, i) => (
                      <li key={i}>{w.message}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Ready notice when completely valid */}
              {!hasBlockers && checkResult.totalReadyStudents > 0 && (
                <div className="bg-emerald-50/70 border border-emerald-200/70 text-emerald-900 p-3.5 rounded-xl flex items-center gap-3">
                  <CheckCircle2 size={18} className="shrink-0 text-emerald-600" />
                  <div className="text-xs leading-relaxed">
                    All subject scores for <strong>{checkResult.totalReadyStudents} student(s)</strong> are complete and ready for LGA Exam Officer approval.
                  </div>
                </div>
              )}

              {/* Notice when no students are ready */}
              {!hasBlockers && checkResult.totalReadyStudents === 0 && (
                <div className="bg-gray-100 border border-gray-200 text-gray-700 p-3.5 rounded-xl text-xs text-center">
                  No unsubmitted results ready for approval in the selected class(es).
                </div>
              )}
            </div>
          ) : null}
        </div>

        <DialogFooter className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="rounded-xl text-xs px-4 py-2 h-auto"
            disabled={submitMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleConfirmSubmit}
            disabled={!canSubmit || checkResult?.totalReadyStudents === 0}
            className="rounded-xl text-xs font-semibold px-5 py-2.5 h-auto flex items-center gap-2"
          >
            {submitMutation.isPending ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                <span>Submitting...</span>
              </>
            ) : hasBlockers ? (
              <span>Fix Missing Scores to Submit</span>
            ) : (
              <>
                <Send size={14} />
                <span>
                  Submit {checkResult?.totalReadyStudents || 0} Student Results
                </span>
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
