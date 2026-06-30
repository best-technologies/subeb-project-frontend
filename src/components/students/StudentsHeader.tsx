"use client";
import React from "react";

interface StudentsHeaderProps {
  totalStudents: number;
  averageScore: number;
  getScoreColor: (score: number) => string;
  onAddStudent?: () => void;
}

const StudentsHeader: React.FC<StudentsHeaderProps> = ({
  totalStudents,
  averageScore,
  onAddStudent,
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
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="flex items-center gap-6 mr-4">
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
          {onAddStudent && (
            <button
              onClick={onAddStudent}
              className="bg-white text-brand-primary font-semibold px-6 py-2.5 rounded-lg shadow-md hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Enrol Student
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentsHeader;
