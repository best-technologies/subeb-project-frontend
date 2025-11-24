import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { AuthStore, User } from "@/services/types/auth";
import { clearTokens } from "@/lib/tokens";

/**
 * Zustand store for authentication state management
 * Persists user data to localStorage while tokens are managed separately
 */
export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      // Initial state
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,

      // Set authentication state after login/register
      setAuth: (user: User, accessToken: string, refreshToken: string) => {
        set({
          user,
          accessToken,
          refreshToken,
          isAuthenticated: true,
          isLoading: false,
        });
      },

      // Update user information
      setUser: (user: User) => {
        set({ user });
      },

      // Update tokens (used during token refresh)
      updateTokens: (accessToken: string, refreshToken: string) => {
        set({
          accessToken,
          refreshToken,
        });
      },

      // Clear authentication state on logout
      logout: () => {
        clearTokens();
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          isLoading: false,
        });
      },

      // Set loading state
      setLoading: (isLoading: boolean) => {
        set({ isLoading });
      },
    }),
    {
      name: "asubeb-auth-storage", // localStorage key
      storage: createJSONStorage(() => localStorage),
      // Only persist user data, not tokens (tokens are managed separately in src/lib/tokens.ts)
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
