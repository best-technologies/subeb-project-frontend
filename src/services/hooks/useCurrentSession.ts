import { useState, useEffect } from "react";
import { getCurrentSession } from "@/services/api";
import { AcademicSession } from "@/services/api/session";

interface UseCurrentSessionState {
  session: AcademicSession | null;
  loading: boolean;
  error: string | null;
}

export const useCurrentSession = () => {
  const [state, setState] = useState<UseCurrentSessionState>({
    session: null,
    loading: false,
    error: null,
  });

  useEffect(() => {
    const fetchCurrentSession = async () => {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        console.log("🔍 Fetching current session...");
        const response = await getCurrentSession();
        console.log("✅ Session response:", response);

        if (response.success && response.data) {
          setState({
            session: response.data,
            loading: false,
            error: null,
          });
        } else {
          console.error("❌ Session response failed:", response);
          setState({
            session: null,
            loading: false,
            error: response.message || "Failed to fetch current session",
          });
        }
      } catch (error) {
        console.error("❌ Session fetch error:", error);
        setState({
          session: null,
          loading: false,
          error:
            error instanceof Error
              ? error.message
              : "Failed to fetch current session",
        });
      }
    };

    fetchCurrentSession();
  }, []);

  return state;
};
