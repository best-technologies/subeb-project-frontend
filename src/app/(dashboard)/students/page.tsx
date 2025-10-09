"use client";
import React, { useEffect } from "react";
import { TriangleAlert } from "lucide-react";
import { useData } from "@/context/DataContext";
import StudentsTab from "@/components/students/StudentsTab";
import StudentsPageSkeleton from "@/components/students/StudentsPageSkeleton";
import { Button } from "@/components/ui/Button";

export default function StudentsPage() {
  const {
    state: { adminDashboard },
    fetchAdminDashboard,
    shouldFetchAdminDashboard,
    getStudentsDataFromAdmin,
    hasAdminDataForStudents,
  } = useData();

  // Always try to get students data
  const studentsData = getStudentsDataFromAdmin();

  // Add debugging
  // console.log("Students Page Debug:", {
  //   hasAdminDataForStudents: hasAdminDataForStudents(),
  //   studentsData,
  //   adminDashboard: adminDashboard.data,
  //   adminDashboardKeys: adminDashboard.data
  //     ? Object.keys(adminDashboard.data)
  //     : [],
  //   loading: adminDashboard.loading,
  //   error: adminDashboard.error,
  //   timestamp: adminDashboard.timestamp,
  //   hasAttempted: adminDashboard.hasAttempted,
  // });

  // Determine loading state - if no data and still loading admin
  const loading = !studentsData && adminDashboard.loading;

  // Determine error state
  const error = !studentsData ? adminDashboard.error : null;

  useEffect(() => {
    // Only fetch if we should (prevents infinite loops after errors)
    if (shouldFetchAdminDashboard()) {
      // console.log("Fetching admin dashboard data for students page");
      fetchAdminDashboard();
    }
  }, [shouldFetchAdminDashboard, fetchAdminDashboard]);

  // Show skeleton while loading or when no data is available yet
  if (loading || (!studentsData && !error)) {
    return <StudentsPageSkeleton />;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto">
          <div className="flex justify-center mb-4">
            <TriangleAlert className="w-16 h-16 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-brand-primary mb-4">
            Error Loading Data
          </h2>
          <p className="text-brand-accent-text mb-6">{error}</p>
          <Button
            onClick={() => fetchAdminDashboard({}, true)}
            className="bg-brand-primary hover:bg-brand-primary-2 text-brand-primary-contrast"
            size="lg"
          >
            Try Again
          </Button>
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
    />
  );
}
