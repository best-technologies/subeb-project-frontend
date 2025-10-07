"use client";
import React from "react";
import { StudentsFilters as StudentsFiltersType } from "@/services/types/studentsDashboardResponse";
import { formatEducationalText } from "@/utils/formatters";

interface StudentsFiltersProps {
  filters: StudentsFiltersType;
  lgas: Array<{ id: string; name: string }>;
  availableSchools: Array<{ id: string; name: string }>;
  availableClasses: Array<{ id: string; name: string }>;
  availableGenders: string[];
  subjects: string[];

  // Progressive filter states
  isSchoolEnabled: boolean;
  isClassEnabled: boolean;
  isGenderEnabled: boolean;

  // Actions
  onLgaChange: (lgaId: string) => void;
  onSchoolChange: (schoolId: string) => void;
  onClassChange: (classId: string) => void;
  onGenderChange: (gender: string) => void;
  onSubjectChange: (subject: string) => void;
  onClearFilters: () => void;
}

const StudentsFilters: React.FC<StudentsFiltersProps> = ({
  filters,
  lgas,
  availableSchools,
  availableClasses,
  availableGenders,
  subjects,
  isSchoolEnabled,
  isClassEnabled,
  isGenderEnabled,
  onLgaChange,
  onSchoolChange,
  onClassChange,
  onGenderChange,
  onSubjectChange,
  onClearFilters,
}) => {
  return (
    <div className="bg-brand-secondary rounded-xl p-6 shadow-lg hover:opacity-90 transition-all duration-300">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        {/* LGA Filter - Always enabled */}
        <div>
          <label className="block text-sm font-medium text-brand-secondary-contrast/80 mb-2">
            LGA
          </label>
          <select
            value={filters.lga || ""}
            onChange={(e) => onLgaChange(e.target.value)}
            className="w-full bg-brand-secondary-contrast/10 border border-brand-secondary-contrast/20 rounded-lg px-3 py-2 text-brand-secondary-contrast placeholder-brand-secondary-contrast/60 focus:outline-none focus:ring-2 focus:ring-brand-secondary-contrast/40 focus:border-transparent"
          >
            <option value="">All LGAs</option>
            {lgas.map((lga) => (
              <option key={lga.id} value={lga.id}>
                {formatEducationalText(lga.name)}
              </option>
            ))}
          </select>
        </div>

        {/* School Filter - Enabled only after LGA selection */}
        <div>
          <label className="block text-sm font-medium text-brand-secondary-contrast/80 mb-2">
            School
          </label>
          <select
            value={filters.school || ""}
            onChange={(e) => onSchoolChange(e.target.value)}
            disabled={!isSchoolEnabled}
            className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-secondary-contrast/40 focus:border-transparent transition-all duration-200 ${
              isSchoolEnabled
                ? "bg-brand-secondary-contrast/10 border-brand-secondary-contrast/20 text-brand-secondary-contrast placeholder-brand-secondary-contrast/60"
                : "bg-brand-secondary-contrast/5 border-brand-secondary-contrast/10 text-brand-secondary-contrast/40 cursor-not-allowed"
            }`}
          >
            <option value="">
              {isSchoolEnabled ? "All Schools" : "Select LGA first"}
            </option>
            {isSchoolEnabled &&
              availableSchools.map((school) => (
                <option key={school.id} value={school.id}>
                  {formatEducationalText(school.name)}
                </option>
              ))}
          </select>
        </div>

        {/* Class Filter - Enabled only after School selection */}
        <div>
          <label className="block text-sm font-medium text-brand-secondary-contrast/80 mb-2">
            Class
          </label>
          <select
            value={filters.class || ""}
            onChange={(e) => onClassChange(e.target.value)}
            disabled={!isClassEnabled}
            className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-secondary-contrast/40 focus:border-transparent transition-all duration-200 ${
              isClassEnabled
                ? "bg-brand-secondary-contrast/10 border-brand-secondary-contrast/20 text-brand-secondary-contrast placeholder-brand-secondary-contrast/60"
                : "bg-brand-secondary-contrast/5 border-brand-secondary-contrast/10 text-brand-secondary-contrast/40 cursor-not-allowed"
            }`}
          >
            <option value="">
              {isClassEnabled ? "All Classes" : "Select School first"}
            </option>
            {isClassEnabled &&
              availableClasses.map((classItem) => (
                <option key={classItem.id} value={classItem.id}>
                  {formatEducationalText(classItem.name)}
                </option>
              ))}
          </select>
        </div>

        {/* Gender Filter - Enabled only after Class selection */}
        <div>
          <label className="block text-sm font-medium text-brand-secondary-contrast/80 mb-2">
            Gender
          </label>
          <select
            value={filters.gender || ""}
            onChange={(e) => onGenderChange(e.target.value)}
            disabled={!isGenderEnabled}
            className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-secondary-contrast/40 focus:border-transparent transition-all duration-200 ${
              isGenderEnabled
                ? "bg-brand-secondary-contrast/10 border-brand-secondary-contrast/20 text-brand-secondary-contrast placeholder-brand-secondary-contrast/60"
                : "bg-brand-secondary-contrast/5 border-brand-secondary-contrast/10 text-brand-secondary-contrast/40 cursor-not-allowed"
            }`}
          >
            <option value="">
              {isGenderEnabled ? "All Genders" : "Select Class first"}
            </option>
            {isGenderEnabled &&
              availableGenders.map((gender) => (
                <option key={gender} value={gender}>
                  {gender === "MALE" ? "Male" : "Female"}
                </option>
              ))}
          </select>
        </div>

        {/* Subject Filter - Always enabled */}
        <div>
          <label className="block text-sm font-medium text-brand-secondary-contrast/80 mb-2">
            Subject
          </label>
          <select
            value={filters.subject || ""}
            onChange={(e) => onSubjectChange(e.target.value)}
            className="w-full bg-brand-secondary-contrast/10 border border-brand-secondary-contrast/20 rounded-lg px-3 py-2 text-brand-secondary-contrast placeholder-brand-secondary-contrast/60 focus:outline-none focus:ring-2 focus:ring-brand-secondary-contrast/40 focus:border-transparent"
          >
            <option value="">All Subjects</option>
            {subjects.map((subject) => (
              <option key={subject} value={subject}>
                {formatEducationalText(subject)}
              </option>
            ))}
          </select>
        </div>

        {/* Clear Filters */}
        <div className="flex items-end">
          <button
            onClick={onClearFilters}
            className="w-full px-4 py-2 bg-brand-primary hover:bg-brand-primary-2 text-brand-primary-contrast rounded-lg transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
          >
            Clear Filters
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentsFilters;
