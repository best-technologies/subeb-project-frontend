"use client";

import React, { useState, useMemo } from "react";
import {
  Upload,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Sparkles,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { schoolItApi } from "@/services/api/school-it";
import { useUploadSchoolItResults } from "@/services/hooks/useSchoolIt";
import { toast } from "react-hot-toast";

interface BulkResultUploadProps {
  classId: string;
  dashboardData: any;
  onSuccess: () => void;
  onCancel: () => void;
}

interface SubjectItem {
  id: string;
  name: string;
  code?: string;
}

interface PreviewRow {
  rowIndex: number;
  studentDbId: string | null;
  studentId: string;
  studentName: string;
  scores: Record<string, number | null>;
  errors: string[];
  isValid: boolean;
  isSuspended?: boolean;
  suspendedReason?: string;
}

interface PreviewData {
  mapping: Record<string, string>;
  unmapped: string[];
  subjects: SubjectItem[];
  rows: PreviewRow[];
  stats: {
    total: number;
    valid: number;
    invalid: number;
    suspended?: number;
  };
  hasErrors: boolean;
}

export function BulkResultUpload({
  classId,
  dashboardData,
  onSuccess,
  onCancel,
}: BulkResultUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);
  const [editedRows, setEditedRows] = useState<PreviewRow[]>([]);

  const uploadMutation = useUploadSchoolItResults();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleAnalyzeFile = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedFile) {
      toast.error("Please select a CSV or Excel file to upload.");
      return;
    }
    if (!classId) {
      toast.error("Please select a class from the results page first.");
      return;
    }

    setIsAnalyzing(true);
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("classId", classId);

      const res = await schoolItApi.previewBulkResults(formData);
      const data: PreviewData = res.data?.data;

      setPreviewData(data);
      setEditedRows(data.rows || []);
      toast.success("File analyzed & mapped with bulk-d!");
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || "Failed to analyze spreadsheet. Please check the file format."
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Inline cell editor for scores
  const handleScoreChange = (rowIndex: number, subjectId: string, valStr: string) => {
    setEditedRows((prev) =>
      prev.map((row) => {
        if (row.rowIndex !== rowIndex) return row;

        const nextScores = { ...row.scores };
        const nextErrors = [...row.errors];

        if (valStr === "") {
          nextScores[subjectId] = null;
        } else {
          const num = Number(valStr);
          nextScores[subjectId] = isNaN(num) ? null : num;
        }

        // Re-validate score limits
        const invalidScores = Object.entries(nextScores).some(
          ([_, score]) => score !== null && (score < 0 || score > 100)
        );

        const filteredErrors = nextErrors.filter((err) => !err.includes("score must be between 0 and 100"));
        if (invalidScores) {
          filteredErrors.push("All scores must be between 0 and 100.");
        }

        const isValid = filteredErrors.length === 0;

        return {
          ...row,
          scores: nextScores,
          errors: filteredErrors,
          isValid,
        };
      })
    );
  };

  // Suspended students count
  const suspendedCount = useMemo(() => {
    return editedRows.filter((r) => r.isSuspended).length;
  }, [editedRows]);

  // Invalid count for active students only
  const currentInvalidCount = useMemo(() => {
    return editedRows.filter((r) => !r.isSuspended && !r.isValid).length;
  }, [editedRows]);

  const activeValidCount = useMemo(() => {
    return editedRows.filter((r) => !r.isSuspended && r.isValid).length;
  }, [editedRows]);

  const canSubmit = useMemo(() => {
    return (
      activeValidCount > 0 &&
      currentInvalidCount === 0 &&
      !uploadMutation.isPending
    );
  }, [activeValidCount, currentInvalidCount, uploadMutation.isPending]);

  // Final submission handler
  const handleConfirmSubmit = () => {
    if (!canSubmit) return;
    if (
      !dashboardData?.school ||
      !dashboardData?.activeSession ||
      !dashboardData?.activeTerm
    ) {
      toast.error("Active academic session or school context is missing.");
      return;
    }

    const payload = {
      sessionId: dashboardData.activeSession.id,
      termId: dashboardData.activeTerm.id,
      lgaId: dashboardData.school.lgaId,
      schoolId: dashboardData.school.id,
      classId,
      students: editedRows
        .filter((r) => r.studentDbId && !r.isSuspended)
        .map((r) => ({
          studentId: r.studentDbId!,
          subjects: Object.entries(r.scores)
            .filter(([_, score]) => score !== null && score !== undefined)
            .map(([subjectId, score]) => ({
              subjectId,
              score: Number(score),
            })),
        })),
    };

    uploadMutation.mutate(payload, {
      onSuccess: () => {
        onSuccess();
      },
    });
  };

  return (
    <div className="space-y-4">
      {!previewData ? (
        /* STEP 1: Upload & AI Analysis */
        <form onSubmit={handleAnalyzeFile} className="space-y-4">
          <div className="bg-amber-50 p-3.5 rounded-xl border border-amber-200/70 flex items-start gap-3">
            <AlertCircle className="text-amber-600 mt-0.5 shrink-0" size={18} />
            <div className="text-xs text-amber-900 leading-relaxed">
              <strong className="font-semibold">Batch Validation Rule:</strong> If any single student or score fails validation, the entire batch will be locked. You will be able to preview the AI column mapping and edit any values before submitting.
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bulkFile" className="text-xs font-semibold text-gray-700">
              Upload CSV or Excel Spreadsheet (.csv, .xlsx, .xls)
            </Label>
            <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 flex flex-col items-center justify-center bg-gray-50/70 hover:bg-gray-50 transition-colors">
              <Upload size={36} className="text-gray-400 mb-2" />
              <p className="text-xs font-medium text-gray-700 mb-1">
                {selectedFile ? selectedFile.name : "Drag & drop your results sheet here, or click to browse"}
              </p>
              <p className="text-[11px] text-gray-400 mb-4">
                bulk-d will automatically match your spreadsheet columns to system subjects.
              </p>
              <Input
                id="bulkFile"
                type="file"
                accept=".csv, .xlsx, .xls"
                onChange={handleFileChange}
                className="w-[260px] text-xs h-9 py-1 bg-white"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="rounded-xl text-xs px-4 py-2 h-auto"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!selectedFile || isAnalyzing}
              className="rounded-xl text-xs font-semibold px-5 py-2.5 h-auto flex items-center gap-2 bg-brand-primary text-white"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Analyzing with bulk-d (Gemini)...</span>
                </>
              ) : (
                <>
                  <Sparkles size={14} />
                  <span>Analyze & Preview</span>
                </>
              )}
            </Button>
          </div>
        </form>
      ) : (
        /* STEP 2: Interactive Preview & Review Grid */
        <div className="space-y-4">
          {/* Header Toolbar & Gemini Mapping Card */}
          <div className="bg-gradient-to-r from-blue-50/80 to-indigo-50/50 p-4 rounded-2xl border border-blue-100/80 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-blue-600" />
                <h4 className="text-xs font-bold text-blue-950 uppercase tracking-wider">
                  AI Column Mapping Strategy (bulk-d)
                </h4>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPreviewData(null)}
                className="text-xs text-blue-700 hover:text-blue-900 h-7 px-2.5 rounded-lg flex items-center gap-1.5"
              >
                <RefreshCw size={12} />
                <span>Change File</span>
              </Button>
            </div>

            {/* Mapped Badges */}
            <div className="flex flex-wrap gap-1.5 text-xs">
              {Object.entries(previewData.mapping || {}).map(([col, target]) => (
                <span
                  key={col}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/90 border border-blue-200/80 text-[11px] font-medium text-blue-900 shadow-2xs"
                >
                  <span className="font-mono text-gray-500">{col}</span>
                  <span className="text-blue-500 font-bold">&rarr;</span>
                  <span className="font-semibold text-blue-800">{target}</span>
                </span>
              ))}
            </div>

            {/* Stats row */}
            <div className="flex items-center gap-4 text-xs pt-1 border-t border-blue-100/60 font-medium">
              <span className="text-gray-600">
                Total Rows: <strong className="text-gray-900">{editedRows.length}</strong>
              </span>
              <span className="text-emerald-700 flex items-center gap-1">
                <CheckCircle2 size={13} />
                Valid Active: <strong>{activeValidCount}</strong>
              </span>
              {suspendedCount > 0 && (
                <span className="text-amber-700 flex items-center gap-1 font-semibold">
                  <AlertTriangle size={13} />
                  Suspended (Skipped): <strong>{suspendedCount}</strong>
                </span>
              )}
              {currentInvalidCount > 0 && (
                <span className="text-red-600 flex items-center gap-1 font-semibold">
                  <AlertTriangle size={13} />
                  Errors: <strong>{currentInvalidCount}</strong>
                </span>
              )}
            </div>
          </div>

          {/* Suspended Students Alert Banner */}
          {suspendedCount > 0 && (
            <div className="bg-amber-50 p-3.5 rounded-xl border border-amber-200/80 flex items-start gap-3">
              <AlertTriangle className="text-amber-600 mt-0.5 shrink-0" size={18} />
              <div className="text-xs text-amber-900 leading-relaxed">
                <strong className="font-semibold">Suspended Student(s) Detected:</strong>{" "}
                {suspendedCount} student(s) in this sheet are currently suspended. Their results{" "}
                <strong>will not be saved to awaiting approval</strong> and will be skipped. Only active students will be saved. To record results for these students, unsuspend them in the Student Directory first and try again.
              </div>
            </div>
          )}

          {/* Validation Banner */}
          {currentInvalidCount > 0 ? (
            <div className="bg-red-50 p-3.5 rounded-xl border border-red-200/80 flex items-start gap-3">
              <AlertTriangle className="text-red-600 mt-0.5 shrink-0" size={18} />
              <div className="text-xs text-red-900">
                <strong className="font-semibold">Submission Locked:</strong> {currentInvalidCount} active row(s) contain validation errors (e.g. unrecognized student ID or scores outside 0–100). Please edit the highlighted cells directly below before submitting.
              </div>
            </div>
          ) : (
            <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200/80 flex items-center gap-2 text-xs text-emerald-900 font-medium">
              <CheckCircle2 size={16} className="text-emerald-600" />
              <span>
                {suspendedCount > 0
                  ? `All ${activeValidCount} active student records passed validation! Suspended students will be skipped.`
                  : "All student records and scores passed validation! Review entries and click \"Submit Results\" below."}
              </span>
            </div>
          )}

          {/* Data Preview Table */}
          <div className="border border-gray-200 rounded-xl overflow-hidden max-h-[380px] overflow-y-auto">
            <Table>
              <TableHeader className="bg-gray-50 sticky top-0 z-10 border-b border-gray-200">
                <TableRow>
                  <TableHead className="w-[60px] text-xs">#</TableHead>
                  <TableHead className="w-[140px] text-xs">Student ID</TableHead>
                  <TableHead className="w-[180px] text-xs">Student Name (Reviewer)</TableHead>
                  {previewData.subjects.map((s) => (
                    <TableHead key={s.id} className="min-w-[100px] text-xs text-center">
                      {s.name}
                    </TableHead>
                  ))}
                  <TableHead className="w-[140px] text-xs text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {editedRows.map((row) => (
                  <TableRow
                    key={row.rowIndex}
                    className={
                      row.isSuspended
                        ? "bg-amber-50/40 text-gray-500 hover:bg-amber-50/60"
                        : !row.isValid
                        ? "bg-red-50/40 hover:bg-red-50/60"
                        : "hover:bg-gray-50/50"
                    }
                  >
                    {/* Row Index */}
                    <TableCell className="font-mono text-xs text-gray-500">
                      {row.rowIndex}
                    </TableCell>

                    {/* Student ID */}
                    <TableCell>
                      <span className="font-mono text-xs font-semibold text-gray-800 bg-gray-100 px-2 py-0.5 rounded">
                        {row.studentId}
                      </span>
                    </TableCell>

                    {/* Student Name */}
                    <TableCell className="text-xs font-medium text-gray-800">
                      <div className="flex items-center gap-1.5">
                        <span>{row.studentName}</span>
                        {row.isSuspended && (
                          <span className="text-[10px] font-semibold text-amber-800 bg-amber-100 border border-amber-200 px-1.5 py-0.2 rounded-full uppercase tracking-wider">
                            Suspended
                          </span>
                        )}
                      </div>
                    </TableCell>

                    {/* Subject Scores (Editable inputs) */}
                    {previewData.subjects.map((subj) => {
                      const scoreVal = row.scores[subj.id];
                      const isOutOfRange = scoreVal !== null && (scoreVal < 0 || scoreVal > 100);

                      return (
                        <TableCell key={subj.id} className="p-1.5 text-center">
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            value={scoreVal === null || scoreVal === undefined ? "" : scoreVal}
                            onChange={(e) =>
                              handleScoreChange(row.rowIndex, subj.id, e.target.value)
                            }
                            disabled={row.isSuspended}
                            title={row.isSuspended ? "Cannot edit score for suspended student" : undefined}
                            className={
                              "h-7 w-20 text-xs text-center mx-auto rounded-lg " +
                              (row.isSuspended
                                ? "bg-gray-100/80 border-gray-200 opacity-60 cursor-not-allowed text-gray-400"
                                : isOutOfRange
                                ? "border-red-500 bg-red-50 text-red-900 focus:border-red-600 font-bold"
                                : "border-gray-200")
                            }
                          />
                        </TableCell>
                      );
                    })}

                    {/* Status / Errors */}
                    <TableCell className="text-right">
                      {row.isSuspended ? (
                        <span
                          title={row.suspendedReason || "Student is currently suspended. This result will be skipped upon upload."}
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-800 bg-amber-100/90 px-2.5 py-0.5 rounded-full border border-amber-300 shadow-2xs whitespace-nowrap"
                        >
                          <AlertTriangle size={11} className="text-amber-600" />
                          Suspended (Skipped)
                        </span>
                      ) : row.isValid ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
                          <CheckCircle2 size={11} />
                          Valid
                        </span>
                      ) : (
                        <span
                          title={row.errors.join("\n")}
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-700 bg-red-100/80 px-2 py-0.5 rounded-full border border-red-200 cursor-help"
                        >
                          <AlertTriangle size={11} />
                          Error
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            <span className="text-xs text-gray-500">
              {currentInvalidCount > 0
                ? "Resolve all " + currentInvalidCount + " errors to enable upload"
                : activeValidCount > 0
                ? `Ready to upload results for ${activeValidCount} active student(s)`
                : "No valid active students to upload"}
            </span>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="rounded-xl text-xs px-4 py-2 h-auto"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleConfirmSubmit}
                disabled={!canSubmit}
                className="rounded-xl text-xs font-semibold px-5 py-2.5 h-auto bg-brand-primary text-white shadow-xs"
              >
                {uploadMutation.isPending ? (
                  <>
                    <Loader2 size={14} className="animate-spin mr-1.5" />
                    <span>Submitting Results...</span>
                  </>
                ) : (
                  <span>
                    Submit Results ({activeValidCount} active student{activeValidCount !== 1 ? "s" : ""})
                  </span>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
