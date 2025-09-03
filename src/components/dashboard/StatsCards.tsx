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
      bgColor: "bg-brand-primary",
      textColor: "text-brand-primary-contrast",
      titleColor: "text-brand-primary-contrast/80",
    },
    {
      title: "Total Schools",
      value: totalSchools,
      icon: <School className="w-7 h-7" />,
      bgColor: "bg-brand-primary-2",
      textColor: "text-brand-primary-2-contrast",
      titleColor: "text-brand-primary-2-contrast/80",
    },
    {
      title: "Total Students",
      value: totalStudents,
      change: "+12%",
      changeType: "positive",
      icon: <Users className="w-7 h-7" />,
      bgColor: "bg-brand-secondary",
      textColor: "text-brand-secondary-contrast",
      titleColor: "text-brand-secondary-contrast/80",
    },
    {
      title: "Male Students",
      value: maleStudents,
      percentage: Math.round((maleStudents / totalStudents) * 100) || 0,
      icon: <Mars className="w-7 h-7" />,
      bgColor: "bg-brand-accent",
      textColor: "text-brand-accent-contrast",
      titleColor: "text-brand-accent-contrast/80",
    },
    {
      title: "Female Students",
      value: femaleStudents,
      percentage: Math.round((femaleStudents / totalStudents) * 100) || 0,
      icon: <Venus className="w-7 h-7" />,
      bgColor: "bg-brand-primary",
      textColor: "text-brand-primary-contrast",
      titleColor: "text-brand-primary-contrast/80",
    },
    {
      title: "Average Score",
      value: averageScore,
      unit: "%",
      icon: <ChartColumn className="w-7 h-7" />,
      bgColor: "bg-brand-primary-2",
      textColor: "text-brand-primary-2-contrast",
      titleColor: "text-brand-primary-2-contrast/80",
    },
    {
      title: "Top 10 Students",
      value: topPerformers,
      icon: <Trophy className="w-7 h-7" />,
      bgColor: "bg-brand-secondary",
      textColor: "text-brand-secondary-contrast",
      titleColor: "text-brand-secondary-contrast/80",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5 gap-6 mb-8">
      {stats.map((stat, index) => (
        <div
          key={index}
          className={`${stat.bgColor} rounded-xl p-6 hover:opacity-90 transition-all duration-300 group shadow-lg`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className={`${stat.titleColor} text-sm font-medium`}>
                {stat.title}
              </p>
              <div className="flex items-baseline space-x-2">
                <p className={`text-2xl font-bold ${stat.textColor}`}>
                  {stat.value}
                  {stat.unit && <span className="text-lg">{stat.unit}</span>}
                </p>
                {stat.percentage && (
                  <span className={`text-sm ${stat.titleColor}`}>
                    ({stat.percentage}%)
                  </span>
                )}
              </div>
              {stat.change && (
                <p className={`text-sm ${stat.titleColor}`}>{stat.change}</p>
              )}
            </div>
            <div
              className={`w-12 h-12 ${stat.textColor} rounded-lg flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-300 bg-white/20`}
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
