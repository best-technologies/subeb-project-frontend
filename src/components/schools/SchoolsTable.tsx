"use client";

import React from "react";
import {
  School as SchoolIcon,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Calendar,
  Layers,
  MapPin,
  Search,
  Eye,
  Building2,
  Users,
} from "lucide-react";
import { SchoolDirectoryItem } from "@/services/types/schoolsDirectoryResponse";
import { SchoolFilterStage } from "@/services/hooks/useSchoolSearch";
import { formatEducationalText } from "@/utils/formatters";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/Button";

interface SchoolsTableProps {
  schools: SchoolDirectoryItem[];
  filterStage: SchoolFilterStage;
  selectedSessionName?: string;
  selectedTermName?: string;
  selectedLgaName?: string;
  searchTerm?: string;
  currentPage?: number;
  totalPages?: number;
  totalItems?: number;
  itemsPerPage?: number;
  isTableLoading?: boolean;
  isSearching?: boolean;
  onPageChange?: (page: number) => void;
  onViewSchool: (school: SchoolDirectoryItem) => void;
}

export const SchoolsTable: React.FC<SchoolsTableProps> = ({
  schools,
  filterStage,
  selectedSessionName,
  selectedTermName,
  selectedLgaName,
  searchTerm,
  currentPage = 1,
  totalPages = 1,
  totalItems = 0,
  itemsPerPage = 10,
  isTableLoading = false,
  isSearching = false,
  onPageChange,
  onViewSchool,
}) => {
  const startItem = totalItems > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const getScoreBadgeClass = (score: number) => {
    if (score >= 75) return "bg-emerald-50 text-emerald-700 border-emerald-200";
    if (score >= 60) return "bg-teal-50 text-teal-700 border-teal-200";
    if (score >= 50) return "bg-amber-50 text-amber-700 border-amber-200";
    if (score > 0) return "bg-rose-50 text-rose-700 border-rose-200";
    return "bg-gray-50 text-gray-500 border-gray-200";
  };

  const renderEmptyPrompt = () => {
    switch (filterStage) {
      case "STAGE_1_NEEDS_SESSION":
        return (
          <div className="max-w-lg mx-auto py-12 text-center flex flex-col items-center">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold mb-3">
              Step 1 of 2 • Session
            </span>
            <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mb-3 text-emerald-700 shadow-2xs">
              <Calendar className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">
              Select an Academic Session
            </h3>
            <p className="text-xs text-gray-500 max-w-md leading-relaxed mb-4">
              To begin exploring school records and calculated performance averages, select an academic session from the filters above.
            </p>
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-emerald-50/70 border border-emerald-200/60 text-xs text-emerald-900 font-medium">
              <Search className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>
                <strong>Direct search:</strong> You can also search for a school directly by name, school code, or principal name above.
              </span>
            </div>
          </div>
        );

      case "STAGE_2_NEEDS_TERM":
        return (
          <div className="max-w-lg mx-auto py-12 text-center flex flex-col items-center">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold mb-3">
              Step 2 of 2 • Term
            </span>
            <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mb-3 text-emerald-700 shadow-2xs">
              <Layers className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">
              Select an Academic Term
            </h3>
            <p className="text-xs text-gray-500 max-w-md leading-relaxed mb-4">
              Session <strong className="text-gray-800">"{selectedSessionName || 'Selected'}"</strong> is active. Now select an academic term (or "All Terms") above to compute school academic performance and view the directory.
            </p>
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-emerald-50/70 border border-emerald-200/60 text-xs text-emerald-900 font-medium">
              <Search className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>
                <strong>Direct search:</strong> Or search for a specific school by name or code.
              </span>
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center py-12 text-gray-500">
            <SchoolIcon className="w-10 h-10 mx-auto mb-3 text-gray-300 stroke-[1.5]" />
            <h4 className="text-sm font-semibold text-gray-800 mb-1">No Schools Found</h4>
            <p className="text-xs text-gray-400 max-w-xs mx-auto">
              No school records match your selected session, term, or search query.
            </p>
          </div>
        );
    }
  };

  const showGuidance = filterStage !== "STAGE_3_READY" && !searchTerm?.trim();

  return (
    <Card className="border border-gray-200 shadow-xs rounded-2xl overflow-hidden bg-white">
      <CardHeader className="px-6 py-4 border-b border-gray-100 flex flex-row items-center justify-between bg-gray-50/30">
        <div>
          <CardTitle className="text-base font-bold text-gray-900 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-emerald-600" />
            Schools Directory
          </CardTitle>
          <p className="text-xs text-gray-500 mt-0.5">
            {filterStage === "STAGE_3_READY" || searchTerm
              ? `Displaying ${totalItems.toLocaleString()} registered institutions`
              : "Step-guided directory view"}
          </p>
        </div>

        {totalItems > 0 && (
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            {totalItems.toLocaleString()} Schools Total
          </span>
        )}
      </CardHeader>

      <CardContent className="p-0">
        {showGuidance ? (
          renderEmptyPrompt()
        ) : isTableLoading ? (
          <div className="py-20 flex flex-col items-center justify-center text-center">
            <Loader2 className="w-8 h-8 text-emerald-600 animate-spin mb-3" />
            <p className="text-sm font-semibold text-gray-800">Loading schools directory...</p>
            <p className="text-xs text-gray-400 mt-0.5">Retrieving institutions and computing academic scores</p>
          </div>
        ) : schools.length === 0 ? (
          renderEmptyPrompt()
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-gray-50/80">
                <TableRow className="border-b border-gray-100">
                  <TableHead className="w-12 text-center text-xs font-bold text-gray-600">S/N</TableHead>
                  <TableHead className="text-xs font-bold text-gray-600 min-w-[200px]">School Name & Code</TableHead>
                  <TableHead className="text-xs font-bold text-gray-600">LGA</TableHead>
                  <TableHead className="text-xs font-bold text-gray-600 text-center">Level</TableHead>
                  <TableHead className="text-xs font-bold text-gray-600 text-center">Enrollment</TableHead>
                  <TableHead className="text-xs font-bold text-gray-600 text-center">Assessed</TableHead>
                  <TableHead className="text-xs font-bold text-gray-600 text-center">Average Score</TableHead>
                  <TableHead className="text-xs font-bold text-gray-600 text-center w-24">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {schools.map((school, index) => {
                  const serialNumber = startItem + index;
                  return (
                    <TableRow
                      key={school.id}
                      className="hover:bg-emerald-50/30 transition-colors border-b border-gray-100/70"
                    >
                      <TableCell className="text-center text-xs text-gray-500 font-mono">
                        {serialNumber}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-semibold text-gray-900 text-xs">
                            {formatEducationalText(school.name)}
                          </span>
                          <span className="text-[11px] text-gray-400 font-mono">
                            {school.code}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center gap-1 text-xs text-gray-700">
                          <MapPin className="w-3 h-3 text-emerald-600 shrink-0" />
                          {formatEducationalText(school.lga?.name || "Abia State")}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="inline-block text-[11px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                          {school.level}
                        </span>
                      </TableCell>
                      <TableCell className="text-center text-xs font-semibold text-gray-800">
                        {school.totalStudents.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-center text-xs text-gray-600">
                        {school.assessedStudents.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-center">
                        <span
                          className={`inline-block text-xs font-bold px-2 py-0.5 rounded-full border ${getScoreBadgeClass(
                            school.averageScore
                          )}`}
                        >
                          {school.averageScore > 0 ? `${school.averageScore}%` : "—"}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onViewSchool(school)}
                          className="h-8 w-8 p-0 text-gray-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg cursor-pointer"
                          title="View School Profile"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Pagination Bar */}
        {!showGuidance && schools.length > 0 && totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gray-50/30">
            <span className="text-xs text-gray-500">
              Showing <strong className="text-gray-800">{startItem}</strong> to{" "}
              <strong className="text-gray-800">{endItem}</strong> of{" "}
              <strong className="text-gray-800">{totalItems.toLocaleString()}</strong> schools
            </span>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange && onPageChange(currentPage - 1)}
                disabled={currentPage <= 1 || isTableLoading}
                className="h-8 text-xs gap-1 border-gray-200"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                Previous
              </Button>

              <span className="text-xs font-semibold text-gray-700 px-2">
                Page {currentPage} of {totalPages}
              </span>

              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange && onPageChange(currentPage + 1)}
                disabled={currentPage >= totalPages || isTableLoading}
                className="h-8 text-xs gap-1 border-gray-200"
              >
                Next
                <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SchoolsTable;
