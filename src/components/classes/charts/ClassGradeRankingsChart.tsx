"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { GradePerformanceAnalytics } from "@/services/types/classResponse";
import { Award } from "lucide-react";

interface ClassGradeRankingsChartProps {
  data: GradePerformanceAnalytics[];
  schoolLevel?: "ALL" | "PRIMARY" | "SECONDARY";
}

export const ClassGradeRankingsChart: React.FC<ClassGradeRankingsChartProps> = ({
  data,
  schoolLevel = "ALL",
}) => {
  const rankedGrades = React.useMemo(() => {
    return [...(data || [])]
      .sort((a, b) => (b.averageScore || 0) - (a.averageScore || 0))
      .slice(0, 5);
  }, [data]);

  const subtitle = React.useMemo(() => {
    if (schoolLevel === "PRIMARY") {
      return "Top performing primary cohorts across Abia State";
    }
    if (schoolLevel === "SECONDARY") {
      return "Top performing secondary cohorts across Abia State";
    }
    return "Top performing cohorts across Abia State";
  }, [schoolLevel]);

  return (
    <Card className="border border-gray-200/90 shadow-xs hover:shadow-sm transition-all duration-200 bg-white flex flex-col h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
            <Award className="w-4 h-4" />
          </div>
          <div>
            <CardTitle className="text-sm font-semibold text-gray-900">
              Grade-Level Academic Rankings
            </CardTitle>
            <CardDescription className="text-[11px] text-gray-500">
              {subtitle}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0 flex-1 flex flex-col justify-between">
        {rankedGrades.length === 0 ? (
          <div className="py-8 text-center text-xs text-gray-400 px-4">
            {schoolLevel === "SECONDARY"
              ? "No secondary school cohort rankings available yet. Data will appear once secondary assessment records are submitted."
              : "No grade assessment records available"}
          </div>
        ) : (
          <div className="space-y-2.5">
            {rankedGrades.map((item, idx) => (
              <div
                key={item.grade}
                className="p-2.5 rounded-lg border border-gray-100 hover:border-gray-200 bg-white flex items-center justify-between text-xs transition-colors"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[11px] flex items-center justify-center shrink-0">
                    {idx + 1}
                  </div>
                  <div className="min-w-0 truncate">
                    <p className="font-semibold text-gray-900 truncate">
                      {item.grade}
                    </p>
                    <p className="text-[10px] text-gray-500 truncate">
                      {item.classCount} classes • {item.studentCount.toLocaleString()} pupils
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0 pl-2">
                  <div className="text-right">
                    <span className="font-bold text-emerald-600 text-sm">
                      {item.averageScore}%
                    </span>
                    <p className="text-[10px] text-blue-600 font-medium">
                      {item.passRate}% pass
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
