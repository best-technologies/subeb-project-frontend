"use client";
import React, { useEffect } from "react";
import { TriangleAlert } from "lucide-react";
import { useData } from "@/context/DataContext";
import { useAccessStore } from "@/store/accessStore";
import StudentsTab from "@/components/students/StudentsTab";
import StudentsPageSkeleton from "@/components/students/StudentsPageSkeleton";
import { Button } from "@/components/ui/Button";

export default function StudentsPage() {
  const { isAccessReady } = useAccessStore();
  const {
    state: { adminDashboard },
    fetchAdminDashboard,
    shouldFetchAdminDashboard,
    getStudentsDataFromAdmin,
  } = useData();

  // Always try to get students data
  const studentsData = getStudentsDataFromAdmin();

  useEffect(() => {
    if (shouldFetchAdminDashboard()) {
      fetchAdminDashboard();
    }
  }, [shouldFetchAdminDashboard, fetchAdminDashboard]);

  // 1. While access verification overlay is active, keep page clear so no skeleton flashes before access dialog
  if (!isAccessReady) {
    return null;
  }

  // 2. If data arrived fast during verification (e.g. backend cache hit), go straight to displaying data!
  if (studentsData) {
    return (
      <StudentsTab
        performanceTable={studentsData.performanceTable}
        lgas={studentsData.lgas}
      />
    );
  }

  const error = !studentsData ? adminDashboard.error : null;
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

  // 3. Only if access is ready but data hasn't arrived yet, show skeleton
  return <StudentsPageSkeleton />;
}
