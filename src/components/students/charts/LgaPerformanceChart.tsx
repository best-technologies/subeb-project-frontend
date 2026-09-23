"use client";

import React from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
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
import { LgaPerformanceItem } from "@/services/types/studentAnalyticsResponse";
import { capitalizeInitials } from "@/utils/formatters";
import { TrendingUp, MapPin } from "lucide-react";

interface LgaPerformanceChartProps {
  data: LgaPerformanceItem[];
  session?: string;
  term?: string;
}

const chartConfig = {
  averagePercentage: {
    label: "Avg Score",
    color: "#059669", // emerald-600
  },
  passRate: {
    label: "Pass Rate",
    color: "#10b981", // emerald-500
  },
} satisfies ChartConfig;

export const LgaPerformanceChart: React.FC<LgaPerformanceChartProps> = ({
  data,
  session,
  term,
}) => {
  const chartData = React.useMemo(() => {
    return data.map((item) => ({
      lga: capitalizeInitials(item.lgaName),
      averagePercentage: item.averagePercentage,
      passRate: item.passRate,
      studentCount: item.studentCount,
    }));
  }, [data]);

  const topLga = React.useMemo(() => {
    if (!data.length) return null;
    return [...data].sort((a, b) => b.averagePercentage - a.averagePercentage)[0];
  }, [data]);

  return (
    <Card className="border-gray-200 shadow-xs flex flex-col justify-between">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100/80 text-emerald-700 flex items-center justify-center">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <CardTitle className="text-base font-bold text-gray-900">
                Performance by LGA
              </CardTitle>
              <CardDescription className="text-xs text-gray-500">
                Average assessment score trajectory across local governments
              </CardDescription>
            </div>
          </div>
          {topLga && (
            <span className="hidden sm:inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              <TrendingUp className="w-3 h-3" />
              Top: {capitalizeInitials(topLga.lgaName)} ({topLga.averagePercentage}%)
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-2">
        <ChartContainer config={chartConfig} className="aspect-auto h-[240px] w-full">
          <AreaChart
            data={chartData}
            margin={{
              left: 0,
              right: 12,
              top: 10,
              bottom: 0,
            }}
          >
            <defs>
              <linearGradient id="fillAvgPercentage" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#059669" stopOpacity={0.6} />
                <stop offset="95%" stopColor="#059669" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis
              dataKey="lga"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value.slice(0, 5)}
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
              cursor={{ stroke: "#059669", strokeWidth: 1.5, strokeDasharray: "4 4" }}
              content={
                <ChartTooltipContent
                  indicator="dot"
                  formatter={(value, name, item) => (
                    <div className="flex items-center justify-between gap-4 w-full text-xs">
                      <span className="text-gray-600">{name === "averagePercentage" ? "Avg Score" : name}:</span>
                      <span className="font-bold text-gray-900">{value}%</span>
                    </div>
                  )}
                />
              }
            />
            <Area
              dataKey="averagePercentage"
              type="natural"
              fill="url(#fillAvgPercentage)"
              fillOpacity={0.4}
              stroke="#059669"
              strokeWidth={2.5}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};
