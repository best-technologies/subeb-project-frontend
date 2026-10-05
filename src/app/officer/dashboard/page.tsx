"use client";

import React from "react";
import { useExamOfficerDashboard } from "@/services/hooks/useExamOfficer";
import {
  Users,
  School,
  CheckCircle,
  Clock,
  ClipboardList,
  MapPin,
  Laptop,
} from "lucide-react";
import Link from "next/link";
import { SchoolItRelationshipTable } from "@/components/officer/SchoolItRelationshipTable";

interface LgaItem {
  id?: string;
  name: string;
  code?: string;
}

export default function ExamOfficerDashboard() {
  const { data: dashboard, isLoading, error } = useExamOfficerDashboard();

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !dashboard) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 text-red-600 p-6 rounded-2xl border border-red-200">
          Failed to load dashboard data.
        </div>
      </div>
    );
  }

  const { officer, activeSession, activeTerm, analytics, schoolItRelations } = dashboard;

  const lgasList: LgaItem[] =
    officer?.lgas || (officer?.currentLga ? [{ name: officer.currentLga }] : []);
  const hasMultipleLgas = lgasList.length > 1;

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            LGA Examination Dashboard
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Welcome back, {officer?.firstName || "Exam Officer"}! Overview of your LGA examination metrics, schools, and School IT personnel.
          </p>
        </div>

        {activeTerm && (
          <div className="bg-emerald-50 text-emerald-800 px-4 py-2 rounded-xl font-medium shadow-xs border border-emerald-200 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-sm">
              Active Period: <strong>{activeSession?.name}</strong> -{" "}
              <strong>{activeTerm.name.replace(/_/g, " ")}</strong>
            </span>
          </div>
        )}
      </div>

      {/* Stats Cards Grid - Compact and proportionate */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* 1. Current LGA Card (Emerald/Teal Gradient matching Admin Academic Settings) */}
        <div className="bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-950 text-white rounded-xl p-4 sm:p-5 shadow-sm relative overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 w-28 h-28 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-200/90">
                {hasMultipleLgas ? "Assigned LGAs" : "Current LGA"}
              </span>
              {hasMultipleLgas && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/30 text-emerald-200 border border-emerald-400/20">
                  {lgasList.length} LGAs
                </span>
              )}
            </div>
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-emerald-300 backdrop-blur-xs">
              <MapPin className="w-4 h-4" />
            </div>
          </div>

          <div className="mt-2.5">
            {hasMultipleLgas ? (
              <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto pr-1">
                {lgasList.map((lga: LgaItem, idx: number) => (
                  <span
                    key={lga.id || lga.code || idx}
                    className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-white/15 text-white border border-white/10"
                  >
                    {lga.name}
                  </span>
                ))}
              </div>
            ) : (
              <div className="text-xl sm:text-2xl font-bold tracking-tight">
                {officer?.currentLga || lgasList[0]?.name || "Not Assigned"}
              </div>
            )}
            <p className="text-[11px] text-emerald-200/80 mt-1 flex items-center gap-1.5">
              <span>{officer?.state || "Abia State"}</span>
              <span>•</span>
              <span>Primary jurisdiction</span>
            </p>
          </div>
        </div>

        {/* 2. Total School IT Personnel Card */}
        <div className="bg-white rounded-xl p-4 sm:p-5 border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              School IT Personnel
            </span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <Laptop className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5">
            <div className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
              {analytics?.totalSchoolIt ?? 0}
            </div>
            <p className="text-[11px] text-gray-500 mt-1 flex items-center gap-1">
              <span className="font-semibold text-purple-600">
                {analytics?.schoolsWithItCount ?? 0}
              </span>
              <span>of</span>
              <span className="font-semibold text-gray-700">
                {analytics?.totalSchools ?? 0}
              </span>
              <span>schools assigned</span>
            </p>
          </div>
        </div>

        {/* 3. Total Schools */}
        <div className="bg-white rounded-xl p-4 sm:p-5 border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Total Schools
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <School className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5">
            <div className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
              {(analytics?.totalSchools || 0).toLocaleString()}
            </div>
            <p className="text-[11px] text-gray-500 mt-1">
              {analytics?.schoolsWithoutItCount && analytics.schoolsWithoutItCount > 0
                ? `${analytics.schoolsWithoutItCount} without assigned IT`
                : "All schools registered in LGA"}
            </p>
          </div>
        </div>

        {/* 4. Total Students */}
        <div className="bg-white rounded-xl p-4 sm:p-5 border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Total Students
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5">
            <div className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
              {(analytics?.totalStudents || 0).toLocaleString()}
            </div>
            <p className="text-[11px] text-gray-500 mt-1">Enrolled active students</p>
          </div>
        </div>

        {/* 5. Results Awaiting Review */}
        <div className="bg-white rounded-xl p-4 sm:p-5 border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Results Awaiting
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5">
            <div className="text-xl sm:text-2xl font-bold text-amber-600 tracking-tight">
              {(analytics?.awaitingApproval || 0).toLocaleString()}
            </div>
            <p className="text-[11px] text-gray-500 mt-1">Students pending your approval</p>
          </div>
        </div>

        {/* 6. Results Approved */}
        <div className="bg-white rounded-xl p-4 sm:p-5 border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Results Approved
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5">
            <div className="text-xl sm:text-2xl font-bold text-emerald-600 tracking-tight">
              {(analytics?.approved || 0).toLocaleString()}
            </div>
            <p className="text-[11px] text-gray-500 mt-1">Approved this academic period</p>
          </div>
        </div>
      </div>

      {/* Analytical Table: School IT Persons & Their Schools */}
      <div className="space-y-4">
        <SchoolItRelationshipTable
          schools={schoolItRelations || []}
          activeTermName={activeTerm?.name}
          activeSessionName={activeSession?.name}
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-1">Quick Actions</h2>
        <p className="text-sm text-gray-500 mb-4">
          Direct navigation to pending school results approval and exam officer audit logs.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            href="/officer/results?status=AWAITING_APPROVAL"
            className="flex items-center justify-between p-4 rounded-xl border border-gray-200 hover:border-brand-primary hover:bg-brand-primary/5 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-yellow-100 rounded-xl group-hover:bg-brand-primary/10 transition-colors">
                <Clock className="w-6 h-6 text-yellow-600 group-hover:text-brand-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Review Pending Results</h3>
                <p className="text-sm text-gray-500">Approve or reject results sent by schools</p>
              </div>
            </div>
          </Link>

          <Link
            href="/officer/audit-logs"
            className="flex items-center justify-between p-4 rounded-xl border border-gray-200 hover:border-brand-primary hover:bg-brand-primary/5 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-gray-100 rounded-xl group-hover:bg-brand-primary/10 transition-colors">
                <ClipboardList className="w-6 h-6 text-gray-600 group-hover:text-brand-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">View Audit Logs</h3>
                <p className="text-sm text-gray-500">Track your past approval actions and activity</p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}