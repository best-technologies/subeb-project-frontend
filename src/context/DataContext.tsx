"use client";
import React, {
  createContext,
  useContext,
  useReducer,
  ReactNode,
  useCallback,
} from "react";
import { AdminDashboardData } from "@/services/types/adminDashboardResponse";
import {
  StudentsDashboardData,
  StudentsFilters,
} from "@/services/types/studentsDashboardResponse";
import { getAdminDashboard } from "@/services/api";
import { getStudentsDashboard } from "@/services/api";

// Cache duration in milliseconds (10 minutes)
const CACHE_DURATION = 10 * 60 * 1000;

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  loading: boolean;
  error: string | null;
}

interface DataState {
  adminDashboard: CacheEntry<AdminDashboardData | null>;
  studentsDashboard: CacheEntry<StudentsDashboardData | null>;
}

type DataAction =
  | { type: "SET_ADMIN_DASHBOARD_LOADING" }
  | { type: "SET_ADMIN_DASHBOARD_SUCCESS"; payload: AdminDashboardData }
  | { type: "SET_ADMIN_DASHBOARD_ERROR"; payload: string }
  | { type: "SET_STUDENTS_DASHBOARD_LOADING" }
  | { type: "SET_STUDENTS_DASHBOARD_SUCCESS"; payload: StudentsDashboardData }
  | { type: "SET_STUDENTS_DASHBOARD_ERROR"; payload: string }
  | { type: "CLEAR_CACHE" };

const initialState: DataState = {
  adminDashboard: {
    data: null,
    timestamp: 0,
    loading: false,
    error: null,
  },
  studentsDashboard: {
    data: null,
    timestamp: 0,
    loading: false,
    error: null,
  },
};

function dataReducer(state: DataState, action: DataAction): DataState {
  switch (action.type) {
    case "SET_ADMIN_DASHBOARD_LOADING":
      return {
        ...state,
        adminDashboard: {
          ...state.adminDashboard,
          loading: true,
          error: null,
        },
      };
    case "SET_ADMIN_DASHBOARD_SUCCESS":
      return {
        ...state,
        adminDashboard: {
          data: action.payload,
          timestamp: Date.now(),
          loading: false,
          error: null,
        },
      };
    case "SET_ADMIN_DASHBOARD_ERROR":
      return {
        ...state,
        adminDashboard: {
          ...state.adminDashboard,
          loading: false,
          error: action.payload,
        },
      };
    case "SET_STUDENTS_DASHBOARD_LOADING":
      return {
        ...state,
        studentsDashboard: {
          ...state.studentsDashboard,
          loading: true,
          error: null,
        },
      };
    case "SET_STUDENTS_DASHBOARD_SUCCESS":
      return {
        ...state,
        studentsDashboard: {
          data: action.payload,
          timestamp: Date.now(),
          loading: false,
          error: null,
        },
      };
    case "SET_STUDENTS_DASHBOARD_ERROR":
      return {
        ...state,
        studentsDashboard: {
          ...state.studentsDashboard,
          loading: false,
          error: action.payload,
        },
      };
    case "CLEAR_CACHE":
      return {
        adminDashboard: {
          data: null,
          timestamp: 0,
          loading: false,
          error: null,
        },
        studentsDashboard: {
          data: null,
          timestamp: 0,
          loading: false,
          error: null,
        },
      };
    default:
      return state;
  }
}

interface DataContextType {
  state: DataState;
  fetchAdminDashboard: (
    params?: {
      session?: string;
      term?: string;
      page?: number;
      limit?: number;
      search?: string;
      schoolId?: string;
      classId?: string;
      gender?: string;
      schoolLevel?: string;
      lgaId?: string;
      sortBy?: string;
      sortOrder?: string;
      includeStats?: boolean;
      includePerformance?: boolean;
    },
    forceRefresh?: boolean
  ) => Promise<void>;
  fetchStudentsDashboard: (
    filters?: StudentsFilters,
    forceRefresh?: boolean
  ) => Promise<void>;
  clearCache: () => void;
  isAdminDashboardCached: () => boolean;
  isStudentsDashboardCached: () => boolean;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(dataReducer, initialState);

