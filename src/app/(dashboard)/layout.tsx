"use client";
import React, { useState } from "react";
import Sidebar from "@/components/shared/Sidebar";
import { Button } from "@/components/ui/Button";
import { CacheStatus } from "@/components/shared/CacheStatus";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Fixed Sidebar */}
      <div className="hidden lg:block lg:fixed lg:inset-y-0 lg:left-0 lg:z-50 lg:w-64">
        <Sidebar
          isOpen={true}
          onToggle={() => {}} // No toggle needed for desktop
        />
      </div>

      {/* Mobile Sidebar */}
      <div className="lg:hidden">
        <Sidebar
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
        />
      </div>

      {/* Main Content */}
      <div className="lg:ml-64 flex flex-col min-h-screen">
        {/* Fixed Header */}
        <header className="bg-black/20 backdrop-blur-lg border-b border-white/10 flex-shrink-0">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden text-white hover:text-gray-300 p-2"
                >
                  ☰
                </button>
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-lg">A</span>
                  </div>
                  <div>
                    <h1 className="text-white text-xl font-bold">ASUBEB</h1>
                    <p className="text-gray-300 text-sm">
                      School Management System
                    </p>
                  </div>
                  <div>
                    {/* Reusable Button component with variant, size, and icon support */}
                    <Button variant="default" size="lg">
                      Enroll Officer
                    </Button>
                  </div>
                </div>
              </div>

              {/* Cache Status */}
              <div className="hidden md:block">
                <CacheStatus />
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Page Content */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8 overflow-y-auto">
          {children}
        </main>

        {/* Footer */}
        <footer className="bg-black/20 backdrop-blur-lg border-t border-white/10 flex-shrink-0">
          <div className="px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="flex items-center space-x-4 mb-4 md:mb-0">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">A</span>
                </div>
                <div>
                  <h3 className="text-white font-semibold">ASUBEB</h3>
                  <p className="text-gray-400 text-sm">
                    School Management System
                  </p>
                </div>
              </div>

              <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6 text-sm">
                <div className="text-gray-400">
                  © 2024 ASUBEB. All rights reserved.
                </div>
                <div className="flex items-center space-x-4 text-gray-400">
                  <span>Version 1.0.0</span>
                  <span>•</span>
                  <span>Powered by Next.js</span>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
