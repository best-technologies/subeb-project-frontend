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
  ChartTooltipContent,
} from "@/components/ui/chart";
import { GenderPerformanceItem } from "@/services/types/studentAnalyticsResponse";
import { Users2 } from "lucide-react";

interface GenderPerformanceChartProps {
  data: GenderPerformanceItem[];
  genderParityIndex?: number;
}

const chartConfig = {
  MALE: {
    label: "Male",
    color: "#3b82f6", // blue-500
  },
  FEMALE: {
    label: "Female",
    color: "#f43f5e", // rose-500
  },
} satisfies ChartConfig;

export const GenderPerformanceChart: React.FC<GenderPerformanceChartProps> = ({
  data,
  genderParityIndex = 1.0,
}) => {
  const chartData = React.useMemo(() => {
    return data.map((item) => ({
      gender: item.gender,
      value: item.studentCount,
      percentage: item.sharePercentage,
      averageScore: item.averagePercentage,
      fill: item.gender === "MALE" ? "#3b82f6" : "#f43f5e",
    }));
  }, [data]);

  const totalStudents = React.useMemo(() => {
    return data.reduce((acc, curr) => acc + curr.studentCount, 0);
  }, [data]);

  return (
    <Card className="border-gray-200 shadow-xs flex flex-col justify-between">
      <CardHeader className="pb-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-100/80 text-indigo-700 flex items-center justify-center">
            <Users2 className="w-4 h-4" />
          </div>
          <div>
            <CardTitle className="text-base font-bold text-gray-900">
              Gender Distribution & Parity
            </CardTitle>
            <CardDescription className="text-xs text-gray-500">
              Enrollment proportion and average score parity
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col sm:flex-row items-center justify-around gap-4 pt-2">
        <ChartContainer
          config={chartConfig}
          className="aspect-square h-[180px] w-[180px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  hideLabel
                  formatter={(value, name, item) => (
                    <div className="flex flex-col gap-1 text-xs">
                      <div className="flex items-center justify-between gap-3 font-semibold">
                        <span>{item.payload.gender}:</span>
                        <span>{item.payload.value?.toLocaleString()} students</span>
                      </div>
                      <div className="flex items-center justify-between gap-3 text-gray-600 text-[10px]">
                        <span>Share:</span>
                        <span>{item.payload.percentage}%</span>
                      </div>
                      <div className="flex items-center justify-between gap-3 text-emerald-700 font-medium text-[10px]">
                        <span>Avg Score:</span>
                        <span>{item.payload.averageScore}%</span>
                      </div>
                    </div>
                  )}
                />
              }
            />
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="gender"
              innerRadius={55}
              outerRadius={75}
              strokeWidth={3}
              stroke="#fff"
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
                          {genderParityIndex.toFixed(2)}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 16}
                          className="fill-gray-500 text-[10px] font-medium"
                        >
                          GPI Parity
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>

        <div className="flex flex-col gap-2.5 w-full sm:w-auto">
          {data.map((item) => (
            <div
              key={item.gender}
              className="flex items-center justify-between gap-4 p-2 rounded-lg bg-gray-50/80 border border-gray-100"
            >
              <div className="flex items-center gap-2">
                <div
                  className={`w-2.5 h-2.5 rounded-full ${
                    item.gender === "MALE" ? "bg-blue-500" : "bg-rose-500"
                  }`}
                />
                <span className="text-xs font-semibold text-gray-800">
                  {item.gender === "MALE" ? "Male" : "Female"}
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-gray-900 block">
                  {item.averagePercentage}% avg
                </span>
                <span className="text-[10px] text-gray-500">
                  {item.sharePercentage}% ({item.studentCount.toLocaleString()})
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
