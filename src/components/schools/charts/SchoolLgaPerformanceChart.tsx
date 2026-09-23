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
} from "@/components/ui/chart";
import { SchoolLgaPerformanceItem } from "@/services/types/schoolAnalyticsResponse";
import { formatEducationalText } from "@/utils/formatters";
import { TrendingUp, TrendingDown, MapPin, School, Users } from "lucide-react";

interface SchoolLgaPerformanceChartProps {
  data: SchoolLgaPerformanceItem[];
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

export const SchoolLgaPerformanceChart: React.FC<SchoolLgaPerformanceChartProps> = ({
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
    const active = data.filter((d) => d.averagePercentage > 0);
    if (!active.length) return data[0];
    return [...active].sort((a, b) => b.averagePercentage - a.averagePercentage)[0];
  }, [data]);

  const hasData = React.useMemo(() => {
    return data.some((d) => d.averagePercentage > 0 || d.studentCount > 0);
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
                School Performance by LGA ({data.length} LGAs)
              </CardTitle>
              <CardDescription className="text-xs text-gray-500">
                Academic achievement and school counts across all 17 LGAs
              </CardDescription>
            </div>
          </div>
          {topLga && hasData && (
            <span className="hidden sm:inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              <TrendingUp className="w-3 h-3" />
              Top LGA: {formatEducationalText(topLga.lgaName)} ({topLga.averagePercentage}%)
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
              No school performance records found across the 17 LGAs for this period.
            </p>
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="h-[240px] w-full">
            <AreaChart
              data={chartData}
              margin={{ top: 12, right: 12, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="schoolLgaAvgGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#059669" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#059669" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis
                dataKey="lgaCode"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                fontSize={10}
                stroke="#64748b"
                interval={0}
              />
              <YAxis
                domain={[0, 100]}
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                fontSize={10}
                stroke="#64748b"
                unit="%"
              />
              <ChartTooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const row = payload[0].payload;
                    const changeVal = row.change;
                    return (
                      <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-md min-w-[210px] text-xs">
                        <div className="flex items-center justify-between pb-1.5 border-b border-gray-100">
                          <span className="font-bold text-gray-900 text-sm">
                            {formatEducationalText(row.lgaName)}
                          </span>
                          <span className="text-[11px] font-mono text-emerald-600 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded">
                            {row.lgaCode}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          <div className="bg-gray-50 rounded p-1.5">
                            <span className="text-[10px] text-gray-500 block">Avg Score</span>
                            <span className="font-bold text-emerald-700 text-sm">
                              {row.averagePercentage}%
                            </span>
                          </div>
                          <div className="bg-gray-50 rounded p-1.5">
                            <span className="text-[10px] text-gray-500 block">Pass Rate</span>
                            <span className="font-bold text-gray-800 text-sm">
                              {row.passRate}%
                            </span>
                          </div>
                        </div>
                        <div className="mt-2 space-y-1 pt-1.5 border-t border-gray-100 text-[11px]">
                          <div className="flex items-center justify-between text-gray-600">
                            <span className="flex items-center gap-1">
                              <School className="w-3 h-3 text-emerald-600" />
                              Schools:
                            </span>
                            <span className="font-semibold text-gray-900">{row.schoolCount}</span>
                          </div>
                          <div className="flex items-center justify-between text-gray-600">
                            <span className="flex items-center gap-1">
                              <Users className="w-3 h-3 text-blue-600" />
                              Students:
                            </span>
                            <span className="font-semibold text-gray-900">
                              {row.studentCount.toLocaleString()}
                            </span>
                          </div>
                          {changeVal !== undefined && changeVal !== null && (
                            <div className="flex items-center justify-between pt-1 border-t border-gray-50">
                              <span className="text-[10px] text-gray-500">Comparison:</span>
                              <span
                                className={`text-[11px] font-semibold flex items-center gap-0.5 ${
                                  changeVal > 0
                                    ? "text-emerald-600"
                                    : changeVal < 0
                                    ? "text-red-500"
                                    : "text-gray-400"
                                }`}
                              >
                                {changeVal > 0 ? (
                                  <>
                                    <TrendingUp className="w-3 h-3" /> +{changeVal}% vs prev
                                  </>
                                ) : changeVal < 0 ? (
                                  <>
                                    <TrendingDown className="w-3 h-3" /> {changeVal}% vs prev
                                  </>
                                ) : (
                                  "No change vs prev"
                                )}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                dataKey="averagePercentage"
                type="monotone"
                fill="url(#schoolLgaAvgGrad)"
                stroke="#059669"
                strokeWidth={2}
                dot={{ r: 2.5, fill: "#059669", strokeWidth: 1 }}
                activeDot={{ r: 5, fill: "#047857", stroke: "#fff", strokeWidth: 2 }}
              />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
};
