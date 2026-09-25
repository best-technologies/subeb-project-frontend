"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useClassAnalytics } from "@/services/hooks/useClasses";
import { useSessions } from "@/services/hooks/useAcademic";
import { ClassGradeDistributionChart } from "./ClassGradeDistributionChart";
import { ClassLgaDistributionChart } from "./ClassLgaDistributionChart";
import { ClassUtilizationBandsChart } from "./ClassUtilizationBandsChart";
import { TopSchoolsClassesChart } from "./TopSchoolsClassesChart";
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
  Percent,
  ChevronDown,
  ChevronUp,
  BarChart3,
  Calendar,
} from "lucide-react";

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
    totalCapacity: 0,
    capacityUtilization: 0,
    overcrowdedClasses: 0,
    balancedClasses: 0,
    underEnrolledClasses: 0,
  };

  if (loading && !data) {
    return <ClassesChartsSkeleton />;
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200/90 shadow-xs overflow-hidden transition-all duration-200">
      {/* Header Bar */}
      <div className="px-4 sm:px-6 py-3 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-linear-to-r from-emerald-50/40 via-white to-teal-50/30">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-brand-primary/10 text-brand-primary flex items-center justify-center">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-gray-900 flex items-center gap-2">
              Class Capacity & Grade Analytics
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                Live Overview
              </span>
            </h3>
            <p className="text-[11px] text-gray-500">
              Interactive enrollment density, seat occupancy, and grade distributions
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
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

          {/* Toggle Button */}
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
                  Students/Class
                </span>
              </div>
              <p className="mt-1 text-[11px] text-gray-500">Recommended target: 35 pupils</p>
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

            {/* Card 4: Capacity Utilization */}
            <div className="p-4 rounded-xl border border-gray-100 bg-linear-to-br from-amber-50/60 to-white shadow-2xs hover:shadow-xs transition-shadow">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-500">Capacity Utilization</span>
                <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
                  <Percent className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-black text-gray-900">
                  {summary.capacityUtilization}%
                </span>
                <span className="text-[11px] font-medium text-amber-700 bg-amber-100/70 px-1.5 py-0.5 rounded">
                  {summary.capacityUtilization >= 70 && summary.capacityUtilization <= 100
                    ? "Optimal"
                    : summary.capacityUtilization > 100
                    ? "Overcrowded"
                    : "Under Capacity"}
                </span>
              </div>
              <p className="mt-1 text-[11px] text-gray-500">
                {summary.totalCapacity.toLocaleString()} total available seats
              </p>
            </div>
          </div>

          {/* Top Main Section: Grade-Level Class Distribution Chart */}
          <ClassGradeDistributionChart
            data={data?.byGrade || []}
            session={selectedSession}
          />

          {/* Bottom 3 Cards: LGA breakdown, Utilization Bands, Top Schools */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <ClassLgaDistributionChart data={data?.byLga || []} />
            <ClassUtilizationBandsChart
              summary={summary}
              utilizationBands={data?.utilizationBands}
            />
            <TopSchoolsClassesChart data={data?.topSchools || []} />
          </div>
        </div>
      )}
    </div>
  );
};
