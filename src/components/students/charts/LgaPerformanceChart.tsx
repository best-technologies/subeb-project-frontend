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
      lgaName: item.lgaName,
      lgaCode: item.lgaCode || item.lgaName.substring(0, 4).toUpperCase(),
      averagePercentage: item.averagePercentage,
      passRate: item.passRate,
      studentCount: item.studentCount,
      schoolCount: item.schoolCount,
      change: item.change,
    }));
  }, [data]);

  const topLga = React.useMemo(() => {
    if (!data.length) return null;
    const active = data.filter((d) => d.studentCount > 0);
    if (!active.length) return data[0];
    return [...active].sort((a, b) => b.averagePercentage - a.averagePercentage)[0];
  }, [data]);

  const hasData = React.useMemo(() => {
    return data.some((d) => d.studentCount > 0);
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
                Performance by LGA ({data.length} LGAs)
              </CardTitle>
              <CardDescription className="text-xs text-gray-500">
                Trajectory and demographic assessment across all local governments
              </CardDescription>
            </div>
          </div>
          {topLga && hasData && (
            <span className="hidden sm:inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              <TrendingUp className="w-3 h-3" />
              Top: {capitalizeInitials(topLga.lgaName)} ({topLga.averagePercentage}%)
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-2">
        {!hasData ? (
          <div className="h-[240px] flex flex-col items-center justify-center text-center p-4 text-gray-400">
            <MapPin className="w-8 h-8 stroke-[1.5] text-gray-300 mb-2" />
            <p className="text-xs font-semibold text-gray-600">No LGA Assessment Records</p>
            <p className="text-[11px] text-gray-400 max-w-[260px] mt-0.5">
              No student performance records found across the 17 LGAs for this period.
            </p>
          </div>
        ) : (
        <ChartContainer config={chartConfig} className="aspect-auto h-[240px] w-full">
          <AreaChart
            data={chartData}
            margin={{
              left: -10,
              right: 8,
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
              dataKey="lgaCode"
              interval={0}
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              className="text-[9px] text-gray-600 font-semibold"
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
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const p = payload[0].payload;
                const change = p.change;
                return (
                  <div className="rounded-lg border border-gray-200 bg-white p-2.5 shadow-md text-xs min-w-[170px] space-y-1.5">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-1">
                      <span className="font-bold text-gray-900">{p.lgaName}</span>
                      <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded">
                        {p.lgaCode}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-3 text-gray-600">
                      <span>Average Score:</span>
                      <span className="font-bold text-emerald-700">{p.averagePercentage}%</span>
                    </div>
                    <div className="flex items-center justify-between gap-3 text-gray-600">
                      <span>Schools:</span>
                      <span className="font-medium text-gray-900">{p.schoolCount}</span>
                    </div>
                    <div className="flex items-center justify-between gap-3 text-gray-600">
                      <span>Assessed Students:</span>
                      <span className="font-medium text-gray-900">{p.studentCount?.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between gap-3 border-t border-gray-100 pt-1 text-[11px]">
                      <span className="text-gray-500">vs Previous:</span>
                      {change !== null && change !== undefined ? (
                        change > 0 ? (
                          <span className="font-semibold text-emerald-600 flex items-center gap-0.5">
                            +{change}% ▲
                          </span>
                        ) : change < 0 ? (
                          <span className="font-semibold text-rose-600 flex items-center gap-0.5">
                            {change}% ▼
                          </span>
                        ) : (
                          <span className="font-medium text-gray-500">0.0% —</span>
                        )
                      ) : (
                        <span className="font-medium text-gray-400 italic text-[10px]">No prior record</span>
                      )}
                    </div>
                  </div>
                );
              }}
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
        )}
      </CardContent>
    </Card>
  );
};
