"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { Eye, UserRoundPen, MoreVertical } from "lucide-react";
import { PerformanceStudent } from "@/services/types/studentsDashboardResponse";
import { formatEducationalText, capitalizeInitials } from "@/utils/formatters";
import { StudentNameText, SchoolNameText } from "@/utils/truncateText";
import { TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/Button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

interface StudentRowProps {
  student: PerformanceStudent;
  serialNumber?: number;
  getScoreColor?: (score: number) => string;
  getScoreBgColor?: (score: number) => string;
  getPositionBadge?: (position: number) => string;
  onEditStudent: (student: PerformanceStudent) => void;
}

const StudentRow: React.FC<StudentRowProps> = ({
  student,
  serialNumber,
  onEditStudent,
}) => {
  const router = useRouter();

  const handleViewDetails = () => {
    router.push(`/students/${student.id}`);
  };

  const isMale = student.gender?.toUpperCase() === "MALE";

  return (
    <TableRow
      key={student.id || student.examNo}
      className="border-b border-gray-100 hover:bg-emerald-50/40 transition-colors duration-150 group"
    >
      {/* S/N */}
      <TableCell className="pl-6 pr-3 py-3.5 text-xs font-semibold text-gray-500 whitespace-nowrap w-[60px]">
        {serialNumber ?? "-"}
      </TableCell>

      {/* Student Name & Avatar */}
      <TableCell className="py-3.5 pr-4">
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

      {/* LGA (Between Exam No. and School) */}
      <TableCell className="py-3.5 text-sm text-gray-700">
        {student.lga ? capitalizeInitials(student.lga) : "N/A"}
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

      {/* Total Score / Max Score */}
      <TableCell className="py-3.5 text-right">
        {(() => {
          const score = student.total ?? 0;
          const rawMax = student.totalMaxScore;
          const defaultMax = 1000;
          const maxScore =
            rawMax && rawMax >= score
              ? rawMax
              : Math.max(score > 0 ? Math.ceil(score / 100) * 100 : defaultMax, defaultMax);

          return (
            <span className="inline-block font-bold text-sm text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200/60 whitespace-nowrap">
              {score.toLocaleString()}
              <span className="text-emerald-600/80 font-medium text-xs">
                /{maxScore.toLocaleString()}
              </span>
            </span>
          );
        })()}
      </TableCell>

      {/* Average Score */}
      <TableCell className="py-3.5 text-right">
        <span className="inline-block font-semibold text-xs text-gray-800 bg-gray-100 px-2 py-0.5 rounded-md border border-gray-200">
          {student.average}%
        </span>
      </TableCell>

      {/* Actions (ShadCN Dropdown with Ellipsis-Vertical) */}
      <TableCell className="py-3.5 pr-6 pl-2 text-center">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 p-0 text-gray-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg cursor-pointer transition-colors"
              aria-label="Student actions"
            >
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-white border-gray-200 shadow-md min-w-[130px] p-1">
            <DropdownMenuItem
              onClick={handleViewDetails}
              className="cursor-pointer gap-2 text-xs font-medium text-gray-700 hover:text-emerald-700 hover:bg-emerald-50 px-2.5 py-1.5 rounded"
            >
              <Eye className="w-3.5 h-3.5 text-emerald-600" />
              <span>View Details</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onEditStudent(student)}
              className="cursor-pointer gap-2 text-xs font-medium text-gray-700 hover:text-emerald-700 hover:bg-emerald-50 px-2.5 py-1.5 rounded"
            >
              <UserRoundPen className="w-3.5 h-3.5 text-emerald-600" />
              <span>Edit Student</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
};

export default StudentRow;