  const isCacheValid = useCallback((timestamp: number) => {
    return Date.now() - timestamp < CACHE_DURATION;
  }, []);

  const isAdminDashboardCached = useCallback(() => {
    return (
      state.adminDashboard.data !== null &&
      isCacheValid(state.adminDashboard.timestamp)
    );
  }, [state.adminDashboard.data, state.adminDashboard.timestamp, isCacheValid]);

  const isStudentsDashboardCached = useCallback(() => {
    return (
      state.studentsDashboard.data !== null &&
      isCacheValid(state.studentsDashboard.timestamp)
    );
  }, [
    state.studentsDashboard.data,
    state.studentsDashboard.timestamp,
    isCacheValid,
  ]);

  const fetchAdminDashboard = useCallback(
    async (
      params?: {
        session?: string;
        term?: string;
        page?: number;
        limit?: number;
        search?: string;
        schoolId?: string;
        classId?: string;
        gender?: string;
        schoolLevel?: string;
        lgaId?: string;
        sortBy?: string;
        sortOrder?: string;
        includeStats?: boolean;
        includePerformance?: boolean;
      },
      forceRefresh = false
    ) => {
      // Check if we have search parameters that require a new API call
      const hasSearchParams =
        params &&
        Object.values(params).some((val) => val !== undefined && val !== "");

      // Return cached data only if no search params and not forcing refresh
      if (!forceRefresh && !hasSearchParams && isAdminDashboardCached()) {
        console.log("📦 Using cached data (no search params)");
        return;
      }

      // Don't fetch if already loading
      if (state.adminDashboard.loading) {
        // console.log("⏳ Already loading, skipping request");
        return;
      }

      // Don't retry if we have a recent error (prevent infinite loops)
      const hasRecentError =
        state.adminDashboard.error &&
        Date.now() - state.adminDashboard.timestamp < 30000; // 30 seconds
      if (hasRecentError && !forceRefresh) {
        console.log(
          "⚠️ Skipping request due to recent error:",
          state.adminDashboard.error
        );
        return;
      }

      // console.log("🚀 DataContext - Making API call with params:", params);
      dispatch({ type: "SET_ADMIN_DASHBOARD_LOADING" });

      try {
        const response = await getAdminDashboard(params);
        //  console.log('✅ DataContext - API response received:', response);
        if (response.success) {
          dispatch({
            type: "SET_ADMIN_DASHBOARD_SUCCESS",
            payload: response.data,
          });
        } else {
          console.error("❌ DataContext - API error:", response.message);
          dispatch({
            type: "SET_ADMIN_DASHBOARD_ERROR",
            payload: response.message,
          });
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "An unknown error occurred";
        console.error("❌ DataContext - Fetch error:", errorMessage);
        dispatch({ type: "SET_ADMIN_DASHBOARD_ERROR", payload: errorMessage });
      }
    },
    [isAdminDashboardCached, state.adminDashboard.loading]
  );

  const fetchStudentsDashboard = useCallback(
    async (filters = {}, forceRefresh = false) => {
      // Return cached data if valid and not forcing refresh
      if (!forceRefresh && isStudentsDashboardCached()) {
        return;
      }

      // Don't fetch if already loading
      if (state.studentsDashboard.loading) {
        return;
      }

      dispatch({ type: "SET_STUDENTS_DASHBOARD_LOADING" });

      try {
        const response = await getStudentsDashboard(filters);
        if (response.success) {
          dispatch({
            type: "SET_STUDENTS_DASHBOARD_SUCCESS",
            payload: response.data,
          });
        } else {
          dispatch({
            type: "SET_STUDENTS_DASHBOARD_ERROR",
            payload: response.message,
          });
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "An unknown error occurred";
        dispatch({
          type: "SET_STUDENTS_DASHBOARD_ERROR",
          payload: errorMessage,
        });
      }
    },
    [isStudentsDashboardCached, state.studentsDashboard.loading]
  );

  const clearCache = useCallback(() => {
    dispatch({ type: "CLEAR_CACHE" });
  }, []);

  const value: DataContextType = {
    state,
    fetchAdminDashboard,
    fetchStudentsDashboard,
    clearCache,
    isAdminDashboardCached,
    isStudentsDashboardCached,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
}
