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
    <Card className="border-gray-200 shadow-xs flex flex-col justify-between h-full">
      <CardHeader className="pb-2">
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
      <CardContent className="flex flex-col items-center justify-between gap-2 pt-1 flex-1">
        {totalStudents === 0 ? (
          <div className="h-[210px] w-full flex flex-col items-center justify-center text-center p-4 text-gray-400">
            <Users2 className="w-8 h-8 stroke-[1.5] text-gray-300 mb-2" />
            <p className="text-xs font-semibold text-gray-600">No Gender Records</p>
            <p className="text-[11px] text-gray-400 max-w-[200px] mt-0.5">
              No assessed students to calculate gender ratio or parity index.
            </p>
          </div>
        ) : (
          <>
            {/* Inline Male & Female Mini Cards at top */}
            <div className="grid grid-cols-2 gap-2.5 w-full">
              {data.map((item) => (
                <div
                  key={item.gender}
                  className={`p-2 rounded-lg border flex flex-col justify-between ${
                    item.gender === "MALE"
                      ? "bg-blue-50/60 border-blue-100"
                      : "bg-rose-50/60 border-rose-100"
                  }`}
                >
                  <div className="flex items-center justify-between gap-1.5 mb-1">
                    <div className="flex items-center gap-1.5">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          item.gender === "MALE" ? "bg-blue-500" : "bg-rose-500"
                        }`}
                      />
                      <span className="text-xs font-bold text-gray-800">
                        {item.gender === "MALE" ? "Male" : "Female"}
                      </span>
                    </div>
                    <span className="text-[10px] font-semibold text-gray-500">
                      {item.sharePercentage}%
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-sm font-extrabold text-gray-900">
                      {item.averagePercentage}% <span className="text-[10px] font-normal text-gray-500">avg</span>
                    </span>
                    <span className="text-[10px] text-gray-500">
                      {item.studentCount.toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Centered Donut / Radial Chart */}
            <ChartContainer
              config={chartConfig}
              className="aspect-square h-[175px] w-[175px] mx-auto my-auto"
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
                  innerRadius={52}
                  outerRadius={72}
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
          </>
        )}
      </CardContent>
    </Card>
  );
};
