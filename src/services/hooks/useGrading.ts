import { useState, useEffect } from "react";
import {
  fetchGradeEntryMetadata,
  fetchLgaSchools,
  fetchSchoolClasses,
  fetchClassStudents,
  type GradeEntryMetadataResponse,
  type LgaSchoolsResponse,
  type SchoolClassesResponse,
  type ClassStudentsResponse,
} from "@/services/api/grading";

// ============================================================================
// useGradeEntryMetadata Hook
// ============================================================================

interface UseGradeEntryMetadataState {
  data: GradeEntryMetadataResponse["data"] | null;
  loading: boolean;
  error: string | null;
}

export const useGradeEntryMetadata = () => {
  const [state, setState] = useState<UseGradeEntryMetadataState>({
    data: null,
    loading: false,
    error: null,
  });

  useEffect(() => {
    const loadMetadata = async () => {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const response = await fetchGradeEntryMetadata();
        if (response.success && response.data) {
          setState({ data: response.data, loading: false, error: null });
        } else {
          setState({
            data: null,
            loading: false,
            error: response.message || "Failed to load academic metadata.",
          });
        }
      } catch (error: unknown) {
        const err = error as { message?: string };
        setState({
          data: null,
          loading: false,
          error: err.message || "Failed to load academic metadata.",
        });
      }
    };

    loadMetadata();
  }, []);

  return state;
};

// ============================================================================
// useLgaSchools Hook
// ============================================================================

interface UseLgaSchoolsState {
  data: LgaSchoolsResponse["data"] | null;
  loading: boolean;
  error: string | null;
}

export const useLgaSchools = (lgaId: string | null) => {
  const [state, setState] = useState<UseLgaSchoolsState>({
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
// useSchoolClasses Hook
// ============================================================================

interface UseSchoolClassesState {
  data: SchoolClassesResponse["data"] | null;
  loading: boolean;
  error: string | null;
}

export const useSchoolClasses = (schoolId: string | null) => {
  const [state, setState] = useState<UseSchoolClassesState>({
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

// ============================================================================
// useClassStudents Hook
// ============================================================================

interface UseClassStudentsState {
  data: ClassStudentsResponse["data"] | null;
  loading: boolean;
  error: string | null;
}

export const useClassStudents = (classId: string | null) => {
  const [state, setState] = useState<UseClassStudentsState>({
    data: null,
    loading: false,
    error: null,
  });

  useEffect(() => {
    if (!classId) {
      setState({ data: null, loading: false, error: null });
      return;
    }

    const loadStudents = async () => {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const response = await fetchClassStudents(classId);
        if (response.success && response.data) {
          setState({ data: response.data, loading: false, error: null });
        } else {
          setState({
            data: null,
            loading: false,
            error: response.message || "Failed to load students.",
          });
        }
      } catch (error: unknown) {
        const err = error as { message?: string };
        setState({
          data: null,
          loading: false,
          error: err.message || "Failed to load students.",
        });
      }
    };

    loadStudents();
  }, [classId]);

  return state;
};
