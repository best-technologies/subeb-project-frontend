"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  StudentAnalyticsData,
  StudentAnalyticsResponse,
} from "@/services/types/studentAnalyticsResponse";
import { getStudentAnalytics } from "@/services/api";
import { useTerms } from "@/services/hooks/useAcademic";
import { LgaPerformanceChart } from "./LgaPerformanceChart";
import { ClassPerformanceChart } from "./ClassPerformanceChart";
import { TopSchoolsChart } from "./TopSchoolsChart";
import { GenderPerformanceChart } from "./GenderPerformanceChart";
import { AgeRangePerformanceChart } from "./AgeRangePerformanceChart";
import { Button } from "@/components/ui/Button";
import {
  TrendingUp,
  Award,
  Users,
  Percent,
  ChevronDown,
  ChevronUp,
  BarChart3,
  Loader2,
  Calendar,
  Layers,
} from "lucide-react";

interface StudentChartsSectionProps {
  initialSession?: string;
  initialTerm?: string;
  availableSessions?: Array<{ id: string; name: string; isCurrent?: boolean }>;
  availableTerms?: Array<{ id: string; name: string; isCurrent?: boolean }>;
}

export const StudentChartsSection: React.FC<StudentChartsSectionProps> = ({
  initialSession,
  initialTerm,
  availableSessions = [],
  availableTerms: initialAvailableTerms = [],
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<StudentAnalyticsData | null>(null);
  const [selectedSession, setSelectedSession] = useState<string>(initialSession || "");
  const [selectedTerm, setSelectedTerm] = useState<string>(initialTerm || "");

  // Find selected session ID for terms query
  const selectedSessionObj = useMemo(() => {
    return availableSessions.find(
      (s) => s.id === selectedSession || s.name === selectedSession
    );
  }, [availableSessions, selectedSession]);

  const { data: sessionTermsData } = useTerms(selectedSessionObj?.id);

  const dynamicTerms = useMemo(() => {
    if (sessionTermsData?.data && sessionTermsData.data.length > 0) {
      return sessionTermsData.data;
    }
    return initialAvailableTerms;
  }, [sessionTermsData, initialAvailableTerms]);

  // Sync with initial props when provided
  useEffect(() => {
    if (initialSession && !selectedSession) {
      setSelectedSession(initialSession);
    }
    if (initialTerm && !selectedTerm) {
      setSelectedTerm(initialTerm);
    }
  }, [initialSession, initialTerm, selectedSession, selectedTerm]);

  // Fetch analytics whenever session or term changes
  useEffect(() => {
    let isMounted = true;
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const res: StudentAnalyticsResponse = await getStudentAnalytics({
          session: selectedSession || undefined,
          term: selectedTerm || undefined,
        });
        if (isMounted && res.success && res.data) {
          setAnalytics(res.data);
        }
      } catch (err) {
        console.error("Failed to load student analytics:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchAnalytics();
    return () => {
      isMounted = false;
    };
  }, [selectedSession, selectedTerm]);

  const summary = analytics?.summary;

  return (
    <div className="w-full bg-white rounded-xl border border-gray-200/90 shadow-2xs overflow-hidden mb-5 transition-all duration-200">
      {/* Analytics Section Header */}
      <div className="px-5 py-4 border-b border-gray-100 bg-linear-to-r from-gray-50/90 via-emerald-50/20 to-white flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-700 text-white flex items-center justify-center shadow-xs">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-gray-900 tracking-tight">
                Student Performance & Demographics Analytics
              </h2>
              {analytics && (
                <span className="inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  {analytics.session} • {analytics.term.replace("_", " ")}
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Comparative analysis across Classes, Top Schools, LGAs, Gender, and Age Range
            </p>
          </div>
        </div>

        {/* Action Controls & Collapse Button */}
        <div className="flex items-center gap-2 self-end md:self-auto">
          {/* Quick Academic Filter for Charts: Session & Term */}
          <div className="flex flex-wrap items-center gap-2">
            {availableSessions.length > 0 && (
              <div className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-lg px-2.5 py-1 text-xs shadow-2xs">
                <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                <select
                  aria-label="Filter Analytics by Session"
                  value={selectedSession}
                  onChange={(e) => {
                    setSelectedSession(e.target.value);
                    setSelectedTerm(""); // Reset term when session changes
                  }}
                  className="bg-transparent text-xs text-gray-700 font-medium focus:outline-hidden cursor-pointer"
                >
                  <option value="">Current Session</option>
                  {availableSessions.map((s) => (
                    <option key={s.id} value={s.name}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {dynamicTerms.length > 0 && (
              <div className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-lg px-2.5 py-1 text-xs shadow-2xs">
                <Layers className="w-3.5 h-3.5 text-emerald-600" />
                <select
                  aria-label="Filter Analytics by Term"
                  value={selectedTerm}
                  onChange={(e) => setSelectedTerm(e.target.value)}
                  className="bg-transparent text-xs text-gray-700 font-medium focus:outline-hidden cursor-pointer"
                >
                  <option value="">All / Current Term</option>
                  {dynamicTerms.map((t) => (
                    <option key={t.id} value={t.name}>
                      {t.name.replace(/_/g, " ")}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-xs font-medium text-gray-600 hover:text-gray-900 gap-1.5 h-8 px-2.5 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer"
          >
            {isExpanded ? (
              <>
                <span>Hide Analytics</span>
                <ChevronUp className="w-3.5 h-3.5" />
              </>
            ) : (
              <>
                <span>Show Analytics</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </>
            )}
          </Button>
        </div>
      </div>

      {isExpanded && (
        <div className="p-5 space-y-5">
          {/* KPI Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
            {/* KPI 1: Overall Average */}
            <div className="p-3.5 rounded-xl bg-linear-to-br from-emerald-50/70 to-emerald-100/40 border border-emerald-200/60 shadow-2xs">
              <div className="flex items-center justify-between text-emerald-700 mb-1">
                <span className="text-[11px] font-semibold uppercase tracking-wider">
                  Statewide Average
                </span>
                <Percent className="w-4 h-4 opacity-80" />
              </div>
              <div className="text-2xl font-extrabold text-emerald-900">
                {loading ? "..." : `${summary?.overallAverage ?? 0}%`}
              </div>
              <p className="text-[10px] text-emerald-700/80 font-medium mt-0.5">
                Across all registered students
              </p>
            </div>

            {/* KPI 2: Total Assessed */}
            <div className="p-3.5 rounded-xl bg-linear-to-br from-blue-50/70 to-blue-100/40 border border-blue-200/60 shadow-2xs">
              <div className="flex items-center justify-between text-blue-700 mb-1">
                <span className="text-[11px] font-semibold uppercase tracking-wider">
                  Assessed Students
                </span>
                <Users className="w-4 h-4 opacity-80" />
              </div>
              <div className="text-2xl font-extrabold text-blue-900">
                {loading ? "..." : summary?.totalStudentsAssessed?.toLocaleString() ?? 0}
              </div>
              <p className="text-[10px] text-blue-700/80 font-medium mt-0.5">
                Out of {summary?.totalEnrollment?.toLocaleString() ?? 0} total enrolled
              </p>
            </div>

            {/* KPI 3: Gender Parity Index */}
            <div className="p-3.5 rounded-xl bg-linear-to-br from-indigo-50/70 to-indigo-100/40 border border-indigo-200/60 shadow-2xs">
              <div className="flex items-center justify-between text-indigo-700 mb-1">
                <span className="text-[11px] font-semibold uppercase tracking-wider">
                  Gender Parity
                </span>
                <TrendingUp className="w-4 h-4 opacity-80" />
              </div>
              <div className="text-2xl font-extrabold text-indigo-900">
                {loading ? "..." : summary?.genderParityIndex?.toFixed(2) ?? "1.00"}
              </div>
              <p className="text-[10px] text-indigo-700/80 font-medium mt-0.5">
                Female to Male ratio (1.0 = equal)
              </p>
            </div>

            {/* KPI 4: Top LGA */}
            <div className="p-3.5 rounded-xl bg-linear-to-br from-teal-50/70 to-teal-100/40 border border-teal-200/60 shadow-2xs">
              <div className="flex items-center justify-between text-teal-700 mb-1">
                <span className="text-[11px] font-semibold uppercase tracking-wider">
                  Top LGA
                </span>
                <Award className="w-4 h-4 opacity-80" />
              </div>
              <div className="text-xl font-extrabold text-teal-900 truncate">
                {loading ? "..." : summary?.topPerformingLga ?? "N/A"}
              </div>
              <p className="text-[10px] text-teal-700/80 font-medium mt-0.5">
                Highest scoring local government
              </p>
            </div>
          </div>

          {/* Charts Grid */}
          {loading && !analytics ? (
            <div className="py-20 flex flex-col items-center justify-center gap-2 text-gray-500">
              <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
              <p className="text-xs font-medium">Loading demographic analytics...</p>
            </div>
          ) : analytics ? (
            <div className="space-y-4">
              {/* Row 1: LGA Area Chart (60%) & Top Schools Horizontal Bar (40%) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                <div className="lg:col-span-7">
                  <LgaPerformanceChart
                    data={analytics.byLga}
                    session={analytics.session}
                    term={analytics.term}
                  />
                </div>
                <div className="lg:col-span-5">
                  <TopSchoolsChart data={analytics.bySchool} />
                </div>
              </div>

              {/* Row 2: Class Performance (5 cols) & Gender Radial (4 cols) & Age Range (3 cols) */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                <div className="md:col-span-5">
                  <ClassPerformanceChart data={analytics.byClass} />
                </div>
                <div className="md:col-span-4">
                  <GenderPerformanceChart
                    data={analytics.byGender}
                    genderParityIndex={summary?.genderParityIndex}
                  />
                </div>
                <div className="md:col-span-3">
                  <AgeRangePerformanceChart data={analytics.byAgeRange} />
                </div>
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};
