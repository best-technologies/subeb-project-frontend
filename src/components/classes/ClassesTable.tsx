"use client";

import React from "react";
import {
  GraduationCap,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Users,
  Eye,
  School,
  MapPin,
  Pencil,
  MoreVertical,
  Layers,
} from "lucide-react";
import { ClassItem, ClassPagination } from "@/services/types/classResponse";
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
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

interface ClassesTableProps {
  classes: ClassItem[];
  pagination: ClassPagination;
  loading?: boolean;
  onPageChange?: (page: number) => void;
  onViewClass: (cls: ClassItem) => void;
  onEditClass?: (cls: ClassItem) => void;
}

export const ClassesTable: React.FC<ClassesTableProps> = ({
  classes,
  pagination,
  loading = false,
  onPageChange,
  onViewClass,
  onEditClass,
}) => {
  const { page = 1, limit = 10, total = 0, totalPages = 1 } = pagination;
  const startItem = total === 0 ? 0 : (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, total);

  const getUtilizationBadge = (utilization: number) => {
    if (utilization > 100) {
      return (
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200">
          Overcrowded ({utilization}%)
        </span>
      );
    }
    if (utilization >= 70) {
      return (
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
          Optimal ({utilization}%)
        </span>
      );
    }
    return (
      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
        Under Capacity ({utilization}%)
      </span>
    );
  };

  return (
    <Card className="border border-gray-200/90 shadow-xs bg-white overflow-hidden">
      <CardHeader className="py-4 px-4 sm:px-6 border-b border-gray-100 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-brand-primary flex items-center justify-center">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <CardTitle className="text-base font-bold text-gray-900">
              Classes Directory
            </CardTitle>
            <p className="text-xs text-gray-500">
              Showing {total.toLocaleString()} registered classes in Abia State
            </p>
          </div>
        </div>

        <div className="text-xs text-gray-500 font-medium">
          {startItem}-{endItem} of {total.toLocaleString()}
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-gray-50/80">
              <TableRow className="border-gray-100 hover:bg-transparent">
                <TableHead className="w-12 text-center text-xs font-semibold text-gray-500">
                  #
                </TableHead>
                <TableHead className="text-xs font-semibold text-gray-500">
                  Class Name
                </TableHead>
                <TableHead className="text-xs font-semibold text-gray-500">
                  School & LGA
                </TableHead>
                <TableHead className="text-xs font-semibold text-gray-500">
                  Grade / Level
                </TableHead>
                <TableHead className="text-xs font-semibold text-gray-500">
                  Capacity & Occupancy
                </TableHead>
                <TableHead className="text-xs font-semibold text-gray-500">
                  Academic Year
                </TableHead>
                <TableHead className="text-xs font-semibold text-gray-500 text-right pr-6">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && classes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-64 text-center">
                    <div className="flex flex-col items-center justify-center gap-2 text-gray-400">
                      <Loader2 className="w-6 h-6 animate-spin text-brand-primary" />
                      <span className="text-xs">Loading classes...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : classes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-64 text-center">
                    <div className="flex flex-col items-center justify-center gap-2 text-gray-400">
                      <GraduationCap className="w-8 h-8 opacity-40" />
                      <p className="text-sm font-semibold text-gray-600">
                        No classes found
                      </p>
                      <p className="text-xs text-gray-400 max-w-sm">
                        No classes match your selected filters. Try changing filters or create a new class.
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                classes.map((cls, index) => {
                  const rowNumber = (page - 1) * limit + index + 1;
                  const capacity = cls.capacity || 35;
                  const studentCount = cls.studentCount || cls.currentEnrollment || 0;
                  const utilization = Math.round((studentCount / capacity) * 100);
                  const widthPct = Math.min(utilization, 100);

                  return (
                    <TableRow
                      key={cls.id}
                      className="border-gray-100 hover:bg-emerald-50/20 transition-colors"
                    >
                      <TableCell className="text-center text-xs text-gray-400 font-mono">
                        {rowNumber}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-gray-900 text-sm">
                            {cls.name}
                          </span>
                          {cls.section && (
                            <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-gray-100 text-gray-700">
                              Sec {cls.section}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-0.5">
                          <p className="text-xs font-semibold text-gray-800 capitalize truncate max-w-[200px]">
                            {cls.school?.name || "Unassigned"}
                          </p>
                          {cls.school?.lga && (
                            <span className="inline-flex items-center gap-1 text-[10px] text-gray-500">
                              <MapPin className="w-2.5 h-2.5 text-brand-primary" />
                              <span>{cls.school.lga.name}</span>
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs font-medium text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-md">
                          {cls.grade}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1.5 min-w-[140px]">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-semibold text-gray-900">
                              {studentCount}{" "}
                              <span className="text-gray-400 font-normal">
                                / {capacity}
                              </span>
                            </span>
                            {getUtilizationBadge(utilization)}
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                            <div
                              className={`h-1.5 rounded-full transition-all duration-500 ${
                                utilization > 100
                                  ? "bg-rose-500"
                                  : utilization >= 70
                                  ? "bg-emerald-500"
                                  : "bg-amber-400"
                              }`}
                              style={{ width: `${Math.max(widthPct, 4)}%` }}
                            />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs text-gray-600 font-mono">
                          {cls.academicYear || "2024-2025"}
                        </span>
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-40 text-xs">
                            <DropdownMenuItem
                              onClick={() => onViewClass(cls)}
                              className="cursor-pointer gap-2"
                            >
                              <Eye className="w-3.5 h-3.5 text-brand-primary" />
                              <span>View Students</span>
                            </DropdownMenuItem>
                            {onEditClass && (
                              <DropdownMenuItem
                                onClick={() => onEditClass(cls)}
                                className="cursor-pointer gap-2"
                              >
                                <Pencil className="w-3.5 h-3.5 text-amber-600" />
                                <span>Edit Class</span>
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="px-4 sm:px-6 py-3 border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
            <p className="text-xs text-gray-500">
              Page <span className="font-semibold text-gray-800">{page}</span> of{" "}
              <span className="font-semibold text-gray-800">{totalPages}</span>
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange?.(page - 1)}
                disabled={page <= 1}
                className="h-8 px-2.5 text-xs text-gray-600 border-gray-200 hover:bg-gray-100"
              >
                <ChevronLeft className="w-3.5 h-3.5 mr-1" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange?.(page + 1)}
                disabled={page >= totalPages}
                className="h-8 px-2.5 text-xs text-gray-600 border-gray-200 hover:bg-gray-100"
              >
                Next
                <ChevronRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
