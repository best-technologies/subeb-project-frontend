"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LgaClassAnalytics } from "@/services/types/classResponse";
import { MapPin, Users } from "lucide-react";

interface ClassLgaDistributionChartProps {
  data: LgaClassAnalytics[];
}

export const ClassLgaDistributionChart: React.FC<ClassLgaDistributionChartProps> = ({
  data,
}) => {
  const topLgas = React.useMemo(() => {
    return [...data].sort((a, b) => b.classCount - a.classCount).slice(0, 8);
  }, [data]);

  const maxCount = React.useMemo(() => {
    if (!topLgas.length) return 1;
    return Math.max(...topLgas.map((l) => l.classCount), 1);
  }, [topLgas]);

  return (
    <Card className="border border-gray-200/90 shadow-xs hover:shadow-sm transition-all duration-200 bg-white flex flex-col h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-brand-primary flex items-center justify-center">
            <MapPin className="w-4 h-4" />
          </div>
          <div>
            <CardTitle className="text-sm font-semibold text-gray-900">
              LGA Class Distribution
            </CardTitle>
            <CardDescription className="text-[11px] text-gray-500">
              Top local government areas by total active classes
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0 flex-1 flex flex-col justify-between">
        {topLgas.length === 0 ? (
          <div className="py-8 text-center text-xs text-gray-400">
            No LGA class data available
          </div>
        ) : (
          <div className="space-y-3">
            {topLgas.map((lga, index) => {
              const widthPct = Math.round((lga.classCount / maxCount) * 100);
              return (
                <div key={lga.lgaId || index} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-gray-800 truncate max-w-[130px]">
                      {lga.lgaName}
                    </span>
                    <div className="flex items-center gap-2 text-[11px] text-gray-500">
                      <span className="font-semibold text-gray-900">
                        {lga.classCount} <span className="font-normal text-gray-400">classes</span>
                      </span>
                      <span className="text-gray-300">•</span>
                      <span>avg {lga.averageSize}</span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-brand-primary h-2 rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(widthPct, 4)}%` }}
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
