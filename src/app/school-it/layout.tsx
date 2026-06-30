"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/shared/Sidebar";
import { useAuthStore } from "@/store/authStore";

export default function SchoolItLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isValidating, setIsValidating] = useState(true);
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();

  // Validate role on mount
  useEffect(() => {
    if (isAuthenticated && user) {
      const normalizedRole = user.role.toLowerCase();

      // Only SCHOOL_IT can access school-it routes
      if (normalizedRole !== "school_it") {
        if (normalizedRole === "super_admin") router.replace("/dashboard");
        else if (normalizedRole === "subeb_officer") router.replace("/officer/dashboard");
        else router.replace("/login");
        return;
      }
    }

    setIsValidating(false);
  }, [isAuthenticated, user, router]);

  // Refresh function to be passed to sidebar
  const handleRefresh = () => {
    window.location.reload();
  };

  // Function to close the mobile sidebar when navigation occurs
  const handleMobileNavigation = () => {
    setSidebarOpen(false);
  };

  // Show loading state while validating role
  if (isValidating) {
    return (
      <div className="min-h-screen bg-brand-accent-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-brand-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying access...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-accent-background">
      {/* Fixed Sidebar */}
      <div className="hidden lg:block lg:fixed lg:inset-y-0 lg:left-0 lg:z-50 lg:w-64">
        <Sidebar
          variant="school-it"
          isOpen={true}
          onToggle={() => {}}
          onRefresh={handleRefresh}
        />
      </div>

      {/* Mobile Sidebar */}
      <div className="lg:hidden">
        <Sidebar
          variant="school-it"
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
          onRefresh={handleRefresh}
          onNavigate={handleMobileNavigation}
        />
      </div>

      {/* Main Content */}
      <div className="lg:ml-64 flex flex-col min-h-screen">
        {/* Mobile Menu Button */}
        <div className="lg:hidden p-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-gray-800 hover:text-gray-600 p-2 rounded-lg"
          >
            ☰
          </button>
        </div>

        {/* Scrollable Page Content */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8 overflow-y-auto">
          {children}
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-gray-200 flex-shrink-0">
          <div className="px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="flex items-center space-x-4 mb-4 md:mb-0">
                <div className="w-8 h-8 bg-brand-primary rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">A</span>
                </div>
                <div>
                  <h3 className="text-gray-800 font-semibold">ASUBEB</h3>
                  <p className="text-gray-600 text-sm">
                    Student Management System
                  </p>
                </div>
              </div>

              <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6 text-sm">
                <div className="text-gray-600">
                  © {new Date().getFullYear()} ASUBEB. All rights reserved.
                </div>
                <div className="flex items-center space-x-1 text-gray-600">
                  <span>Powered by</span>
                  <Link
                    href="https://www.besttechnologiesltd.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brand-primary hover:text-brand-accent transition-colors duration-200"
                  >
                    Best Technologies Ltd.
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
