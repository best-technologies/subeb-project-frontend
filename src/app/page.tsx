"use client"

import MainLayout from "@/components/dashboard/MainLayout";
import React, { useState, useEffect } from "react";

const ACCESS_PIN = "2024ASUBEB"; // Change this to your desired pin
const PIN_STORAGE_KEY = "asubeb_auth_pin";
const PIN_EXPIRY_KEY = "asubeb_auth_expiry";
const PIN_VALIDITY_HOURS = 6;

export default function Home() {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);

  // Check for existing valid PIN on component mount
  useEffect(() => {
    const storedPin = localStorage.getItem(PIN_STORAGE_KEY);
    const expiryTime = localStorage.getItem(PIN_EXPIRY_KEY);
    
    if (storedPin && expiryTime) {
      const expiryDate = new Date(parseInt(expiryTime));
      const now = new Date();
      
      if (now < expiryDate && storedPin === ACCESS_PIN) {
        setAuthenticated(true);
      } else {
        // Clear expired or invalid PIN
        localStorage.removeItem(PIN_STORAGE_KEY);
        localStorage.removeItem(PIN_EXPIRY_KEY);
      }
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      if (pin === ACCESS_PIN) {
        // Store PIN and expiry time in localStorage
        localStorage.setItem(PIN_STORAGE_KEY, pin);
        const expiryTime = new Date().getTime() + (PIN_VALIDITY_HOURS * 60 * 60 * 1000);
        localStorage.setItem(PIN_EXPIRY_KEY, expiryTime.toString());
        
        setAuthenticated(true);
        setError("");
      } else {
        setError("Invalid access pin. Please try again.");
      }
      setLoading(false);
    }, 600);
  };

  return (
    <>
      {!authenticated && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-sm flex flex-col gap-6 border border-gray-200 relative animate-fade-in"
          >
            <h2 className="text-2xl font-bold text-center text-blue-700">Enter Access Pin</h2>
            <input
              type="password"
              value={pin}
              onChange={e => setPin(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg text-center tracking-widest"
              placeholder="Access Pin"
              autoFocus
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !pin}
              className={`w-full py-3 rounded-lg font-semibold text-white transition-colors text-lg ${loading || !pin ? "bg-blue-300 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}`}
            >
              {loading ? "Verifying..." : "Unlock Dashboard"}
            </button>
            {error && (
              <div className="absolute left-0 right-0 -bottom-14 flex justify-center">
                <div className="bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg animate-shake text-center font-medium">
                  {error}
                </div>
              </div>
            )}
          </form>
        </div>
      )}
      {authenticated && <MainLayout />}
    </>
  );
}
