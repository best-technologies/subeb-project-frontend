import { useState, useEffect } from "react";
import {
  fetchEnrollmentMetadata,
  fetchLgaSchools,
  fetchSchoolClasses,
  type EnrollmentMetadataResponse,
  type LgaSchoolsResponse,
  type SchoolClassesResponse,
} from "@/services/api/enrollment";

// ============================================================================
// useEnrollmentMetadata Hook
// ============================================================================

interface UseEnrollmentMetadataState {
  data: EnrollmentMetadataResponse["data"] | null;
  loading: boolean;
  error: string | null;
}

export const useEnrollmentMetadata = () => {
  const [state, setState] = useState<UseEnrollmentMetadataState>({
    data: null,
    loading: false,
    error: null,
  });

  useEffect(() => {
    const loadMetadata = async () => {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const response = await fetchEnrollmentMetadata();
        if (response.success && response.data) {
          setState({ data: response.data, loading: false, error: null });
        } else {
          setState({
            data: null,
            loading: false,
            error: response.message || "Failed to load enrollment metadata.",
          });
        }
      } catch (error: unknown) {
        const err = error as { message?: string };
        setState({
          data: null,
          loading: false,
          error: err.message || "Failed to load enrollment metadata.",
        });
      }
    };

    loadMetadata();
  }, []);

  return state;
};

// ============================================================================
// useEnrollmentLgaSchools Hook
// ============================================================================

interface UseEnrollmentLgaSchoolsState {
  data: LgaSchoolsResponse["data"] | null;
  loading: boolean;
  error: string | null;
}

export const useEnrollmentLgaSchools = (lgaId: string | null) => {
  const [state, setState] = useState<UseEnrollmentLgaSchoolsState>({
    data: null,
    loading: false,
    error: null,
  });

  useEffect(() => {
    if (!lgaId) {
      setState({ data: null, loading: false, error: null });
      return;
    }

    const loadSchools = async () => {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const response = await fetchLgaSchools(lgaId);
        if (response.success && response.data) {
          setState({ data: response.data, loading: false, error: null });
        } else {
          setState({
            data: null,
            loading: false,
            error: response.message || "Failed to load schools.",
          });
        }
      } catch (error: unknown) {
        const err = error as { message?: string };
        setState({
          data: null,
          loading: false,
          error: err.message || "Failed to load schools.",
        });
      }
    };

    loadSchools();
  }, [lgaId]);

  return state;
};

// ============================================================================
// useEnrollmentSchoolClasses Hook
// ============================================================================

interface UseEnrollmentSchoolClassesState {
  data: SchoolClassesResponse["data"] | null;
  loading: boolean;
  error: string | null;
}

export const useEnrollmentSchoolClasses = (schoolId: string | null) => {
  const [state, setState] = useState<UseEnrollmentSchoolClassesState>({
    data: null,
    loading: false,
    error: null,
  });

  useEffect(() => {
    if (!schoolId) {
      setState({ data: null, loading: false, error: null });
      return;
    }

    const loadClasses = async () => {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const response = await fetchSchoolClasses(schoolId);
        if (response.success && response.data) {
          setState({ data: response.data, loading: false, error: null });
        } else {
          setState({
            data: null,
            loading: false,
            error: response.message || "Failed to load classes.",
          });
        }
      } catch (error: unknown) {
        const err = error as { message?: string };
        setState({
          data: null,
          loading: false,
          error: err.message || "Failed to load classes.",
        });
      }
    };

    loadClasses();
  }, [schoolId]);

  return state;
};
