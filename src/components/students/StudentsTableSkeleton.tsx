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
import { Users } from "lucide-react";

const ROWS = 10;

const StudentsTableSkeleton: React.FC = () => {
  return (
    <Card className="border-gray-200 shadow-xs overflow-hidden">
      {/* Static Header */}
      <CardHeader className="bg-gray-50/80 border-b border-gray-100 px-6 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center shadow-2xs">
              <Users className="w-5 h-5 text-emerald-700" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold text-gray-900">
                Enrolled Students
              </CardTitle>
              <p className="text-xs text-gray-500 mt-0.5">
                Loading students directory...
              </p>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-gray-50/60">
              <TableRow className="border-b border-gray-200 hover:bg-transparent">
                <TableHead className="w-[90px] text-xs font-semibold text-gray-600 uppercase tracking-wider text-center">
                  Position
                </TableHead>
                <TableHead className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Student
                </TableHead>
                <TableHead className="w-[120px] text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Exam No.
                </TableHead>
                <TableHead className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  School
                </TableHead>
                <TableHead className="w-[110px] text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Class
                </TableHead>
                <TableHead className="w-[100px] text-xs font-semibold text-gray-600 uppercase tracking-wider text-right">
                  Total
                </TableHead>
                <TableHead className="w-[100px] text-xs font-semibold text-gray-600 uppercase tracking-wider text-right">
                  Average
                </TableHead>
                <TableHead className="w-[100px] text-xs font-semibold text-gray-600 uppercase tracking-wider text-center">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: ROWS }).map((_, rowIdx) => (
                <TableRow key={rowIdx} className="border-b border-gray-100 hover:bg-transparent">
                  <TableCell className="text-center py-3.5">
                    <div className="inline-flex items-center justify-center min-w-6 h-6 px-1.5 rounded-md bg-gray-100 animate-pulse" />
                  </TableCell>
                  <TableCell className="py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-200/80 animate-pulse shrink-0" />
                      <div className="space-y-1">
                        <div className="h-4 w-32 bg-gray-200/80 rounded animate-pulse" />
                        <div className="h-3 w-12 bg-gray-100 rounded animate-pulse" />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-3.5">
                    <div className="h-5 w-20 bg-gray-100 rounded border border-gray-200/60 animate-pulse" />
                  </TableCell>
                  <TableCell className="py-3.5">
                    <div className="h-4 w-36 bg-gray-200/70 rounded animate-pulse" />
                  </TableCell>
                  <TableCell className="py-3.5">
                    <div className="h-5 w-16 bg-emerald-50/60 rounded-md animate-pulse" />
                  </TableCell>
                  <TableCell className="py-3.5 text-right">
                    <div className="inline-block h-6 w-12 bg-emerald-50/80 rounded-md animate-pulse" />
                  </TableCell>
                  <TableCell className="py-3.5 text-right">
                    <div className="inline-block h-5 w-10 bg-gray-100 rounded-md animate-pulse" />
                  </TableCell>
                  <TableCell className="py-3.5 text-center">
                    <div className="inline-flex items-center gap-1">
                      <div className="w-7 h-7 bg-gray-100 rounded-lg animate-pulse" />
                      <div className="w-7 h-7 bg-gray-100 rounded-lg animate-pulse" />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default StudentsTableSkeleton;
