"use client";

import React from "react";
import { useSchoolItDashboard } from "@/services/hooks/useSchoolIt";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, GraduationCap, School, BookOpen, UserPlus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function SchoolItDashboardPage() {
  const { data, isLoading } = useSchoolItDashboard();

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="w-10 h-10 border-4 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const school = data?.school || { name: 'Unknown School', code: 'N/A' };
  const analytics = data?.analytics || {
    totalStudents: 0,
    maleStudents: 0,
    femaleStudents: 0,
    totalTeachers: 0,
    totalClasses: 0,
  };
  const recentStudents = data?.recentStudents || [];

  const statCards = [
    {
      title: "Total Students",
      value: analytics.totalStudents,
      icon: <Users size={24} className="text-blue-500" />,
      bgColor: "bg-blue-50",
    },
    {
      title: "Classes",
      value: analytics.totalClasses,
      icon: <School size={24} className="text-indigo-500" />,
      bgColor: "bg-indigo-50",
    },
    {
      title: "Teachers",
      value: analytics.totalTeachers,
      icon: <GraduationCap size={24} className="text-emerald-500" />,
      bgColor: "bg-emerald-50",
    },
    {
      title: "Male Students",
      value: analytics.maleStudents,
      icon: <Users size={24} className="text-cyan-500" />,
      bgColor: "bg-cyan-50",
    },
    {
      title: "Female Students",
      value: analytics.femaleStudents,
      icon: <Users size={24} className="text-pink-500" />,
      bgColor: "bg-pink-50",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome to {school.name}</h1>
          <p className="text-gray-600 mt-1">School Code: <span className="font-mono text-brand-primary">{school.code}</span></p>
          {(data?.activeSession || data?.activeTerm) && (
            <p className="text-sm text-gray-500 mt-2 flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-green-500"></span>
              Active Period: <span className="font-medium text-gray-700">{data.activeSession?.name} - {data.activeTerm?.name?.replace('_', ' ')}</span>
            </p>
          )}
        </div>
        <Link href="/school-it/students">
          <Button className="flex items-center gap-2 px-6 py-2.5">
            <UserPlus size={18} />
            Enrol New Student
          </Button>
        </Link>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {statCards.map((stat, idx) => (
          <Card key={idx} className="border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6 flex flex-col gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.bgColor}`}>
                {stat.icon}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">{stat.title}</p>
                <h3 className="text-3xl font-bold text-gray-900">{stat.value}</h3>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions & Recent */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-gray-100 shadow-sm">
          <CardHeader className="bg-gray-50 border-b border-gray-100">
            <CardTitle className="text-lg font-semibold text-gray-800">Recently Enrolled Students</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {recentStudents.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                No students enrolled recently.
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {recentStudents.map((student: any) => (
                  <div key={student.id} className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-bold">
                        {student.firstName[0]}{student.lastName[0]}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{student.firstName} {student.lastName}</p>
                        <p className="text-xs text-gray-500">Gender: {student.gender}</p>
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(student.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-gray-100 shadow-sm">
          <CardHeader className="bg-gray-50 border-b border-gray-100">
            <CardTitle className="text-lg font-semibold text-gray-800">Quick Links</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <Link href="/school-it/students" className="flex items-center gap-3 p-4 rounded-xl border border-gray-100 hover:border-brand-primary hover:bg-brand-primary/5 transition-all group">
              <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-brand-primary group-hover:text-white transition-colors">
                <Users size={20} />
              </div>
              <div>
                <p className="font-medium text-gray-900">Manage Students</p>
                <p className="text-xs text-gray-500">View, edit, or enrol</p>
              </div>
            </Link>
            
            <Link href="/school-it/results" className="flex items-center gap-3 p-4 rounded-xl border border-gray-100 hover:border-brand-primary hover:bg-brand-primary/5 transition-all group">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-brand-primary group-hover:text-white transition-colors">
                <BookOpen size={20} />
              </div>
              <div>
                <p className="font-medium text-gray-900">Manage Results</p>
                <p className="text-xs text-gray-500">Upload or edit grades</p>
              </div>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
