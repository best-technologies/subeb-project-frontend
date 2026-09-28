"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TopPerformingClassItem } from "@/services/types/classResponse";
import { GraduationCap } from "lucide-react";
import { formatEducationalText, capitalizeWords } from "@/utils/formatters";

interface TopPerformingClassesChartProps {
  data: TopPerformingClassItem[];
  schoolLevel?: "ALL" | "PRIMARY" | "SECONDARY";
}

export const TopPerformingClassesChart: React.FC<TopPerformingClassesChartProps> = ({
  data,
  schoolLevel = "ALL",
}) => {
  const topClasses = React.useMemo(() => {
    return (data || []).slice(0, 5);
  }, [data]);

  const subtitle = React.useMemo(() => {
    if (schoolLevel === "PRIMARY") {
      return "Primary classrooms with highest academic average";
    }
    if (schoolLevel === "SECONDARY") {
      return "Secondary classrooms with highest academic average";
    }
    return "Classrooms with highest academic average";
  }, [schoolLevel]);

  return (
    <Card className="border border-gray-200/90 shadow-xs hover:shadow-sm transition-all duration-200 bg-white flex flex-col h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-brand-primary flex items-center justify-center shrink-0">
            <GraduationCap className="w-4 h-4" />
          </div>
          <div>
            <CardTitle className="text-sm font-semibold text-gray-900">
              Top Performing Classes
            </CardTitle>
            <CardDescription className="text-[11px] text-gray-500">
              {subtitle}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0 flex-1 flex flex-col justify-between">
        {topClasses.length === 0 ? (
          <div className="py-8 text-center text-xs text-gray-400 px-4">
            {schoolLevel === "SECONDARY"
              ? "No secondary school class assessment records available yet"
              : "No class assessment records available"}
          </div>
        ) : (
          <div className="space-y-2.5">
            {topClasses.map((item, idx) => (
              <div
                key={item.classId || idx}
                className="p-2.5 rounded-lg border border-gray-100 hover:border-gray-200 bg-white flex items-center justify-between text-xs transition-colors"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[11px] flex items-center justify-center shrink-0">
                    {idx + 1}
                  </div>
                  <div className="min-w-0 truncate">
                    <p className="font-semibold text-gray-900 truncate">
                      {formatEducationalText(item.className)}
                    </p>
                    <p className="text-[10px] text-gray-500 truncate">
                      {capitalizeWords(item.schoolName)} ({item.lgaName})
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0 pl-2">
                  <span className="font-bold text-emerald-600 text-sm">
                    {item.averageScore}%
                  </span>
                  <span className="text-[10px] text-gray-400">avg</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
