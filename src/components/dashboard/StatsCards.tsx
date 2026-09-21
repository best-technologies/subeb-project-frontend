import React from "react";
import {
  MapPin,
  School,
  Users,
  Calendar,
  Layers,
  Sparkles,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { AdminDashboardData } from "@/services/types/adminDashboardResponse";

interface StatsCardsProps {
  dashboardData: AdminDashboardData | null;
}

const StatsCards: React.FC<StatsCardsProps> = ({ dashboardData }) => {
  const summary = dashboardData?.summary;
  const totalStudents = summary?.totalStudents || 0;
  const maleStudents = summary?.totalMale || 0;
  const femaleStudents = summary?.totalFemale || 0;
  const totalLgas = summary?.totalLgas || 0;
  const totalSchools = summary?.totalSchools || 0;

  const currentSession = dashboardData?.currentSession;
  const currentTerm = dashboardData?.currentTerm;

  const formatTermName = (name?: string) => {
    if (!name) return "Not Set";
    return name
      .replace(/_/g, " ")
      .toLowerCase()
      .replace(/\b\w/g, (c) => c.toUpperCase());
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* 1. Academic Session & Term Card */}
      <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50/80 via-white to-emerald-100/40 shadow-sm hover:shadow-md transition-all duration-300">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-600/10 text-emerald-700 flex items-center justify-center">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900 tracking-tight">Academic Period</h3>
                <p className="text-xs text-gray-500">Current active schedule</p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
              Active
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="bg-white/90 rounded-lg p-3 border border-emerald-100/80 shadow-2xs text-center">
              <span className="text-xs font-medium text-gray-500 block mb-1">Session</span>
              <span className="text-base font-bold text-gray-900 block truncate">
                {currentSession?.name || "Not Set"}
              </span>
            </div>
            <div className="bg-white/90 rounded-lg p-3 border border-emerald-100/80 shadow-2xs text-center">
              <span className="text-xs font-medium text-gray-500 block mb-1">Term</span>
              <span className="text-base font-bold text-gray-900 block truncate">
                {formatTermName(currentTerm?.name)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 2. State Educational Overview Card */}
      <Card className="border-teal-200 bg-gradient-to-br from-teal-50/80 via-white to-teal-100/40 shadow-sm hover:shadow-md transition-all duration-300">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-teal-600/10 text-teal-700 flex items-center justify-center">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900 tracking-tight">State Overview</h3>
                <p className="text-xs text-gray-500">Total educational facilities</p>
              </div>
            </div>
            <span className="text-xs font-medium text-teal-700 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-md">
              Abia State
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-2">
            <div className="bg-white/90 rounded-lg p-2.5 border border-teal-100/80 text-center">
              <div className="flex items-center justify-center mb-1 text-teal-600">
                <MapPin className="w-4 h-4" />
              </div>
              <span className="text-lg font-bold text-gray-900 block">{totalLgas}</span>
              <span className="text-[11px] font-medium text-gray-500">LGAs</span>
            </div>
            <div className="bg-white/90 rounded-lg p-2.5 border border-teal-100/80 text-center">
              <div className="flex items-center justify-center mb-1 text-teal-600">
                <School className="w-4 h-4" />
              </div>
              <span className="text-lg font-bold text-gray-900 block">{totalSchools}</span>
              <span className="text-[11px] font-medium text-gray-500">Schools</span>
            </div>
            <div className="bg-white/90 rounded-lg p-2.5 border border-teal-100/80 text-center">
              <div className="flex items-center justify-center mb-1 text-teal-600">
                <Users className="w-4 h-4" />
              </div>
              <span className="text-lg font-bold text-gray-900 block truncate">{totalStudents.toLocaleString()}</span>
              <span className="text-[11px] font-medium text-gray-500">Students</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 3. Students by Gender Distribution Card */}
      <Card className="border-indigo-200 bg-gradient-to-br from-indigo-50/80 via-white to-indigo-100/40 shadow-sm hover:shadow-md transition-all duration-300">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-indigo-600/10 text-indigo-700 flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900 tracking-tight">Students by Gender</h3>
                <p className="text-xs text-gray-500">Enrollment ratio</p>
              </div>
            </div>
            <span className="text-xs font-medium text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-md flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              Verified
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="bg-white/90 rounded-lg p-3 border border-indigo-100/80 text-center">
              <span className="text-xs font-medium text-blue-600 flex items-center justify-center gap-1 mb-1">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                Male
              </span>
              <span className="text-base font-bold text-gray-900 block">
                {maleStudents.toLocaleString()}
              </span>
              <span className="text-[11px] text-gray-500 font-medium">
                {totalStudents > 0 ? Math.round((maleStudents / totalStudents) * 100) : 0}% of total
              </span>
            </div>
            <div className="bg-white/90 rounded-lg p-3 border border-indigo-100/80 text-center">
              <span className="text-xs font-medium text-pink-600 flex items-center justify-center gap-1 mb-1">
                <span className="w-2 h-2 rounded-full bg-pink-500" />
                Female
              </span>
              <span className="text-base font-bold text-gray-900 block">
                {femaleStudents.toLocaleString()}
              </span>
              <span className="text-[11px] text-gray-500 font-medium">
                {totalStudents > 0 ? Math.round((femaleStudents / totalStudents) * 100) : 0}% of total
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StatsCards;
