"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  AlertCircle,
  Clock,
  ArrowRight,
} from "lucide-react";
import { formatTermName } from "@/utils/formatters";

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

  // UI state for dropdown selects
  const [selectedSession, setSelectedSession] = useState<string>(initialSession || "");
  const [selectedTerm, setSelectedTerm] = useState<string>(initialTerm || "ALL_TERMS");

  // Query state that triggers API fetch
  const [activeQuery, setActiveQuery] = useState<{ session: string; term: string }>({
    session: initialSession || "",
    term: initialTerm || "ALL_TERMS",
  });

  // 4-second session debounce states & refs
  const [isDebouncing, setIsDebouncing] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownTimerRef = useRef<NodeJS.Timeout | null>(null);

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
    if (initialAvailableTerms.length > 0) {
      return initialAvailableTerms;
    }
    return [
      { id: "FIRST_TERM", name: "FIRST_TERM" },
      { id: "SECOND_TERM", name: "SECOND_TERM" },
      { id: "THIRD_TERM", name: "THIRD_TERM" },
    ];
  }, [sessionTermsData, initialAvailableTerms]);

  // Sync with initial props when provided
  useEffect(() => {
    if (initialSession && !selectedSession) {
      setSelectedSession(initialSession);
      setActiveQuery((prev) => ({ ...prev, session: initialSession }));
    }
    if (initialTerm && !selectedTerm) {
      setSelectedTerm(initialTerm);
      setActiveQuery((prev) => ({ ...prev, term: initialTerm }));
    }
  }, [initialSession, initialTerm, selectedSession, selectedTerm]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    };
  }, []);

  // Fetch analytics whenever activeQuery changes
  useEffect(() => {
    let isMounted = true;
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const res: StudentAnalyticsResponse = await getStudentAnalytics({
          session: activeQuery.session || undefined,
          term: activeQuery.term === "ALL_TERMS" ? "ALL_TERMS" : (activeQuery.term || undefined),
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
  }, [activeQuery]);

  // Handle session selection with 4-second debounce
  const handleSessionChange = (val: string) => {
    const sessionVal = val === "CURRENT_SESSION" ? "" : val;
    setSelectedSession(sessionVal);
    setSelectedTerm("ALL_TERMS");

    // Clear any previous debounce & countdown timers
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }

    setIsDebouncing(true);
    setCountdown(4);

    // Ticking countdown interval (every 1 second)
    countdownTimerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev === null || prev <= 1) {
          if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
          return null;
        }
        return prev - 1;
      });
    }, 1000);

    // 4-second debounce timer: if after 4 seconds nothing else is selected, fire session overview
    debounceTimerRef.current = setTimeout(() => {
      setIsDebouncing(false);
      setCountdown(null);
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
      debounceTimerRef.current = null;

      // Send request for session (all the terms) overview
      setActiveQuery({
        session: sessionVal,
        term: "ALL_TERMS",
      });
    }, 4000);
  };

  // Handle term selection immediately (cancels any pending session debounce)
  const handleTermChange = (val: string) => {
    setSelectedTerm(val);

    // If user moved to select a term, immediately cancel the 4s debounce timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }
    setIsDebouncing(false);
    setCountdown(null);

    // Fire request immediately with chosen session and chosen term
    setActiveQuery({
      session: selectedSession,
      term: val,
    });
  };

  // Switch to known active dataset (e.g. 2024/2025 Second Term)
  const handleSwitchToActiveDataset = (sessionName: string, termName: string) => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }
    setIsDebouncing(false);
    setCountdown(null);

    setSelectedSession(sessionName);
    setSelectedTerm(termName);
    setActiveQuery({
      session: sessionName,
      term: termName,
    });
  };

  const summary = analytics?.summary;
  const isNoData = !loading && analytics && analytics.summary.totalStudentsAssessed === 0;

  return (
    <div className="w-full bg-white rounded-xl border border-gray-200/90 shadow-2xs overflow-hidden mb-5 transition-all duration-200 relative">
      {/* Analytics Section Header */}
      <div className="px-5 py-4 border-b border-gray-100 bg-linear-to-r from-gray-50/90 via-emerald-50/20 to-white flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-700 text-white flex items-center justify-center shadow-xs">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base font-bold text-gray-900 tracking-tight">
                Student Performance & Demographics Analytics
              </h2>
              {/* Dynamic Loading / Debouncing / Period Badge */}
              {loading ? (
                <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 animate-pulse">
                  <Loader2 className="w-3 h-3 animate-spin text-emerald-600" />
                  Updating analytics...
                </span>
              ) : isDebouncing ? (
                <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 animate-pulse">
                  <Clock className="w-3 h-3 text-amber-600" />
                  Applying session in {countdown ?? 4}s (or choose a term)
                </span>
              ) : analytics ? (
                <span className="inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  {analytics.session} • {analytics.term === "ALL_TERMS" ? "All Terms (Session Overview)" : analytics.term.replace(/_/g, " ")}
                </span>
              ) : null}
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
              <Select
                value={selectedSession || "CURRENT_SESSION"}
                onValueChange={handleSessionChange}
              >
                <SelectTrigger className="h-8 text-xs font-medium text-gray-700 bg-white border border-gray-200 rounded-lg px-2.5 shadow-2xs hover:bg-gray-50 focus:ring-1 focus:ring-emerald-600 focus:ring-offset-0 gap-1.5 w-auto min-w-[135px]">
                  <div className="flex items-center gap-1.5 truncate">
                    <Calendar className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <SelectValue placeholder="Current Session" />
                  </div>
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-200 text-xs shadow-md z-50">
                  <SelectItem value="CURRENT_SESSION" className="text-xs py-1.5 cursor-pointer">
                    Current Session
                  </SelectItem>
                  {availableSessions.map((s) => (
                    <SelectItem key={s.id} value={s.name} className="text-xs py-1.5 cursor-pointer">
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {/* Term Dropdown */}
            <Select
              value={selectedTerm || "ALL_TERMS"}
              onValueChange={handleTermChange}
            >
              <SelectTrigger className="h-8 text-xs font-medium text-gray-700 bg-white border border-gray-200 rounded-lg px-2.5 shadow-2xs hover:bg-gray-50 focus:ring-1 focus:ring-emerald-600 focus:ring-offset-0 gap-1.5 w-auto min-w-[155px]">
                <div className="flex items-center gap-1.5 truncate">
                  <Layers className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <SelectValue placeholder="All Terms (Session Overview)" />
                </div>
              </SelectTrigger>
              <SelectContent className="bg-white border-gray-200 text-xs shadow-md z-50">
                <SelectItem value="ALL_TERMS" className="text-xs py-1.5 font-medium text-emerald-800 cursor-pointer">
                  All Terms (Session Overview)
                </SelectItem>
                {dynamicTerms.map((t) => (
                  <SelectItem key={t.id} value={t.name} className="text-xs py-1.5 cursor-pointer">
                    {formatTermName(t.name)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
        <div className="p-5 space-y-5 relative">
          {/* Active Loading Overlay */}
          {loading && (
            <div className="absolute inset-0 bg-white/70 backdrop-blur-[1.5px] z-30 flex flex-col items-center justify-center rounded-b-xl transition-opacity duration-200">
              <div className="bg-white px-5 py-4 rounded-xl border border-gray-200 shadow-lg flex flex-col items-center gap-2 text-center">
                <Loader2 className="w-7 h-7 text-emerald-600 animate-spin" />
                <p className="text-xs font-bold text-gray-900">Loading Assessment Analytics...</p>
                <p className="text-[11px] text-gray-500 max-w-[240px]">
                  Fetching student performance, LGA metrics, and demographic distributions
                </p>
              </div>
            </div>
          )}

          {/* User-friendly Master Empty State Banner */}
          {isNoData && (
            <div className="rounded-xl border border-amber-200/90 bg-linear-to-r from-amber-50/90 via-orange-50/40 to-amber-50/70 p-4 shadow-2xs">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                    <AlertCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">
                      No Assessment Records Found for {analytics?.session} (
                      {analytics?.term === "ALL_TERMS"
                        ? "All Terms (Session Overview)"
                        : formatTermName(analytics?.term)}
                      )
                    </h3>
                    <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">
                      There are no student scores or examination results uploaded for this academic period yet.
                      To inspect demographic charts and performance trends, please select an academic session and/or term with uploaded results.
                    </p>
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={() => handleSwitchToActiveDataset("2024/2025", "SECOND_TERM")}
                  className="shrink-0 text-xs font-semibold bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs cursor-pointer gap-1.5 self-start md:self-auto"
                >
                  <span>Switch to 2024/2025 (Second Term)</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          )}

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
                {loading && !analytics ? "..." : `${summary?.overallAverage ?? 0}%`}
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
                {loading && !analytics ? "..." : summary?.totalStudentsAssessed?.toLocaleString() ?? 0}
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
                {loading && !analytics ? "..." : summary?.genderParityIndex?.toFixed(2) ?? "1.00"}
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
                {loading && !analytics ? "..." : summary?.topPerformingLga ?? "N/A"}
              </div>
              <p className="text-[10px] text-teal-700/80 font-medium mt-0.5">
                Highest scoring local government
              </p>
            </div>
          </div>

          {/* Charts Grid */}
          {analytics ? (
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
          ) : (
            <div className="py-20 flex flex-col items-center justify-center gap-2 text-gray-500">
              <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
              <p className="text-xs font-medium">Loading demographic analytics...</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
