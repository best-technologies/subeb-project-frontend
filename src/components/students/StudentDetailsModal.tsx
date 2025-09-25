"use client";
import React from "react";
import { X, Venus, Mars, ChartColumn, User, School } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/Button";
import { PerformanceStudent } from "@/services/types/studentsDashboardResponse";
import { formatEducationalText } from "@/utils/formatters";

interface StudentDetailsModalProps {
  student: PerformanceStudent | null;
  isOpen: boolean;
  onClose: () => void;
  getScoreColor: (score: number) => string;
  getPositionBadge: (position: number) => string;
}

const StudentDetailsModal: React.FC<StudentDetailsModalProps> = ({
  student,
  isOpen,
  onClose,
  // getScoreColor,
  getPositionBadge,
}) => {
  if (!student) return null;

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <div className="bg-brand-accent-background rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto border border-brand-accent/20 shadow-2xl">
        <div className="sticky top-0 bg-brand-primary p-6 border-b border-brand-primary/20 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  student.gender === "MALE"
                    ? "bg-brand-accent text-brand-accent-contrast"
                    : "bg-brand-secondary text-brand-secondary-contrast"
                }`}
              >
                {student.gender === "MALE" ? (
                  <Mars className="w-6 h-6" />
                ) : (
                  <Venus className="w-6 h-6" />
                )}
              </div>
              <div>
                <h3 className="text-2xl font-bold text-brand-primary-contrast">
                  {formatEducationalText(student.studentName)}
                </h3>
                <p className="text-brand-primary-contrast/70">
                  {student.examNo}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-6">
              {/* Performance Metrics */}
              <div className="flex items-center space-x-4">
                <div className="text-center">
                  <div className="px-3 py-1 rounded-full text-sm font-semibold bg-yellow-500/20 text-yellow-300 border border-yellow-500/30">
                    {student.total}
                  </div>
                  <div className="text-xs text-brand-primary-contrast/70 mt-1">
                    Total Score
                  </div>
                </div>
                <div className="text-center">
                  <div className="px-3 py-1 rounded-full text-sm font-semibold bg-yellow-500/20 text-yellow-300 border border-yellow-500/30">
                    {student.average}%
                  </div>
                  <div className="text-xs text-brand-primary-contrast/70 mt-1">
                    Avg. Score
                  </div>
                </div>
                <div className="text-center">
                  <div className="px-3 py-1 rounded-full text-sm font-semibold bg-yellow-500/20 text-yellow-300 border border-yellow-500/30">
                    {student.position}
                  </div>
                  <div className="text-xs text-brand-primary-contrast/70 mt-1">
                    Position
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="text-brand-primary-contrast/70 hover:text-brand-primary-contrast hover:bg-brand-primary-contrast/10"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

        <div className="p-8 space-y-8">
          {/* Basic Info and School Info */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-brand-primary rounded-xl p-6 border border-brand-primary/20 shadow-lg">
              <h4 className="text-lg font-semibold text-brand-primary-contrast mb-4 flex items-center">
                <User className="w-5 h-5 mr-2" />
                Basic Information
              </h4>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-brand-primary-contrast/10">
                  <span className="text-brand-primary-contrast/70">
                    Student Name
                  </span>
                  <span className="text-brand-primary-contrast font-medium">
                    {formatEducationalText(student.studentName)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-brand-primary-contrast/10">
                  <span className="text-brand-primary-contrast/70">
                    Exam Number
                  </span>
                  <span className="text-brand-primary-contrast font-mono">
                    {student.examNo}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-brand-primary-contrast/10">
                  <span className="text-brand-primary-contrast/70">Gender</span>
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      student.gender === "MALE"
                        ? "bg-brand-accent text-brand-accent-contrast"
                        : "bg-brand-secondary text-brand-secondary-contrast"
                    }`}
                  >
                    {student.gender === "MALE" ? "Male" : "Female"}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-brand-primary-contrast/70">Class</span>
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-brand-accent text-brand-accent-contrast border border-brand-accent/30">
                    {formatEducationalText(student.class)}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-brand-primary rounded-xl p-6 border border-brand-primary/20 shadow-lg">
              <h4 className="text-lg font-semibold text-brand-primary-contrast mb-4 flex items-center">
                <School className="w-5 h-5 mr-2" />
                School Information
              </h4>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-brand-primary-contrast/10">
                  <span className="text-brand-primary-contrast/70">
                    School Name
                  </span>
                  <span className="text-brand-primary-contrast font-medium text-right">
                    {formatEducationalText(student.school)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-brand-primary-contrast/10">
                  <span className="text-brand-primary-contrast/70">Class</span>
                  <span className="text-brand-primary-contrast font-medium">
                    {formatEducationalText(student.class)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-brand-primary-contrast/70">
                    Position in Class
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-semibold ${getPositionBadge(
                      student.position
                    )}`}
                  >
                    {student.position}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Performance Summary */}
          <div className="bg-brand-primary rounded-xl p-6 border border-brand-primary/20 shadow-lg">
            <h4 className="text-lg font-semibold text-brand-primary-contrast mb-6 flex items-center">
              <ChartColumn className="w-5 h-5 mr-2" />
              Performance Summary
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-brand-accent rounded-lg p-4 border border-brand-accent/20">
                <div className="text-sm text-brand-accent-contrast/70 mb-2">
                  Total Score
                </div>
                <div className="text-2xl font-bold text-brand-accent-contrast">
                  {student.total}
                </div>
              </div>
              <div className="bg-brand-secondary rounded-lg p-4 border border-brand-secondary/20">
                <div className="text-sm text-brand-secondary-contrast/70 mb-2">
                  Average Score
                </div>
                <div className="text-2xl font-bold text-brand-secondary-contrast">
                  {student.average}%
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Dialog>
  );
};

export default StudentDetailsModal;
