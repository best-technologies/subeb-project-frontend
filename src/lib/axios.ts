import axios, { InternalAxiosRequestConfig } from "axios";
import { getAccessToken, setTokens, clearTokens } from "./tokens";

// Create axios instance with base configuration
const api = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/${process.env.NEXT_PUBLIC_API_VERSION}`,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Track if we're currently refreshing token to prevent multiple refresh requests
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: unknown = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });

  failedQueue = [];
};

// Request interceptor for injecting auth token
api.interceptors.request.use(
  (config) => {
    // Log requests in development
    if (process.env.NODE_ENV === "development") {
      console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
      console.log("Request data:", config.data);
    }

    // Skip adding token for auth endpoints
    const isAuthEndpoint =
      config.url?.includes("/auth/login") ||
      config.url?.includes("/auth/register") ||
      config.url?.includes("/auth/refresh");

    if (!isAuthEndpoint) {
      const token = getAccessToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        if (process.env.NODE_ENV === "development") {
          console.log(
            "Token added to request:",
            token.substring(0, 20) + "..."
          );
        }
      } else {
        console.warn(
          "No access token found for protected endpoint:",
          config.url
        );
      }
    }

    return config;
  },
  (error) => {
    console.error("Request Error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling and token refresh
api.interceptors.response.use(
  (response) => {
    // Log successful responses in development
    if (process.env.NODE_ENV === "development") {
      console.log(`API Response: ${response.status} ${response.config.url}`);
      console.log("Response data:", response.data);
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Handle common HTTP errors
    if (error.response) {
      const { status, data } = error.response;
      console.error(`API Error ${status}:`, data);

      // Handle 401 Unauthorized - attempt token refresh
      if (status === 401 && !originalRequest._retry) {
        // Skip refresh for auth endpoints
        const isAuthEndpoint =
          originalRequest.url?.includes("/auth/login") ||
          originalRequest.url?.includes("/auth/register") ||
          originalRequest.url?.includes("/auth/refresh");

        if (isAuthEndpoint) {
          return Promise.reject(error);
        }

        if (isRefreshing) {
          // If already refreshing, queue this request
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then(() => {
              return api(originalRequest);
            })
            .catch((err) => {
              return Promise.reject(err);
            });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          // Dynamically import to avoid circular dependency
          const { refreshToken } = await import("@/services/api/auth");
          const response = await refreshToken();

          if (response.success && response.data) {
            const {
              accessToken,
              refreshToken: newRefreshToken,
              expiresIn,
            } = response.data;

            // Update tokens in storage
            setTokens(accessToken, newRefreshToken, expiresIn);

            // Update failed queue and retry requests
            processQueue(null);
            isRefreshing = false;

            // Retry the original request with new token
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            return api(originalRequest);
          } else {
            console.error("Token refresh failed - response not successful");
            throw new Error("Your session has expired. Please sign in again.");
          }
        } catch (refreshError) {
          // Token refresh failed - logout user
          processQueue(refreshError);
          isRefreshing = false;

          clearTokens();

          // Dynamically import to avoid circular dependency
          if (typeof window !== "undefined") {
            const { useAuthStore } = await import("@/store/authStore");
            useAuthStore.getState().logout();
            window.location.href = "/login";
          }

          return Promise.reject(refreshError);
        }
      }
    } else if (error.request) {
      console.error("Network Error:", error.message);
    } else {
      console.error("Request Setup Error:", error.message);
    }

    return Promise.reject(error);
  }
);

export default api;
