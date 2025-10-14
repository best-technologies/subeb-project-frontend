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
  TrendingUp,
  TrendingDown,
  Award,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useData } from "@/context/DataContext";
import { PerformanceStudent } from "@/services/types/studentsDashboardResponse";
import {
  StudentDetailsData,
  SubjectBreakdown,
  getStudentDetails,
  downloadStudentResultPDF,
  StudentDetailsStudent,
} from "@/services";
import { formatEducationalText } from "@/utils/formatters";
import { downloadBlob, sanitizeFilename } from "@/utils/downloadUtils";
import { getPositionBadge } from "@/components/students/utils/studentUtils";

export default function StudentDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const studentId = params.id as string;

  const {
    state: { adminDashboard },
    getStudentsDataFromAdmin,
  } = useData();

  const [student, setStudent] = useState<PerformanceStudent | null>(null);
  const [studentDetails, setStudentDetails] =
    useState<StudentDetailsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] = useState(true);
  const [downloadingPDF, setDownloadingPDF] = useState(false);

  useEffect(() => {
    // Get students data from admin dashboard for basic info (fallback only)
    const studentsData = getStudentsDataFromAdmin();

    if (studentsData?.performanceTable) {
      // Find student by UUID (id) instead of examNo
      const foundStudent = studentsData.performanceTable.find(
        (s: PerformanceStudent) => s.id === studentId
      );

      setStudent(foundStudent || null);
    }

    setLoading(false);
  }, [studentId, adminDashboard, getStudentsDataFromAdmin]);

  useEffect(() => {
    // Fetch detailed student data from backend
    const fetchStudentDetails = async () => {
      if (!studentId) return;

      setDetailsLoading(true);
      try {
        // Use the student UUID from the URL for the API call
        const response = await getStudentDetails(studentId);
        setStudentDetails(response.data);

        // If we don't have the student in cache, we can still proceed with API data
        if (!student && response.data?.student) {
          // We have all the data we need from the API, no need to block
          setLoading(false);
        }
      } catch (error) {
        console.error("Error fetching student details:", error);
        // Handle error - maybe show a fallback or error message
      } finally {
        setDetailsLoading(false);
      }
    };

    fetchStudentDetails();
  }, [studentId, student]);

  const handleBackToStudents = () => {
    router.push("/students");
  };

  const handleDownload = async () => {
    if (downloadingPDF) return; // Prevent multiple downloads

    try {
      setDownloadingPDF(true);
      // console.log("Starting PDF download for student:", getStudentName());

      const blob = await downloadStudentResultPDF(studentId);

      // Generate a clean filename
      const studentName = getStudentName();
      const filename = sanitizeFilename(`${studentName}_Result.pdf`);

      // Download the PDF
      downloadBlob(blob, filename);

      // console.log("PDF download completed successfully");
    } catch (error) {
      console.error("Error downloading PDF:", error);
      // You could show a toast notification or error message here
      alert("Failed to download PDF. Please try again.");
    } finally {
      setDownloadingPDF(false);
    }
  };

  const handleShare = () => {
    // TODO: Implement share functionality
    console.log("Share student details for:", student?.studentName);
  };

  // Helper functions for analytics
  const getSubjectGrade = (percentage: number): string => {
    if (percentage >= 80) return "A";
    if (percentage >= 70) return "B+";
    if (percentage >= 60) return "B";
    if (percentage >= 50) return "C";
    if (percentage >= 40) return "D";
    return "F";
  };

  const formatSubjectName = (name: string): string => {
    return name
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  const getPerformanceInsights = (subjectBreakdown: SubjectBreakdown[]) => {
    const sortedSubjects = [...subjectBreakdown].sort(
      (a, b) => b.percentage - a.percentage
    );

    return {
      topSubjects: sortedSubjects.slice(0, 2),
      improvementAreas: sortedSubjects.slice(-2),
      averagePerformance:
        sortedSubjects.reduce((sum, subject) => sum + subject.percentage, 0) /
        sortedSubjects.length,
      gradeDistribution: {
        A: sortedSubjects.filter((s) => s.percentage >= 80).length,
        B: sortedSubjects.filter((s) => s.percentage >= 60 && s.percentage < 80)
          .length,
        C: sortedSubjects.filter((s) => s.percentage >= 40 && s.percentage < 60)
          .length,
        F: sortedSubjects.filter((s) => s.percentage < 40).length,
      },
    };
  };

  if (loading || detailsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary mx-auto mb-4"></div>
          <p className="text-brand-accent-text">
            {loading
              ? "Loading student info..."
              : "Loading performance data..."}
          </p>
        </div>
      </div>
    );
  }

  // Show "Student Not Found" only if we don't have student in cache AND no student details from API
  if (!student && !studentDetails?.student) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto">
          <h2 className="text-2xl font-bold text-brand-primary mb-4">
            Student Not Found
          </h2>
          <p className="text-brand-accent-text mb-6">
            The student with ID &quot;{studentId}&quot; could not be found.
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

  // Use detailed data if available, fallback to basic student data
  const displayStudent = studentDetails?.student || student;
  const performanceSummary = studentDetails?.performanceSummary;

  // Helper to get student name
  const getStudentName = () => {
    if (studentDetails?.student) {
      const detailsStudent = displayStudent as StudentDetailsStudent;
      return `${detailsStudent.firstName || ""} ${
        detailsStudent.lastName || ""
      }`.trim();
    }
    return (student as PerformanceStudent)?.studentName || "";
  };

  // Helper to get student ID
  const getStudentId = () => {
    if (studentDetails?.student) {
      const detailsStudent = displayStudent as StudentDetailsStudent;
      return detailsStudent.studentId;
    }
    return (student as PerformanceStudent)?.examNo || studentId;
  };

  // Helper to get class name
  const getClassName = () => {
    if (studentDetails?.student) {
      const detailsStudent = displayStudent as StudentDetailsStudent;
      const classData = detailsStudent.class;
      return typeof classData === "object"
        ? classData?.name || ""
        : classData || "";
    }
    return (student as PerformanceStudent)?.class || "";
  };

  // Helper to get school name
  const getSchoolName = () => {
    if (studentDetails?.student) {
      const detailsStudent = displayStudent as StudentDetailsStudent;
      const schoolData = detailsStudent.school;
      return typeof schoolData === "object"
        ? schoolData?.name || ""
        : schoolData || "";
    }
    return (student as PerformanceStudent)?.school || "";
  };

  // Helper to get section
  const getSection = () => {
    if (studentDetails?.student) {
      const detailsStudent = displayStudent as StudentDetailsStudent;
      const classData = detailsStudent.class;
      return typeof classData === "object"
        ? classData?.section || "N/A"
        : "N/A";
    }
    return "N/A";
  };

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
              className="text-brand-primary-contrast hover:bg-brand-primary-contrast/10 flex items-center gap-2"
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
                  displayStudent?.gender === "MALE"
                    ? "bg-brand-accent text-brand-accent-contrast"
                    : "bg-brand-secondary text-brand-secondary-contrast"
                }`}
              >
                {getStudentName()
                  .split(" ")
                  .map((name: string) => name[0])
                  .join("")
                  .toUpperCase()}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-brand-primary-contrast">
                  {getStudentName()}
                </h1>
                <p className="text-brand-primary-contrast/70 text-lg">
                  {studentDetails?.student
                    ? `Student ID: ${getStudentId()}`
                    : `Exam No: ${getStudentId()}`}
                </p>
                <p className="text-brand-primary-contrast/60">
                  {studentDetails?.student
                    ? (displayStudent as StudentDetailsStudent)?.gender ===
                      "MALE"
                      ? "Male"
                      : "Female"
                    : (student as PerformanceStudent)?.gender === "MALE"
                    ? "Male"
                    : "Female"}{" "}
                  • {formatEducationalText(getClassName())}
                </p>
              </div>
            </div>

            {/* Right Section - Performance Metrics and Actions */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              {/* Performance Metrics */}
              {performanceSummary && (
                <div className="flex items-center space-x-4">
                  <div className="text-center">
                    <div className="px-4 py-2 rounded-lg bg-brand-accent/20 border border-brand-accent/30">
                      <div className="text-xl font-bold text-brand-primary-contrast">
                        {performanceSummary.totalScore}
                      </div>
                      <div className="text-xs text-brand-primary-contrast/70">
                        Total Score
                      </div>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="px-4 py-2 rounded-lg bg-brand-secondary/20 border border-brand-secondary/30">
                      <div className="text-xl font-bold text-brand-primary-contrast">
                        {performanceSummary.averageScore.toFixed(1)}%
                      </div>
                      <div className="text-xs text-brand-primary-contrast/70">
                        Average
                      </div>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="px-4 py-2 rounded-lg bg-yellow-500/20 border border-yellow-500/30">
                      <div className="text-xl font-bold text-yellow-300">
                        {performanceSummary.grade}
                      </div>
                      <div className="text-xs text-brand-primary-contrast/70">
                        Grade
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleDownload}
                  disabled={downloadingPDF}
                  className="text-brand-primary-contrast/70 hover:text-brand-primary-contrast hover:bg-brand-primary-contrast/10 disabled:opacity-50"
                  title={
                    downloadingPDF
                      ? "Downloading..."
                      : "Download student result PDF"
                  }
                >
                  {downloadingPDF ? (
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-brand-primary-contrast border-t-transparent" />
                  ) : (
                    <Download className="h-5 w-5" />
                  )}
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
                  {getStudentName()}
                </span>
              </div>
              <div>
                <span className="text-brand-accent-text/60 block">
                  {studentDetails?.student ? "Student ID" : "Exam Number"}
                </span>
                <span className="text-brand-primary font-mono font-medium">
                  {getStudentId()}
                </span>
              </div>
              <div>
                <span className="text-brand-accent-text/60 block">Gender</span>
                <span
                  className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${
                    displayStudent?.gender === "MALE"
                      ? "bg-brand-accent/20 text-brand-accent"
                      : "bg-brand-secondary/20 text-brand-secondary"
                  }`}
                >
                  {displayStudent?.gender === "MALE" ? "Male" : "Female"}
                </span>
              </div>
              <div>
                <span className="text-brand-accent-text/60 block">Class</span>
                <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-brand-primary/10 text-brand-primary">
                  {formatEducationalText(getClassName())}
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
                  {formatEducationalText(getSchoolName())}
                </span>
              </div>
              <div>
                <span className="text-brand-accent-text/60 block">
                  Class Position
                </span>
                <span
                  className={`inline-flex px-2 py-0.5 rounded text-xs font-semibold ${
                    student
                      ? getPositionBadge(student.position)
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {student ? `#${student.position}` : "N/A"}
                </span>
              </div>
              <div>
                <span className="text-brand-accent-text/60 block">Section</span>
                <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-brand-primary/10 text-brand-primary">
                  {getSection()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Performance Summary */}
        {performanceSummary ? (
          <div className="bg-white rounded-xl p-6 border border-brand-accent/20 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-brand-primary flex items-center">
                <ChartColumn className="w-5 h-5 mr-3" />
                Academic Performance Report
              </h3>
              <div className="text-sm text-brand-accent-text/70">
                {performanceSummary.session} •{" "}
                {performanceSummary.term.replace("_", " ")}
              </div>
            </div>

            {/* Performance Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-gradient-to-br from-brand-accent/10 to-brand-accent/5 rounded-lg p-4 border border-brand-accent/20">
                <div className="text-xs text-brand-accent-text/70 mb-1 font-medium">
                  Total Score
                </div>
                <div className="text-2xl font-bold text-brand-accent">
                  {performanceSummary.totalScore}/
                  {performanceSummary.totalMaxScore}
                </div>
              </div>
              <div className="bg-gradient-to-br from-brand-secondary/10 to-brand-secondary/5 rounded-lg p-4 border border-brand-secondary/20">
                <div className="text-xs text-brand-accent-text/70 mb-1 font-medium">
                  Average
                </div>
                <div className="text-2xl font-bold text-brand-secondary">
                  {performanceSummary.averageScore.toFixed(1)}%
                </div>
              </div>
              <div className="bg-gradient-to-br from-yellow-500/10 to-yellow-500/5 rounded-lg p-4 border border-yellow-500/20">
                <div className="text-xs text-brand-accent-text/70 mb-1 font-medium">
                  Grade
                </div>
                <div className="text-2xl font-bold text-yellow-600">
                  {performanceSummary.grade}
                </div>
              </div>
              <div className="bg-gradient-to-br from-brand-primary/10 to-brand-primary/5 rounded-lg p-4 border border-brand-primary/20">
                <div className="text-xs text-brand-accent-text/70 mb-1 font-medium">
                  Subjects
                </div>
                <div className="text-2xl font-bold text-brand-primary">
                  {performanceSummary.subjectBreakdown.length}
                </div>
              </div>
            </div>

            {/* Subject Performance Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-brand-accent/20">
                    <th className="text-left py-3 px-4 font-semibold text-brand-primary text-sm">
                      Subject
                    </th>
                    <th className="text-center py-3 px-4 font-semibold text-brand-primary text-sm">
                      Score
                    </th>
                    <th className="text-center py-3 px-4 font-semibold text-brand-primary text-sm">
                      Max
                    </th>
                    <th className="text-center py-3 px-4 font-semibold text-brand-primary text-sm">
                      Percentage
                    </th>
                    <th className="text-center py-3 px-4 font-semibold text-brand-primary text-sm">
                      Grade
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {performanceSummary.subjectBreakdown
                    .sort((a, b) => b.percentage - a.percentage)
                    .map((subject, index) => (
                      <tr
                        key={subject.subject.id}
                        className={`border-b border-brand-accent/10 ${
                          index % 2 === 0 ? "bg-brand-accent/5" : ""
                        }`}
                      >
                        <td className="py-3 px-4">
                          <div className="font-medium text-brand-primary">
                            {formatSubjectName(subject.subject.name)}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="font-semibold text-brand-accent-text">
                            {subject.totalScore}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center text-brand-accent-text/70">
                          {subject.totalMaxScore}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span
                            className={`inline-flex px-2 py-1 rounded text-sm font-semibold ${
                              subject.percentage >= 80
                                ? "bg-emerald-100 text-emerald-700"
                                : subject.percentage >= 70
                                ? "bg-blue-100 text-blue-700"
                                : subject.percentage >= 60
                                ? "bg-yellow-100 text-yellow-700"
                                : subject.percentage >= 50
                                ? "bg-orange-100 text-orange-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {subject.percentage.toFixed(1)}%
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span
                            className={`inline-flex px-2 py-1 rounded text-xs font-bold ${
                              subject.percentage >= 80
                                ? "bg-emerald-500 text-white"
                                : subject.percentage >= 70
                                ? "bg-blue-500 text-white"
                                : subject.percentage >= 60
                                ? "bg-yellow-500 text-white"
                                : subject.percentage >= 50
                                ? "bg-orange-500 text-white"
                                : "bg-red-500 text-white"
                            }`}
                          >
                            {getSubjectGrade(subject.percentage)}
                          </span>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

            {/* Performance Insights */}
            {(() => {
              const insights = getPerformanceInsights(
                performanceSummary.subjectBreakdown
              );
              return (
                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
                    <div className="flex items-center mb-2">
                      <TrendingUp className="w-4 h-4 text-emerald-600 mr-2" />
                      <h4 className="font-semibold text-emerald-800">
                        Top Subjects
                      </h4>
                    </div>
                    {insights.topSubjects.map((subject) => (
                      <div
                        key={subject.subject.id}
                        className="text-sm text-emerald-700 mb-1"
                      >
                        • {formatSubjectName(subject.subject.name)} (
                        {subject.percentage.toFixed(1)}%)
                      </div>
                    ))}
                  </div>

                  <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                    <div className="flex items-center mb-2">
                      <TrendingDown className="w-4 h-4 text-orange-600 mr-2" />
                      <h4 className="font-semibold text-orange-800">
                        Needs Improvement
                      </h4>
                    </div>
                    {insights.improvementAreas.map((subject) => (
                      <div
                        key={subject.subject.id}
                        className="text-sm text-orange-700 mb-1"
                      >
                        • {formatSubjectName(subject.subject.name)} (
                        {subject.percentage.toFixed(1)}%)
                      </div>
                    ))}
                  </div>

                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <div className="flex items-center mb-2">
                      <Award className="w-4 h-4 text-blue-600 mr-2" />
                      <h4 className="font-semibold text-blue-800">
                        Grade Distribution
                      </h4>
                    </div>
                    <div className="text-sm text-blue-700 space-y-1">
                      <div>• A Grades: {insights.gradeDistribution.A}</div>
                      <div>• B Grades: {insights.gradeDistribution.B}</div>
                      <div>• C Grades: {insights.gradeDistribution.C}</div>
                      <div>• F Grades: {insights.gradeDistribution.F}</div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        ) : (
          // Fallback Performance Summary if detailed data isn't available
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
                  {student?.total || "N/A"}
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
                  {student?.average || "N/A"}%
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
                  #{student?.position || "N/A"}
                </div>
                <div className="text-xs text-brand-accent-text/60">
                  Ranking in class
                </div>
              </div>
            </div>
          </div>
        )}

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
