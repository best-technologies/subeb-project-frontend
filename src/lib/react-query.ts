import { QueryClient } from "@tanstack/react-query";

// Create a query client with optimized defaults
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Time before data is considered stale
      staleTime: 5 * 60 * 1000, // 5 minutes

      // Time data stays in cache when not in use
      gcTime: 10 * 60 * 1000, // 10 minutes (previously cacheTime)

      // Retry failed requests
      retry: (
        failureCount,
        error: Error & { response?: { status: number } }
      ) => {
        // Don't retry for 4xx errors
        if (
          error?.response?.status &&
          error.response.status >= 400 &&
          error.response.status < 500
        ) {
          return false;
        }
        return failureCount < 3;
      },

      // Retry delay (exponential backoff)
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),

      // Don't refetch on window focus in development
      refetchOnWindowFocus: process.env.NODE_ENV === "production",
    },
    mutations: {
      // Global mutation options
      retry: false, // Don't retry mutations by default
    },
  },
});

// Query key factory for consistent key management
export const queryKeys = {
  // Authentication keys
  auth: {
    user: () => ["auth", "user"] as const,
    permissions: () => ["auth", "permissions"] as const,
  },

  // Officer management keys
  officers: {
    all: () => ["officers"] as const,
    list: (filters?: Record<string, unknown>) =>
      [...queryKeys.officers.all(), "list", filters] as const,
    detail: (id: string) =>
      [...queryKeys.officers.all(), "detail", id] as const,
  },

  // Student management keys
  students: {
    all: () => ["students"] as const,
    list: (filters?: Record<string, unknown>) =>
      [...queryKeys.students.all(), "list", filters] as const,
    search: (query: string) =>
      [...queryKeys.students.all(), "search", query] as const,
    detail: (id: string) =>
      [...queryKeys.students.all(), "detail", id] as const,
  },

  // Dashboard keys
  dashboard: {
    admin: (params?: Record<string, unknown>) =>
      ["dashboard", "admin", params] as const,
    students: (filters?: Record<string, unknown>) =>
      ["dashboard", "students", filters] as const,
  },
} as const;
