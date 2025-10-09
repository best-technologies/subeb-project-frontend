"use client";
import React, { useState } from "react";
import Link from "next/link";
import Sidebar from "@/components/shared/Sidebar";
// import { Button } from "@/components/ui/Button";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Refresh function to be passed to sidebar
  const handleRefresh = () => {
    // Trigger a page refresh or emit a custom event
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-brand-accent-background">
      {/* Fixed Sidebar */}
      <div className="hidden lg:block lg:fixed lg:inset-y-0 lg:left-0 lg:z-50 lg:w-64">
        <Sidebar
          isOpen={true}
          onToggle={() => {}} // No toggle needed for desktop
          onRefresh={handleRefresh}
        />
      </div>

      {/* Mobile Sidebar */}
      <div className="lg:hidden">
        <Sidebar
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
          onRefresh={handleRefresh}
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
