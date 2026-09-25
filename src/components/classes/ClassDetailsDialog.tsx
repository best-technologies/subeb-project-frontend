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
import { ClassItem } from "@/services/types/classResponse";
import {
  GraduationCap,
  School,
  MapPin,
  Users,
  Calendar,
  Layers,
  Loader2,
  User,
  CheckCircle,
} from "lucide-react";

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
  const [loadingStudents, setLoadingStudents] = useState(false);

  useEffect(() => {
    if (isOpen && cls?.id) {
      setLoadingStudents(true);
      getClassStudents(cls.id)
        .then((res) => {
          if (res.success && res.data) {
            setStudents(res.data.students || []);
          }
        })
        .catch((err) => console.error("Error loading class students:", err))
        .finally(() => setLoadingStudents(false));
    } else {
      setStudents([]);
    }
  }, [isOpen, cls?.id]);

  if (!cls) return null;

  const capacity = cls.capacity || 35;
  const studentCount = cls.studentCount || cls.currentEnrollment || 0;
  const utilization = Math.round((studentCount / capacity) * 100);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto p-0 border-gray-200">
        {/* Header */}
        <div className="bg-linear-to-r from-emerald-600 to-teal-700 p-6 text-white">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
                  {cls.name}
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-white/20 text-white">
                    {cls.grade}
                  </span>
                </DialogTitle>
                <DialogDescription className="text-emerald-100 text-xs mt-0.5 flex items-center gap-2">
                  <span>{cls.school?.name}</span>
                  {cls.school?.lga && (
                    <>
                      <span>•</span>
                      <span>{cls.school.lga.name} LGA</span>
                    </>
                  )}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
        </div>

        <div className="p-6 space-y-6">
          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-lg border border-gray-100 bg-gray-50/60">
              <span className="text-[11px] text-gray-500 font-medium">Enrolled Students</span>
              <p className="text-lg font-bold text-gray-900 mt-0.5">{studentCount}</p>
            </div>
            <div className="p-3 rounded-lg border border-gray-100 bg-gray-50/60">
              <span className="text-[11px] text-gray-500 font-medium">Total Capacity</span>
              <p className="text-lg font-bold text-gray-900 mt-0.5">{capacity}</p>
            </div>
            <div className="p-3 rounded-lg border border-gray-100 bg-gray-50/60">
              <span className="text-[11px] text-gray-500 font-medium">Utilization</span>
              <p className="text-lg font-bold text-emerald-700 mt-0.5">{utilization}%</p>
            </div>
            <div className="p-3 rounded-lg border border-gray-100 bg-gray-50/60">
              <span className="text-[11px] text-gray-500 font-medium">Academic Year</span>
              <p className="text-sm font-bold text-gray-900 mt-1">{cls.academicYear || "2024-2025"}</p>
            </div>
          </div>

          {/* Student Roster Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-brand-primary" />
                <h4 className="text-sm font-bold text-gray-900">Enrolled Students</h4>
              </div>
              <span className="text-xs text-gray-500 font-medium">
                {students.length} pupil{students.length !== 1 ? "s" : ""}
              </span>
            </div>

            {loadingStudents ? (
              <div className="py-8 flex flex-col items-center justify-center gap-2 text-gray-400">
                <Loader2 className="w-5 h-5 animate-spin text-brand-primary" />
                <span className="text-xs">Loading class student roster...</span>
              </div>
            ) : students.length === 0 ? (
              <div className="py-8 text-center text-xs text-gray-400 bg-gray-50/60 rounded-lg border border-dashed border-gray-200">
                No students currently enrolled in this class section
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
                          {student.lastName} {student.firstName}
                        </p>
                        <p className="text-[10px] text-gray-400 font-mono">
                          ID: {student.studentId || "N/A"}
                        </p>
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
        </div>

        <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end">
          <Button variant="outline" size="sm" onClick={onClose} className="text-xs">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
