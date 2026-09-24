"use client";

import React from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
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
  ChartTooltipContent,
} from "@/components/ui/chart";
import { AgeRangePerformanceItem } from "@/services/types/studentAnalyticsResponse";
import { Calendar } from "lucide-react";

interface AgeRangePerformanceChartProps {
  data: AgeRangePerformanceItem[];
}

const chartConfig = {
  averagePercentage: {
    label: "Avg Score",
    color: "#8b5cf6", // violet-500
  },
} satisfies ChartConfig;

export const AgeRangePerformanceChart: React.FC<AgeRangePerformanceChartProps> = ({
  data,
}) => {
  const chartData = React.useMemo(() => {
    return data.map((item) => ({
      range: item.range,
      averagePercentage: item.averagePercentage,
      passRate: item.passRate,
      students: item.studentCount,
    }));
  }, [data]);

  return (
    <Card className="border-gray-200 shadow-xs flex flex-col justify-between h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-violet-100/80 text-violet-700 flex items-center justify-center">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <CardTitle className="text-base font-bold text-gray-900">
              Performance by Age
            </CardTitle>
            <CardDescription className="text-xs text-gray-500">
              Score across student age groups
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-2 flex-1 flex flex-col justify-center">
        {chartData.length === 0 ? (
          <div className="h-[240px] flex flex-col items-center justify-center text-center p-4 text-gray-400">
            <Calendar className="w-8 h-8 stroke-[1.5] text-gray-300 mb-2" />
            <p className="text-xs font-semibold text-gray-600">No Age Bracket Records</p>
            <p className="text-[11px] text-gray-400 max-w-[220px] mt-0.5">
              No age cohort performance records available for this period.
            </p>
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="aspect-auto h-[240px] w-full">
            <BarChart
              data={chartData}
              margin={{
                left: 0,
                right: 12,
                top: 10,
                bottom: 0,
              }}
            >
              <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis
                dataKey="range"
                tickLine={false}
                tickMargin={8}
                axisLine={false}
                className="text-[10px] text-gray-500 font-medium"
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                domain={[0, 100]}
                tickFormatter={(v) => `${v}%`}
                className="text-[10px] text-gray-500 font-medium"
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    indicator="dot"
                    formatter={(value, name, item) => (
                      <div className="flex flex-col gap-1 text-xs">
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-gray-600">Avg Score:</span>
                          <span className="font-bold text-gray-900">{value}%</span>
                        </div>
                        <div className="flex items-center justify-between gap-4 text-emerald-700 text-[10px]">
                          <span>Pass Rate:</span>
                          <span className="font-medium">{item.payload.passRate}%</span>
                        </div>
                        <div className="flex items-center justify-between gap-4 text-gray-500 text-[10px]">
                          <span>Students:</span>
                          <span>{item.payload.students?.toLocaleString()}</span>
                        </div>
                      </div>
                    )}
                  />
                }
              />
              <Bar
                dataKey="averagePercentage"
                fill="var(--color-averagePercentage)"
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
};
