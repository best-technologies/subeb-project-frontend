"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { useAccessStore } from "@/store/accessStore";
import { getTokens } from "@/lib/tokens";
import {
  isAccessCacheValid,
  saveAccessCache,
  setupHardRefreshDetector,
} from "@/lib/accessCache";

interface AccessVerificationOverlayProps {
  allowedRoles: string[];
  fallbackRoute: string;
}

export default function AccessVerificationOverlay({
  allowedRoles,
  fallbackRoute,
}: AccessVerificationOverlayProps) {
  const router = useRouter();
  const { user } = useAuthStore();
  const { isAccessReady, setIsAccessReady } = useAccessStore();

  // Avoid hydration mismatch by waiting for client mount
  const [mounted, setMounted] = useState(false);
  const [isDismissed, setIsDismissed] = useState(true);

  // Verification stage: "verifying" -> "confirmed"
  const [stage, setStage] = useState<"verifying" | "confirmed">("verifying");
  const [isFadingOut, setIsFadingOut] = useState(false);

  // Stable string key of roles to avoid effect re-runs when parent passes array literals
  const rolesKey = allowedRoles
    .map((r) => r.toLowerCase())
    .sort()
    .join(",");

  const isRolePermitted = (role?: string | null) => {
    if (!role) return false;
    return allowedRoles.map((r) => r.toLowerCase()).includes(role.toLowerCase());
  };

  useEffect(() => {
    setMounted(true);

    // Setup hard refresh keystroke listener (Ctrl+F5, Ctrl+Shift+R)
    const cleanup = setupHardRefreshDetector(() => {
      setIsAccessReady(false);
      setIsDismissed(false);
    });

    // If access was already verified in the current session or is valid in cache,
    // remain completely dismissed and never interrupt client-side navigation.
    if (isAccessReady || isAccessCacheValid(allowedRoles)) {
      setIsAccessReady(true);
      setIsDismissed(true);
    } else {
      setIsAccessReady(false);
      setIsDismissed(false);
    }

    return cleanup;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rolesKey, setIsAccessReady]);

  useEffect(() => {
    if (!mounted || isDismissed) return;

    // Check if cached access exists
    if (isAccessCacheValid(allowedRoles)) {
      setIsAccessReady(true);
      setIsDismissed(true);
      return;
    }

    // Role check logic
    const currentRole = user?.role;

    if (currentRole) {
      if (!isRolePermitted(currentRole)) {
        router.replace(fallbackRoute);
        return;
      }

      // Valid role: Transition stage
      saveAccessCache(currentRole);
      setStage("confirmed");

      // Brief transition so user sees "Access confirmed. Crunching data..." before fade-out
      const timer = setTimeout(() => {
        setIsAccessReady(true);
        setIsFadingOut(true);
        setTimeout(() => {
          setIsDismissed(true);
        }, 300); // Matches fade-out transition
      }, 500);

      return () => clearTimeout(timer);
    } else {
      // If store hasn't loaded user yet, check cookie role or tokens
      const match = document.cookie.match(/(?:^|;\s*)asubeb_user_role=([^;]+)/);
      if (match) {
        const cookieRole = decodeURIComponent(match[1]);
        if (isRolePermitted(cookieRole)) {
          saveAccessCache(cookieRole);
          setStage("confirmed");
          const timer = setTimeout(() => {
            setIsAccessReady(true);
            setIsFadingOut(true);
            setTimeout(() => setIsDismissed(true), 300);
          }, 500);
          return () => clearTimeout(timer);
        } else {
          router.replace(fallbackRoute);
          return;
        }
      }

      // Check tokens
      const tokens = getTokens();
      if (!tokens) {
        router.replace("/login");
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, user, rolesKey, fallbackRoute, router, isDismissed, setIsAccessReady]);

  // Never render during SSR or before client mount to prevent hydration mismatch
  if (!mounted || isDismissed) {
    return null;
  }

  const overlayContent = (
    <div
      className={`fixed inset-0 z-[9999] bg-[#f8fafc] dark:bg-gray-950 flex items-center justify-center transition-opacity duration-300 ${
        isFadingOut ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      <div className="bg-white dark:bg-gray-900 shadow-2xl border border-gray-200/90 dark:border-gray-800 rounded-3xl p-8 max-w-sm w-full mx-4 flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-200">
        {stage === "verifying" ? (
          <>
            <div className="relative mb-5 flex items-center justify-center">
              <div className="w-12 h-12 border-4 border-emerald-200 dark:border-emerald-950 border-t-emerald-600 rounded-full animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-ping" />
              </div>
            </div>
            <h3 className="text-gray-900 dark:text-gray-100 font-bold text-lg mb-1">
              Verifying access...
            </h3>
            <p className="text-gray-500 dark:text-gray-400 text-xs">
              Confirming your security role and permissions
            </p>
          </>
        ) : (
          <>
            <div className="relative mb-5 flex items-center justify-center">
              <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-950/60 rounded-full flex items-center justify-center text-emerald-600 dark:text-emerald-400 animate-in zoom-in-75 duration-200">
                <svg
                  className="w-6 h-6 stroke-current"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="2.5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4.5 12.75l6 6 9-13.5"
                  />
                </svg>
              </div>
            </div>
            <h3 className="text-gray-900 dark:text-gray-100 font-bold text-lg mb-1">
              Access confirmed
            </h3>
            <p className="text-emerald-700 dark:text-emerald-400 font-medium text-xs flex items-center justify-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
              Crunching data...
            </p>
          </>
        )}
      </div>
    </div>
  );

  return createPortal(overlayContent, document.body);
}
