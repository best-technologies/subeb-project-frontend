"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ClassAnalyticsSummary } from "@/services/types/classResponse";
import { Percent, CheckCircle2, AlertTriangle, AlertCircle } from "lucide-react";

interface ClassUtilizationBandsChartProps {
  summary: ClassAnalyticsSummary;
  utilizationBands?: Array<{ name: string; count: number; percentage: number }>;
}

export const ClassUtilizationBandsChart: React.FC<ClassUtilizationBandsChartProps> = ({
  summary,
  utilizationBands,
}) => {
  const bands = React.useMemo(() => {
    if (utilizationBands && utilizationBands.length > 0) {
      return utilizationBands;
    }
    const total = summary.totalClasses || 1;
    return [
      {
        name: "Optimal (70-100%)",
        count: summary.balancedClasses,
        percentage: Math.round((summary.balancedClasses / total) * 100),
      },
      {
        name: "Overcrowded (>100%)",
        count: summary.overcrowdedClasses,
        percentage: Math.round((summary.overcrowdedClasses / total) * 100),
      },
      {
        name: "Under Capacity (<70%)",
        count: summary.underEnrolledClasses,
        percentage: Math.round((summary.underEnrolledClasses / total) * 100),
      },
    ];
  }, [summary, utilizationBands]);

  const colors = [
    { bg: "bg-emerald-500", text: "text-emerald-700", border: "border-emerald-200", icon: CheckCircle2 },
    { bg: "bg-rose-500", text: "text-rose-700", border: "border-rose-200", icon: AlertTriangle },
    { bg: "bg-amber-500", text: "text-amber-700", border: "border-amber-200", icon: AlertCircle },
  ];

  return (
    <Card className="border border-gray-200/90 shadow-xs hover:shadow-sm transition-all duration-200 bg-white flex flex-col h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-brand-primary flex items-center justify-center">
            <Percent className="w-4 h-4" />
          </div>
          <div>
            <CardTitle className="text-sm font-semibold text-gray-900">
              Capacity Utilization
            </CardTitle>
            <CardDescription className="text-[11px] text-gray-500">
              Seat occupancy and student density status
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0 flex-1 flex flex-col justify-between space-y-4">
        {/* Overall Progress Bar */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-gray-800">Statewide Utilization</span>
            <span className="font-bold text-brand-primary text-sm">
              {summary.capacityUtilization || 0}%
            </span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-3 flex overflow-hidden">
            {bands.map((b, idx) => {
              const c = colors[idx % colors.length];
              return (
                <div
                  key={b.name}
                  className={`${c.bg} transition-all duration-500`}
                  style={{ width: `${b.percentage}%` }}
                  title={`${b.name}: ${b.count} (${b.percentage}%)`}
                />
              );
            })}
          </div>
        </div>

        {/* Detailed Breakdown */}
        <div className="space-y-2.5">
          {bands.map((band, idx) => {
            const c = colors[idx % colors.length];
            const Icon = c.icon;
            return (
              <div
                key={band.name}
                className="p-2.5 rounded-lg border border-gray-100 bg-gray-50/60 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${c.bg}`} />
                  <span className="font-medium text-gray-800">{band.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-gray-900">{band.count}</span>
                  <span className="text-[11px] text-gray-500">({band.percentage}%)</span>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
