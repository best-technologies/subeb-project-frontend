"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isSessionValid, initializeSessionManagement } from "@/lib/auth";

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * ProtectedRoute component that checks for valid session before rendering children
 * Redirects to home page if no valid session is found
 */
export default function ProtectedRoute({
  children,
  fallback,
}: ProtectedRouteProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Initialize session management
    const cleanup = initializeSessionManagement();

    // Check if user has valid session
    const checkAuth = () => {
      const hasValidSession = isSessionValid();
      setIsAuthenticated(hasValidSession);
      setIsLoading(false);

      if (!hasValidSession) {
        // No valid session, redirect to home
        router.push("/");
      }
    };

    // Small delay to prevent flash of loading state
    const timer = setTimeout(checkAuth, 100);

    return () => {
      clearTimeout(timer);
      if (cleanup && typeof cleanup === "function") {
        cleanup();
      }
    };
  }, [router]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      fallback || (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Checking access...</p>
          </div>
        </div>
      )
    );
  }

  // Don't render children if not authenticated (redirect is in progress)
  if (!isAuthenticated) {
    return null;
  }

  // Render protected content
  return <>{children}</>;
}
