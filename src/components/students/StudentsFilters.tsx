"use client";
import React, { useRef, useEffect } from "react";
import { Search, Loader2 } from "lucide-react";
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
  isSearching?: boolean;
  onSearchChange: (value: string) => void;
  onSearchBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onSearchSubmit?: () => void;
  onSearchClickOutside?: (e: MouseEvent | PointerEvent) => void;

  // Search session & term
  searchSession: string;
  searchTermId: string;
  availableSearchTerms: Array<{ id: string; name: string }>;
  isSearchTermEnabled: boolean;
  onSearchSessionChange: (sessionId: string) => void;
  onSearchTermChange: (termId: string) => void;
  onClearSearch: () => void;

  // Progressive filter states
  isLgaEnabled: boolean;
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
  isSearching = false,
  onSearchChange,
  onSearchBlur,
  onSearchSubmit,
  onSearchClickOutside,
  searchSession,
  searchTermId,
  availableSearchTerms,
  isSearchTermEnabled,
  onSearchSessionChange,
  onSearchTermChange,
  onClearSearch,
  isLgaEnabled,
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

  const searchContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent | MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        onSearchClickOutside?.(event);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [onSearchClickOutside]);

  return (
    <div className="bg-brand-secondary border border-emerald-200/60 rounded-xl p-4 shadow-xs space-y-3.5">
      {/* Top Row: Progressive Cascading Filters + Dedicated Clear Filters Button */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 items-end">
        {/* Session Filter */}
        <div>
          <Label className="block text-xs font-semibold text-brand-secondary-contrast mb-1">
            Session
          </Label>
          <Select
            value={filters.session || "all-sessions"}
            onValueChange={(val) => onSessionChange(val === "all-sessions" ? "" : val)}
          >
            <SelectTrigger className="w-full h-9 bg-white border border-gray-200/90 text-gray-800 text-xs sm:text-sm font-medium rounded-lg hover:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500 shadow-2xs transition-colors cursor-pointer">
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
            disabled={!isLgaEnabled}
          >
            <SelectTrigger
              className={`w-full h-9 text-xs sm:text-sm font-medium rounded-lg shadow-2xs transition-colors ${
                isLgaEnabled
                  ? "bg-white border border-gray-200/90 text-gray-800 hover:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500 cursor-pointer"
                  : "bg-white/60 border border-gray-200 text-gray-400 cursor-not-allowed"
              }`}
            >
              <SelectValue placeholder={isLgaEnabled ? "All LGAs" : "Select Term first"} />
            </SelectTrigger>
            <SelectContent className="bg-white border-gray-200 shadow-lg text-gray-800">
              <SelectGroup>
                <SelectLabel className="text-xs font-semibold text-gray-500">LGAs</SelectLabel>
                <SelectItem value="all-lgas" className="text-xs font-medium cursor-pointer">All LGAs</SelectItem>
                {isLgaEnabled &&
                  lgas.map((lga) => (
                    <SelectItem key={lga.id} value={lga.id} className="text-xs font-medium cursor-pointer">
                      {formatEducationalText(lga.name)}
                    </SelectItem>
                  ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        {/* School Filter */}
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
                placeholder={isSchoolEnabled ? "All Schools" : "Select LGA first"}
              />
            </SelectTrigger>
            <SelectContent className="bg-white border-gray-200 shadow-lg text-gray-800 max-h-60">
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

        {/* Class Filter */}
        <div>
          <Label className="block text-xs font-semibold text-brand-secondary-contrast mb-1">
            Class
          </Label>
          <Select
            value={filters.class || "all-classes"}
            onValueChange={(val) => onClassChange(val)}
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
                placeholder={isClassEnabled ? "All Classes" : "Select School first"}
              />
            </SelectTrigger>
            <SelectContent className="bg-white border-gray-200 shadow-lg text-gray-800 max-h-60">
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

        {/* Dedicated Clear Filters Button on the Same Row */}
        <div>
          <Button
            type="button"
            data-clear-filters="true"
            onClick={onClearFilters}
            className="w-full h-9 px-2.5 py-0 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg transition-colors font-medium text-xs shadow-2xs cursor-pointer inline-flex items-center justify-center whitespace-nowrap"
          >
            Clear Filters
          </Button>
        </div>
      </div>

      {/* Subtle Row Divider */}
      <div className="border-t border-emerald-200/60" />

      {/* Bottom Row: Search Field + Search Session + Search Term + Dedicated Clear Search Button */}
      <div
        ref={searchContainerRef}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1fr_160px_160px_auto] gap-2.5 items-end"
      >
        {/* Search Field */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <Label className="block text-xs font-semibold text-brand-secondary-contrast">
              Search Students
            </Label>
            {isSearching && (
              <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-800 animate-pulse">
                <Loader2 className="w-3 h-3 animate-spin text-emerald-700" />
                (Searching...)
              </span>
            )}
          </div>
          <div className="relative">
            <Input
              type="text"
              placeholder="Search by name, exam no, school..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              onBlur={onSearchBlur}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  onSearchSubmit?.();
                }
              }}
              className={`w-full h-9 bg-white border border-gray-200/90 rounded-lg pl-9 ${
                isSearching ? "pr-24" : "pr-4"
              } py-0 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 text-xs sm:text-sm transition-all duration-200 shadow-2xs`}
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              {isSearching ? (
                <Loader2 className="w-4 h-4 text-emerald-600 animate-spin" />
              ) : (
                <Search className="w-4 h-4 text-gray-400" />
              )}
            </div>
            {isSearching && (
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center gap-1 pointer-events-none text-xs font-semibold text-emerald-800 animate-pulse">
                <span>(Searching...)</span>
              </div>
            )}
          </div>
        </div>

        {/* Search Session Selector */}
        <div>
          <Label className="block text-xs font-semibold text-brand-secondary-contrast mb-1">
            Search Session
          </Label>
          <Select
            value={searchSession || "default-session"}
            onValueChange={(val) => onSearchSessionChange(val === "default-session" ? "" : val)}
          >
            <SelectTrigger className="w-full h-9 bg-white border border-gray-200/90 text-gray-800 text-xs sm:text-sm font-medium rounded-lg hover:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500 shadow-2xs transition-colors cursor-pointer">
              <SelectValue placeholder="Select Session" />
            </SelectTrigger>
            <SelectContent className="bg-white border-gray-200 shadow-lg text-gray-800">
              <SelectGroup>
                <SelectLabel className="text-xs font-semibold text-gray-500">Sessions</SelectLabel>
                {availableSessions.map((session) => (
                  <SelectItem key={session.id} value={session.id} className="text-xs font-medium cursor-pointer">
                    {session.name}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        {/* Search Term Selector */}
        <div>
          <Label className="block text-xs font-semibold text-brand-secondary-contrast mb-1">
            Search Term
          </Label>
          <Select
            value={searchTermId || "default-term"}
            onValueChange={(val) => onSearchTermChange(val === "default-term" ? "" : val)}
            disabled={!isSearchTermEnabled}
          >
            <SelectTrigger
              className={`w-full h-9 text-xs sm:text-sm font-medium rounded-lg shadow-2xs transition-colors ${
                isSearchTermEnabled
                  ? "bg-white border border-gray-200/90 text-gray-800 hover:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500 cursor-pointer"
                  : "bg-white/60 border border-gray-200 text-gray-400 cursor-not-allowed"
              }`}
            >
              <SelectValue
                placeholder={isSearchTermEnabled ? "Select Term" : "Select Session"}
              />
            </SelectTrigger>
            <SelectContent className="bg-white border-gray-200 shadow-lg text-gray-800">
              <SelectGroup>
                <SelectLabel className="text-xs font-semibold text-gray-500">Terms</SelectLabel>
                {availableSearchTerms.map((term) => (
                  <SelectItem key={term.id} value={term.id} className="text-xs font-medium cursor-pointer">
                    {formatEducationalText(term.name.replace(/_/g, " "))}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        {/* Dedicated Clear Search Button on the Same Row */}
        <div>
          <Button
            type="button"
            data-clear-search="true"
            onClick={onClearSearch}
            className="w-full sm:w-auto h-9 px-3.5 py-0 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg transition-colors font-medium text-xs shadow-2xs cursor-pointer inline-flex items-center justify-center whitespace-nowrap"
          >
            Clear Search
          </Button>
        </div>
      </div>
    </div>
  );
};

export default StudentsFilters;
