"use client";

import React from "react";
import { useExamOfficerDashboard } from "@/services/hooks/useExamOfficer";
import { Users, School, CheckCircle, Clock, ClipboardList } from "lucide-react";
import Link from "next/link";

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

  const { activeSession, activeTerm, analytics } = dashboard;

  const stats = [
    {
      title: "Total Schools",
      value: analytics.totalSchools,
      icon: <School className="w-8 h-8 text-blue-500" />,
      bg: "bg-blue-50",
      color: "text-blue-600",
    },
    {
      title: "Total Students",
      value: analytics.totalStudents,
      icon: <Users className="w-8 h-8 text-indigo-500" />,
      bg: "bg-indigo-50",
      color: "text-indigo-600",
    },
    {
      title: "Results Awaiting",
      value: analytics.awaitingApproval,
      icon: <Clock className="w-8 h-8 text-yellow-500" />,
      bg: "bg-yellow-50",
      color: "text-yellow-600",
    },
    {
      title: "Results Approved",
      value: analytics.approved,
      icon: <CheckCircle className="w-8 h-8 text-green-500" />,
      bg: "bg-green-50",
      color: "text-green-600",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">
            Welcome back! Here's an overview of your LGA examination metrics and progress.
          </p>
        </div>
        
        {activeTerm && (
          <div className="bg-emerald-50 text-emerald-800 px-4 py-2 rounded-xl font-medium shadow-xs border border-emerald-200 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-sm">
              Active Period: <strong>{activeSession?.name}</strong> - <strong>{activeTerm.name.replace("_", " ")}</strong>
            </span>
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div
            key={idx}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center space-x-4 transition-transform hover:scale-[1.02]"
          >
            <div className={`p-4 rounded-lg ${stat.bg}`}>{stat.icon}</div>
            <div>
              <p className="text-sm font-medium text-gray-500">{stat.title}</p>
              <h3 className={`text-2xl font-bold ${stat.color}`}>
                {stat.value.toLocaleString()}
              </h3>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            href="/officer/results?status=AWAITING_APPROVAL"
            className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:border-brand-primary hover:bg-brand-primary/5 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg group-hover:bg-brand-primary/10 transition-colors">
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
            className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:border-brand-primary hover:bg-brand-primary/5 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-brand-primary/10 transition-colors">
                <ClipboardList className="w-6 h-6 text-gray-600 group-hover:text-brand-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">View Audit Logs</h3>
                <p className="text-sm text-gray-500">Track your past approval actions</p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}