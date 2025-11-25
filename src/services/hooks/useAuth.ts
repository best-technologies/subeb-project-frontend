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

        // Store tokens (using 7 days for refresh token as specified)
        const expiresIn = 7 * 24 * 60 * 60; // 7 days in seconds
        setTokens(access_token, access_token, expiresIn);

        // Update Zustand store
        setAuth(transformedUser, access_token, access_token);

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
  // Define role-based access
  const roleAccess = {
    admin: [
      "/dashboard",
      "/profile",
      "/schools",
      "/students",
      "/enrol-officer",
      "/enter-grades",
    ],
    "grade-entry-officer": ["/enter-grades"],
  };

  // If there's an intended path, validate user has access to it
  if (
    intendedPath &&
    intendedPath !== "/login" &&
    intendedPath !== "/register" &&
    intendedPath !== "/"
  ) {
    // Check if user has access to the intended path
    if (role === "admin") {
      // Admin has access to all routes
      return intendedPath;
    } else if (role === "grade-entry-officer") {
      // Check if grade-entry-officer has access
      const hasAccess = roleAccess["grade-entry-officer"].some((route) =>
        intendedPath.startsWith(route)
      );
      if (hasAccess) {
        return intendedPath;
      }
    }
    // If no access to intended path, fall through to default
  }

  // Role-based default redirects
  if (role === "grade-entry-officer") {
    return "/enter-grades";
  }

  // Admin or default fallback
  return "/dashboard";
}

/**
 * Extract error message from auth response
 */
export function getAuthErrorMessage(error: unknown): string {
  if (!error) return "An unexpected error occurred";

  // Type guard for error objects
  if (typeof error === "object" && error !== null) {
    const errorObj = error as Record<string, unknown>;

    // Handle backend error response
    if ("message" in errorObj && errorObj.message) {
      // If message is an array (validation errors), join them
      if (Array.isArray(errorObj.message)) {
        return errorObj.message.join(", ");
      }
      if (typeof errorObj.message === "string") {
        return errorObj.message;
      }
    }

    // Handle network errors
    if ("error" in errorObj && errorObj.error) {
      return typeof errorObj.error === "string"
        ? errorObj.error
        : "Network error occurred";
    }
  }

  return "An unexpected error occurred";
}
