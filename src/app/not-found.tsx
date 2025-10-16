"use client";
import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  const router = useRouter();

  const handleGoBack = () => {
    router.back();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl text-center">
        {/* Logo and Branding */}
        <div className="mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-brand-primary to-brand-primary-2 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl border-4 border-white">
            <span className="text-white font-bold text-2xl">A</span>
          </div>
          <h1 className="text-3xl font-bold text-brand-primary mb-2">ASUBEB</h1>
          <p className="text-brand-light-accent-1 text-lg font-medium">
            School Management System
          </p>
          <div className="mt-4 h-1 w-20 bg-gradient-to-r from-brand-secondary to-brand-accent mx-auto rounded-full"></div>
        </div>

        {/* 404 Error Content */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden mb-8">
          <div className="p-12">
            {/* Large 404 Number */}
            <div className="mb-8">
              <span className="text-8xl font-bold bg-gradient-to-r from-brand-primary to-brand-primary-2 bg-clip-text text-transparent">
                404
              </span>
            </div>

            {/* Error Message */}
            <div className="mb-8 space-y-3">
              <h3 className="text-2xl font-semibold text-brand-primary">
                Oops! Page Not Found
              </h3>
              <p className="text-brand-light-accent-1 text-lg leading-relaxed">
                The page you are looking for might have been removed, had its
                name changed, or is temporarily unavailable.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                onClick={handleGoBack}
                size="lg"
                className="w-full sm:w-auto bg-gradient-to-r from-brand-primary to-brand-primary-2 hover:from-brand-primary-2 hover:to-brand-primary"
              >
                Go Back
              </Button>
              <Button
                variant="outline"
                size="lg"
                asChild
                className="w-full sm:w-auto"
              >
                <Link href="/">Go to Home</Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Additional Help Section */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 mb-6">
          <h4 className="text-xl font-semibold text-brand-primary mb-4">
            What can you do?
          </h4>
          <div className="grid sm:grid-cols-2 gap-6 text-left">
            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-brand-secondary to-brand-accent rounded-full flex items-center justify-center">
                  <span className="text-brand-secondary-contrast font-bold text-sm">
                    1
                  </span>
                </div>
                <span className="text-brand-light-accent-1">
                  Check the URL spelling
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-brand-secondary to-brand-accent rounded-full flex items-center justify-center">
                  <span className="text-brand-secondary-contrast font-bold text-sm">
                    2
                  </span>
                </div>
                <span className="text-brand-light-accent-1">
                  Return to the homepage
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-brand-secondary to-brand-accent rounded-full flex items-center justify-center">
                  <span className="text-brand-secondary-contrast font-bold text-sm">
                    3
                  </span>
                </div>
                <span className="text-brand-light-accent-1">
                  Use the navigation menu
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-brand-secondary to-brand-accent rounded-full flex items-center justify-center">
                  <span className="text-brand-secondary-contrast font-bold text-sm">
                    4
                  </span>
                </div>
                <span className="text-brand-light-accent-1">
                  Contact system administrator
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="text-center text-brand-light-accent-1 text-sm">
          <p className="mb-2">Abia State Universal Basic Education Board</p>
          <div className="flex items-center justify-center space-x-2 text-xs">
            <span>Powered by</span>
            <span className="font-semibold text-brand-primary">
              Best Technologies Ltd.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
