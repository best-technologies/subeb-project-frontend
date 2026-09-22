"use client";

import React, { useEffect, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { TopStudent } from "@/services/types/adminDashboardResponse";
import {
  StudentDetailsData,
  SubjectBreakdown,
} from "@/services/types/studentDetailsResponse";
import { getStudentDetails } from "@/services/api";
import {
  capitalizeInitials,
  formatEducationalText,
} from "@/utils/formatters";
import {
  Trophy,
  BookOpen,
  School,
  MapPin,
  GraduationCap,
  Sparkles,
  AlertCircle,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/Button";

interface StudentPerformanceSheetProps {
  student: TopStudent | null;
  isOpen: boolean;
  onClose: () => void;
  sessionName?: string;
  termName?: string;
  sessionId?: string;
  termId?: string;
}

export const StudentPerformanceSheet: React.FC<StudentPerformanceSheetProps> = ({
  student,
  isOpen,
  onClose,
  sessionName,
  termName,
  sessionId,
  termId,
}) => {
  const [details, setDetails] = useState<StudentDetailsData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !student?.id) {
      setDetails(null);
      setError(null);
      return;
    }

    let isMounted = true;
    const fetchBreakdown = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await getStudentDetails(
          student.id,
          sessionId || sessionName,
          termId || termName
        );

        if (isMounted) {
          if (response?.success && response.data) {
            setDetails(response.data);
          } else {
            setError(response?.message || "Failed to load student performance breakdown");
          }
        }
      } catch (err: any) {
        if (isMounted) {
          console.error("Error fetching student details breakdown:", err);
          setError(err?.message || "An error occurred while loading subject performances.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchBreakdown();

    return () => {
      isMounted = false;
    };
  }, [isOpen, student?.id, sessionId, sessionName, termId, termName]);

  const renderPositionBadge = (pos?: number) => {
    if (pos === 1) {
      return (
        <span className="inline-flex items-center justify-center min-w-8 h-8 px-2 rounded-lg bg-amber-100 text-amber-900 font-bold text-sm border border-amber-300 shadow-2xs">
          #1
        </span>
      );
    }
    if (pos === 2) {
      return (
        <span className="inline-flex items-center justify-center min-w-8 h-8 px-2 rounded-lg bg-slate-200 text-slate-800 font-bold text-sm border border-slate-300 shadow-2xs">
          #2
        </span>
      );
    }
    if (pos === 3) {
      return (
        <span className="inline-flex items-center justify-center min-w-8 h-8 px-2 rounded-lg bg-orange-100 text-orange-900 font-bold text-sm border border-orange-300 shadow-2xs">
          #3
        </span>
      );
    }
    return (
      <span className="inline-flex items-center justify-center min-w-7 h-7 px-2 rounded-lg text-xs font-bold bg-gray-100 text-gray-700 border border-gray-200">
        #{pos || "-"}
      </span>
    );
  };

  const getScoreColor = (percentage: number) => {
    if (percentage >= 70) return { bg: "bg-emerald-50", text: "text-emerald-700", bar: "bg-emerald-500", border: "border-emerald-200" };
    if (percentage >= 60) return { bg: "bg-blue-50", text: "text-blue-700", bar: "bg-blue-500", border: "border-blue-200" };
    if (percentage >= 50) return { bg: "bg-amber-50", text: "text-amber-700", bar: "bg-amber-500", border: "border-amber-200" };
    return { bg: "bg-rose-50", text: "text-rose-700", bar: "bg-rose-500", border: "border-rose-200" };
  };

  const summary = details?.performanceSummary;
  const subjectBreakdown: SubjectBreakdown[] = summary?.subjectBreakdown || [];

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-lg md:max-w-xl p-0 flex flex-col bg-gray-50/50 overflow-hidden"
      >
        {/* Header section */}
        <SheetHeader className="p-6 bg-white border-b border-gray-200 flex-shrink-0">
          <div className="flex items-start justify-between gap-4 pr-6">
            <div className="flex items-center gap-3">
              {renderPositionBadge(student?.position)}
              <div>
                <SheetTitle className="text-xl font-bold text-gray-900">
                  {student ? capitalizeInitials(student.studentName) : "Student"}
                </SheetTitle>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  {student?.examNumber && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-medium bg-gray-100 text-gray-700 border border-gray-200">
                      {student.examNumber}
                    </span>
                  )}
                  {student?.gender && (
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        student.gender.toUpperCase() === "FEMALE"
                          ? "bg-pink-50 text-pink-700 border border-pink-200"
                          : "bg-blue-50 text-blue-700 border border-blue-200"
                      }`}
                    >
                      {student.gender}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* School and Class tags */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4 pt-4 border-t border-gray-100 text-xs text-gray-600">
            <div className="flex items-center gap-2">
              <School className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span className="truncate font-medium">
                {student?.school ? capitalizeInitials(student.school) : "N/A"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span className="truncate font-medium">
                LGA: {student?.lga ? capitalizeInitials(student.lga) : "N/A"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span className="truncate font-medium">
                Class: {student?.class ? formatEducationalText(student.class) : "N/A"}
              </span>
            </div>
            {(sessionName || termName) && (
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span className="truncate font-medium">
                  {[sessionName, termName ? formatEducationalText(termName.replace(/_/g, " ")) : ""]
                    .filter(Boolean)
                    .join(" • ")}
                </span>
              </div>
            )}
          </div>
        </SheetHeader>

        {/* Scrollable Body Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Performance Overview Banner */}
          <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-xl p-5 text-white shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-300" />
                <span className="text-xs font-semibold tracking-wider uppercase text-emerald-100">
                  Performance Summary
                </span>
              </div>
              {summary?.grade && summary.grade !== "N/A" && (
                <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-white text-emerald-800 shadow-2xs">
                  Grade {summary.grade}
                </span>
              )}
            </div>

            <div className="grid grid-cols-3 gap-3 pt-1 text-center">
              <div className="bg-white/10 rounded-lg p-2.5 backdrop-blur-xs">
                <span className="text-[11px] text-emerald-100 block mb-0.5">Total Score</span>
                <span className="text-lg font-extrabold tracking-tight">
                  {(summary?.totalScore ?? student?.totalScore ?? 0).toLocaleString()}
                </span>
                {(summary?.totalMaxScore || student?.totalMaxScore) ? (
                  <span className="text-[10px] text-emerald-200 block">/ {(summary?.totalMaxScore ?? student?.totalMaxScore)?.toLocaleString()}</span>
                ) : null}
              </div>

              <div className="bg-white/10 rounded-lg p-2.5 backdrop-blur-xs">
                <span className="text-[11px] text-emerald-100 block mb-0.5">Average</span>
                <span className="text-lg font-extrabold tracking-tight">
                  {summary?.averageScore !== undefined && summary.averageScore > 0
                    ? `${Math.round(summary.averageScore * 10) / 10}`
                    : "—"}
                </span>
                <span className="text-[10px] text-emerald-200 block">per subject</span>
              </div>

              <div className="bg-white/10 rounded-lg p-2.5 backdrop-blur-xs">
                <span className="text-[11px] text-emerald-100 block mb-0.5">Percentage</span>
                <span className="text-lg font-extrabold tracking-tight">
                  {summary?.overallPercentage !== undefined && summary.overallPercentage > 0
                    ? `${Math.round(summary.overallPercentage * 10) / 10}%`
                    : "—"}
                </span>
                <span className="text-[10px] text-emerald-200 block">overall</span>
              </div>
            </div>
          </div>

          {/* Subjects Breakdown Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-emerald-600" />
                Subject Performance Breakdown
              </h4>
              <span className="text-xs text-gray-500 font-medium">
                {subjectBreakdown.length} {subjectBreakdown.length === 1 ? "Subject" : "Subjects"}
              </span>
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="p-8 text-center bg-white rounded-xl border border-gray-200 shadow-2xs space-y-3">
                <Loader2 className="w-7 h-7 animate-spin text-emerald-600 mx-auto" />
                <p className="text-xs font-medium text-gray-600">
                  Loading subject performance breakdown...
                </p>
              </div>
            )}

            {/* User-friendly Notice State if data unavailable */}
            {!isLoading && error && (
              <div className="p-5 bg-amber-50/90 border border-amber-200/80 rounded-xl text-amber-900 text-xs flex items-start gap-3">
                <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-amber-900">
                    Individual subject results are not available
                  </p>
                  <p className="text-amber-700 mt-1 leading-relaxed">
                    Subject assessment records have not been uploaded or finalized for the selected academic term. The student's recorded overall score is displayed above.
                  </p>
                </div>
              </div>
            )}

            {/* Empty State */}
            {!isLoading && !error && subjectBreakdown.length === 0 && (
              <div className="p-8 text-center bg-white rounded-xl border border-gray-200 shadow-2xs space-y-2">
                <BookOpen className="w-8 h-8 text-gray-300 mx-auto" />
                <p className="text-sm font-semibold text-gray-700">
                  No Subject Assessments Found
                </p>
                <p className="text-xs text-gray-500 max-w-sm mx-auto">
                  Detailed subject-by-subject assessment scores have not been recorded for this student in the selected academic period.
                </p>
              </div>
            )}

            {/* Subject List */}
            {!isLoading && !error && subjectBreakdown.length > 0 && (
              <div className="space-y-3">
                {subjectBreakdown.map((item, index) => {
                  const subjectName = item.subject?.name || `Subject ${index + 1}`;
                  const percentage = Math.round(item.percentage || 0);
                  const colors = getScoreColor(percentage);

                  return (
                    <div
                      key={item.subject?.id || index}
                      className="p-4 bg-white rounded-xl border border-gray-200/90 hover:border-gray-300 shadow-2xs transition-all duration-150 space-y-2.5"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-md bg-gray-100 text-gray-600 flex items-center justify-center font-bold text-xs">
                            {index + 1}
                          </span>
                          <span className="font-semibold text-sm text-gray-900">
                            {formatEducationalText(subjectName)}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-gray-900">
                            {item.totalScore}
                            <span className="text-xs font-normal text-gray-400">
                              {" "}
                              / {item.totalMaxScore || 100}
                            </span>
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-bold border ${colors.bg} ${colors.text} ${colors.border}`}
                          >
                            {percentage}%
                          </span>
                        </div>
                      </div>

                      {/* Visual Progress Bar */}
                      <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${colors.bar} rounded-full transition-all duration-500`}
                          style={{ width: `${Math.min(100, Math.max(0, percentage))}%` }}
                        />
                      </div>

                      {/* Assessment Breakdown Chips (if CA and Exam exist) */}
                      {item.assessments && item.assessments.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1.5 pt-1">
                          {item.assessments.map((a) => (
                            <span
                              key={a.id}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-gray-50 text-gray-600 border border-gray-200"
                            >
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span className="uppercase font-semibold text-gray-700">
                                {a.type}:
                              </span>
                              <span>
                                {a.score}/{a.maxScore}
                              </span>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <SheetFooter className="p-4 bg-white border-t border-gray-200 flex-shrink-0 flex sm:justify-end">
          <Button
            onClick={onClose}
            className="w-full sm:w-auto bg-gray-900 hover:bg-gray-800 text-white text-xs px-5 py-2 rounded-lg"
          >
            Close
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default StudentPerformanceSheet;
