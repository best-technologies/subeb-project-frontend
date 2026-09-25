"use client";

import React, { useState, useEffect } from "react";
import { Search, Loader2, X, RotateCcw, Filter, MapPin, School, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const GRADE_OPTIONS = [
  "Primary 1",
  "Primary 2",
  "Primary 3",
  "Primary 4",
  "Primary 5",
  "Primary 6",
  "JSS 1",
  "JSS 2",
  "JSS 3",
  "SSS 1",
  "SSS 2",
  "SSS 3",
];

interface ClassesFiltersProps {
  lgas: Array<{ id: string; name: string }>;
  schools?: Array<{ id: string; name: string }>;
  selectedLgaId?: string;
  selectedSchoolId?: string;
  selectedGrade?: string;
  searchTerm: string;
  isSearching?: boolean;
  onSearchChange: (value: string) => void;
  onClearSearch: () => void;
  onLgaChange: (lgaId: string, lgaName?: string) => void;
  onSchoolChange: (schoolId: string, schoolName?: string) => void;
  onGradeChange: (grade: string) => void;
  onClearFilters: () => void;
}

export const ClassesFilters: React.FC<ClassesFiltersProps> = ({
  lgas,
  schools = [],
  selectedLgaId,
  selectedSchoolId,
  selectedGrade,
  searchTerm,
  isSearching = false,
  onSearchChange,
  onClearSearch,
  onLgaChange,
  onSchoolChange,
  onGradeChange,
  onClearFilters,
}) => {
  const [localSearch, setLocalSearch] = useState(searchTerm);

  useEffect(() => {
    setLocalSearch(searchTerm);
  }, [searchTerm]);

  const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setLocalSearch(val);
    onSearchChange(val);
  };

  const handleClear = () => {
    setLocalSearch("");
    onClearSearch();
  };

  const hasActiveFilters = Boolean(
    selectedLgaId || selectedSchoolId || selectedGrade || searchTerm
  );

  return (
    <div className="bg-white rounded-xl border border-gray-200/90 p-4 sm:p-5 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-50 text-brand-primary flex items-center justify-center">
            <Filter className="w-3.5 h-3.5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-gray-900">Class Filters & Search</h4>
            <p className="text-[11px] text-gray-500">
              Narrow class records by LGA, school, grade level, or custom keywords
            </p>
          </div>
        </div>

        {hasActiveFilters && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClearFilters}
            className="h-8 text-xs text-brand-primary border-brand-primary/30 hover:bg-brand-primary/10 transition-colors self-end sm:self-auto gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset All Filters</span>
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Search Input */}
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-gray-700">Search Class</Label>
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              value={localSearch}
              onChange={handleSearchInput}
              placeholder="Class, grade, school..."
              className="pl-9 pr-8 h-9 text-xs bg-white border-gray-200 focus:border-brand-primary focus:ring-brand-primary"
            />
            {isSearching ? (
              <Loader2 className="w-3.5 h-3.5 text-brand-primary animate-spin absolute right-2.5 top-1/2 -translate-y-1/2" />
            ) : localSearch ? (
              <button
                type="button"
                onClick={handleClear}
                className="w-4 h-4 text-gray-400 hover:text-gray-600 absolute right-2.5 top-1/2 -translate-y-1/2"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : null}
          </div>
        </div>

        {/* LGA Filter */}
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-gray-700 flex items-center gap-1">
            <MapPin className="w-3 h-3 text-brand-primary" />
            <span>Local Government Area</span>
          </Label>
          <Select
            value={selectedLgaId || "ALL_LGAS"}
            onValueChange={(val) => {
              if (val === "ALL_LGAS") {
                onLgaChange("", "");
              } else {
                const match = lgas.find((l) => l.id === val);
                onLgaChange(val, match?.name);
              }
            }}
          >
            <SelectTrigger className="h-9 text-xs bg-white border-gray-200 focus:ring-brand-primary">
              <SelectValue placeholder="All LGAs" />
            </SelectTrigger>
            <SelectContent className="max-h-60 text-xs">
              <SelectItem value="ALL_LGAS">All LGAs (17)</SelectItem>
              {lgas.map((l) => (
                <SelectItem key={l.id} value={l.id}>
                  {l.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* School Filter */}
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-gray-700 flex items-center gap-1">
            <School className="w-3 h-3 text-brand-primary" />
            <span>School</span>
          </Label>
          <Select
            value={selectedSchoolId || "ALL_SCHOOLS"}
            onValueChange={(val) => {
              if (val === "ALL_SCHOOLS") {
                onSchoolChange("", "");
              } else {
                const match = schools.find((s) => s.id === val);
                onSchoolChange(val, match?.name);
              }
            }}
            disabled={schools.length === 0 && !selectedSchoolId}
          >
            <SelectTrigger className="h-9 text-xs bg-white border-gray-200 focus:ring-brand-primary">
              <SelectValue
                placeholder={
                  schools.length === 0
                    ? selectedLgaId
                      ? "No schools in this LGA"
                      : "All Schools"
                    : "All Schools"
                }
              />
            </SelectTrigger>
            <SelectContent className="max-h-60 text-xs">
              <SelectItem value="ALL_SCHOOLS">All Schools</SelectItem>
              {schools.map((s) => (
                <SelectItem key={s.id} value={s.id} className="capitalize">
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Grade / Level Filter */}
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-gray-700 flex items-center gap-1">
            <BookOpen className="w-3 h-3 text-brand-primary" />
            <span>Grade Level</span>
          </Label>
          <Select
            value={selectedGrade || "ALL_GRADES"}
            onValueChange={(val) => {
              onGradeChange(val);
            }}
          >
            <SelectTrigger className="h-9 text-xs bg-white border-gray-200 focus:ring-brand-primary">
              <SelectValue placeholder="All Grades" />
            </SelectTrigger>
            <SelectContent className="max-h-60 text-xs">
              <SelectItem value="ALL_GRADES">All Grade Levels</SelectItem>
              {GRADE_OPTIONS.map((g) => (
                <SelectItem key={g} value={g}>
                  {g}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};
