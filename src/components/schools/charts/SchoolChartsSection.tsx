"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  SchoolAnalyticsData,
  SchoolAnalyticsResponse,
} from "@/services/types/schoolAnalyticsResponse";
import { getSchoolAnalytics } from "@/services/api";
import { useTerms } from "@/services/hooks/useAcademic";
import { SchoolLgaPerformanceChart } from "./SchoolLgaPerformanceChart";
import { TopSchoolsRankingChart } from "./TopSchoolsRankingChart";
import { SchoolPerformanceBandsChart } from "./SchoolPerformanceBandsChart";
import { SchoolSizeDistributionChart } from "./SchoolSizeDistributionChart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/Button";
import {
  School,
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
  Building2,
} from "lucide-react";
import { formatEducationalText, formatTermName } from "@/utils/formatters";

interface SchoolChartsSectionProps {
  initialSession?: string;
  initialTerm?: string;
  availableSessions?: Array<{ id: string; name: string; isCurrent?: boolean }>;
  availableTerms?: Array<{ id: string; name: string; isCurrent?: boolean }>;
  onLoadingChange?: (loading: boolean) => void;
}

export const SchoolChartsSection: React.FC<SchoolChartsSectionProps> = ({
  initialSession,
  initialTerm,
  availableSessions = [],
  availableTerms: initialAvailableTerms = [],
  onLoadingChange,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    onLoadingChange?.(loading);
  }, [loading, onLoadingChange]);
  const [analytics, setAnalytics] = useState<SchoolAnalyticsData | null>(null);

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
    if (!selectedSession || selectedSession === "CURRENT_SESSION") {
      return (
        availableSessions.find((s) => s.isCurrent) ||
        availableSessions.find((s: any) => s.status === "OPEN") ||
        availableSessions[0]
      );
    }
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
        const res: SchoolAnalyticsResponse = await getSchoolAnalytics({
          session: activeQuery.session || undefined,
          term: activeQuery.term === "ALL_TERMS" ? "ALL_TERMS" : (activeQuery.term || undefined),
        });
        if (isMounted && res.success && res.data) {
          setAnalytics(res.data);
        }
      } catch (err) {
        console.error("Failed to load school analytics:", err);
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

    let currentSec = 4;
    countdownTimerRef.current = setInterval(() => {
      currentSec -= 1;
      if (currentSec <= 0) {
        if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
        countdownTimerRef.current = null;
        setCountdown(null);
      } else {
        setCountdown(currentSec);
      }
    }, 1000);

    debounceTimerRef.current = setTimeout(() => {
      setIsDebouncing(false);
      setCountdown(null);
      setActiveQuery({
        session: sessionVal,
        term: "ALL_TERMS",
      });
      debounceTimerRef.current = null;
    }, 4000);
  };

  // Immediate term change: cancel debounce and apply immediately
  const handleTermChange = (val: string) => {
    setSelectedTerm(val);

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

    setActiveQuery({
      session: selectedSession,
      term: val,
    });
  };

  const handleInstantApply = () => {
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

    setActiveQuery({
      session: selectedSession,
      term: selectedTerm,
    });
  };

  const summary = analytics?.summary;
  const hasAssessments = Boolean(summary && summary.totalAssessedStudents > 0);

  // Dynamic school level distribution (Primary vs Secondary)
  const schoolLevelSubtext = useMemo(() => {
    const primary = summary?.primarySchoolsCount;
    const secondary = summary?.secondarySchoolsCount;
    if (primary !== undefined && secondary !== undefined) {
      if (primary > 0 && secondary === 0) return "100% Primary Level";
      if (secondary > 0 && primary === 0) return "100% Secondary Level";
      if (primary > 0 && secondary > 0) {
        const total = primary + secondary;
        const primaryPct = Math.round((primary / total) * 100);
        const secondaryPct = 100 - primaryPct;
        return `${primaryPct}% Primary • ${secondaryPct}% Secondary`;
      }
    }
    return "100% Primary Level";
  }, [summary]);

  return (
    <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs mb-6 overflow-hidden transition-all duration-300">
      {/* Header Bar */}
      <div className="px-6 py-4 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-emerald-50/40 via-white to-gray-50/40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
            <School className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-gray-900 text-lg">
                School Performance & Demographic Analytics
              </h3>
              {loading && (
                <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-full animate-pulse">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Crunching data...
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500">
              Insights crunched across {summary?.totalSchools || 443} primary schools, 17 LGAs, and enrollment cohorts
            </p>
          </div>
        </div>

        {/* Right side: Session & Term filters + collapse toggle */}
        <div className="flex items-center flex-wrap gap-2.5">
          {/* Debounce countdown indicator pill */}
          {isDebouncing && countdown !== null && (
            <button
              onClick={handleInstantApply}
              title="Click to apply immediately"
              className="group flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100/80 border border-emerald-300 text-emerald-800 text-xs font-semibold hover:bg-emerald-200/80 transition-all cursor-pointer"
            >
              <Clock className="w-3.5 h-3.5 text-emerald-600 animate-spin" />
              <span>Applying in {countdown}s</span>
              <ArrowRight className="w-3 h-3 text-emerald-600 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
            </button>
          )}

          {/* Session Selector */}
          <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200/80 rounded-lg px-2.5 py-1">
            <Calendar className="w-3.5 h-3.5 text-gray-500" />
            <span className="text-xs font-medium text-gray-500 hidden sm:inline">Session:</span>
            <Select
              value={selectedSession || "CURRENT_SESSION"}
              onValueChange={handleSessionChange}
            >
              <SelectTrigger className="border-0 shadow-none bg-transparent h-7 text-xs font-semibold text-gray-800 focus:ring-0 px-1 py-0 gap-1 min-w-[110px]">
                <SelectValue placeholder="Current Session" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CURRENT_SESSION" className="text-xs">
                  Current Session
                </SelectItem>
                {availableSessions.map((s) => (
                  <SelectItem key={s.id} value={s.id} className="text-xs">
                    {s.name} {s.isCurrent ? "(Current)" : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Term Selector */}
          <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200/80 rounded-lg px-2.5 py-1">
            <Layers className="w-3.5 h-3.5 text-gray-500" />
            <span className="text-xs font-medium text-gray-500 hidden sm:inline">Term:</span>
            <Select
              value={selectedTerm}
              onValueChange={handleTermChange}
            >
              <SelectTrigger className="border-0 shadow-none bg-transparent h-7 text-xs font-semibold text-gray-800 focus:ring-0 px-1 py-0 gap-1 min-w-[100px]">
                <SelectValue placeholder="All Terms" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL_TERMS" className="text-xs font-medium">
                  All Terms (Overview)
                </SelectItem>
                {dynamicTerms.map((t) => (
                  <SelectItem key={t.id} value={t.name || t.id} className="text-xs">
                    {formatTermName(t.name)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Collapse Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-gray-500 hover:text-gray-700 h-8 px-2"
          >
            {isExpanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Main Body */}
      {isExpanded && (
        <div className="p-6 relative">
          {/* Empty-state Alert */}
          {!loading && !hasAssessments && (
            <div className="mb-6 p-4 rounded-xl bg-amber-50/80 border border-amber-200/80 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-xs">
                <p className="font-bold text-amber-900">
                  No School Assessment Records for Selected Period
                </p>
                <p className="text-amber-700 mt-0.5">
                  No student assessment scores were submitted or recorded for{" "}
                  <span className="font-semibold">
                    {analytics?.session || selectedSession || "the selected session"} -{" "}
                    {analytics?.term === "ALL_TERMS"
                      ? "All Terms"
                      : formatTermName(analytics?.term || selectedTerm)}
                  </span>
                  . Please select an academic session and term that has completed score entries.
                </p>
              </div>
            </div>
          )}

          {/* 4 KPI Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Total Schools */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border border-emerald-200/60 flex items-center justify-between">
              <div>
                <span className="text-xs text-gray-500 block mb-1">Total Schools</span>
                <span className="text-2xl font-bold text-gray-900">
                  {(summary?.totalSchools || 443).toLocaleString()}
                </span>
                <span className="text-[11px] text-emerald-700 font-medium block mt-0.5">
                  {schoolLevelSubtext}
                </span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <Building2 className="w-5 h-5" />
              </div>
            </div>

            {/* Statewide Academic Average (Score Average) */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-200/60 flex items-center justify-between">
              <div>
                <span className="text-xs text-gray-500 block mb-1">Statewide School Average</span>
                <span className="text-2xl font-bold text-gray-900">
                  {summary?.statewideSchoolAverage ? `${summary.statewideSchoolAverage}%` : "—"}
                </span>
                <span className="text-[11px] text-blue-700 font-medium block mt-0.5">
                  Across all schools
                </span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                <Percent className="w-5 h-5" />
              </div>
            </div>

            {/* Average School Enrollment */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-teal-500/10 to-teal-500/5 border border-teal-200/60 flex items-center justify-between">
              <div>
                <span className="text-xs text-gray-500 block mb-1">Average School Size</span>
                <span className="text-2xl font-bold text-gray-900">
                  {(summary?.averageSchoolSize || 101).toLocaleString()}
                </span>
                <span className="text-[11px] text-teal-700 font-medium block mt-0.5">
                  Students per school
                </span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
            </div>

            {/* Top LGA / School */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-amber-500/10 to-amber-500/5 border border-amber-200/60 flex items-center justify-between">
              <div className="truncate pr-2">
                <span className="text-xs text-gray-500 block mb-1">Top Performing LGA</span>
                <span className="text-base font-bold text-gray-900 block truncate">
                  {summary?.topPerformingLga
                    ? formatEducationalText(summary.topPerformingLga)
                    : "—"}
                </span>
                <span className="text-[11px] text-amber-700 font-medium block mt-0.5 truncate">
                  Top School: {summary?.topPerformingSchool ? formatEducationalText(summary.topPerformingSchool) : "—"}
                </span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                <Award className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Row 1: 17 LGAs Performance Area Chart */}
          <div className="mb-6">
            <SchoolLgaPerformanceChart
              data={analytics?.byLga || []}
              session={analytics?.session}
              term={analytics?.term}
            />
          </div>

          {/* Row 2: Top Schools, Performance Tiers & School Size Cohorts */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <TopSchoolsRankingChart data={analytics?.topSchools || []} />
            <SchoolPerformanceBandsChart data={analytics?.performanceBands || []} />
            <SchoolSizeDistributionChart
              data={analytics?.sizeDistribution || []}
              totalSchools={summary?.totalSchools}
            />
          </div>
        </div>
      )}
    </div>
  );
};
