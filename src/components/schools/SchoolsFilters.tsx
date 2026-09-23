"use client";

import React, { useState, useEffect } from "react";
import { Search, Loader2, X, RotateCcw, Filter, School, Calendar, Layers, MapPin } from "lucide-react";
import { formatEducationalText, formatTermName } from "@/utils/formatters";
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

interface SchoolsFiltersProps {
  // Available options
  lgas: Array<{ id: string; name: string }>;
  availableSessions: Array<{ id: string; name: string; isCurrent?: boolean }>;
  availableTerms: Array<{ id: string; name: string; isCurrent?: boolean }>;

  // Filter values
  selectedSession?: string;
  selectedTerm?: string;
  selectedLgaId?: string;

  // Search functionality
  searchTerm: string;
  isSearching?: boolean;
  onSearchChange: (value: string) => void;
  onClearSearch: () => void;

  // Progressive enablement
  isSessionEnabled: boolean;
  isTermEnabled: boolean;
  isLgaEnabled: boolean;

  // Actions
  onSessionChange: (sessionId: string) => void;
  onTermChange: (termId: string) => void;
  onLgaChange: (lgaId: string, lgaName?: string) => void;
  onClearFilters: () => void;
}

export const SchoolsFilters: React.FC<SchoolsFiltersProps> = ({
  lgas,
  availableSessions,
  availableTerms,
  selectedSession,
  selectedTerm,
  selectedLgaId,
  searchTerm,
  isSearching = false,
  onSearchChange,
  onClearSearch,
  isSessionEnabled,
  isTermEnabled,
  isLgaEnabled,
  onSessionChange,
  onTermChange,
  onLgaChange,
  onClearFilters,
}) => {
  const [localSearch, setLocalSearch] = useState(searchTerm || "");

  useEffect(() => {
    setLocalSearch(searchTerm || "");
  }, [searchTerm]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setLocalSearch(val);
    onSearchChange(val);
  };

  const handleClearLocalSearch = () => {
    setLocalSearch("");
    onClearSearch();
  };

  const handleLgaSelect = (lgaId: string) => {
    if (lgaId === "all-lgas") {
      onLgaChange("all-lgas", "All LGAs");
    } else {
      const matched = lgas.find((l) => l.id === lgaId);
      onLgaChange(lgaId, matched?.name);
    }
  };

  const hasActiveFilters = Boolean(
    selectedSession || selectedTerm || (selectedLgaId && selectedLgaId !== "all-lgas") || localSearch
  );

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-6 mb-6">
      {/* Top row: Title and Clear Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 pb-4 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-100/80 text-emerald-700 flex items-center justify-center">
            <Filter className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-base">Filter & Search Schools</h3>
            <p className="text-xs text-gray-500">
              Narrow results by session, term, and LGA, or search directly
            </p>
          </div>
        </div>

        {hasActiveFilters && (
          <Button
            variant="outline"
            size="sm"
            onClick={onClearFilters}
            className="text-xs text-gray-600 hover:text-gray-900 gap-1.5 self-start sm:self-auto"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset All Filters
          </Button>
        )}
      </div>

      {/* Grid of Search + Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Direct Search Input */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <Label htmlFor="school-search" className="text-xs font-semibold text-gray-700">
              Search School
            </Label>
            {isSearching && (
              <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                <Loader2 className="w-3 h-3 animate-spin" />
                Searching...
              </span>
            )}
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              id="school-search"
              type="text"
              placeholder="Name, Code, or Principal..."
              value={localSearch}
              onChange={handleInputChange}
              className="pl-9 pr-8 text-xs h-10 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500"
            />
            {localSearch && (
              <button
                type="button"
                onClick={handleClearLocalSearch}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5 rounded cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* 2. Step 1: Academic Session */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <Label className="text-xs font-semibold text-gray-700 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-gray-400" />
              1. Academic Session
            </Label>
            {!selectedSession && (
              <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
                Required
              </span>
            )}
          </div>
          <Select
            value={selectedSession || ""}
            onValueChange={onSessionChange}
            disabled={!isSessionEnabled}
          >
            <SelectTrigger className="w-full text-xs h-10 border-gray-200">
              <SelectValue placeholder="Select Session" />
            </SelectTrigger>
            <SelectContent>
              {availableSessions.map((session) => (
                <SelectItem key={session.id} value={session.id} className="text-xs">
                  {session.name} {session.isCurrent ? "(Current)" : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* 3. Step 2: Academic Term */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <Label className="text-xs font-semibold text-gray-700 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-gray-400" />
              2. Academic Term
            </Label>
            {selectedSession && !selectedTerm && (
              <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
                Next Step
              </span>
            )}
          </div>
          <Select
            value={selectedTerm || ""}
            onValueChange={onTermChange}
            disabled={!isTermEnabled}
          >
            <SelectTrigger
              className={`w-full text-xs h-10 border-gray-200 ${
                !isTermEnabled ? "opacity-60 bg-gray-50 cursor-not-allowed" : ""
              }`}
            >
              <SelectValue
                placeholder={
                  !isTermEnabled ? "Select Session First" : "Select Term"
                }
              />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL_TERMS" className="text-xs font-medium">
                All Terms (Annual Combined)
              </SelectItem>
              {availableTerms.map((term) => (
                <SelectItem key={term.id} value={term.id} className="text-xs">
                  {formatTermName(term.name)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* 4. Step 3: LGA Filter */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <Label className="text-xs font-semibold text-gray-700 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-gray-400" />
              3. Local Government Area
            </Label>
            {isLgaEnabled && (
              <span className="text-[10px] text-gray-400 font-medium">
                Optional
              </span>
            )}
          </div>
          <Select
            value={selectedLgaId || "all-lgas"}
            onValueChange={handleLgaSelect}
            disabled={!isLgaEnabled}
          >
            <SelectTrigger
              className={`w-full text-xs h-10 border-gray-200 ${
                !isLgaEnabled ? "opacity-60 bg-gray-50 cursor-not-allowed" : ""
              }`}
            >
              <SelectValue
                placeholder={
                  !isLgaEnabled ? "Select Term First" : "All LGAs"
                }
              />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-lgas" className="text-xs font-medium">
                All LGAs (All 17 LGAs)
              </SelectItem>
              {lgas.map((lga) => (
                <SelectItem key={lga.id} value={lga.id} className="text-xs">
                  {formatEducationalText(lga.name)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

export default SchoolsFilters;
