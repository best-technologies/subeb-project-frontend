"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createSession, isSessionValid, clearSession } from "@/lib/auth";

export default function Home() {
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  // Check if user already has a valid session
  useEffect(() => {
    if (isSessionValid()) {
      // User already authenticated, redirect to dashboard
      router.push("/dashboard");
    } else {
      // Clear any expired sessions
      clearSession();
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Simulate API call
    setTimeout(() => {
      if (pin === "6234") {
        // Create session on successful PIN validation
        createSession();
        router.push("/dashboard");
      } else {
        setError("Invalid PIN. Please try again.");
      }
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="w-24 h-24 bg-gradient-to-br from-brand-primary to-brand-primary-2 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl border-4 border-white">
            <span className="text-white font-bold text-3xl">A</span>
          </div>
          <h1 className="text-4xl font-bold text-brand-primary mb-3">ASUBEB</h1>
          <p className="text-brand-light-accent-1 text-lg font-medium">
            School Management System
          </p>
          <div className="mt-4 h-1 w-20 bg-gradient-to-r from-brand-secondary to-brand-accent mx-auto rounded-full"></div>
        </div>

        {/* Welcome Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-brand-primary to-brand-primary-2 px-8 py-6">
            <h2 className="text-white text-xl font-semibold text-center">
              Welcome Back
            </h2>
            <p className="text-brand-primary-contrast/80 text-center mt-1">
              Please enter your access PIN to continue
            </p>
          </div>

          {/* PIN Form */}
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            <div>
              <label
                htmlFor="pin"
                className="block text-sm font-semibold text-brand-primary mb-3"
              >
                Access PIN
              </label>
              <input
                type="password"
                id="pin"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="••••"
                className="w-full px-6 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent text-xl text-center tracking-[0.5em] font-bold text-brand-primary transition-all duration-200 bg-gray-50 hover:bg-white"
                maxLength={4}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading || !pin}
              className={`w-full py-4 rounded-xl font-semibold text-white transition-all duration-200 text-lg shadow-lg ${
                loading || !pin
                  ? "bg-gray-300 cursor-not-allowed text-gray-500"
                  : "bg-gradient-to-r from-brand-primary to-brand-primary-2 hover:from-brand-primary-2 hover:to-brand-primary transform hover:scale-[1.02] hover:shadow-xl"
              }`}
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-3">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Verifying...</span>
                </div>
              ) : (
                "Access Dashboard"
              )}
            </button>
          </form>
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

        {/* Error Message */}
        {error && (
          <div className="fixed inset-0 flex items-end justify-center p-4 pointer-events-none z-50">
            <div className="bg-red-500 text-white px-6 py-4 rounded-xl shadow-2xl animate-bounce border-l-4 border-red-600 pointer-events-auto">
              <div className="flex items-center space-x-3">
                <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                  <span className="text-xs font-bold">!</span>
                </div>
                <span className="font-medium">{error}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
