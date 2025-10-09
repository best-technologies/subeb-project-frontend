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

  // Search functionality
  searchTerm: string;
  onSearchChange: (value: string) => void;

  // Progressive filter states
  isSchoolEnabled: boolean;
  isClassEnabled: boolean;

  // Actions
  onLgaChange: (lgaId: string) => void;
  onSchoolChange: (schoolId: string) => void;
  onClassChange: (classId: string) => void;
  onClearFilters: () => void;
}

const StudentsFilters: React.FC<StudentsFiltersProps> = ({
  filters,
  lgas,
  availableSchools,
  availableClasses,
  searchTerm,
  onSearchChange,
  isSchoolEnabled,
  isClassEnabled,
  onLgaChange,
  onSchoolChange,
  onClassChange,
  onClearFilters,
}) => {
  return (
    <div className="bg-brand-secondary rounded-xl p-6 shadow-lg hover:opacity-90 transition-all duration-300">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* LGA Filter - Always enabled */}
        <div>
          <Label className="block text-sm font-medium text-brand-secondary-contrast/80 mb-2">
            LGA
          </Label>
          <Select value={filters.lga || "all-lgas"} onValueChange={onLgaChange}>
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
            onValueChange={onSchoolChange}
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
        <div>
          <div className="mb-4 opacity-0 hidden lg:block">
            <Label>Placeholder</Label>
          </div>
          <Button
            onClick={onClearFilters}
            className="w-full h-[46px] bg-brand-primary hover:bg-brand-primary-2 text-brand-primary-contrast rounded-lg transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
          >
            Clear Filters
          </Button>
        </div>
      </div>
    </div>
  );
};

export default StudentsFilters;
