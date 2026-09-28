"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PerformanceBandItem } from "@/services/types/classResponse";
import { BarChart3 } from "lucide-react";

interface ClassPerformanceBandsChartProps {
  bands?: PerformanceBandItem[];
  schoolLevel?: "ALL" | "PRIMARY" | "SECONDARY";
}

export const ClassPerformanceBandsChart: React.FC<ClassPerformanceBandsChartProps> = ({
  bands = [],
  schoolLevel = "ALL",
}) => {
  const defaultBands: PerformanceBandItem[] = [
    { name: "Distinction (≥70%)", count: 0, percentage: 0, color: "#10b981" },
    { name: "Credit (50-69%)", count: 0, percentage: 0, color: "#3b82f6" },
    { name: "Pass (40-49%)", count: 0, percentage: 0, color: "#f59e0b" },
    { name: "Needs Improvement (<40%)", count: 0, percentage: 0, color: "#ef4444" },
  ];

  const displayBands = bands && bands.length > 0 ? bands : defaultBands;
  const totalCount = displayBands.reduce((acc, curr) => acc + (curr.count || 0), 0);

  const subtitle = React.useMemo(() => {
    if (schoolLevel === "PRIMARY") {
      return "Primary classroom distribution across academic score brackets";
    }
    if (schoolLevel === "SECONDARY") {
      return "Secondary classroom distribution across academic score brackets";
    }
    return "Classroom distribution across academic grade brackets";
  }, [schoolLevel]);

  return (
    <Card className="border border-gray-200/90 shadow-xs hover:shadow-sm transition-all duration-200 bg-white flex flex-col h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div>
            <CardTitle className="text-sm font-semibold text-gray-900">
              Score Performance Bands
            </CardTitle>
            <CardDescription className="text-[11px] text-gray-500">
              {subtitle}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0 flex-1 flex flex-col justify-between">
        {totalCount === 0 ? (
          <div className="py-8 text-center text-xs text-gray-400 px-4">
            {schoolLevel === "SECONDARY"
              ? "No secondary school performance brackets available yet"
              : "No assessed classroom records available"}
          </div>
        ) : (
          <div className="space-y-3">
            {displayBands.map((band, idx) => {
              const colors = [
                "bg-emerald-500",
                "bg-blue-500",
                "bg-amber-500",
                "bg-rose-500",
              ];
              const barColor = band.color || colors[idx % colors.length];

              return (
                <div key={band.name} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-gray-700">{band.name}</span>
                    <span className="font-bold text-gray-900">
                      {band.count}{" "}
                      <span className="text-gray-400 font-normal">
                        ({band.percentage}%)
                      </span>
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${
                        barColor.startsWith("#") ? "" : barColor
                      }`}
                      style={{
                        width: `${Math.max(band.percentage, 2)}%`,
                        backgroundColor: barColor.startsWith("#") ? barColor : undefined,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
