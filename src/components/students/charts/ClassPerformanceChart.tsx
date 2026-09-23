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
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import { ClassPerformanceItem } from "@/services/types/studentAnalyticsResponse";
import { formatEducationalText } from "@/utils/formatters";
import { GraduationCap } from "lucide-react";

interface ClassPerformanceChartProps {
  data: ClassPerformanceItem[];
}

const chartConfig = {
  maleAverage: {
    label: "Male Avg",
    color: "#2563eb", // blue-600
  },
  femaleAverage: {
    label: "Female Avg",
    color: "#e11d48", // rose-600
  },
} satisfies ChartConfig;

export const ClassPerformanceChart: React.FC<ClassPerformanceChartProps> = ({
  data,
}) => {
  const chartData = React.useMemo(() => {
    return data
      .filter((item) => item.studentCount > 5) // filter out outliers
      .slice(0, 9)
      .map((item) => ({
        class: formatEducationalText(item.className),
        maleAverage: item.maleAverage,
        femaleAverage: item.femaleAverage,
        averagePercentage: item.averagePercentage,
        students: item.studentCount,
      }));
  }, [data]);

  return (
    <Card className="border-gray-200 shadow-xs flex flex-col justify-between h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-100/80 text-blue-700 flex items-center justify-center">
            <GraduationCap className="w-4 h-4" />
          </div>
          <div>
            <CardTitle className="text-base font-bold text-gray-900">
              Performance by Class & Gender
            </CardTitle>
            <CardDescription className="text-xs text-gray-500">
              Score comparison between male and female students per grade
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-2">
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
              dataKey="class"
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
                  formatter={(value, name) => (
                    <div className="flex items-center justify-between gap-4 w-full text-xs">
                      <span className="text-gray-600">
                        {name === "maleAverage" ? "Male Avg" : "Female Avg"}:
                      </span>
                      <span className="font-bold text-gray-900">{value}%</span>
                    </div>
                  )}
                />
              }
            />
            <ChartLegend content={<ChartLegendContent />} />
            <Bar dataKey="maleAverage" fill="var(--color-maleAverage)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="femaleAverage" fill="var(--color-femaleAverage)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};
