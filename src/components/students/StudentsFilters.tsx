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
    <div className="bg-brand-secondary rounded-xl p-6 shadow-lg hover:opacity-90 transition-all duration-300">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {/* Session Filter */}
        <div>
          <Label className="block text-sm font-medium text-brand-secondary-contrast/80 mb-2">
            Session
          </Label>
          <Select
            value={filters.session || "all-sessions"}
            onValueChange={(val) => onSessionChange(val === "all-sessions" ? "" : val)}
          >
            <SelectTrigger className="w-full bg-brand-secondary-contrast/10 border-brand-secondary-contrast/20 text-brand-secondary-contrast h-12">
              <SelectValue placeholder="All Sessions" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Sessions</SelectLabel>
                <SelectItem value="all-sessions">All Sessions</SelectItem>
                {availableSessions.map((session) => (
                  <SelectItem key={session.id} value={session.id}>
                    {session.name}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        {/* Term Filter */}
        <div>
          <Label className="block text-sm font-medium text-brand-secondary-contrast/80 mb-2">
            Term
          </Label>
          <Select
            value={filters.term || "all-terms"}
            onValueChange={(val) => onTermChange(val === "all-terms" ? "" : val)}
            disabled={!isTermEnabled}
          >
            <SelectTrigger
              className={`w-full h-12 transition-all duration-200 ${
                isTermEnabled
                  ? "bg-brand-secondary-contrast/10 border-brand-secondary-contrast/20 text-brand-secondary-contrast"
                  : "bg-brand-secondary-contrast/5 border-brand-secondary-contrast/10 text-brand-secondary-contrast/40 cursor-not-allowed"
              }`}
            >
              <SelectValue
                placeholder={isTermEnabled ? "All Terms" : "Select Session first"}
              />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Terms</SelectLabel>
                <SelectItem value="all-terms">All Terms</SelectItem>
                {isTermEnabled &&
                  availableTerms.map((term) => (
                    <SelectItem key={term.id} value={term.id}>
                      {term.name}
                    </SelectItem>
                  ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        {/* LGA Filter */}
        <div>
          <Label className="block text-sm font-medium text-brand-secondary-contrast/80 mb-2">
            LGA
          </Label>
          <Select
            value={filters.lga || "all-lgas"}
            onValueChange={handleLgaChange}
          >
            <SelectTrigger className="w-full bg-brand-secondary-contrast/10 border-brand-secondary-contrast/20 text-brand-secondary-contrast h-12">
              <SelectValue placeholder="All LGAs" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>LGAs</SelectLabel>
                <SelectItem value="all-lgas">All LGAs</SelectItem>
                {lgas.map((lga) => (
                  <SelectItem key={lga.id} value={lga.id}>
                    {formatEducationalText(lga.name)}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        {/* School Filter - Enabled only after LGA selection */}
        <div>
          <Label className="block text-sm font-medium text-brand-secondary-contrast/80 mb-2">
            School
          </Label>
          <Select
            value={filters.school || "all-schools"}
            onValueChange={handleSchoolChange}
            disabled={!isSchoolEnabled}
          >
            <SelectTrigger
              className={`w-full h-12 transition-all duration-200 ${
                isSchoolEnabled
                  ? "bg-brand-secondary-contrast/10 border-brand-secondary-contrast/20 text-brand-secondary-contrast"
                  : "bg-brand-secondary-contrast/5 border-brand-secondary-contrast/10 text-brand-secondary-contrast/40 cursor-not-allowed"
              }`}
            >
              <SelectValue
                placeholder={
                  isSchoolEnabled ? "All Schools" : "Select LGA first"
                }
              />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Schools</SelectLabel>
                <SelectItem value="all-schools">All Schools</SelectItem>
                {isSchoolEnabled &&
                  availableSchools.map((school) => (
                    <SelectItem key={school.id} value={school.id}>
                      {formatEducationalText(school.name)}
                    </SelectItem>
                  ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        {/* Class Filter - Enabled only after School selection */}
        <div>
          <Label className="block text-sm font-medium text-brand-secondary-contrast/80 mb-2">
            Class
          </Label>
          <Select
            value={filters.class || "all-classes"}
            onValueChange={onClassChange}
            disabled={!isClassEnabled}
          >
            <SelectTrigger
              className={`w-full h-12 transition-all duration-200 ${
                isClassEnabled
                  ? "bg-brand-secondary-contrast/10 border-brand-secondary-contrast/20 text-brand-secondary-contrast"
                  : "bg-brand-secondary-contrast/5 border-brand-secondary-contrast/10 text-brand-secondary-contrast/40 cursor-not-allowed"
              }`}
            >
              <SelectValue
                placeholder={
                  isClassEnabled ? "All Classes" : "Select School first"
                }
              />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Classes</SelectLabel>
                <SelectItem value="all-classes">All Classes</SelectItem>
                {isClassEnabled &&
                  availableClasses.map((classItem) => (
                    <SelectItem key={classItem.id} value={classItem.id}>
                      {formatEducationalText(classItem.name)}
                    </SelectItem>
                  ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_200px] gap-4">

        {/* Search Field */}
        <div>
          <Label className="block text-sm font-medium text-brand-secondary-contrast/80 mb-2">
            Search Students
          </Label>
          <div className="relative">
            <Input
              type="text"
              placeholder="Search by name, exam no, school..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full bg-brand-secondary-contrast/10 border border-brand-secondary-contrast/20 rounded-lg pl-10 pr-4 py-0 text-brand-secondary-contrast placeholder-brand-secondary-contrast/60 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-all duration-200 h-12"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="w-4 h-4 text-brand-secondary-contrast/60" />
            </div>
          </div>
        </div>

        {/* Clear Filters */}
        <div className="flex items-end">
          <Button
            onClick={onClearFilters}
            className="w-full h-[48px] bg-brand-primary hover:bg-brand-primary-2 text-brand-primary-contrast rounded-lg transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
          >
            Clear Filters
          </Button>
        </div>
      </div>
    </div>
  );
};

export default StudentsFilters;
