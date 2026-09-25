"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TopSchoolClassAnalytics } from "@/services/types/classResponse";
import { School, Award } from "lucide-react";

interface TopSchoolsClassesChartProps {
  data: TopSchoolClassAnalytics[];
}

export const TopSchoolsClassesChart: React.FC<TopSchoolsClassesChartProps> = ({
  data,
}) => {
  const topSchools = React.useMemo(() => {
    return (data || []).slice(0, 5);
  }, [data]);

  const medals = ["🥇", "🥈", "🥉"];

  return (
    <Card className="border border-gray-200/90 shadow-xs hover:shadow-sm transition-all duration-200 bg-white flex flex-col h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-brand-primary flex items-center justify-center">
            <School className="w-4 h-4" />
          </div>
          <div>
            <CardTitle className="text-sm font-semibold text-gray-900">
              Top Schools by Classes
            </CardTitle>
            <CardDescription className="text-[11px] text-gray-500">
              Institutions with the highest class capacity
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0 flex-1 flex flex-col justify-between">
        {topSchools.length === 0 ? (
          <div className="py-8 text-center text-xs text-gray-400">
            No school class records available
          </div>
        ) : (
          <div className="space-y-2.5">
            {topSchools.map((item, idx) => (
              <div
                key={item.schoolId || idx}
                className="p-2.5 rounded-lg border border-gray-100 hover:border-gray-200 bg-white flex items-center justify-between text-xs transition-colors"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="text-sm w-4 text-center shrink-0">
                    {medals[idx] || (
                      <span className="text-xs font-semibold text-gray-400">
                        #{idx + 1}
                      </span>
                    )}
                  </span>
                  <div className="min-w-0 truncate">
                    <p className="font-semibold text-gray-900 truncate capitalize">
                      {item.schoolName}
                    </p>
                    <p className="text-[10px] text-gray-500 truncate">
                      {item.lgaName}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0 pl-2">
                  <span className="font-bold text-brand-primary text-sm">
                    {item.classCount}
                  </span>
                  <span className="text-[10px] text-gray-400">classes</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
