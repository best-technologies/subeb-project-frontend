"use client";

import React from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Cell } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
} from "@/components/ui/chart";
import { SchoolPerformanceBandItem } from "@/services/types/schoolAnalyticsResponse";
import { BarChart3, Target } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface SchoolPerformanceBandsChartProps {
  data: SchoolPerformanceBandItem[];
}

const BAND_COLORS: Record<string, string> = {
  distinction: "#059669", // emerald-600
  good: "#0d9488", // teal-600
  average: "#f59e0b", // amber-500
  needsImprovement: "#ef4444", // red-500
};

const chartConfig = {
  count: {
    label: "Schools",
    color: "#059669",
  },
} satisfies ChartConfig;

export const SchoolPerformanceBandsChart: React.FC<SchoolPerformanceBandsChartProps> = ({
  data,
}) => {
  const chartData = React.useMemo(() => {
    return data.map((item) => ({
      band: item.band,
      key: item.key,
      count: item.count,
      percentage: item.percentage,
      color: BAND_COLORS[item.key] || item.color || "#059669",
    }));
  }, [data]);

  const totalAssessedSchools = React.useMemo(() => {
    return data.reduce((acc, curr) => acc + curr.count, 0);
  }, [data]);

  const hasData = totalAssessedSchools > 0;

  return (
    <Card className="border-gray-200 shadow-xs flex flex-col justify-between">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-100/80 text-blue-700 flex items-center justify-center">
              <Target className="w-4 h-4" />
            </div>
            <div>
              <CardTitle className="text-base font-bold text-gray-900">
                School Performance Tiers
              </CardTitle>
              <CardDescription className="text-xs text-gray-500">
                Breakdown of institutions by academic grading thresholds
              </CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-2 flex-1 flex flex-col justify-center">
        {!hasData ? (
          <div className="h-[240px] flex flex-col items-center justify-center text-center p-4 text-gray-400">
            <BarChart3 className="w-8 h-8 stroke-[1.5] text-gray-300 mb-2" />
            <p className="text-xs font-semibold text-gray-600">No Assessment Tiers</p>
            <p className="text-[11px] text-gray-400 max-w-[220px] mt-0.5">
              Schools have not recorded assessment scores for this period.
            </p>
          </div>
        ) : (
          <div>
            <ChartContainer config={chartConfig} className="aspect-auto h-[210px] w-full">
              <BarChart
                accessibilityLayer
                data={chartData}
                margin={{ top: 12, right: 12, left: -20, bottom: 0 }}
              >
                <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  dataKey="band"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  fontSize={10}
                  stroke="#64748b"
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  fontSize={10}
                  stroke="#64748b"
                />
                <ChartTooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const row = payload[0].payload;
                      return (
                        <div className="bg-white border border-gray-200 rounded-lg p-2.5 shadow-md min-w-[170px] text-xs">
                          <div className="flex items-center gap-1.5 pb-1 border-b border-gray-100">
                            <span
                              className="w-2.5 h-2.5 rounded-full"
                              style={{ backgroundColor: row.color }}
                            />
                            <span className="font-bold text-gray-900">{row.band}</span>
                          </div>
                          <div className="mt-2 space-y-1">
                            <div className="flex items-center justify-between text-gray-600">
                              <span>Schools:</span>
                              <span className="font-bold text-gray-900">{row.count}</span>
                            </div>
                            <div className="flex items-center justify-between text-gray-600">
                              <span>Share of Total:</span>
                              <span className="font-bold text-emerald-700">{row.percentage}%</span>
                            </div>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>

            {/* Quick mini-legend with Tooltip for cut-off text */}
            <TooltipProvider delayDuration={150}>
              <div className="grid grid-cols-4 gap-2 mt-3 pt-2 border-t border-gray-100 text-center">
                {chartData.map((b) => (
                  <Tooltip key={b.key}>
                    <TooltipTrigger asChild>
                      <div className="text-center cursor-pointer group rounded-md p-1 hover:bg-gray-50 transition-colors">
                        <span className="text-[10px] text-gray-500 block truncate group-hover:text-gray-900 transition-colors">
                          {b.band}
                        </span>
                        <span className="text-xs font-bold block" style={{ color: b.color }}>
                          {b.count} ({b.percentage}%)
                        </span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="text-center">
                      <p className="font-semibold text-xs">{b.band}</p>
                      <p className="text-[11px] text-gray-300 mt-0.5">
                        {b.count} schools ({b.percentage}% of total)
                      </p>
                    </TooltipContent>
                  </Tooltip>
                ))}
              </div>
            </TooltipProvider>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
