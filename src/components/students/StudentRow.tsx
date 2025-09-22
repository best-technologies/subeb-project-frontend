"use client";
import React from "react";
import { Mars, Venus, Eye, UserRoundPen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PerformanceStudent } from "@/services/types/studentsDashboardResponse";
import { formatEducationalText } from "@/utils/formatters";
import { StudentNameText, SchoolNameText } from "@/utils/truncateText";

interface StudentRowProps {
  student: PerformanceStudent;
  getScoreColor: (score: number) => string;
  getScoreBgColor: (score: number) => string;
  getPositionBadge: (position: number) => string;
  onViewDetails: (student: PerformanceStudent) => void;
  onEditStudent: (student: PerformanceStudent) => void;
}

const StudentRow: React.FC<StudentRowProps> = ({
  student,
  getScoreColor,
  getScoreBgColor,
  getPositionBadge,
  onViewDetails,
  onEditStudent,
}) => {
  return (
    <tr
      key={`${student.examNo}-${student.position}`}
      className="hover:bg-brand-accent/5 transition-all duration-200 group"
    >
      <td className="px-3 py-4 whitespace-nowrap">
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-brand-accent text-brand-accent-contrast">
          {student.position}
        </span>
      </td>
      <td className="px-3 py-4 whitespace-nowrap">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center bg-brand-accent text-brand-accent-contrast">
            {student.gender === "MALE" ? (
              <Mars className="w-5 h-5" />
            ) : (
              <Venus className="w-5 h-5" />
            )}
          </div>
          <div>
            <div className="text-sm font-semibold text-brand-primary-2 group-hover:text-brand-primary transition-colors duration-200">
              <StudentNameText
                text={formatEducationalText(student.studentName)}
                className="font-semibold"
              />
            </div>
            <div className="text-sm text-brand-light-accent-1">
              {student.gender === "MALE" ? "Male" : "Female"}
            </div>
          </div>
        </div>
      </td>
      <td className="px-3 py-4 whitespace-nowrap">
        <div className="text-sm font-mono text-brand-accent-text bg-brand-accent/10 px-2 py-1 rounded">
          {student.examNo}
        </div>
      </td>
      <td className="px-3 py-4 whitespace-nowrap">
        <div>
          <div className="text-sm font-medium text-brand-primary-2">
            <SchoolNameText
              text={formatEducationalText(student.school)}
              className="font-medium"
            />
          </div>
          <div className="text-sm text-brand-light-accent-1">
            {formatEducationalText(student.class)}
          </div>
        </div>
      </td>
      <td className="px-3 py-4 whitespace-nowrap">
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-brand-accent/20 text-brand-accent-contrast border border-brand-accent/30">
          {formatEducationalText(student.class)}
        </span>
      </td>
      <td className="px-3 py-4 whitespace-nowrap">
        <div
          className={`inline-flex items-center px-3 py-1 rounded-lg text-sm font-semibold ${getScoreBgColor(
            student.total
          )}`}
        >
          <span className={`${getScoreColor(student.total)}`}>
            {student.total}
          </span>
        </div>
      </td>
      <td className="px-3 py-4 whitespace-nowrap">
        <div
          className={`inline-flex items-center px-3 py-1 rounded-lg text-sm font-semibold ${getScoreBgColor(
            student.average
          )}`}
        >
          <span className={`${getScoreColor(student.average)}`}>
            {student.average}%
          </span>
        </div>
      </td>
      <td className="px-3 py-4 whitespace-nowrap text-sm font-medium">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            aria-label="View student details"
            onClick={() => onViewDetails(student)}
            className="h-8 w-8 text-brand-primary hover:text-brand-primary-2 hover:bg-brand-primary/10"
          >
            <Eye className="w-4 h-4" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            aria-label="Edit student"
            onClick={() => onEditStudent(student)}
            className="h-8 w-8 text-brand-primary hover:text-brand-primary-2 hover:bg-brand-primary/10"
          >
            <UserRoundPen className="w-4 h-4" />
          </Button>
        </div>
      </td>
    </tr>
  );
};

export default StudentRow;
