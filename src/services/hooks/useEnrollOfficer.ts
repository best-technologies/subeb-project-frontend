import { useMutation } from "@tanstack/react-query";
import { enrollOfficer } from "@/services/api/officers";
// import { queryKeys } from "@/lib/react-query";
// import { OfficerData } from "@/services/api/types";

/**
 * Hook for enrolling a new officer
 * Provides loading states, error handling, and success callbacks
 */
export function useEnrollOfficer() {
  // const queryClient = useQueryClient();

  return useMutation({
    mutationFn: enrollOfficer,

    onMutate: async () => {
      console.log("Starting officer enrollment mutation");
    },

    onSuccess: (data) => {
      console.log("Officer enrollment successful!", data);

      // Future: Invalidate officer lists when we have them
      // queryClient.invalidateQueries({ queryKey: queryKeys.officers.all() });

      // Future: Add toast notification
      // toast.success('Officer enrolled successfully!');
    },

    onError: (error, variables) => {
      console.error("Officer enrollment failed:", error);
      console.error("Failed variables:", variables);

      // Future: Add toast notification
      // toast.error(`Failed to enroll officer: ${error.message}`);
    },

    onSettled: (data, error) => {
      console.log("Officer enrollment mutation completed");
      if (data) {
        console.log("Final result:", data);
      }
      if (error) {
        console.log("Final error:", error);
      }
    },
  });
}
