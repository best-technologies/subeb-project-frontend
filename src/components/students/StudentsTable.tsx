"use client";
import React from "react";
import { Squirrel } from "lucide-react";
import { PerformanceStudent } from "@/services/types/studentsDashboardResponse";
import StudentRow from "./StudentRow";

interface StudentsTableProps {
  students: PerformanceStudent[];
  sortBy: string;
  sortOrder: "asc" | "desc";
  onSort: (field: string) => void;
  getScoreColor: (score: number) => string;
  getScoreBgColor: (score: number) => string;
  getPositionBadge: (position: number) => string;
  onViewDetails: (student: PerformanceStudent) => void;
  onEditStudent: (student: PerformanceStudent) => void;
}

const StudentsTable: React.FC<StudentsTableProps> = ({
  students,
  sortBy,
  sortOrder,
  onSort,
  getScoreColor,
  getScoreBgColor,
  getPositionBadge,
  onViewDetails,
  onEditStudent,
}) => {
  return (
    <div className="bg-white border border-brand-accent/20 rounded-xl overflow-hidden shadow-lg">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-brand-primary-2">
            <tr>
              <th
                className="px-3 py-4 text-left text-xs font-semibold text-brand-primary-2-contrast uppercase tracking-wider cursor-pointer hover:text-brand-accent-contrast/80 transition-colors duration-200"
                onClick={() => onSort("position")}
              >
                <div className="flex items-center gap-2">
                  <span>Position</span>
                  {sortBy === "position" && (
                    <span className="text-brand-accent-contrast">
                      {sortOrder === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </div>
              </th>
              <th
                className="px-3 py-4 text-left text-xs font-semibold text-brand-primary-2-contrast uppercase tracking-wider cursor-pointer hover:text-brand-accent-contrast/80 transition-colors duration-200"
                onClick={() => onSort("studentName")}
              >
                <div className="flex items-center gap-2">
                  <span>Student</span>
                  {sortBy === "studentName" && (
                    <span className="text-brand-accent-contrast">
                      {sortOrder === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </div>
              </th>
              <th
                className="px-3 py-4 text-left text-xs font-semibold text-brand-primary-2-contrast uppercase tracking-wider cursor-pointer hover:text-brand-accent-contrast/80 transition-colors duration-200"
                onClick={() => onSort("examNo")}
              >
                <div className="flex items-center gap-2">
                  <span>Exam No.</span>
                  {sortBy === "examNo" && (
                    <span className="text-brand-accent-contrast">
                      {sortOrder === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </div>
              </th>
              <th
                className="px-3 py-4 text-left text-xs font-semibold text-brand-primary-2-contrast uppercase tracking-wider cursor-pointer hover:text-brand-accent-contrast/80 transition-colors duration-200"
                onClick={() => onSort("school")}
              >
                <div className="flex items-center gap-2">
                  <span>School</span>
                  {sortBy === "school" && (
                    <span className="text-brand-accent-contrast">
                      {sortOrder === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </div>
              </th>
              <th
                className="px-3 py-4 text-left text-xs font-semibold text-brand-primary-2-contrast uppercase tracking-wider cursor-pointer hover:text-brand-accent-contrast/80 transition-colors duration-200"
                onClick={() => onSort("class")}
              >
                <div className="flex items-center gap-2">
                  <span>Class</span>
                  {sortBy === "class" && (
                    <span className="text-brand-accent-contrast">
                      {sortOrder === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </div>
              </th>
              <th
                className="px-3 py-4 text-left text-xs font-semibold text-brand-primary-2-contrast uppercase tracking-wider cursor-pointer hover:text-brand-accent-contrast/80 transition-colors duration-200"
                onClick={() => onSort("total")}
              >
                <div className="flex items-center gap-2">
                  <span>Total</span>
                  {sortBy === "total" && (
                    <span className="text-brand-accent-contrast">
                      {sortOrder === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </div>
              </th>
              <th
                className="px-3 py-4 text-left text-xs font-semibold text-brand-primary-2-contrast uppercase tracking-wider cursor-pointer hover:text-brand-accent-contrast/80 transition-colors duration-200"
                onClick={() => onSort("average")}
              >
                <div className="flex items-center gap-2">
                  <span>Average</span>
                  {sortBy === "average" && (
                    <span className="text-brand-accent-contrast">
                      {sortOrder === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </div>
              </th>
              <th className="px-3 py-4 text-left text-xs font-semibold text-brand-primary-2-contrast uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-accent/10">
            {students && students.length > 0 ? (
              students.map((student) => (
                <StudentRow
                  key={`${student.examNo}-${student.position}`}
                  student={student}
                  getScoreColor={getScoreColor}
                  getScoreBgColor={getScoreBgColor}
                  getPositionBadge={getPositionBadge}
                  onViewDetails={onViewDetails}
                  onEditStudent={onEditStudent}
                />
              ))
            ) : (
              <tr>
                <td colSpan={8} className="px-3 py-8 text-center">
                  <div className="text-brand-light-accent-1">
                    <div className="flex justify-center mb-4">
                      <Squirrel className="w-16 h-16 text-brand-primary-2" />
                    </div>
                    <p className="text-lg font-medium text-brand-accent-text">
                      No students found
                    </p>
                    <p className="text-sm">
                      Try adjusting your filters or search terms
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StudentsTable;
