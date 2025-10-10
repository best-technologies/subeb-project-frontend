"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  User,
  School,
  ChartColumn,
  Download,
  Share2,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useData } from "@/context/DataContext";
import { PerformanceStudent } from "@/services/types/studentsDashboardResponse";
import { formatEducationalText } from "@/utils/formatters";
import {
  getScoreColor,
  getScoreBgColor,
  getPositionBadge,
} from "@/components/students/utils/studentUtils";

export default function StudentDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const studentId = params.id as string;

  const {
    state: { adminDashboard },
    getStudentsDataFromAdmin,
  } = useData();

  const [student, setStudent] = useState<PerformanceStudent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get students data from admin dashboard
    const studentsData = getStudentsDataFromAdmin();

    if (studentsData?.performanceTable) {
      // Find student by examNo (ID)
      const foundStudent = studentsData.performanceTable.find(
        (s: PerformanceStudent) => s.examNo === studentId
      );

      setStudent(foundStudent || null);
    }

    setLoading(false);
  }, [studentId, adminDashboard, getStudentsDataFromAdmin]);

  const handleBackToStudents = () => {
    router.push("/students");
  };

  const handleDownload = () => {
    // TODO: Implement download functionality
    console.log("Download student details for:", student?.studentName);
  };

  const handleShare = () => {
    // TODO: Implement share functionality
    console.log("Share student details for:", student?.studentName);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary"></div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto">
          <h2 className="text-2xl font-bold text-brand-primary mb-4">
            Student Not Found
          </h2>
          <p className="text-brand-accent-text mb-6">
            The student with ID "{studentId}" could not be found.
          </p>
          <Button
            onClick={handleBackToStudents}
            className="bg-brand-primary hover:bg-brand-primary-2 text-brand-primary-contrast"
          >
            Back to Students
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-accent-background/30">
      {/* Header Section */}
      <div className="bg-brand-primary shadow-lg">
        <div className="max-w-6xl mx-auto px-6 py-8">
          {/* Back Button */}
          <div className="mb-6">
            <Button
              onClick={handleBackToStudents}
              variant="ghost"
              className="text-brand-primary-contrast flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Students
            </Button>
          </div>

          {/* Student Header Info */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            {/* Left Section - Student Info */}
            <div className="flex items-center space-x-6">
              <div
                className={`w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold ${
                  student.gender === "MALE"
                    ? "bg-brand-accent text-brand-accent-contrast"
                    : "bg-brand-secondary text-brand-secondary-contrast"
                }`}
              >
                {student.studentName
                  .split(" ")
                  .map((name) => name[0])
                  .join("")
                  .toUpperCase()}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-brand-primary-contrast">
                  {formatEducationalText(student.studentName)}
                </h1>
                <p className="text-brand-primary-contrast/70 text-lg">
                  Exam No: {student.examNo}
                </p>
                <p className="text-brand-primary-contrast/60">
                  {student.gender === "MALE" ? "Male" : "Female"} •{" "}
                  {formatEducationalText(student.class)}
                </p>
              </div>
            </div>

            {/* Right Section - Actions and Performance Metrics */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              {/* Performance Metrics */}
              <div className="flex items-center space-x-4">
                <div className="text-center">
                  <div className="px-4 py-2 rounded-lg bg-brand-accent/20 border border-brand-accent/30">
                    <div className="text-xl font-bold text-brand-primary-contrast">
                      {student.total}
                    </div>
                    <div className="text-xs text-brand-primary-contrast/70">
                      Total Score
                    </div>
                  </div>
                </div>
                <div className="text-center">
                  <div className="px-4 py-2 rounded-lg bg-brand-secondary/20 border border-brand-secondary/30">
                    <div className="text-xl font-bold text-brand-primary-contrast">
                      {student.average}%
                    </div>
                    <div className="text-xs text-brand-primary-contrast/70">
                      Average
                    </div>
                  </div>
                </div>
                <div className="text-center">
                  <div
                    className={`px-4 py-2 rounded-lg ${getPositionBadge(
                      student.position
                    )}`}
                  >
                    <div className="text-xl font-bold">{student.position}</div>
                    <div className="text-xs opacity-70">Position</div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleDownload}
                  className="text-brand-primary-contrast/70 hover:text-brand-primary-contrast hover:bg-brand-primary-contrast/10"
                  title="Download student details"
                >
                  <Download className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleShare}
                  className="text-brand-primary-contrast/70 hover:text-brand-primary-contrast hover:bg-brand-primary-contrast/10"
                  title="Share student details"
                >
                  <Share2 className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-6xl mx-auto px-6 py-6">
        {/* Compact Information Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          {/* Basic Information Card - Compact */}
          <div className="bg-white rounded-lg p-4 border border-brand-accent/20 shadow-sm">
            <div className="flex items-center mb-3">
              <User className="w-4 h-4 mr-2 text-brand-primary" />
              <h3 className="text-sm font-semibold text-brand-primary">
                Basic Information
              </h3>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-brand-accent-text/60 block">
                  Student Name
                </span>
                <span className="text-brand-primary font-medium">
                  {formatEducationalText(student.studentName)}
                </span>
              </div>
              <div>
                <span className="text-brand-accent-text/60 block">
                  Exam Number
                </span>
                <span className="text-brand-primary font-mono font-medium">
                  {student.examNo}
                </span>
              </div>
              <div>
                <span className="text-brand-accent-text/60 block">Gender</span>
                <span
                  className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${
                    student.gender === "MALE"
                      ? "bg-brand-accent/20 text-brand-accent"
                      : "bg-brand-secondary/20 text-brand-secondary"
                  }`}
                >
                  {student.gender === "MALE" ? "Male" : "Female"}
                </span>
              </div>
              <div>
                <span className="text-brand-accent-text/60 block">Class</span>
                <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-brand-primary/10 text-brand-primary">
                  {formatEducationalText(student.class)}
                </span>
              </div>
            </div>
          </div>

          {/* School Information Card - Compact */}
          <div className="bg-white rounded-lg p-4 border border-brand-accent/20 shadow-sm">
            <div className="flex items-center mb-3">
              <School className="w-4 h-4 mr-2 text-brand-primary" />
              <h3 className="text-sm font-semibold text-brand-primary">
                School Information
              </h3>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="col-span-2">
                <span className="text-brand-accent-text/60 block">
                  School Name
                </span>
                <span className="text-brand-primary font-medium leading-tight">
                  {formatEducationalText(student.school)}
                </span>
              </div>
              <div>
                <span className="text-brand-accent-text/60 block">
                  Class Position
                </span>
                <span
                  className={`inline-flex px-2 py-0.5 rounded text-xs font-semibold ${getPositionBadge(
                    student.position
                  )}`}
                >
                  #{student.position}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Summary Card - More Prominent */}
        <div className="bg-white rounded-xl p-6 border border-brand-accent/20 shadow-lg">
          <h3 className="text-xl font-semibold text-brand-primary mb-6 flex items-center">
            <ChartColumn className="w-5 h-5 mr-3" />
            Performance Summary
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-brand-accent/10 to-brand-accent/5 rounded-lg p-6 border border-brand-accent/20">
              <div className="text-sm text-brand-accent-text/70 mb-2 font-medium">
                Total Score
              </div>
              <div className="text-3xl font-bold text-brand-accent mb-1">
                {student.total}
              </div>
              <div className="text-xs text-brand-accent-text/60">
                Out of total possible marks
              </div>
            </div>
            <div className="bg-gradient-to-br from-brand-secondary/10 to-brand-secondary/5 rounded-lg p-6 border border-brand-secondary/20">
              <div className="text-sm text-brand-accent-text/70 mb-2 font-medium">
                Average Score
              </div>
              <div className="text-3xl font-bold text-brand-secondary mb-1">
                {student.average}%
              </div>
              <div className="text-xs text-brand-accent-text/60">
                Overall performance percentage
              </div>
            </div>
            <div className="bg-gradient-to-br from-brand-primary/10 to-brand-primary/5 rounded-lg p-6 border border-brand-primary/20">
              <div className="text-sm text-brand-accent-text/70 mb-2 font-medium">
                Class Position
              </div>
              <div className="text-3xl font-bold text-brand-primary mb-1">
                #{student.position}
              </div>
              <div className="text-xs text-brand-accent-text/60">
                Ranking in class
              </div>
            </div>
          </div>
        </div>

        {/* Back Button (Bottom) */}
        <div className="mt-6 text-center">
          <Button
            onClick={handleBackToStudents}
            className="bg-brand-primary hover:bg-brand-primary-2 text-brand-primary-contrast px-8 py-3"
            size="lg"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Students List
          </Button>
        </div>
      </div>
    </div>
  );
}
