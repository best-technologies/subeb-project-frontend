import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { AuthStore, User } from "@/services/types/auth";
import {
  clearTokens,
  syncTokensToCookies,
  clearTokenCookies,
  getTokens,
} from "@/lib/tokens";

/**
 * Zustand store for authentication state management
 * Persists user data to localStorage while tokens are managed separately
 */
export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
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
        // Sync tokens and role to cookies so middleware can access them
        syncTokensToCookies(user.role);
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
        // Sync updated tokens to cookies
        syncTokensToCookies();
      },

      // Clear authentication state on logout
      logout: () => {
        clearTokens();
        clearTokenCookies();
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
      // Only persist user data, not tokens or isAuthenticated flag
      // isAuthenticated should be derived from presence of valid tokens, not persisted
      partialize: (state) => ({
        user: state.user,
      }),
      // After hydration, check if we have valid tokens and update auth state accordingly
      onRehydrateStorage: () => (state) => {
        if (state) {
          const tokens = getTokens();
          if (tokens && state.user) {
            // We have both user data and tokens, mark as authenticated
            state.isAuthenticated = true;
            state.accessToken = tokens.accessToken;
            state.refreshToken = tokens.refreshToken;
          } else {
            // No tokens, ensure not authenticated
            state.isAuthenticated = false;
            state.accessToken = null;
            state.refreshToken = null;
          }
        }
      },
    }
  )
);
