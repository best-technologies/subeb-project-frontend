"use client";

import React from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  ReferenceLine,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GradePerformanceAnalytics } from "@/services/types/classResponse";
import { Award, BookOpen, TrendingUp } from "lucide-react";
import { isSecondaryGrade, isPrimaryGrade } from "@/utils/formatters";

export type SchoolLevelFilter = "ALL" | "PRIMARY" | "SECONDARY";

interface ClassPerformanceLevelChartProps {
  data: GradePerformanceAnalytics[];
  session?: string;
  selectedSchoolLevel?: SchoolLevelFilter;
  onSchoolLevelChange?: (level: SchoolLevelFilter) => void;
}

const DEFAULT_SECONDARY_GRADES = [
  "JSS 1",
  "JSS 2",
  "JSS 3",
  "SSS 1",
  "SSS 2",
  "SSS 3",
];

const GRADE_SORT_ORDER: Record<string, number> = {
  "ECCDE 1": 1,
  "ECCDE 2": 2,
  "ECCDE 3": 3,
  "NURSERY 1": 4,
  "NURSERY 2": 5,
  "NURSERY 3": 6,
  "PRIMARY 1": 7,
  "PRIMARY 2": 8,
  "PRIMARY 3": 9,
  "PRIMARY 4": 10,
  "PRIMARY 5": 11,
  "PRIMARY 6": 12,
  "JSS 1": 13,
  "JSS 2": 14,
  "JSS 3": 15,
  "SSS 1": 16,
  "SSS 2": 17,
  "SSS 3": 18,
};

