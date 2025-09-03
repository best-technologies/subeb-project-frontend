import React from "react";
import {
  Map,
  School,
  Users,
  Mars,
  Venus,
  ChartColumn,
  Trophy,
} from "lucide-react";
import { AdminDashboardData } from "@/services/types/adminDashboardResponse";

interface StatsCardsProps {
  dashboardData: AdminDashboardData | null;
}

const StatsCards: React.FC<StatsCardsProps> = ({ dashboardData }) => {
  // Use real API data from the new structure
  const summary = dashboardData?.summary;
  const totalStudents = summary?.totalStudents || 0;
  const maleStudents = summary?.totalMale || 0;
  const femaleStudents = summary?.totalFemale || 0;
  const totalLgas = summary?.totalLgas || 0;
  const totalSchools = summary?.totalSchools || 0;
  const studentsWithScores = (
    dashboardData?.performance?.topStudents ||
    dashboardData?.data?.students ||
    dashboardData?.topStudents ||
    []
  ).filter((s) => s.totalScore);
  const averageScore =
    studentsWithScores.length > 0
      ? Math.round(
          studentsWithScores.reduce((sum, s) => sum + (s.totalScore || 0), 0) /
            studentsWithScores.length /
            7
        ) // Assuming 7 subjects
      : 0;
  const topPerformers = (
    dashboardData?.performance?.topStudents ||
    dashboardData?.data?.students ||
    dashboardData?.topStudents ||
    []
  ).length;

  const stats = [
    {
      title: "Total LGAs",
      value: totalLgas,
      icon: <Map className="w-7 h-7" />,
      color: "from-teal-500 to-teal-600",
    },
    {
      title: "Total Schools",
      value: totalSchools,
      icon: <School className="w-7 h-7" />,
      color: "from-indigo-500 to-indigo-600",
    },
    {
      title: "Total Students",
      value: totalStudents,
      change: "+12%",
      changeType: "positive",
      icon: <Users className="w-7 h-7" />,
      color: "from-blue-500 to-blue-600",
    },
    {
      title: "Male Students",
      value: maleStudents,
      percentage: Math.round((maleStudents / totalStudents) * 100) || 0,
      icon: <Mars className="w-7 h-7" />,
      color: "from-green-500 to-green-600",
    },
    {
      title: "Female Students",
      value: femaleStudents,
      percentage: Math.round((femaleStudents / totalStudents) * 100) || 0,
      icon: <Venus className="w-7 h-7" />,
      color: "from-pink-500 to-pink-600",
    },
    {
      title: "Average Score",
      value: averageScore,
      unit: "%",
      icon: <ChartColumn className="w-7 h-7" />,
      color: "from-purple-500 to-purple-600",
    },
    {
      title: "Top 10 Students",
      value: topPerformers,
      icon: <Trophy className="w-7 h-7" />,
      color: "from-yellow-500 to-yellow-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5 gap-6 mb-8">
      {stats.map((stat, index) => (
        <div
          key={index}
          className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 hover:bg-white/15 transition-all duration-300 group"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-300 text-sm font-medium">{stat.title}</p>
              <div className="flex items-baseline space-x-2">
                <p className="text-2xl font-bold text-white">
                  {stat.value}
                  {stat.unit && <span className="text-lg">{stat.unit}</span>}
                </p>
                {stat.percentage && (
                  <span className="text-sm text-gray-400">
                    ({stat.percentage}%)
                  </span>
                )}
              </div>
              {stat.change && (
                <p
                  className={`text-sm ${
                    stat.changeType === "positive"
                      ? "text-green-400"
                      : "text-red-400"
                  }`}
                >
                  {stat.change}
                </p>
              )}
            </div>
            <div
              className={`w-12 h-12 bg-gradient-to-r ${stat.color} text-white rounded-lg flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-300`}
            >
              {stat.icon}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsCards;
