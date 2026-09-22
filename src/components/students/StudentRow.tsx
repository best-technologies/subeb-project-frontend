"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { Eye, UserRoundPen } from "lucide-react";
import { PerformanceStudent } from "@/services/types/studentsDashboardResponse";
import { formatEducationalText, capitalizeInitials } from "@/utils/formatters";
import { StudentNameText, SchoolNameText } from "@/utils/truncateText";
import { TableRow, TableCell } from "@/components/ui/table";

interface StudentRowProps {
  student: PerformanceStudent;
  getScoreColor: (score: number) => string;
  getScoreBgColor: (score: number) => string;
  getPositionBadge: (position: number) => string;
  onEditStudent: (student: PerformanceStudent) => void;
}

const StudentRow: React.FC<StudentRowProps> = ({
  student,
  onEditStudent,
}) => {
  const router = useRouter();

  const handleViewDetails = () => {
    // Use the student UUID (id) for API calls, not examNo
    router.push(`/students/${student.id}`);
  };

  const renderPositionBadge = (pos: number) => {
    if (pos === 1) {
      return (
        <span className="inline-flex items-center justify-center min-w-6 h-6 px-1.5 rounded-md text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300 shadow-2xs">
          #1
        </span>
      );
    }
    if (pos === 2) {
      return (
        <span className="inline-flex items-center justify-center min-w-6 h-6 px-1.5 rounded-md text-xs font-bold bg-slate-200 text-slate-800 border border-slate-300 shadow-2xs">
          #2
        </span>
      );
    }
    if (pos === 3) {
      return (
        <span className="inline-flex items-center justify-center min-w-6 h-6 px-1.5 rounded-md text-xs font-bold bg-orange-100 text-orange-800 border border-orange-200 shadow-2xs">
          #3
        </span>
      );
    }
    return (
      <span className="inline-flex items-center justify-center min-w-6 h-6 px-1.5 rounded-md text-xs font-semibold bg-gray-100 text-gray-700">
        #{pos}
      </span>
    );
  };

  const isMale = student.gender?.toUpperCase() === "MALE";

  return (
    <TableRow
      key={`${student.examNo}-${student.position}`}
      className="border-b border-gray-100 hover:bg-emerald-50/40 transition-colors duration-150 group"
    >
      {/* Position */}
      <TableCell className="text-center py-3.5">
        {renderPositionBadge(student.position)}
      </TableCell>

      {/* Student Name & Avatar */}
      <TableCell className="py-3.5">
        <div className="flex items-center gap-3">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
              isMale
                ? "bg-blue-100 text-blue-700 border border-blue-200"
                : "bg-rose-100 text-rose-700 border border-rose-200"
            }`}
          >
            {student.studentName ? student.studentName.trim().charAt(0).toUpperCase() : "S"}
          </div>
          <div>
            <div className="text-sm font-semibold text-gray-900 group-hover:text-emerald-700 transition-colors">
              <StudentNameText
                text={capitalizeInitials(student.studentName)}
                className="font-semibold"
              />
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              {isMale ? (
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-50 text-blue-700 border border-blue-200/60">
                  Male
                </span>
              ) : (
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-rose-50 text-rose-700 border border-rose-200/60">
                  Female
                </span>
              )}
            </div>
          </div>
        </div>
      </TableCell>

      {/* Exam Number */}
      <TableCell className="py-3.5">
        <span className="text-xs font-mono font-medium text-gray-700 bg-gray-100/90 border border-gray-200/80 px-2 py-0.5 rounded-md">
          {student.examNo}
        </span>
      </TableCell>

      {/* School */}
      <TableCell className="py-3.5 text-sm text-gray-700">
        <SchoolNameText
          text={capitalizeInitials(student.school)}
          className="font-medium"
        />
      </TableCell>

      {/* Class */}
      <TableCell className="py-3.5">
        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200/60">
          {student.class ? formatEducationalText(student.class) : "N/A"}
        </span>
      </TableCell>

      {/* Total Score */}
      <TableCell className="py-3.5 text-right">
        <span className="inline-block font-bold text-sm text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200/60">
          {student.total?.toLocaleString() || "0"}
        </span>
      </TableCell>

      {/* Average Score */}
      <TableCell className="py-3.5 text-right">
        <span className="inline-block font-semibold text-xs text-gray-800 bg-gray-100 px-2 py-0.5 rounded-md border border-gray-200">
          {student.average}%
        </span>
      </TableCell>

      {/* Actions */}
      <TableCell className="py-3.5 text-center">
        <div className="flex items-center justify-center gap-1">
          <button
            type="button"
            aria-label="View student details"
            onClick={handleViewDetails}
            className="p-1.5 text-gray-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            type="button"
            aria-label="Edit student"
            onClick={() => onEditStudent(student)}
            className="p-1.5 text-gray-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
            title="Edit Student"
          >
            <UserRoundPen className="w-4 h-4" />
          </button>
        </div>
      </TableCell>
    </TableRow>
  );
};

export default StudentRow;
