"use client";
import React from "react";
import { Search } from "lucide-react";
import { StudentsFilters as StudentsFiltersType } from "@/services/types/studentsDashboardResponse";
import { formatEducationalText } from "@/utils/formatters";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface StudentsFiltersProps {
  filters: StudentsFiltersType;
  lgas: Array<{ id: string; name: string }>;
  availableSchools: Array<{ id: string; name: string }>;
  availableClasses: Array<{ id: string; name: string }>;
  availableSessions: Array<{ id: string; name: string }>;
  availableTerms: Array<{ id: string; name: string }>;

  // Search functionality
  searchTerm: string;
  onSearchChange: (value: string) => void;

  // Progressive filter states
  isSchoolEnabled: boolean;
  isClassEnabled: boolean;
  isTermEnabled: boolean;

  // Actions
  onLgaChange: (lgaId: string, lgaName?: string) => void;
  onSchoolChange: (schoolId: string, schoolName?: string) => void;
  onClassChange: (classId: string) => void;
  onSessionChange: (sessionId: string) => void;
  onTermChange: (termId: string) => void;
  onClearFilters: () => void;
}

const StudentsFilters: React.FC<StudentsFiltersProps> = ({
  filters,
  lgas,
  availableSchools,
  availableClasses,
  availableSessions,
  availableTerms,
  searchTerm,
  onSearchChange,
  isSchoolEnabled,
  isClassEnabled,
  isTermEnabled,
  onLgaChange,
  onSchoolChange,
  onClassChange,
  onSessionChange,
  onTermChange,
  onClearFilters,
}) => {
  // Handler to pass both ID and name when LGA is selected
  const handleLgaChange = (lgaId: string) => {
    if (lgaId === "all-lgas") {
      onClearFilters();
      return;
    }

    const selectedLga = lgas.find((lga) => lga.id === lgaId);
    onLgaChange(lgaId, selectedLga?.name);
  };

  // Handler to pass both ID and name when School is selected
  const handleSchoolChange = (schoolId: string) => {
    if (schoolId === "all-schools") {
      return;
    }

    const selectedSchool = availableSchools.find(
      (school) => school.id === schoolId
    );
    onSchoolChange(schoolId, selectedSchool?.name);
  };

  return (
    <div className="bg-brand-secondary border border-emerald-200/60 rounded-xl p-4 shadow-xs">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-3.5">
        {/* Session Filter */}
        <div>
          <Label className="block text-xs font-semibold text-brand-secondary-contrast mb-1">
            Session
          </Label>
          <Select
            value={filters.session || "all-sessions"}
            onValueChange={(val) => onSessionChange(val === "all-sessions" ? "" : val)}
          >
            <SelectTrigger className="w-full h-9 bg-white border border-gray-200/90 text-gray-800 text-xs sm:text-sm font-medium rounded-lg shadow-2xs hover:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500 transition-colors cursor-pointer">
              <SelectValue placeholder="All Sessions" />
            </SelectTrigger>
            <SelectContent className="bg-white border-gray-200 shadow-lg text-gray-800">
              <SelectGroup>
                <SelectLabel className="text-xs font-semibold text-gray-500">Sessions</SelectLabel>
                <SelectItem value="all-sessions" className="text-xs font-medium cursor-pointer">All Sessions</SelectItem>
                {availableSessions.map((session) => (
                  <SelectItem key={session.id} value={session.id} className="text-xs font-medium cursor-pointer">
                    {session.name}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        {/* Term Filter */}
        <div>
          <Label className="block text-xs font-semibold text-brand-secondary-contrast mb-1">
            Term
          </Label>
          <Select
            value={filters.term || "all-terms"}
            onValueChange={(val) => onTermChange(val === "all-terms" ? "" : val)}
            disabled={!isTermEnabled}
          >
            <SelectTrigger
              className={`w-full h-9 text-xs sm:text-sm font-medium rounded-lg shadow-2xs transition-colors ${
                isTermEnabled
                  ? "bg-white border border-gray-200/90 text-gray-800 hover:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500 cursor-pointer"
                  : "bg-white/60 border border-gray-200 text-gray-400 cursor-not-allowed"
              }`}
            >
              <SelectValue
                placeholder={isTermEnabled ? "All Terms" : "Select Session first"}
              />
            </SelectTrigger>
            <SelectContent className="bg-white border-gray-200 shadow-lg text-gray-800">
              <SelectGroup>
                <SelectLabel className="text-xs font-semibold text-gray-500">Terms</SelectLabel>
                <SelectItem value="all-terms" className="text-xs font-medium cursor-pointer">All Terms</SelectItem>
                {isTermEnabled &&
                  availableTerms.map((term) => (
                    <SelectItem key={term.id} value={term.id} className="text-xs font-medium cursor-pointer">
                      {formatEducationalText(term.name.replace(/_/g, " "))}
                    </SelectItem>
                  ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        {/* LGA Filter */}
        <div>
          <Label className="block text-xs font-semibold text-brand-secondary-contrast mb-1">
            LGA
          </Label>
          <Select
            value={filters.lga || "all-lgas"}
            onValueChange={handleLgaChange}
          >
            <SelectTrigger className="w-full h-9 bg-white border border-gray-200/90 text-gray-800 text-xs sm:text-sm font-medium rounded-lg shadow-2xs hover:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500 transition-colors cursor-pointer">
              <SelectValue placeholder="All LGAs" />
            </SelectTrigger>
            <SelectContent className="bg-white border-gray-200 shadow-lg text-gray-800">
              <SelectGroup>
                <SelectLabel className="text-xs font-semibold text-gray-500">LGAs</SelectLabel>
                <SelectItem value="all-lgas" className="text-xs font-medium cursor-pointer">All LGAs</SelectItem>
                {lgas.map((lga) => (
                  <SelectItem key={lga.id} value={lga.id} className="text-xs font-medium cursor-pointer">
                    {formatEducationalText(lga.name)}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        {/* School Filter - Enabled only after LGA selection */}
        <div>
          <Label className="block text-xs font-semibold text-brand-secondary-contrast mb-1">
            School
          </Label>
          <Select
            value={filters.school || "all-schools"}
            onValueChange={handleSchoolChange}
            disabled={!isSchoolEnabled}
          >
            <SelectTrigger
              className={`w-full h-9 text-xs sm:text-sm font-medium rounded-lg shadow-2xs transition-colors ${
                isSchoolEnabled
                  ? "bg-white border border-gray-200/90 text-gray-800 hover:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500 cursor-pointer"
                  : "bg-white/60 border border-gray-200 text-gray-400 cursor-not-allowed"
              }`}
            >
              <SelectValue
                placeholder={
                  isSchoolEnabled ? "All Schools" : "Select LGA first"
                }
              />
            </SelectTrigger>
            <SelectContent className="bg-white border-gray-200 shadow-lg text-gray-800">
              <SelectGroup>
                <SelectLabel className="text-xs font-semibold text-gray-500">Schools</SelectLabel>
                <SelectItem value="all-schools" className="text-xs font-medium cursor-pointer">All Schools</SelectItem>
                {isSchoolEnabled &&
                  availableSchools.map((school) => (
                    <SelectItem key={school.id} value={school.id} className="text-xs font-medium cursor-pointer">
                      {formatEducationalText(school.name)}
                    </SelectItem>
                  ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        {/* Class Filter - Enabled only after School selection */}
        <div>
          <Label className="block text-xs font-semibold text-brand-secondary-contrast mb-1">
            Class
          </Label>
          <Select
            value={filters.class || "all-classes"}
            onValueChange={onClassChange}
            disabled={!isClassEnabled}
          >
            <SelectTrigger
              className={`w-full h-9 text-xs sm:text-sm font-medium rounded-lg shadow-2xs transition-colors ${
                isClassEnabled
                  ? "bg-white border border-gray-200/90 text-gray-800 hover:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500 cursor-pointer"
                  : "bg-white/60 border border-gray-200 text-gray-400 cursor-not-allowed"
              }`}
            >
              <SelectValue
                placeholder={
                  isClassEnabled ? "All Classes" : "Select School first"
                }
              />
            </SelectTrigger>
            <SelectContent className="bg-white border-gray-200 shadow-lg text-gray-800">
              <SelectGroup>
                <SelectLabel className="text-xs font-semibold text-gray-500">Classes</SelectLabel>
                <SelectItem value="all-classes" className="text-xs font-medium cursor-pointer">All Classes</SelectItem>
                {isClassEnabled &&
                  availableClasses.map((classItem) => (
                    <SelectItem key={classItem.id} value={classItem.id} className="text-xs font-medium cursor-pointer">
                      {formatEducationalText(classItem.name)}
                    </SelectItem>
                  ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-3">
        {/* Search Field */}
        <div>
          <Label className="block text-xs font-semibold text-brand-secondary-contrast mb-1">
            Search Students
          </Label>
          <div className="relative">
            <Input
              type="text"
              placeholder="Search by name, exam no, school..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full h-9 bg-white border border-gray-200/90 rounded-lg pl-9 pr-4 py-0 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 text-xs sm:text-sm transition-all duration-200 shadow-2xs"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="w-4 h-4 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Clear Filters */}
        <div className="flex items-end">
          <Button
            onClick={onClearFilters}
            className="w-full sm:w-auto h-9 px-5 py-0 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg transition-colors font-medium text-xs shadow-2xs cursor-pointer inline-flex items-center justify-center"
          >
            Clear Filters
          </Button>
        </div>
      </div>
    </div>
  );
};

export default StudentsFilters;
