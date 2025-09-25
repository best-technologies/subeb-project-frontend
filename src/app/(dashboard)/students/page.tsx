"use client";
import React, { useEffect } from "react";
import { useData } from "@/context/DataContext";
import StudentsTab from "@/components/students/StudentsTab";
import StudentsPageSkeleton from "@/components/students/StudentsPageSkeleton";

export default function StudentsPage() {
  const {
    state: { adminDashboard },
    fetchAdminDashboard,
    isAdminDashboardCached,
    getStudentsDataFromAdmin,
    hasAdminDataForStudents,
  } = useData();

  // Always try to get students data
  const studentsData = getStudentsDataFromAdmin();

  // Add debugging
  console.log("🔍 Students Page Debug:", {
    hasAdminDataForStudents: hasAdminDataForStudents(),
    studentsData,
    adminDashboard: adminDashboard.data,
    adminDashboardKeys: adminDashboard.data
      ? Object.keys(adminDashboard.data)
      : [],
    loading: adminDashboard.loading,
    error: adminDashboard.error,
    timestamp: adminDashboard.timestamp,
    isCached: isAdminDashboardCached(),
  });

  // Determine loading state - if no data and still loading admin
  const loading = !studentsData && adminDashboard.loading;

  // Determine error state
  const error = !studentsData ? adminDashboard.error : null;

  useEffect(() => {
    // Fetch admin dashboard if not cached
    if (!isAdminDashboardCached()) {
      console.log("🚀 Fetching admin dashboard data for students page");
      fetchAdminDashboard();
    }
  }, [isAdminDashboardCached, fetchAdminDashboard]);

  // Show skeleton while loading or when no data is available yet
  if (loading || (!studentsData && !error)) {
    return <StudentsPageSkeleton />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-brand-accent-background flex items-center justify-center">
        <div className="text-center max-w-md mx-auto">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-brand-heading mb-4">
            Error Loading Data
          </h2>
          <p className="text-brand-light-accent-1 mb-6">{error}</p>
          <button
            onClick={() => fetchAdminDashboard({}, true)}
            className="px-6 py-3 bg-brand-primary hover:bg-brand-primary-2 text-brand-primary-contrast rounded-lg transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Guard clause - ensure studentsData exists before rendering
  if (!studentsData) {
    return <StudentsPageSkeleton />;
  }

  return (
    <StudentsTab
      performanceTable={studentsData.performanceTable}
      lgas={studentsData.lgas}
      subjects={studentsData.subjects.map(
        (subject: { name: string }) => subject.name
      )}
    />
  );
}
