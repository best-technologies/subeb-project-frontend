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
  ChartTooltipContent,
} from "@/components/ui/chart";
import { SchoolPerformanceItem } from "@/services/types/studentAnalyticsResponse";
import { capitalizeInitials } from "@/utils/formatters";
import { School as SchoolIcon, Award } from "lucide-react";

interface TopSchoolsChartProps {
  data: SchoolPerformanceItem[];
}

const chartConfig = {
  averagePercentage: {
    label: "Avg Score",
    color: "#0d9488", // teal-600
  },
} satisfies ChartConfig;

export const TopSchoolsChart: React.FC<TopSchoolsChartProps> = ({ data }) => {
  const chartData = React.useMemo(() => {
    return data.slice(0, 7).map((item) => ({
      school: capitalizeInitials(item.schoolName),
      averagePercentage: item.averagePercentage,
      lga: capitalizeInitials(item.lgaName),
      students: item.studentCount,
    }));
  }, [data]);

  return (
    <Card className="border-gray-200 shadow-xs flex flex-col justify-between">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-teal-100/80 text-teal-700 flex items-center justify-center">
            <SchoolIcon className="w-4 h-4" />
          </div>
          <div>
            <CardTitle className="text-base font-bold text-gray-900">
              Top Performing Schools
            </CardTitle>
            <CardDescription className="text-xs text-gray-500">
              Highest scoring educational institutions in the state
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-2">
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
              width={110}
              tickFormatter={(value) =>
                value.length > 15 ? `${value.slice(0, 15)}...` : value
              }
              className="text-[10px] text-gray-600 font-medium"
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
                      <div className="flex items-center justify-between gap-4 text-gray-500 text-[10px]">
                        <span>LGA:</span>
                        <span className="font-medium text-gray-700">
                          {item.payload.lga}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-4 text-gray-500 text-[10px]">
                        <span>Assessed:</span>
                        <span className="font-medium text-gray-700">
                          {item.payload.students} students
                        </span>
                      </div>
                    </div>
                  )}
                />
              }
            />
            <Bar
              dataKey="averagePercentage"
              fill="var(--color-averagePercentage)"
              radius={[0, 6, 6, 0]}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};
