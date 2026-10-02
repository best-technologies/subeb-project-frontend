import api from "@/lib/axios";
import type {
  RegisterRequest,
  LoginRequest,
  AuthResponse,
  RefreshTokenResponse,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  GenericAuthResponse,
} from "@/services/types/auth";
import { getRefreshToken } from "@/lib/tokens";

/**
 * Register a new user account
 * POST /auth/register
 */
export async function register(data: RegisterRequest): Promise<AuthResponse> {
  try {
    const response = await api.post<AuthResponse>("/auth/register", data);
    return response.data;
  } catch (error: unknown) {
    // Extract error message from backend response
    const err = error as {
      response?: { data?: unknown; status?: number };
      message?: string;
    };
    console.error("Registration error:", err);
    if (err.response?.data) {
      throw err.response.data;
    }
    throw {
      success: false,
      message: "Unable to create your account. Please try again.",
      statusCode: err.response?.status || 500,
    };
  }
}

/**
 * Login with email and password
 * POST /auth/login
 */
export async function login(data: LoginRequest): Promise<AuthResponse> {
  try {
    const response = await api.post<AuthResponse>("/auth/login", data);
    return response.data;
  } catch (error: unknown) {
    // Extract error message from backend response
    const err = error as {
      response?: { data?: unknown; status?: number };
      message?: string;
    };
    console.error("Login error:", err);
    if (err.response?.data) {
      throw err.response.data;
    }
    throw {
      success: false,
      message:
        "Unable to sign you in. Please check your credentials and try again.",
      statusCode: err.response?.status || 500,
    };
  }
}

/**
 * Refresh access token using refresh token
 * POST /auth/refresh
 */
export async function refreshToken(): Promise<RefreshTokenResponse> {
  try {
    const refreshTokenValue = getRefreshToken();

    if (!refreshTokenValue) {
      console.error("Token refresh - No refresh token available");
      throw {
        success: false,
        message: "Your session has expired. Please sign in again.",
        statusCode: 401,
      };
    }

    const response = await api.post<RefreshTokenResponse>("/auth/refresh", {
      refreshToken: refreshTokenValue,
    });

    return response.data;
  } catch (error: unknown) {
    // Extract error message from backend response
    const err = error as {
      response?: { data?: unknown; status?: number };
      message?: string;
    };
    console.error("Token refresh error:", err);
    if (err.response?.data) {
      throw err.response.data;
    }
    throw {
      success: false,
      message: "Your session has expired. Please sign in again.",
      statusCode: err.response?.status || 500,
    };
  }
}

/**
 * Logout current user
 * POST /auth/logout
 */
export async function logout(): Promise<{ success: boolean; message: string }> {
  try {
    const response = await api.post("/auth/logout");
    return response.data;
  } catch (error: unknown) {
    // Even if logout fails on backend, we'll clear local state
    console.error("Logout error:", error);
    return {
      success: true,
      message: "Logged out successfully",
    };
  }
}

/**
 * Get current user profile
 * GET /auth/profile
 */
export async function getProfile(): Promise<any> {
  try {
    const response = await api.get("/auth/profile");
    return response.data;
  } catch (error: unknown) {
    console.error("Get profile error:", error);
    return null;
  }
}

/**
 * Update current user profile
 * PATCH /auth/profile
 */
export async function updateProfile(data: { firstName?: string; lastName?: string }): Promise<any> {
  try {
    const response = await api.patch("/auth/profile", data);
    return response.data;
  } catch (error: unknown) {
    console.error("Update profile error:", error);
    return null;
  }
}

/**
 * Request password recovery code
 * POST /auth/forgot-password
 */
export async function forgotPassword(
  data: ForgotPasswordRequest
): Promise<GenericAuthResponse> {
  try {
    const response = await api.post<GenericAuthResponse>(
      "/auth/forgot-password",
      data
    );
    return response.data;
  } catch (error: unknown) {
    const err = error as {
      response?: { data?: unknown; status?: number };
      message?: string;
    };
    console.error("Forgot password error:", err);
    if (err.response?.data) {
      throw err.response.data;
    }
    throw {
      success: false,
      message:
        "Unable to send recovery email. Please check your network and try again.",
      statusCode: err.response?.status || 500,
    };
  }
}

/**
 * Reset password using OTP code
 * POST /auth/reset-password
 */
export async function resetPassword(
  data: ResetPasswordRequest
): Promise<GenericAuthResponse> {
  try {
    const response = await api.post<GenericAuthResponse>(
      "/auth/reset-password",
      data
    );
    return response.data;
  } catch (error: unknown) {
    const err = error as {
      response?: { data?: unknown; status?: number };
      message?: string;
    };
    console.error("Reset password error:", err);
    if (err.response?.data) {
      throw err.response.data;
    }
    throw {
      success: false,
      message:
        "Unable to reset password. Please check your verification code and try again.",
      statusCode: err.response?.status || 500,
    };
  }
}
