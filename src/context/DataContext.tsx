"use client";
import React, {
  createContext,
  useContext,
  useReducer,
  ReactNode,
  useCallback,
} from "react";
import { AdminDashboardData } from "@/services/types/adminDashboardResponse";
import { StudentsDashboardData } from "@/services/types/studentsDashboardResponse";
import { getAdminDashboard } from "@/services/api";

// Cache duration in milliseconds (10 minutes)
const CACHE_DURATION = 10 * 60 * 1000;

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  loading: boolean;
  error: string | null;
  hasAttempted: boolean;
}

interface DataState {
  adminDashboard: CacheEntry<AdminDashboardData | null>;
}

type DataAction =
  | { type: "SET_ADMIN_DASHBOARD_LOADING" }
  | { type: "SET_ADMIN_DASHBOARD_SUCCESS"; payload: AdminDashboardData }
  | { type: "SET_ADMIN_DASHBOARD_ERROR"; payload: string }
  | { type: "CLEAR_CACHE" };

const initialState: DataState = {
  adminDashboard: {
    data: null,
    timestamp: 0,
    loading: false,
    error: null,
    hasAttempted: false,
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
          hasAttempted: true,
        },
      };
    case "SET_ADMIN_DASHBOARD_ERROR":
      return {
        ...state,
        adminDashboard: {
          ...state.adminDashboard,
          loading: false,
          error: action.payload,
          hasAttempted: true,
        },
      };
    case "CLEAR_CACHE":
      return {
        adminDashboard: {
          data: null,
          timestamp: 0,
          loading: false,
          error: null,
          hasAttempted: false,
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
  clearCache: () => void;
  isAdminDashboardCached: () => boolean;
  shouldFetchAdminDashboard: () => boolean;
  getStudentsDataFromAdmin: () => StudentsDashboardData | null;
  hasAdminDataForStudents: () => boolean;
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

  const shouldFetchAdminDashboard = useCallback(() => {
    // Don't fetch if already loading
    if (state.adminDashboard.loading) {
      return false;
    }

    // Don't fetch if we have cached data
    if (isAdminDashboardCached()) {
      return false;
    }

    // Don't fetch if we've already attempted and have an error (prevent infinite loops)
    if (state.adminDashboard.hasAttempted && state.adminDashboard.error) {
      return false;
    }

    // Fetch if we haven't attempted yet or if we have successful data but it's stale
    return true;
  }, [
    state.adminDashboard.loading,
    state.adminDashboard.hasAttempted,
    state.adminDashboard.error,
    isAdminDashboardCached,
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
        console.log("Using cached data (no search params)");
        return;
      }

      // Don't fetch if already loading
      if (state.adminDashboard.loading) {
        // console.log("Already loading, skipping request");
        return;
      }

      // Don't retry if we have an error and not forcing refresh (prevent infinite loops)
      if (
        state.adminDashboard.hasAttempted &&
        state.adminDashboard.error &&
        !forceRefresh
      ) {
        console.log(
          "Skipping request due to previous error (use forceRefresh to retry):",
          state.adminDashboard.error
        );
        return;
      }

      // console.log("DataContext - Making API call with params:", params);
      dispatch({ type: "SET_ADMIN_DASHBOARD_LOADING" });

      try {
        const response = await getAdminDashboard(params);
        //  console.log('DataContext - API response received:', response);
        if (response.success) {
          dispatch({
            type: "SET_ADMIN_DASHBOARD_SUCCESS",
            payload: response.data,
          });
        } else {
          console.error("DataContext - API error:", response.message);
          dispatch({
            type: "SET_ADMIN_DASHBOARD_ERROR",
            payload: response.message,
          });
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "An unknown error occurred";
        console.error("DataContext - Fetch error:", errorMessage);
        dispatch({ type: "SET_ADMIN_DASHBOARD_ERROR", payload: errorMessage });
      }
    },
    [
      isAdminDashboardCached,
      state.adminDashboard.loading,
      state.adminDashboard.error,
      state.adminDashboard.hasAttempted,
    ]
  );

  const clearCache = useCallback(() => {
    dispatch({ type: "CLEAR_CACHE" });
  }, []);

  // Function to check if admin data can be used for students page
  const hasAdminDataForStudents = useCallback(() => {
    const hasData = state.adminDashboard.data !== null;
    const hasTopStudents = state.adminDashboard.data?.performance?.topStudents;
    const hasLgas = state.adminDashboard.data?.data?.lgas;
    const isCacheValidNow = state.adminDashboard.data
      ? isCacheValid(state.adminDashboard.timestamp)
      : false;

    // console.log("🔍 hasAdminDataForStudents check:", {
    //   hasData,
    //   hasTopStudents: !!hasTopStudents,
    //   hasLgas: !!hasLgas,
    //   isCacheValidNow,
    //   topStudentsLength: hasTopStudents?.length || 0,
    //   lgasLength: hasLgas?.length || 0,
    //   timestamp: state.adminDashboard.timestamp,
    //   dataStructure: state.adminDashboard.data
    //     ? Object.keys(state.adminDashboard.data)
    //     : [],
    // });

    // For now, let's be more lenient and just check if we have data and it's valid
    return !!(hasData && isCacheValidNow);
  }, [state.adminDashboard.data, state.adminDashboard.timestamp, isCacheValid]);

  // Function to transform admin dashboard data into students dashboard format
  const getStudentsDataFromAdmin =
    useCallback((): StudentsDashboardData | null => {
      if (!state.adminDashboard.data) {
        // console.log("No admin dashboard data available");
        return null;
      }

      const adminData = state.adminDashboard.data;
      // console.log("Transforming admin data for students:", {
      //   keys: Object.keys(adminData),
      //   performance: adminData.performance,
      //   data: adminData.data,
      // });

      // Transform TopStudent[] to PerformanceStudent[] - handle multiple possible sources
      let topStudents = adminData.performance?.topStudents || [];
      if (!topStudents.length && adminData.topStudents) {
        // Fallback to legacy field
        topStudents = adminData.topStudents;
      }
      if (!topStudents.length && adminData.data?.students) {
        // Fallback to data.students
        topStudents = adminData.data.students;
      }

      const performanceTable = (topStudents || []).map((student, index) => ({
        position: student.position || index + 1,
        studentName: student.studentName,
        examNo: student.examNumber || "",
        school: student.school,
        class: student.class,
        total: student.totalScore || 0,
        average: student.totalScore ? Math.round(student.totalScore / 7) : 0,
        percentage: student.totalScore
          ? Math.round((student.totalScore / 700) * 100)
          : 0,
        gender: student.gender,
      }));

      // Handle multiple possible sources for different data
      const lgas = adminData.data?.lgas || adminData.lgas || [];
      const schools = adminData.data?.schools || adminData.schools || [];
      const classes = adminData.data?.classes || adminData.classes || [];
      const subjects = adminData.data?.subjects || adminData.subjects || [];

      // Transform admin data to students format
      const studentsData: StudentsDashboardData = {
        session: adminData.currentSession?.name || "",
        term: adminData.currentTerm?.name || "",
        performanceTable,
        lgas,
        schools,
        classes,
        subjects,
        genders:
          adminData.statistics?.genderDistribution?.map((g) => ({
            _count: { gender: g._count.gender },
            gender: g.gender as "MALE" | "FEMALE",
          })) ||
          adminData.genders ||
          [],
      };

      // console.log("Transformed students data:", {
      //   performanceTableLength: studentsData.performanceTable.length,
      //   lgasLength: studentsData.lgas.length,
      //   schoolsLength: studentsData.schools.length,
      //   studentsData,
      // });

      return studentsData;
    }, [state.adminDashboard.data]);

  const value: DataContextType = {
    state,
    fetchAdminDashboard,
    clearCache,
    isAdminDashboardCached,
    shouldFetchAdminDashboard,
    getStudentsDataFromAdmin,
    hasAdminDataForStudents,
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
