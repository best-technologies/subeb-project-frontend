import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { examOfficerApi } from '../api/exam-officer';
import { toast } from 'react-hot-toast';

export const examOfficerKeys = {
  all: ['exam-officer'] as const,
  dashboard: () => [...examOfficerKeys.all, 'dashboard'] as const,
  results: (status?: string) => [...examOfficerKeys.all, 'results', status] as const,
  profile: () => [...examOfficerKeys.all, 'profile'] as const,
  auditLogs: (params?: any) => [...examOfficerKeys.all, 'audit-logs', params] as const,
};

export function useExamOfficerDashboard() {
  return useQuery({
    queryKey: examOfficerKeys.dashboard(),
    queryFn: () => examOfficerApi.getDashboardAnalytics().then((res) => res.data.data),
  });
}

export function useExamOfficerResults(statusFilter?: string) {
  return useQuery({
    queryKey: examOfficerKeys.results(statusFilter),
    queryFn: () => examOfficerApi.getSchoolsWithResults(statusFilter).then((res) => res.data.data),
  });
}

export function useExamOfficerSchoolResults(schoolId: string) {
  return useQuery({
    queryKey: [...examOfficerKeys.all, 'results', schoolId],
    queryFn: () => examOfficerApi.getSchoolResultsDetails(schoolId).then((res) => res.data.data),
    enabled: !!schoolId,
  });
}

export function useApproveSchoolResults() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (schoolId: string) => examOfficerApi.approveSchoolResults(schoolId),
    onSuccess: (res) => {
      toast.success(res.data?.message || 'Results approved successfully');
      queryClient.invalidateQueries({ queryKey: ['exam-officer', 'results'] });
      queryClient.invalidateQueries({ queryKey: examOfficerKeys.dashboard() });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to approve results');
    },
  });
}

export function useRejectSchoolResults() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (schoolId: string) => examOfficerApi.rejectSchoolResults(schoolId),
    onSuccess: (res) => {
      toast.success(res.data?.message || 'Results rejected successfully');
      queryClient.invalidateQueries({ queryKey: ['exam-officer', 'results'] });
      queryClient.invalidateQueries({ queryKey: examOfficerKeys.dashboard() });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to reject results');
    },
  });
}

export function useExamOfficerProfile() {
  return useQuery({
    queryKey: examOfficerKeys.profile(),
    queryFn: () => examOfficerApi.getProfile().then((res) => res.data.data),
  });
}

export function useUpdateExamOfficerProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => examOfficerApi.updateProfile(data),
    onSuccess: (res) => {
      toast.success('Profile updated successfully');
      queryClient.invalidateQueries({ queryKey: examOfficerKeys.profile() });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    },
  });
}

export function useExamOfficerAuditLogs(params?: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: examOfficerKeys.auditLogs(params),
    queryFn: () => examOfficerApi.getAuditLogs(params).then((res) => res.data.data),
  });
}
