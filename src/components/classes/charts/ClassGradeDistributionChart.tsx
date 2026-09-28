"use client";

import React from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { GradeClassAnalytics } from "@/services/types/classResponse";
import { Layers, Users, BookOpen } from "lucide-react";

interface ClassGradeDistributionChartProps {
  data: GradeClassAnalytics[];
  session?: string;
}

const normalizeGrade = (rawGrade: string): string => {
  if (!rawGrade) return "Unassigned";
  const clean = rawGrade.trim().toLowerCase().replace(/\s+/g, " ");

  if (/^primar\s*y?\s*1$/i.test(clean) || /^basic\s*1$/i.test(clean) || clean === "p1" || clean === "pri 1") return "Primary 1";
  if (/^primar\s*y?\s*2$/i.test(clean) || /^basic\s*2$/i.test(clean) || clean === "p2" || clean === "pri 2") return "Primary 2";
  if (/^primar\s*y?\s*3$/i.test(clean) || /^basic\s*3$/i.test(clean) || clean === "p3" || clean === "pri 3") return "Primary 3";
  if (/^primar\s*y?\s*4$/i.test(clean) || /^(baisc|basic)\s*4$/i.test(clean) || clean === "p4" || clean === "pri 4") return "Primary 4";
  if (/^primar(yn|y)?\s*5$/i.test(clean) || /^(baisc|basic)\s*5$/i.test(clean) || clean === "p5" || clean === "pri 5") return "Primary 5";
  if (/^primar\s*y?\s*6$/i.test(clean) || /^(baisc|basic)\s*6$/i.test(clean) || clean === "p6" || clean === "pri 6") return "Primary 6";

  if (/^eccde\s*1$/i.test(clean) || clean === "eccde1") return "ECCDE 1";
  if (/^eccde\s*2$/i.test(clean) || clean === "eccde2") return "ECCDE 2";
  if (/^eccde\s*3$/i.test(clean) || clean === "eccde3") return "ECCDE 3";

  if (/^(nur|nursery)\s*1$/i.test(clean)) return "Nursery 1";
  if (/^(nur|nursery)\s*2$/i.test(clean)) return "Nursery 2";
  if (/^(nur|nursery)\s*3$/i.test(clean)) return "Nursery 3";

  if (/^jss\s*1$/i.test(clean) || clean === "jss1") return "JSS 1";
  if (/^jss\s*2$/i.test(clean) || clean === "jss2") return "JSS 2";
  if (/^jss\s*3$/i.test(clean) || clean === "jss3") return "JSS 3";

  if (/^sss\s*1$/i.test(clean) || clean === "sss1") return "SSS 1";
  if (/^sss\s*2$/i.test(clean) || clean === "sss2") return "SSS 2";
  if (/^sss\s*3$/i.test(clean) || clean === "sss3") return "SSS 3";

  return clean.replace(/\b\w/g, (c) => c.toUpperCase());
};

const GRADE_ORDER: Record<string, number> = {
  "ECCDE 1": 1,
  "ECCDE 2": 2,
  "ECCDE 3": 3,
  "Nursery 1": 4,
  "Nursery 2": 5,
  "Nursery 3": 6,
  "Primary 1": 7,
  "Primary 2": 8,
  "Primary 3": 9,
  "Primary 4": 10,
  "Primary 5": 11,
  "Primary 6": 12,
  "JSS 1": 13,
  "JSS 2": 14,
  "JSS 3": 15,
  "SSS 1": 16,
  "SSS 2": 17,
  "SSS 3": 18,
};

export const ClassGradeDistributionChart: React.FC<ClassGradeDistributionChartProps> = ({
  data,
  session,
}) => {
  const chartData = React.useMemo(() => {
    const merged = new Map<
      string,
      { grade: string; classCount: number; studentCount: number; averageSize: number }
    >();

    for (const item of data || []) {
      const normGrade = normalizeGrade(item.grade);
      const existing = merged.get(normGrade) || {
        grade: normGrade,
        classCount: 0,
        studentCount: 0,
        averageSize: 0,
      };
      existing.classCount += item.classCount || 0;
      existing.studentCount += item.studentCount || 0;
      existing.averageSize =
        existing.classCount > 0
          ? Math.round((existing.studentCount / existing.classCount) * 10) / 10
          : 0;
      merged.set(normGrade, existing);
    }

    return Array.from(merged.values()).sort(
      (a, b) => (GRADE_ORDER[a.grade] || 99) - (GRADE_ORDER[b.grade] || 99)
    );
  }, [data]);

  const totalClassesInGrades = React.useMemo(
    () => chartData.reduce((sum, g) => sum + g.classCount, 0),
    [chartData]
  );

  return (
    <Card className="border border-gray-200/90 shadow-xs hover:shadow-sm transition-all duration-200 bg-white">
      <CardHeader className="pb-2">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-brand-primary flex items-center justify-center">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <CardTitle className="text-base font-semibold text-gray-900">
                  Grade-Level Class Distribution
                </CardTitle>
                <CardDescription className="text-xs text-gray-500">
                  Number of classes and average student enrollment across academic grades
                </CardDescription>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs text-gray-600">
              <span className="w-2.5 h-2.5 rounded-full bg-brand-primary" />
              <span>Classes</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-600">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span>Avg Class Size</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-2">
        {chartData.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-gray-400 gap-2">
            <BookOpen className="w-8 h-8 opacity-40" />
            <p className="text-sm">No class grade distribution data available</p>
          </div>
        ) : (
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 10, right: 10, left: -20, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="grade"
                  tickLine={false}
                  axisLine={{ stroke: "#e2e8f0" }}
                  tick={{ fontSize: 11, fill: "#64748b" }}
                  interval={0}
                  angle={-20}
                  textAnchor="end"
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: "#64748b" }}
                  allowDecimals={false}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const item = payload[0].payload as typeof chartData[0];
                      return (
                        <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-md text-xs space-y-1 min-w-[160px]">
                          <p className="font-bold text-gray-900 border-b pb-1 mb-1">
                            {label}
                          </p>
                          <div className="flex justify-between text-gray-600">
                            <span>Total Classes:</span>
                            <span className="font-semibold text-brand-primary">
                              {item.classCount}
                            </span>
                          </div>
                          <div className="flex justify-between text-gray-600">
                            <span>Total Students:</span>
                            <span className="font-semibold text-gray-800">
                              {item.studentCount}
                            </span>
                          </div>
                          <div className="flex justify-between text-gray-600">
                            <span>Avg Students/Class:</span>
                            <span className="font-semibold text-amber-600">
                              {item.averageSize}
                            </span>
                          </div>
                          <div className="flex justify-between text-gray-600 pt-1 border-t">
                            <span>Capacity Utilization:</span>
                            <span className="font-semibold text-emerald-700">
                              {item.utilization}%
                            </span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar
                  dataKey="classCount"
                  name="Classes"
                  fill="#059669"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
