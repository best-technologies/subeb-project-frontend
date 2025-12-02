import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { register, login, logout as logoutApi } from "@/services/api/auth";
import { setTokens, clearTokens } from "@/lib/tokens";
import type {
  RegisterRequest,
  LoginRequest,
  AuthResponse,
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
      "/students",
      "/enrol-officer",
    ],
    subeb_officer: ["/enter-grades"],
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
      // Check if trying to access officer dynamic routes
      const dynamicRoutePattern = /^\/[^/]+\/(profile|grade-record)$/;
      if (dynamicRoutePattern.test(intendedPath)) {
        return "/dashboard"; // Redirect to dashboard instead
      }
      // Check if trying to access /enter-grades
      if (intendedPath.startsWith("/enter-grades")) {
        return "/dashboard"; // Redirect to dashboard instead
      }
      // SUPER_ADMIN has access to dashboard routes
      const hasAccess = roleAccess.super_admin.some((route) =>
        intendedPath.startsWith(route)
      );
      if (hasAccess) {
        return intendedPath;
      }
    } else if (normalizedRole === "subeb_officer") {
      // Check dynamic routes: /:id/profile and /:id/grade-record
      const dynamicRoutePattern = /^\/[^/]+\/(profile|grade-record)$/;
      if (dynamicRoutePattern.test(intendedPath)) {
        return intendedPath;
      }
      // Check if SUBEB_OFFICER has access
      const hasAccess = roleAccess.subeb_officer.some((route) =>
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
    return "/enter-grades";
  }

  // SUPER_ADMIN or default fallback
  return "/dashboard";
}

/**
 * Extract error message from auth response and return user-friendly message
 */
export function getAuthErrorMessage(error: unknown): string {
  if (!error) return "Something went wrong. Please try again.";

  // Type guard for error objects
  if (typeof error === "object" && error !== null) {
    const errorObj = error as Record<string, unknown>;

    // Log the technical error for debugging
    console.error("Auth error details:", errorObj);

    // Handle backend error response
    if ("message" in errorObj && errorObj.message) {
      // If message is an array (validation errors), join them
      if (Array.isArray(errorObj.message)) {
        return errorObj.message.join(", ");
      }
      if (typeof errorObj.message === "string") {
        // Return the message as-is if it's already user-friendly
        // Backend should send user-friendly messages
        return errorObj.message;
      }
    }

    // Handle network errors
    if ("error" in errorObj && errorObj.error) {
      console.error("Network error:", errorObj.error);
      return "Unable to connect to the server. Please check your internet connection.";
    }
  }

  return "Something went wrong. Please try again.";
}
