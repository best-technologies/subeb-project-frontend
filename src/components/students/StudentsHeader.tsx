"use client";
import React from "react";

interface StudentsHeaderProps {
  totalStudents: number;
  averageScore: number;
  getScoreColor: (score: number) => string;
}

const StudentsHeader: React.FC<StudentsHeaderProps> = ({
  totalStudents,
  averageScore,
  // getScoreColor,
}) => {
  return (
    <div className="bg-brand-primary-2 rounded-xl p-8 shadow-lg hover:opacity-90 transition-all duration-300">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-brand-primary-2-contrast mb-2">
            Students Management
          </h1>
          <p className="text-brand-primary-2-contrast/80 text-lg">
            Comprehensive student records and performance analytics
          </p>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-brand-primary-2-contrast">
              {totalStudents}
            </div>
            <div className="text-sm text-brand-primary-2-contrast/70">
              Total Students
            </div>
          </div>
          <div className="text-center">
            <div className={`text-2xl font-bold text-brand-primary-2-contrast`}>
              {averageScore}%
            </div>
            <div className="text-sm text-brand-primary-2-contrast/70">
              Average Score
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentsHeader;
