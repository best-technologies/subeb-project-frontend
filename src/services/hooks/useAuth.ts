import { useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import {
  register,
  login,
  logout as logoutApi,
  forgotPassword,
  resetPassword,
} from "@/services/api/auth";
import { setTokens, clearTokens, getTokens } from "@/lib/tokens";
import type {
  RegisterRequest,
  LoginRequest,
  AuthResponse,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  GenericAuthResponse,
} from "@/services/types/auth";

/**
 * Hook for user registration
 * Note: Registration does NOT auto-login. User must login after registration.
 */
export function useRegister() {
  return useMutation({
    mutationFn: (data: RegisterRequest) => register(data),

    onSuccess: (response: AuthResponse) => {
      console.log("Registration successful!", response);
      // Registration success - user must now login
    },

    onError: (error: unknown) => {
      console.error("Registration failed:", error);
      // Error is handled in the component
    },
  });
}

/**
 * Hook for user login with role-based redirect
 */
export function useLogin() {
  const { setAuth } = useAuthStore();

  return useMutation({
    mutationFn: (data: LoginRequest) => login(data),

    onSuccess: (response: AuthResponse) => {
      console.log("Login successful!", response);

      if (response.success && response.data) {
        const { access_token, user } = response.data;

        // Transform backend user to frontend User type
        const transformedUser = {
          id: user.id,
          email: user.email,
          role: user.role,
          sub: user.sub,
        };

        // Store tokens
        // Since backend doesn't provide a separate refresh token yet,
        // we'll use the access token for both (with a long expiry)
        // TODO: Update when backend implements proper refresh token flow
        const expiresIn = 7 * 24 * 60 * 60; // 7 days in seconds
        setTokens(access_token, access_token, expiresIn);

        // Update Zustand store and sync to cookies for middleware
        setAuth(transformedUser, access_token, access_token);

        console.log("Tokens stored and synced to cookies");

        // Redirect will be handled in the component based on role
      }
    },

    onError: (error: unknown) => {
      console.error("Login failed:", error);
      // Error is handled in the component
    },
  });
}

/**
 * Hook for user logout
 */
export function useLogout() {
  const router = useRouter();
  const { logout: logoutStore } = useAuthStore();

  return useMutation({
    mutationFn: () => logoutApi(),

    onSuccess: () => {
      console.log("Logout successful!");

      // Clear tokens and auth state
      clearTokens();
      logoutStore();

      // Redirect to login
      router.push("/login");
    },

    onError: (error: unknown) => {
      console.error("Logout failed:", error);

      // Even if API fails, clear local state
      clearTokens();
      logoutStore();

      // Redirect to login
      router.push("/login");
    },
  });
}

/**
 * Hook for requesting password reset recovery code
 */
export function useForgotPassword() {
  return useMutation({
    mutationFn: (data: ForgotPasswordRequest) => forgotPassword(data),
    onSuccess: (response: GenericAuthResponse) => {
      console.log("Forgot password OTP dispatched:", response);
    },
    onError: (error: unknown) => {
      console.error("Forgot password request failed:", error);
    },
  });
}

/**
 * Hook for resetting password using verification OTP
 */
export function useResetPassword() {
  return useMutation({
    mutationFn: (data: ResetPasswordRequest) => resetPassword(data),
    onSuccess: (response: GenericAuthResponse) => {
      console.log("Password reset successful:", response);
    },
    onError: (error: unknown) => {
      console.error("Password reset failed:", error);
    },
  });
}

/**
 * Get redirect path based on user role with access validation
 */
export function getRoleBasedRedirect(
  role: string,
  intendedPath?: string
): string {
  const normalizedRole = role.toLowerCase();

  // Define role-based access
  const roleAccess = {
    super_admin: [
      "/dashboard",
      "/profile",
      "/schools",
      "/classes",
      "/students",
      "/enrol-student",
      "/enrol-officer",
      "/academic-settings",
      "/audit-logs",
    ],
    subeb_officer: [
      "/officer/dashboard",
      "/officer/results",
      "/officer/school-it",
      "/officer/profile",
      "/officer/audit-logs",
    ],
    school_it: [
      "/school-it/dashboard",
      "/school-it/students",
      "/school-it/results",
      "/school-it/audit-logs",
    ],
  };

  // If there's an intended path, validate user has access to it
  if (
    intendedPath &&
    intendedPath !== "/login" &&
    intendedPath !== "/register" &&
    intendedPath !== "/"
  ) {
    // Check if user has access to the intended path
    if (normalizedRole === "super_admin") {
      // Prevent access to officer and school-it routes
      if (
        intendedPath.startsWith("/officer") ||
        intendedPath.startsWith("/school-it")
      ) {
        return "/dashboard";
      }
      // SUPER_ADMIN has access to dashboard routes
      const hasAccess = roleAccess.super_admin.some((route) =>
        intendedPath.startsWith(route)
      );
      if (hasAccess) {
        return intendedPath;
      }
    } else if (normalizedRole === "subeb_officer") {
      if (
        intendedPath.startsWith("/dashboard") ||
        intendedPath.startsWith("/school-it")
      ) {
        return "/officer/dashboard";
      }
      // Check if SUBEB_OFFICER has access
      const hasAccess = roleAccess.subeb_officer.some((route) =>
        intendedPath.startsWith(route)
      );
      if (hasAccess) {
        return intendedPath;
      }
    } else if (normalizedRole === "school_it") {
      if (
        intendedPath.startsWith("/dashboard") ||
        intendedPath.startsWith("/officer")
      ) {
        return "/school-it/dashboard";
      }
      const hasAccess = roleAccess.school_it.some((route) =>
        intendedPath.startsWith(route)
      );
      if (hasAccess) {
        return intendedPath;
      }
    }
    // If no access to intended path, fall through to default
  }

  // Role-based default redirects
  if (normalizedRole === "subeb_officer") {
    return "/officer/dashboard";
  }
  if (normalizedRole === "school_it") {
    return "/school-it/dashboard";
  }

  // SUPER_ADMIN or default fallback
  return "/dashboard";
}

/**
 * Extract error message from auth response and return user-friendly message
 */
export function getAuthErrorMessage(error: unknown): string {
  if (!error) return "Something went wrong. Please try again.";

  if (typeof error === "string") return error;

  // Type guard for error objects
  if (typeof error === "object" && error !== null) {
    const errorObj = error as Record<string, unknown>;

    // Log the technical error for debugging
    console.error("Auth error details:", errorObj);

    // 1. Direct message property
    if ("message" in errorObj && errorObj.message) {
      if (Array.isArray(errorObj.message)) {
        return errorObj.message.join(", ");
      }
      if (typeof errorObj.message === "string") {
        return errorObj.message;
      }
    }

    // 2. Nested response.data.message (Axios error structure)
    const respData = (errorObj as any)?.response?.data;
    if (respData) {
      if (Array.isArray(respData.message)) {
        return respData.message.join(", ");
      }
      if (typeof respData.message === "string") {
        return respData.message;
      }
      if (typeof respData.error === "string") {
        return respData.error;
      }
    }

    // 3. Direct data.message
    const data = (errorObj as any)?.data;
    if (data) {
      if (Array.isArray(data.message)) {
        return data.message.join(", ");
      }
      if (typeof data.message === "string") {
        return data.message;
      }
    }

    // Handle network errors
    if ("error" in errorObj && typeof errorObj.error === "string") {
      return errorObj.error;
    }
  }

  return "Something went wrong. Please try again.";
}

/**
 * Hook to silently guard client-side routes by role without blocking initial render.
 * Server-side middleware (middleware.ts) already handles initial edge validation and redirects.
 * This hook acts as a client-side safeguard for client transitions.
 */
export function useRoleGuard(allowedRoles: string[], fallbackRoute: string): void {
  const router = useRouter();
  const { user } = useAuthStore();

  const isRolePermitted = (role?: string | null) => {
    if (!role) return false;
    return allowedRoles.map((r) => r.toLowerCase()).includes(role.toLowerCase());
  };

  useEffect(() => {
    const currentRole = user?.role;
    if (currentRole) {
      if (!isRolePermitted(currentRole)) {
        router.replace(fallbackRoute);
        return;
      }
    } else {
      // If store has no user, verify if any token exists
      const tokens = getTokens();
      if (!tokens) {
        router.replace("/login");
        return;
      }
    }
  }, [user, allowedRoles, fallbackRoute, router]);
}
