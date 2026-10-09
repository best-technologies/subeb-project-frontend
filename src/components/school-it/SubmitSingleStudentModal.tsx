"use client";

import React, { useState, useEffect } from "react";
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
  CheckCircle2,
  Loader2,
  Send,
  ShieldAlert,
  UserCheck,
} from "lucide-react";
import { schoolItApi } from "@/services/api/school-it";
import { useSubmitSchoolItResults } from "@/services/hooks/useSchoolIt";

interface StudentInfo {
  id: string;
  name: string;
  studentId: string;
  className: string;
}

interface SubmitSingleStudentModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  student: StudentInfo | null;
  onSuccess: () => void;
}

export function SubmitSingleStudentModal({
  isOpen,
  onOpenChange,
  student,
  onSuccess,
}: SubmitSingleStudentModalProps) {
  const [isChecking, setIsChecking] = useState(false);
  const [checkResult, setCheckResult] = useState<any | null>(null);
  const [checkError, setCheckError] = useState<string | null>(null);

  const submitMutation = useSubmitSchoolItResults();

  useEffect(() => {
    if (!isOpen || !student) {
      setCheckResult(null);
      setCheckError(null);
      return;
    }

    let isMounted = true;
    setIsChecking(true);
    setCheckError(null);

    schoolItApi
      .checkSubmission({ studentId: student.id })
      .then((res) => {
        if (isMounted) {
          setCheckResult(res.data);
          setIsChecking(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setCheckError(
            err.response?.data?.message || "Failed to validate student results."
          );
          setIsChecking(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, student]);

  const handleConfirmSubmit = () => {
    if (!student || !checkResult?.canSubmit) return;

    submitMutation.mutate(
      { studentId: student.id },
      {
        onSuccess: () => {
          onSuccess();
          onOpenChange(false);
        },
      }
    );
  };

  const hasBlockers = (checkResult?.blockers?.length || 0) > 0;
  const canSubmit = Boolean(checkResult?.canSubmit && !isChecking && !submitMutation.isPending);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] rounded-2xl bg-white border border-gray-100 shadow-xl p-6">
        <DialogHeader className="pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-brand-primary/10 rounded-xl text-brand-primary">
              <UserCheck size={18} />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-gray-900">
                Submit Individual Result
              </DialogTitle>
              <DialogDescription className="text-xs text-gray-500 mt-0.5">
                Submit results for an individual student in {student?.className}.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {student && (
            <div className="p-3.5 bg-gray-50/80 rounded-xl border border-gray-100 text-xs space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Student Name:</span>
                <span className="font-bold text-gray-900">{student.name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Admission No:</span>
                <span className="font-semibold text-gray-700">{student.studentId}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Class:</span>
                <span className="font-semibold text-gray-700">{student.className}</span>
              </div>
            </div>
          )}

          {isChecking ? (
            <div className="p-6 text-center rounded-xl bg-gray-50/50 flex flex-col items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin text-brand-primary" />
              <p className="text-xs text-gray-600">Verifying subject completeness...</p>
            </div>
          ) : checkError ? (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-2.5">
              <AlertCircle size={16} className="text-red-600 mt-0.5 shrink-0" />
              <span>{checkError}</span>
            </div>
          ) : hasBlockers ? (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-900 space-y-2">
              <div className="flex items-center gap-2 font-bold text-xs text-red-700">
                <ShieldAlert size={16} className="shrink-0 text-red-600" />
                <span>Cannot Submit (Incomplete Subject Scores)</span>
              </div>
              <p className="text-xs leading-relaxed text-red-800">
                {checkResult.blockers[0]?.message}
              </p>
              {checkResult.blockers[0]?.missingSubjects?.length > 0 && (
                <div className="mt-2 text-xs">
                  <span className="font-semibold text-red-900">Missing Subjects:</span>{" "}
                  <span className="text-red-800">
                    {checkResult.blockers[0].missingSubjects.join(", ")}
                  </span>
                </div>
              )}
            </div>
          ) : checkResult?.canSubmit ? (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-start gap-2.5">
              <CheckCircle2 size={16} className="text-emerald-600 mt-0.5 shrink-0" />
              <div className="text-xs leading-relaxed">
                All <strong>{checkResult.expectedSubjectCount} subject scores</strong> are complete for this student. Ready for LGA Exam Officer approval.
              </div>
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
            disabled={!canSubmit}
            className="rounded-xl text-xs font-semibold px-4 py-2.5 h-auto flex items-center gap-2"
          >
            {submitMutation.isPending ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                <span>Submitting...</span>
              </>
            ) : (
              <>
                <Send size={14} />
                <span>Submit for Approval</span>
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
