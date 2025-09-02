"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Simulate API call
    setTimeout(() => {
      if (pin === "6234") {
        router.push("/dashboard");
      } else {
        setError("Invalid PIN. Please try again.");
      }
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-2xl">A</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">ASUBEB</h1>
          <p className="text-gray-300">School Management System</p>
        </div>
        {/* <div>
          <button className="w-full py-3 rounded-lg font-semibold text-white transition-colors text-lg bg-blue-600 hover:bg-blue-700">
            Enrol Officer
          </button>
        </div> */}

        {/* PIN Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="pin"
              className="block text-sm font-medium text-gray-300 mb-2"
            >
              Enter Access PIN
            </label>
            <input
              type="password"
              id="pin"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="Enter your PIN"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg text-center tracking-widest"
              maxLength={4}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading || !pin}
            className={`w-full py-3 rounded-lg font-semibold text-white transition-colors text-lg ${
              loading || !pin
                ? "bg-blue-300 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading ? "Verifying..." : "Access Dashboard"}
          </button>
        </form>

        {/* Error Message */}
        {error && (
          <div className="absolute left-0 right-0 -bottom-14 flex justify-center">
            <div className="bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg animate-shake text-center font-medium">
              {error}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
