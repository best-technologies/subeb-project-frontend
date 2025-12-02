import api from "@/lib/axios";
import type {
  RegisterRequest,
  LoginRequest,
  AuthResponse,
  RefreshTokenResponse,
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
