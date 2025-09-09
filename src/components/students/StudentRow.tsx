"use client";
import React from "react";
import { PerformanceStudent } from "@/services/types/studentsDashboardResponse";
import { formatEducationalText } from "@/utils/formatters";

interface StudentRowProps {
  student: PerformanceStudent;
  getScoreColor: (score: number) => string;
  getScoreBgColor: (score: number) => string;
  getPositionBadge: (position: number) => string;
  onViewDetails: (student: PerformanceStudent) => void;
}

const StudentRow: React.FC<StudentRowProps> = ({
  student,
  getScoreColor,
  getScoreBgColor,
  getPositionBadge,
  onViewDetails,
}) => {
  return (
    <tr
      key={`${student.examNo}-${student.position}`}
      className="hover:bg-brand-accent/5 transition-all duration-200 group"
    >
      <td className="px-6 py-4 whitespace-nowrap">
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-brand-accent text-brand-accent-contrast">
          {student.position}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center space-x-3">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
              student.gender === "MALE"
                ? "bg-brand-primary/20 text-brand-primary"
                : "bg-brand-secondary/20 text-brand-secondary"
            }`}
          >
            {student.gender === "MALE" ? "👨" : "👩"}
          </div>
          <div>
            <div className="text-sm font-semibold text-brand-accent-text group-hover:text-brand-primary transition-colors duration-200">
              {formatEducationalText(student.studentName)}
            </div>
            <div className="text-sm text-brand-light-accent-1">
              {student.gender === "MALE" ? "Male" : "Female"}
            </div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm font-mono text-brand-accent-text bg-brand-accent/10 px-2 py-1 rounded">
          {student.examNo}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div>
          <div className="text-sm font-medium text-brand-accent-text">
            {formatEducationalText(student.school)}
          </div>
          <div className="text-sm text-brand-light-accent-1">
            {formatEducationalText(student.class)}
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-brand-accent/20 text-brand-accent-contrast border border-brand-accent/30">
          {formatEducationalText(student.class)}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
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
      <td className="px-6 py-4 whitespace-nowrap">
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
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
        <button
          onClick={() => onViewDetails(student)}
          className="text-brand-primary hover:text-brand-primary-2 transition-colors duration-200 font-medium hover:underline"
        >
          View Details →
        </button>
      </td>
    </tr>
  );
};

export default StudentRow;
