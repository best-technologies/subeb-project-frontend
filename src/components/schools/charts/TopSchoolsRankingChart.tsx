"use client";

import React from "react";
import { Bar, BarChart, XAxis, YAxis } from "recharts";
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
import { TopSchoolRankingItem } from "@/services/types/schoolAnalyticsResponse";
import { formatEducationalText } from "@/utils/formatters";
import { Trophy } from "lucide-react";

interface TopSchoolsRankingChartProps {
  data: TopSchoolRankingItem[];
}

const chartConfig = {
  averagePercentage: {
    label: "Avg Score",
    color: "#059669", // emerald-600
  },
} satisfies ChartConfig;

export const TopSchoolsRankingChart: React.FC<TopSchoolsRankingChartProps> = ({ data }) => {
  const chartData = React.useMemo(() => {
    return data.slice(0, 8).map((item, idx) => ({
      rank: idx + 1,
      schoolId: item.schoolId,
      school: formatEducationalText(item.schoolName),
      averagePercentage: item.averagePercentage,
      lga: formatEducationalText(item.lgaName),
      students: item.studentCount,
      passRate: item.passRate,
    }));
  }, [data]);

  const hasData = chartData.some((d) => d.averagePercentage > 0);

  return (
    <Card className="border-gray-200 shadow-xs flex flex-col justify-between">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-100/80 text-amber-700 flex items-center justify-center">
              <Trophy className="w-4 h-4" />
            </div>
            <div>
              <CardTitle className="text-base font-bold text-gray-900">
                Top Performing Schools
              </CardTitle>
              <CardDescription className="text-xs text-gray-500">
                Top 8 schools by assessment percentage
              </CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-2 flex-1 flex flex-col justify-center">
        {!hasData ? (
          <div className="h-[240px] flex flex-col items-center justify-center text-center p-4 text-gray-400">
            <Trophy className="w-8 h-8 stroke-[1.5] text-gray-300 mb-2" />
            <p className="text-xs font-semibold text-gray-600">No Top Schools Data</p>
            <p className="text-[11px] text-gray-400 max-w-[220px] mt-0.5">
              No school performance data recorded for this academic period.
            </p>
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="aspect-auto h-[240px] w-full">
            <BarChart
              accessibilityLayer
              data={chartData}
              layout="vertical"
              margin={{
                left: 0,
                right: 16,
                top: 0,
                bottom: 0,
              }}
            >
              <XAxis type="number" domain={[0, 100]} hide />
              <YAxis
                dataKey="school"
                type="category"
                tickLine={false}
                tickMargin={6}
                axisLine={false}
                width={120}
                tickFormatter={(value) =>
                  value.length > 17 ? `${value.slice(0, 17)}...` : value
                }
                className="text-[10px] text-gray-700 font-medium"
              />
              <ChartTooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const row = payload[0].payload;
                    return (
                      <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-md min-w-[200px] text-xs">
                        <div className="flex items-center justify-between pb-1 border-b border-gray-100">
                          <span className="font-bold text-gray-900 text-sm">
                            #{row.rank} {row.school}
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-500 mt-1">LGA: {row.lga}</p>
                        <div className="grid grid-cols-2 gap-2 mt-2 pt-1 border-t border-gray-50">
                          <div className="bg-emerald-50 rounded p-1.5 text-center">
                            <span className="text-[10px] text-gray-500 block">Avg Score</span>
                            <span className="font-bold text-emerald-700 text-sm">
                              {row.averagePercentage}%
                            </span>
                          </div>
                          <div className="bg-blue-50 rounded p-1.5 text-center">
                            <span className="text-[10px] text-gray-500 block">Assessed</span>
                            <span className="font-bold text-blue-700 text-sm">
                              {row.students} students
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar
                dataKey="averagePercentage"
                fill="#059669"
                radius={[0, 4, 4, 0]}
              />
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
};
