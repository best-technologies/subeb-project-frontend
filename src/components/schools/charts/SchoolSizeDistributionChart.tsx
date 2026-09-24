"use client";

import React from "react";
import { Pie, PieChart, Cell, Label } from "recharts";
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
import { SchoolSizeDistributionItem } from "@/services/types/schoolAnalyticsResponse";
import { Building2 } from "lucide-react";

interface SchoolSizeDistributionChartProps {
  data: SchoolSizeDistributionItem[];
  totalSchools?: number;
}

const COHORT_COLORS: Record<string, string> = {
  small: "#3b82f6", // blue-500
  medium: "#10b981", // emerald-500
  large: "#f59e0b", // amber-500
  mega: "#8b5cf6", // purple-500
};

const chartConfig = {
  count: {
    label: "Schools",
    color: "#10b981",
  },
} satisfies ChartConfig;

export const SchoolSizeDistributionChart: React.FC<SchoolSizeDistributionChartProps> = ({
  data,
  totalSchools: totalProp,
}) => {
  const chartData = React.useMemo(() => {
    return data.map((item) => ({
      name: item.cohort,
      key: item.key,
      value: item.count,
      percentage: item.percentage,
      averageScore: item.averagePercentage,
      fill: COHORT_COLORS[item.key] || item.color || "#10b981",
    }));
  }, [data]);

  const total = React.useMemo(() => {
    if (totalProp && totalProp > 0) return totalProp;
    return data.reduce((acc, curr) => acc + curr.count, 0);
  }, [data, totalProp]);

  const hasData = total > 0;

  return (
    <Card className="border-gray-200 shadow-xs flex flex-col justify-between h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-100/80 text-emerald-700 flex items-center justify-center">
            <Building2 className="w-4 h-4" />
          </div>
          <div>
            <CardTitle className="text-base font-bold text-gray-900">
              School Size Distribution
            </CardTitle>
            <CardDescription className="text-xs text-gray-500">
              Distribution by student enrollment capacity
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-between gap-2 pt-1 flex-1">
        {!hasData ? (
          <div className="h-[210px] w-full flex flex-col items-center justify-center text-center p-4 text-gray-400">
            <Building2 className="w-8 h-8 stroke-[1.5] text-gray-300 mb-2" />
            <p className="text-xs font-semibold text-gray-600">No Cohort Records</p>
            <p className="text-[11px] text-gray-400 max-w-[200px] mt-0.5">
              No enrollment data available to categorize school size distribution.
            </p>
          </div>
        ) : (
          <>
            {/* Donut Chart */}
            <div className="w-full flex justify-center">
              <ChartContainer
                config={chartConfig}
                className="aspect-square max-h-[160px] w-full"
              >
                <PieChart>
                  <ChartTooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const row = payload[0].payload;
                        return (
                          <div className="bg-white border border-gray-200 rounded-lg p-2.5 shadow-md min-w-[160px] text-xs">
                            <div className="flex items-center gap-1.5 pb-1 border-b border-gray-100">
                              <span
                                className="w-2.5 h-2.5 rounded-full"
                                style={{ backgroundColor: row.fill }}
                              />
                              <span className="font-bold text-gray-900">{row.name}</span>
                            </div>
                            <div className="mt-1.5 space-y-1">
                              <div className="flex items-center justify-between text-gray-600">
                                <span>Schools:</span>
                                <span className="font-bold text-gray-900">{row.value}</span>
                              </div>
                              <div className="flex items-center justify-between text-gray-600">
                                <span>Share:</span>
                                <span className="font-bold text-emerald-700">
                                  {row.percentage}%
                                </span>
                              </div>
                              {row.averageScore > 0 && (
                                <div className="flex items-center justify-between text-gray-600 pt-1 border-t border-gray-50">
                                  <span>Avg Score:</span>
                                  <span className="font-bold text-blue-700">
                                    {row.averageScore}%
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
                  <Pie
                    data={chartData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={48}
                    outerRadius={72}
                    strokeWidth={2}
                    stroke="#ffffff"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                    <Label
                      content={({ viewBox }) => {
                        if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                          return (
                            <text
                              x={viewBox.cx}
                              y={viewBox.cy}
                              textAnchor="middle"
                              dominantBaseline="middle"
                            >
                              <tspan
                                x={viewBox.cx}
                                y={viewBox.cy}
                                className="fill-gray-900 text-lg font-bold"
                              >
                                {total.toLocaleString()}
                              </tspan>
                              <tspan
                                x={viewBox.cx}
                                y={(viewBox.cy || 0) + 16}
                                className="fill-gray-500 text-[10px]"
                              >
                                Schools
                              </tspan>
                            </text>
                          );
                        }
                      }}
                    />
                  </Pie>
                </PieChart>
              </ChartContainer>
            </div>

            {/* Mini breakdown cards */}
            <div className="grid grid-cols-2 gap-2 w-full pt-1">
              {chartData.map((cohort) => (
                <div
                  key={cohort.key}
                  className="p-2 rounded-lg border border-gray-100 bg-gray-50/70 flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-[11px] font-semibold text-gray-800 flex items-center gap-1.5 truncate">
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: cohort.fill }}
                      />
                      {cohort.name}
                    </span>
                    <span className="text-[10px] font-bold text-gray-500">
                      {cohort.percentage}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-gray-500">Schools</span>
                    <span className="font-bold text-gray-900">{cohort.value}</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
