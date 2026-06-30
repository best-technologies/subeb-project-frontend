import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getSessions, updateSessionStatus, getTerms, updateTermStatus, createSession, createTerm } from "@/services/api/academic";

export const academicKeys = {
  all: ["academic"] as const,
  sessions: () => [...academicKeys.all, "sessions"] as const,
  terms: (sessionId?: string) => [...academicKeys.all, "terms", { sessionId }] as const,
};

export function useSessions() {
  return useQuery({
    queryKey: academicKeys.sessions(),
    queryFn: getSessions,
  });
}

export function useUpdateSessionStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'OPEN' | 'CLOSED' }) => updateSessionStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: academicKeys.sessions() });
    },
  });
}

export function useCreateSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createSession,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: academicKeys.sessions() });
    },
  });
}

export function useTerms(sessionId?: string) {
  return useQuery({
    queryKey: academicKeys.terms(sessionId),
    queryFn: () => getTerms(sessionId),
    enabled: !!sessionId, // only fetch terms if a session is provided
  });
}

export function useUpdateTermStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'OPEN' | 'CLOSED' }) => updateTermStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: academicKeys.all });
    },
  });
}

export function useCreateTerm() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createTerm,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: academicKeys.all });
    },
  });
}
