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
    if (err.response?.data) {
      throw err.response.data;
    }
    throw {
      success: false,
      message: err.message || "Registration failed. Please try again.",
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
    if (err.response?.data) {
      throw err.response.data;
    }
    throw {
      success: false,
      message: err.message || "Login failed. Please try again.",
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
      throw {
        success: false,
        message: "No refresh token available",
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
    if (err.response?.data) {
      throw err.response.data;
    }
    throw {
      success: false,
      message: err.message || "Token refresh failed. Please login again.",
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
