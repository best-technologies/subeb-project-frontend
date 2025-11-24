"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { shouldRefreshToken, getTokens } from "@/lib/tokens";
import { refreshToken } from "@/services/api/auth";
import { setTokens } from "@/lib/tokens";

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * ProtectedRoute component that checks for valid JWT authentication
 * Attempts token refresh if expired, redirects to login with return URL if unauthenticated
 */
export default function ProtectedRoute({
  children,
  fallback,
}: ProtectedRouteProps) {
  const [isLoading, setIsLoading] = useState(true);
  const { isAuthenticated, updateTokens, logout } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // First check: Is user authenticated in Zustand store?
        if (!isAuthenticated) {
          // Not authenticated, redirect to login with return URL
          const returnUrl = encodeURIComponent(pathname);
          router.push(`/login?redirect=${returnUrl}`);
          setIsLoading(false);
          return;
        }

        // Second check: Do we have valid tokens?
        const tokens = getTokens();
        if (!tokens) {
          // No tokens found, logout and redirect
          logout();
          const returnUrl = encodeURIComponent(pathname);
          router.push(`/login?redirect=${returnUrl}`);
          setIsLoading(false);
          return;
        }

        // Third check: Is token expired and should we refresh?
        if (shouldRefreshToken()) {
          console.log("Token expired, attempting refresh...");

          try {
            const response = await refreshToken();

            if (response.success && response.data) {
              const {
                accessToken,
                refreshToken: newRefreshToken,
                expiresIn,
              } = response.data;

              // Update tokens in both storage and Zustand
              setTokens(accessToken, newRefreshToken, expiresIn);
              updateTokens(accessToken, newRefreshToken);

              console.log("Token refresh successful");
              setIsLoading(false);
              return;
            } else {
              throw new Error("Token refresh failed");
            }
          } catch (refreshError) {
            console.error("Token refresh failed:", refreshError);

            // Refresh failed, logout and redirect
            logout();
            const returnUrl = encodeURIComponent(pathname);
            router.push(`/login?redirect=${returnUrl}`);
            setIsLoading(false);
            return;
          }
        }

        // All checks passed, user is authenticated
        setIsLoading(false);
      } catch (error) {
        console.error("Auth check error:", error);

        // On error, logout and redirect
        logout();
        const returnUrl = encodeURIComponent(pathname);
        router.push(`/login?redirect=${returnUrl}`);
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [isAuthenticated, router, pathname, logout, updateTokens]);

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
