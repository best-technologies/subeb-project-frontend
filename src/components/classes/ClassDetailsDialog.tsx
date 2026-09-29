"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/Button";
import { getClassStudents } from "@/services/api/classes";
import { ClassItem, ClassRegisteredSchool } from "@/services/types/classResponse";
import {
  GraduationCap,
  School,
  MapPin,
  Users,
  Calendar,
  Loader2,
  ChevronDown,
  ChevronUp,
  Building2,
} from "lucide-react";
import { formatEducationalText, capitalizeWords } from "@/utils/formatters";

interface ClassDetailsDialogProps {
  cls: ClassItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ClassDetailsDialog: React.FC<ClassDetailsDialogProps> = ({
  cls,
  isOpen,
  onClose,
}) => {
  const [students, setStudents] = useState<any[]>([]);
  const [schools, setSchools] = useState<ClassRegisteredSchool[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [schoolsOpen, setSchoolsOpen] = useState(true);
  const [studentsOpen, setStudentsOpen] = useState(true);

  useEffect(() => {
    if (isOpen && cls?.id) {
      setSchools(cls.schools || []);
      setLoadingDetails(true);
      getClassStudents(cls.id)
        .then((res) => {
          if (res.success && res.data) {
            setStudents(res.data.students || []);
            if (res.data.schools && res.data.schools.length > 0) {
              setSchools(res.data.schools);
            }
          }
        })
        .catch((err) => console.error("Error loading class details:", err))
        .finally(() => setLoadingDetails(false));
    } else {
      setStudents([]);
      setSchools([]);
    }
  }, [isOpen, cls]);

  if (!cls) return null;

  const totalPupils =
    students.length > 0
      ? students.length
      : cls.studentCount || cls.currentEnrollment || 0;
  const totalSchools =
    schools.length > 0 ? schools.length : cls.schoolsCount || 0;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto p-0 border-gray-200">
        {/* Header - No LGA or School */}
        <div className="bg-linear-to-r from-emerald-600 to-teal-700 p-6 text-white">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
                  {formatEducationalText(cls.name)}
                </DialogTitle>
                <DialogDescription className="text-emerald-100 text-xs mt-0.5">
                  State-Wide Curriculum Class
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
        </div>

        <div className="p-6 space-y-6">
          {/* Quick Metrics: Registered Schools comes in place of Utilization, before Enrolled Students */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded-lg border border-gray-100 bg-gray-50/60">
              <span className="text-[11px] text-gray-500 font-medium">Registered Schools</span>
              <p className="text-lg font-bold text-gray-900 mt-0.5">{totalSchools}</p>
            </div>
            <div className="p-3 rounded-lg border border-gray-100 bg-gray-50/60">
              <span className="text-[11px] text-gray-500 font-medium">Enrolled Students</span>
              <p className="text-lg font-bold text-emerald-700 mt-0.5">{totalPupils}</p>
            </div>
            <div className="p-3 rounded-lg border border-gray-100 bg-gray-50/60">
              <span className="text-[11px] text-gray-500 font-medium">Academic Year</span>
              <p className="text-sm font-bold text-gray-900 mt-1">{cls.academicYear || "2024-2025"}</p>
            </div>
          </div>

          {/* Collapsible 1: Registered Schools (comes before enrolled students) */}
          <div className="border border-gray-200 rounded-xl overflow-hidden">
            <button
              type="button"
              onClick={() => setSchoolsOpen(!schoolsOpen)}
              className="w-full flex items-center justify-between p-3.5 bg-gray-50 hover:bg-gray-100/80 transition-colors text-left"
            >
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-brand-primary" />
                <span className="text-sm font-bold text-gray-900">Registered Schools</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-brand-primary">
                  {totalSchools} school{totalSchools !== 1 ? "s" : ""}
                </span>
              </div>
              {schoolsOpen ? (
                <ChevronUp className="w-4 h-4 text-gray-500" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-500" />
              )}
            </button>

            {schoolsOpen && (
              <div className="p-3 bg-white border-t border-gray-100">
                {loadingDetails && schools.length === 0 ? (
                  <div className="py-6 flex flex-col items-center justify-center gap-2 text-gray-400">
                    <Loader2 className="w-5 h-5 animate-spin text-brand-primary" />
                    <span className="text-xs">Loading registered schools...</span>
                  </div>
                ) : schools.length === 0 ? (
                  <div className="py-6 text-center text-xs text-gray-400 bg-gray-50/60 rounded-lg border border-dashed border-gray-200">
                    No schools currently registered for this class
                  </div>
                ) : (
                  <div className="max-h-56 overflow-y-auto space-y-2 pr-1">
                    {schools.map((sch, idx) => (
                      <div
                        key={sch.id || idx}
                        className="p-2.5 rounded-lg border border-gray-100 hover:border-gray-200 bg-white flex items-center justify-between text-xs transition-colors"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-700 font-bold flex items-center justify-center text-xs">
                            <School className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">
                              {capitalizeWords(sch.name)}
                            </p>
                            <p className="text-[10px] text-gray-500 flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-gray-400" />
                              <span>{capitalizeWords(sch.lgaName || "Abia")} LGA</span>
                            </p>
                          </div>
                        </div>
                        {sch.studentCount !== undefined && (
                          <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-gray-100 text-gray-700">
                            {sch.studentCount} pupil{sch.studentCount !== 1 ? "s" : ""}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Collapsible 2: Enrolled Students (under schools collapsible) */}
          <div className="border border-gray-200 rounded-xl overflow-hidden">
            <button
              type="button"
              onClick={() => setStudentsOpen(!studentsOpen)}
              className="w-full flex items-center justify-between p-3.5 bg-gray-50 hover:bg-gray-100/80 transition-colors text-left"
            >
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-brand-primary" />
                <span className="text-sm font-bold text-gray-900">Enrolled Students</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-brand-primary">
                  {students.length} pupil{students.length !== 1 ? "s" : ""}
                </span>
              </div>
              {studentsOpen ? (
                <ChevronUp className="w-4 h-4 text-gray-500" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-500" />
              )}
            </button>

            {studentsOpen && (
              <div className="p-3 bg-white border-t border-gray-100">
                {loadingDetails && students.length === 0 ? (
                  <div className="py-6 flex flex-col items-center justify-center gap-2 text-gray-400">
                    <Loader2 className="w-5 h-5 animate-spin text-brand-primary" />
                    <span className="text-xs">Loading class student roster...</span>
                  </div>
                ) : students.length === 0 ? (
                  <div className="py-6 text-center text-xs text-gray-400 bg-gray-50/60 rounded-lg border border-dashed border-gray-200">
                    No students currently enrolled in this class
                  </div>
                ) : (
                  <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                    {students.map((student, idx) => (
                      <div
                        key={student.id || idx}
                        className="p-2.5 rounded-lg border border-gray-100 hover:border-gray-200 bg-white flex items-center justify-between text-xs transition-colors"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-emerald-100 text-brand-primary font-bold flex items-center justify-center text-xs">
                            {idx + 1}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">
                              {capitalizeWords(
                                `${student.lastName || ""} ${student.firstName || ""}`.trim()
                              )}
                            </p>
                            <div className="flex items-center gap-2 text-[10px] text-gray-400 font-mono">
                              <span>ID: {student.studentId || "N/A"}</span>
                              {student.schoolName && (
                                <>
                                  <span>•</span>
                                  <span className="font-sans text-gray-500">
                                    {capitalizeWords(student.schoolName)}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        {student.gender && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                            {student.gender}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end">
          <Button
            size="sm"
            onClick={onClose}
            className="bg-brand-primary hover:bg-brand-primary-2 text-white text-xs px-5 h-8.5 font-medium rounded-lg shadow-xs transition-colors"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

