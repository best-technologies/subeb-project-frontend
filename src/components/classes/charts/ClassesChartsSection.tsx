"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useClassAnalytics } from "@/services/hooks/useClasses";
import { useSessions } from "@/services/hooks/useAcademic";
import { ClassPerformanceLevelChart } from "./ClassPerformanceLevelChart";
import { ClassGradeRankingsChart } from "./ClassGradeRankingsChart";
import { ClassPerformanceBandsChart } from "./ClassPerformanceBandsChart";
import { TopPerformingClassesChart } from "./TopPerformingClassesChart";
import { ClassesChartsSkeleton } from "./ClassesChartsSkeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/Button";
import {
  GraduationCap,
  Users,
  TrendingUp,
  ChevronDown,
  ChevronUp,
  BarChart3,
  Calendar,
  UserCheck,
} from "lucide-react";
import { isSecondaryGrade, isPrimaryGrade } from "@/utils/formatters";

interface ClassesChartsSectionProps {
  initialSession?: string;
  onLoadingChange?: (loading: boolean) => void;
}

export const ClassesChartsSection: React.FC<ClassesChartsSectionProps> = ({
  initialSession,
  onLoadingChange,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [selectedSession, setSelectedSession] = useState<string>(initialSession || "");
  const [selectedSchoolLevel, setSelectedSchoolLevel] = useState<"ALL" | "PRIMARY" | "SECONDARY">("ALL");

  // Academic sessions
  const { data: sessionsData } = useSessions();
  const availableSessions = useMemo(() => sessionsData?.data || [], [sessionsData]);

  // Set default session if not set
  useEffect(() => {
    if (!selectedSession && availableSessions.length > 0) {
      const current = availableSessions.find((s) => s.isCurrent) || availableSessions[0];
      if (current) {
        setSelectedSession(current.name);
      }
    }
  }, [availableSessions, selectedSession]);

  const { data, loading, error, refetch } = useClassAnalytics({
    session: selectedSession || undefined,
  });

  useEffect(() => {
    onLoadingChange?.(loading);
  }, [loading, onLoadingChange]);

  const summary = data?.summary || {
    totalClasses: 0,
    totalEnrolledStudents: 0,
    averageClassSize: 0,
    classesWithTeachers: 0,
    schoolsRepresented: 0,
  };

  // Filter cohort grade rankings based on selected school level
  const filteredPerformanceByGrade = useMemo(() => {
    const list = data?.performanceByGrade || [];
    if (selectedSchoolLevel === "PRIMARY") {
      return list.filter((item) => item.schoolLevel === "PRIMARY" || isPrimaryGrade(item.grade));
    }
    if (selectedSchoolLevel === "SECONDARY") {
      return list.filter((item) => item.schoolLevel === "SECONDARY" || isSecondaryGrade(item.grade));
    }
    return list;
  }, [data?.performanceByGrade, selectedSchoolLevel]);

  // Performance bands for the selected school level
  const activePerformanceBands = useMemo(() => {
    if (selectedSchoolLevel === "PRIMARY") {
      return data?.primaryPerformanceBands || [];
    }
    if (selectedSchoolLevel === "SECONDARY") {
      return data?.secondaryPerformanceBands || [];
    }
    return data?.performanceBands || [];
  }, [data, selectedSchoolLevel]);

  // Top performing classes filtered by selected school level
  const filteredTopPerformingClasses = useMemo(() => {
    const list = data?.topPerformingClasses || [];
    if (selectedSchoolLevel === "PRIMARY") {
      return list.filter((item) => item.schoolLevel === "PRIMARY" || isPrimaryGrade(item.grade));
    }
    if (selectedSchoolLevel === "SECONDARY") {
      return list.filter((item) => item.schoolLevel === "SECONDARY" || isSecondaryGrade(item.grade));
    }
    return list;
  }, [data?.topPerformingClasses, selectedSchoolLevel]);

  if (loading && !data) {
    return <ClassesChartsSkeleton />;
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200/90 shadow-xs overflow-hidden transition-all duration-200">
      {/* Header Bar */}
      <div className="px-4 sm:px-6 py-3 border-b border-gray-100 flex flex-col md:flex-row md:items-center md:justify-between gap-3 bg-linear-to-r from-emerald-50/40 via-white to-teal-50/30">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-brand-primary flex items-center justify-center">
              <BarChart3 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">
                Performance across Class Levels
              </h3>
              <p className="text-[11px] text-gray-500">
                Grade-level academic averages, pass rate benchmarks, and cohort rankings
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end md:self-auto">
          {/* Academic Session Selector */}
          {availableSessions.length > 0 && (
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-gray-400" />
              <Select
                value={selectedSession}
                onValueChange={(val) => setSelectedSession(val)}
              >
                <SelectTrigger className="h-8 text-xs bg-white border-gray-200 hover:border-brand-primary/40 focus:ring-brand-primary w-[140px]">
                  <SelectValue placeholder="Session" />
                </SelectTrigger>
                <SelectContent className="text-xs">
                  {availableSessions.map((s) => (
                    <SelectItem key={s.id} value={s.name}>
                      {s.name} {s.isCurrent ? "(Current)" : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Collapse/Expand Toggle Button */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-8 px-2 text-gray-500 hover:text-gray-900"
          >
            {isExpanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Collapsible Body */}
      {isExpanded && (
        <div className="p-4 sm:p-6 space-y-6">
          {/* 4 KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {/* Card 1: Total Classes */}
            <div className="p-4 rounded-xl border border-gray-100 bg-linear-to-br from-emerald-50/60 to-white shadow-2xs hover:shadow-xs transition-shadow">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-500">Total Classes</span>
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-brand-primary flex items-center justify-center">
                  <GraduationCap className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-black text-gray-900">
                  {summary.totalClasses.toLocaleString()}
                </span>
                <span className="text-[11px] font-medium text-emerald-700 bg-emerald-100/70 px-1.5 py-0.5 rounded">
                  Active
                </span>
              </div>
              <p className="mt-1 text-[11px] text-gray-500">Across all registered schools</p>
            </div>

            {/* Card 2: Average Class Size */}
            <div className="p-4 rounded-xl border border-gray-100 bg-linear-to-br from-teal-50/60 to-white shadow-2xs hover:shadow-xs transition-shadow">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-500">Average Class Size</span>
                <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-black text-gray-900">
                  {summary.averageClassSize}
                </span>
                <span className="text-[11px] font-medium text-teal-700 bg-teal-100/70 px-1.5 py-0.5 rounded">
                  Pupils / Class
                </span>
              </div>
              <p className="mt-1 text-[11px] text-gray-500">Average enrollment per active classroom</p>
            </div>

            {/* Card 3: Total Enrolled Students */}
            <div className="p-4 rounded-xl border border-gray-100 bg-linear-to-br from-blue-50/60 to-white shadow-2xs hover:shadow-xs transition-shadow">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-500">Students in Classes</span>
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-black text-gray-900">
                  {summary.totalEnrolledStudents.toLocaleString()}
                </span>
                <span className="text-[11px] font-medium text-blue-700 bg-blue-100/70 px-1.5 py-0.5 rounded">
                  Enrolled
                </span>
              </div>
              <p className="mt-1 text-[11px] text-gray-500">Total assigned student records</p>
            </div>

            {/* Card 4: Assigned Teachers */}
            <div className="p-4 rounded-xl border border-gray-100 bg-linear-to-br from-indigo-50/60 to-white shadow-2xs hover:shadow-xs transition-shadow">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-500">Assigned Teachers</span>
                <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
                  <UserCheck className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-black text-gray-900">
                  {(summary.classesWithTeachers || 0).toLocaleString()}
                </span>
                <span className="text-[11px] font-medium text-indigo-700 bg-indigo-100/70 px-1.5 py-0.5 rounded">
                  Assigned
                </span>
              </div>
              <p className="mt-1 text-[11px] text-gray-500">
                Classrooms with assigned class teachers
              </p>
            </div>
          </div>

          {/* Main Top Chart: Performance across School/Class Levels with Level Selector */}
          <ClassPerformanceLevelChart
            data={data?.performanceByGrade || []}
            session={selectedSession}
            selectedSchoolLevel={selectedSchoolLevel}
            onSchoolLevelChange={setSelectedSchoolLevel}
          />

          {/* Bottom 3 Cards: Cohort Rankings, Performance Bands, Top Classes */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <ClassGradeRankingsChart
              data={filteredPerformanceByGrade}
              schoolLevel={selectedSchoolLevel}
            />
            <ClassPerformanceBandsChart
              bands={activePerformanceBands}
              schoolLevel={selectedSchoolLevel}
            />
            <TopPerformingClassesChart
              data={filteredTopPerformingClasses}
              schoolLevel={selectedSchoolLevel}
            />
          </div>
        </div>
      )}
    </div>
  );
};