export const ClassPerformanceLevelChart: React.FC<ClassPerformanceLevelChartProps> = ({
  data,
  session,
  selectedSchoolLevel = "ALL",
  onSchoolLevelChange,
}) => {
  const chartData = React.useMemo(() => {
    const existingMap = new Map<
      string,
      {
        grade: string;
        averageScore: number;
        passRate: number;
        studentCount: number;
        classCount: number;
      }
    >();

    (data || []).forEach((item) => {
      const key = item.grade.toUpperCase().trim();
      existingMap.set(key, {
        grade: item.grade,
        averageScore: item.averageScore || 0,
        passRate: item.passRate || 0,
        studentCount: item.studentCount || 0,
        classCount: item.classCount || 0,
      });
    });

    if (selectedSchoolLevel === "PRIMARY") {
      // Primary only
      return (data || [])
        .filter((item) => item.schoolLevel === "PRIMARY" || isPrimaryGrade(item.grade))
        .map((item) => ({
          grade: item.grade,
          averageScore: item.averageScore || 0,
          passRate: item.passRate || 0,
          studentCount: item.studentCount || 0,
          classCount: item.classCount || 0,
        }))
        .sort(
          (a, b) =>
            (GRADE_SORT_ORDER[a.grade.toUpperCase()] || 99) -
            (GRADE_SORT_ORDER[b.grade.toUpperCase()] || 99)
        );
    }

    if (selectedSchoolLevel === "SECONDARY") {
      // Secondary: include standard secondary grades even if no data uploaded yet (values = 0)
      return DEFAULT_SECONDARY_GRADES.map((secGrade) => {
        const match = existingMap.get(secGrade.toUpperCase());
        if (match) return match;
        return {
          grade: secGrade,
          averageScore: 0,
          passRate: 0,
          studentCount: 0,
          classCount: 0,
        };
      });
    }

    // ALL: Primary grades + Secondary grades (with 0s if no secondary data)
    const primaryItems = (data || [])
      .filter((item) => item.schoolLevel === "PRIMARY" || isPrimaryGrade(item.grade))
      .map((item) => ({
        grade: item.grade,
        averageScore: item.averageScore || 0,
        passRate: item.passRate || 0,
        studentCount: item.studentCount || 0,
        classCount: item.classCount || 0,
      }));

    const secondaryItems = DEFAULT_SECONDARY_GRADES.map((secGrade) => {
      const match = existingMap.get(secGrade.toUpperCase());
      if (match) return match;
      return {
        grade: secGrade,
        averageScore: 0,
        passRate: 0,
        studentCount: 0,
        classCount: 0,
      };
    });

    return [...primaryItems, ...secondaryItems].sort(
      (a, b) =>
        (GRADE_SORT_ORDER[a.grade.toUpperCase()] || 99) -
        (GRADE_SORT_ORDER[b.grade.toUpperCase()] || 99)
    );
  }, [data, selectedSchoolLevel]);

  const statewideGradeAverage = React.useMemo(() => {
    const activeItems = chartData.filter(
      (item) => (item.studentCount || 0) > 0 || (item.averageScore || 0) > 0
    );
    if (activeItems.length === 0) return 0;
    const sum = activeItems.reduce((acc, curr) => acc + curr.averageScore, 0);
    return Math.round((sum / activeItems.length) * 10) / 10;
  }, [chartData]);

  const dynamicTitle = React.useMemo(() => {
    if (selectedSchoolLevel === "PRIMARY") {
      return "Performance across Primary Schools";
    }
    if (selectedSchoolLevel === "SECONDARY") {
      return "Performance across Secondary Schools";
    }
    return "Performance across Class Levels";
  }, [selectedSchoolLevel]);

  const dynamicDescription = React.useMemo(() => {
    if (selectedSchoolLevel === "PRIMARY") {
      return "Average academic score and student pass rate across primary school grades";
    }
    if (selectedSchoolLevel === "SECONDARY") {
      return "Average academic score and student pass rate across secondary school grades";
    }
    return "Average academic score and student pass rate across academic grades";
  }, [selectedSchoolLevel]);

  const activeBarSize = chartData.length > 12 ? 14 : 18;

  return (
    <Card className="border border-gray-200/90 shadow-xs hover:shadow-sm transition-all duration-200 bg-white">
      <CardHeader className="pb-2">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-brand-primary flex items-center justify-center shrink-0">
                <TrendingUp className="w-4 h-4" />
              </div>

              {/* Card Title first */}
              <CardTitle className="text-base font-semibold text-gray-900">
                {dynamicTitle}
              </CardTitle>

              {/* Selection dropdown in front of the card title */}
              <Select
                value={selectedSchoolLevel}
                onValueChange={(val) => onSchoolLevelChange?.(val as SchoolLevelFilter)}
              >
                <SelectTrigger className="h-7 w-[115px] text-xs font-semibold border-emerald-200 bg-emerald-50/80 hover:bg-emerald-100/70 text-emerald-900 focus:ring-emerald-500 rounded-md">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent className="text-xs">
                  <SelectItem value="ALL">All</SelectItem>
                  <SelectItem value="PRIMARY">Primary</SelectItem>
                  <SelectItem value="SECONDARY">Secondary</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <CardDescription className="text-xs text-gray-500 pl-0 sm:pl-10">
              {dynamicDescription}
            </CardDescription>
          </div>
          <div className="flex items-center gap-4 flex-wrap">
            <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-md bg-emerald-50/70 border border-emerald-200/60 text-xs font-semibold text-emerald-800">
              <Award className="w-3.5 h-3.5 text-emerald-600" />
              <span>Avg Score: {statewideGradeAverage}%</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-xs text-gray-600">
                <span className="w-2.5 h-2.5 rounded-full bg-brand-primary" />
                <span>Avg Score (%)</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-gray-600">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                <span>Pass Rate (%)</span>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-2">
        {chartData.length === 0 ? (
          <div className="h-72 flex flex-col items-center justify-center text-gray-400 gap-2 p-6 text-center">
            <BookOpen className="w-8 h-8 opacity-40 text-emerald-600" />
            <p className="text-sm font-medium text-gray-700">
              No assessment performance records available for this period
            </p>
            <p className="text-xs text-gray-400 max-w-sm">
              Switch session or check filters to view assessment records.
            </p>
          </div>
        ) : (
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 15, right: 10, left: -20, bottom: 25 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="grade"
                  tickLine={false}
                  axisLine={{ stroke: "#e2e8f0" }}
                  tick={{ fontSize: chartData.length > 12 ? 10 : 11, fill: "#64748b" }}
                  interval={0}
                  angle={-25}
                  textAnchor="end"
                  height={45}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: "#64748b" }}
                  domain={[0, 100]}
                  unit="%"
                />
                <ReferenceLine
                  y={50}
                  stroke="#ef4444"
                  strokeDasharray="3 3"
                  label={{
                    value: "50% Pass Benchmark",
                    position: "insideTopRight",
                    fill: "#ef4444",
                    fontSize: 10,
                  }}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const item = payload[0].payload;
                      const hasData =
                        (item.studentCount || 0) > 0 ||
                        (item.classCount || 0) > 0 ||
                        (item.averageScore || 0) > 0;
                      return (
                        <div className="bg-white border border-gray-100 rounded-lg shadow-lg p-3 text-xs space-y-1.5 z-50">
                          <p className="font-bold text-gray-900 border-b border-gray-100 pb-1">
                            {label}
                          </p>
                          {hasData ? (
                            <>
                              <div className="flex items-center justify-between gap-4">
                                <span className="text-gray-500">Average Score:</span>
                                <span className="font-bold text-emerald-600">
                                  {item.averageScore}%
                                </span>
                              </div>
                              <div className="flex items-center justify-between gap-4">
                                <span className="text-gray-500">Pass Rate:</span>
                                <span className="font-bold text-blue-600">
                                  {item.passRate}%
                                </span>
                              </div>
                              <div className="flex items-center justify-between gap-4 pt-1 border-t border-gray-50 text-[11px]">
                                <span className="text-gray-400">Classrooms:</span>
                                <span className="font-medium text-gray-700">
                                  {item.classCount}
                                </span>
                              </div>
                              <div className="flex items-center justify-between gap-4 text-[11px]">
                                <span className="text-gray-400">Assessed Students:</span>
                                <span className="font-medium text-gray-700">
                                  {item.studentCount.toLocaleString()}
                                </span>
                              </div>
                            </>
                          ) : (
                            <div className="text-[11px] text-gray-500 py-1">
                              No assessment records uploaded yet (0%)
                            </div>
                          )}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar
                  dataKey="averageScore"
                  name="Avg Score"
                  fill="#059669"
                  radius={[4, 4, 0, 0]}
                  barSize={activeBarSize}
                />
                <Bar
                  dataKey="passRate"
                  name="Pass Rate"
                  fill="#3b82f6"
                  radius={[4, 4, 0, 0]}
                  barSize={activeBarSize}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
