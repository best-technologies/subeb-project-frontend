import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { enrollOfficer, getOfficers, updateOfficer } from "@/services/api/officers";
import { OfficerData } from "@/services/api/types";

export const officerKeys = {
  all: ["officers"] as const,
  lists: () => [...officerKeys.all, "list"] as const,
  list: (filters: string) => [...officerKeys.lists(), { filters }] as const,
  details: () => [...officerKeys.all, "detail"] as const,
  detail: (id: string) => [...officerKeys.details(), id] as const,
};

/**
 * Hook for fetching officers
 */
export function useOfficers(page: number = 1, limit: number = 10) {
  return useQuery({
    queryKey: officerKeys.list(`page=${page}&limit=${limit}`),
    queryFn: () => getOfficers(page, limit),
  });
}

/**
 * Hook for enrolling a new officer
 */
export function useEnrollOfficer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: enrollOfficer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: officerKeys.lists() });
    },
  });
}

/**
 * Hook for updating an officer
 */
export function useUpdateOfficer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<OfficerData> }) =>
      updateOfficer(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: officerKeys.lists() });
      queryClient.invalidateQueries({ queryKey: officerKeys.detail(variables.id) });
    },
  });
}
