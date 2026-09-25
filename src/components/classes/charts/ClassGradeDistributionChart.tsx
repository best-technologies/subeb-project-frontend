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

export const ClassGradeDistributionChart: React.FC<ClassGradeDistributionChartProps> = ({
  data,
  session,
}) => {
  const chartData = React.useMemo(() => {
    return data.map((item) => ({
      grade: item.grade,
      classCount: item.classCount,
      studentCount: item.studentCount,
      averageSize: item.averageSize,
      utilization: item.utilization,
    }));
  }, [data]);

  const totalClassesInGrades = React.useMemo(
    () => data.reduce((sum, g) => sum + g.classCount, 0),
    [data]
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
