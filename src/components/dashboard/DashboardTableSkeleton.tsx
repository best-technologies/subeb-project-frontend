import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Trophy, ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";

interface DashboardTableSkeletonProps {
  rows?: number;
}

const DashboardTableSkeleton: React.FC<DashboardTableSkeletonProps> = ({
  rows = 10,
}) => {
  return (
    <Card className="border-gray-200 shadow-xs overflow-hidden">
      {/* Static Header matching Dashboard CardHeader */}
      <CardHeader className="bg-gray-50/80 border-b border-gray-100 px-6 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center shadow-2xs">
              <Trophy className="w-5 h-5 text-emerald-700" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-lg font-bold text-gray-900 whitespace-nowrap">
                  Top Ranked Students
                </CardTitle>
                <div className="h-7 w-[125px] px-2.5 py-0 bg-white border border-gray-200 rounded-lg text-xs text-gray-400 font-medium flex items-center justify-between shadow-2xs shrink-0">
                  <span>Select term</span>
                  <ChevronDown className="h-3.5 w-3.5 opacity-40 ml-1 flex-shrink-0" />
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                Showing top ranked students across the state
              </p>
            </div>
          </div>

          {/* Static Pagination Controls Shape */}
          <div className="flex items-center gap-2">
            <button
              disabled
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-gray-400 text-xs font-medium shadow-2xs cursor-not-allowed opacity-60"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              Previous
            </button>

            <span className="px-2.5 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-md text-xs font-semibold flex items-center gap-1.5">
              Page 1 of ...
            </span>

            <button
              disabled
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-gray-400 text-xs font-medium shadow-2xs cursor-not-allowed opacity-60"
            >
              Next
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </CardHeader>

      {/* Static Table Header + Dynamic Animated Body Rows */}
      <CardContent className="p-0">
        <Table>
          <TableHeader className="bg-gray-50/50">
            <TableRow className="border-b border-gray-200 hover:bg-transparent">
              <TableHead className="w-[90px] text-xs font-semibold text-gray-600 uppercase tracking-wider text-center">
                Position
              </TableHead>
              <TableHead className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Student Name
              </TableHead>
              <TableHead className="w-[100px] text-xs font-semibold text-gray-600 uppercase tracking-wider text-center">
                Gender
              </TableHead>
              <TableHead className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                LGA
              </TableHead>
              <TableHead className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                School
              </TableHead>
              <TableHead className="w-[110px] text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Class
              </TableHead>
              <TableHead className="w-[120px] text-right text-xs font-semibold text-gray-600 uppercase tracking-wider pr-6">
                Total Score
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: rows }).map((_, index) => (
              <TableRow
                key={index}
                className="border-b border-gray-100 hover:bg-transparent"
              >
                {/* Position - static badge shape with pulsing rank */}
                <TableCell className="text-center">
                  <div className="inline-flex items-center justify-center min-w-6 h-6 px-1.5 rounded-md text-xs font-semibold bg-gray-100 text-gray-400 animate-pulse">
                    #{index + 1}
                  </div>
                </TableCell>

                {/* Student Name & Exam No */}
                <TableCell>
                  <div className="h-4 w-36 bg-gray-200 rounded mb-1 animate-pulse" />
                  <div className="h-3 w-20 bg-gray-100 rounded animate-pulse" />
                </TableCell>

                {/* Gender */}
                <TableCell className="text-center">
                  <div className="inline-block h-5 w-14 rounded-full bg-gray-100 border border-gray-200/60 animate-pulse" />
                </TableCell>

                {/* LGA */}
                <TableCell>
                  <div className="h-3.5 w-24 bg-gray-200/80 rounded animate-pulse" />
                </TableCell>

                {/* School */}
                <TableCell>
                  <div className="h-3.5 w-44 bg-gray-200/80 rounded animate-pulse" />
                </TableCell>

                {/* Class */}
                <TableCell>
                  <div className="h-3.5 w-16 bg-gray-200/80 rounded animate-pulse" />
                </TableCell>

                {/* Total Score */}
                <TableCell className="text-right pr-6">
                  <div className="inline-block h-7 w-16 bg-emerald-50 rounded-md border border-emerald-200/60 animate-pulse" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default DashboardTableSkeleton;
