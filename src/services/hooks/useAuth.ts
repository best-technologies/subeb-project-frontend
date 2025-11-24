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
 */
export function useRegister() {
  const { setAuth } = useAuthStore();

  return useMutation({
    mutationFn: (data: RegisterRequest) => register(data),

    onSuccess: (response: AuthResponse) => {
      console.log("Registration successful!", response);

      if (response.success && response.data) {
        const { user, accessToken, refreshToken, expiresIn } = response.data;

        // Store tokens
        setTokens(accessToken, refreshToken, expiresIn);

        // Update Zustand store
        setAuth(user, accessToken, refreshToken);
      }
    },

    onError: (error: unknown) => {
      console.error("Registration failed:", error);
      // Error is handled in the component
    },
  });
}

/**
 * Hook for user login
 */
export function useLogin() {
  const { setAuth } = useAuthStore();

  return useMutation({
    mutationFn: (data: LoginRequest) => login(data),

    onSuccess: (response: AuthResponse) => {
      console.log("Login successful!", response);

      if (response.success && response.data) {
        const { user, accessToken, refreshToken, expiresIn } = response.data;

        // Store tokens
        setTokens(accessToken, refreshToken, expiresIn);

        // Update Zustand store
        setAuth(user, accessToken, refreshToken);

        // Redirect will be handled in the component
        // to access searchParams for intended route
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
