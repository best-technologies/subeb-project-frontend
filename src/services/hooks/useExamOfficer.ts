import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { examOfficerApi } from '../api/exam-officer';
import { toast } from 'react-hot-toast';

export const examOfficerKeys = {
  all: ['exam-officer'] as const,
  dashboard: () => [...examOfficerKeys.all, 'dashboard'] as const,
  results: (status?: string) => [...examOfficerKeys.all, 'results', status] as const,
  profile: () => [...examOfficerKeys.all, 'profile'] as const,
  auditLogs: (params?: any) => [...examOfficerKeys.all, 'audit-logs', params] as const,
  lgas: () => [...examOfficerKeys.all, 'lgas'] as const,
  schools: (lgaId?: string) => [...examOfficerKeys.all, 'schools', lgaId] as const,
  schoolItList: (params?: any) => [...examOfficerKeys.all, 'school-it', params] as const,
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
    mutationFn: (args: string | { schoolId: string; studentIds?: string[]; classIds?: string[] }) => {
      const schoolId = typeof args === 'string' ? args : args.schoolId;
      const payload = typeof args === 'string' ? undefined : { studentIds: args.studentIds, classIds: args.classIds };
      return examOfficerApi.approveSchoolResults(schoolId, payload);
    },
    onSuccess: (res, args) => {
      const schoolId = typeof args === 'string' ? args : args.schoolId;
      toast.success(res.data?.message || 'Results approved successfully');
      queryClient.invalidateQueries({ queryKey: ['exam-officer', 'results'] });
      queryClient.invalidateQueries({ queryKey: ['exam-officer', 'results', schoolId] });
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
    mutationFn: (args: string | { schoolId: string; studentIds?: string[]; classIds?: string[] }) => {
      const schoolId = typeof args === 'string' ? args : args.schoolId;
      const payload = typeof args === 'string' ? undefined : { studentIds: args.studentIds, classIds: args.classIds };
      return examOfficerApi.rejectSchoolResults(schoolId, payload);
    },
    onSuccess: (res, args) => {
      const schoolId = typeof args === 'string' ? args : args.schoolId;
      toast.success(res.data?.message || 'Results rejected successfully');
      queryClient.invalidateQueries({ queryKey: ['exam-officer', 'results'] });
      queryClient.invalidateQueries({ queryKey: ['exam-officer', 'results', schoolId] });
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

export function useExamOfficerAuditLogs(
  pageOrParams: number | { page?: number; limit?: number } = 1,
  limitParam = 20
) {
  const page = typeof pageOrParams === 'number' ? pageOrParams : (pageOrParams?.page ?? 1);
  const limit = typeof pageOrParams === 'number' ? limitParam : (pageOrParams?.limit ?? 20);

  return useQuery({
    queryKey: [...examOfficerKeys.all, 'audit-logs', page, limit] as const,
    queryFn: () => examOfficerApi.getAuditLogs({ page, limit }).then((res) => res.data?.data ?? res.data),
    staleTime: 0,
    refetchOnMount: true,
  });
}

export function useExamOfficerLgas() {
  return useQuery({
    queryKey: examOfficerKeys.lgas(),
    queryFn: () => examOfficerApi.getOfficerLgas().then((res) => res.data.data),
  });
}

export function useExamOfficerSchools(lgaId?: string) {
  return useQuery({
    queryKey: examOfficerKeys.schools(lgaId),
    queryFn: () => examOfficerApi.getSchoolsInLga(lgaId).then((res) => res.data.data),
  });
}

export function useExamOfficerSchoolItList(params?: { search?: string; schoolId?: string; status?: string; lgaId?: string }) {
  return useQuery({
    queryKey: examOfficerKeys.schoolItList(params),
    queryFn: () => examOfficerApi.getSchoolItList(params).then((res) => res.data.data),
  });
}

export function useCreateSchoolIt() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
      schoolId: string;
      profilePicture?: string;
    }) => examOfficerApi.createSchoolIt(data).then((res) => res.data.data),
    onSuccess: () => {
      toast.success('School IT personnel created successfully');
      queryClient.invalidateQueries({ queryKey: ['exam-officer', 'school-it'] });
      queryClient.invalidateQueries({ queryKey: examOfficerKeys.dashboard() });
      queryClient.invalidateQueries({ queryKey: examOfficerKeys.schools() });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create School IT personnel');
    },
  });
}

export function useUpdateSchoolIt() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      examOfficerApi.updateSchoolIt(id, data).then((res) => res.data.data),
    onSuccess: () => {
      toast.success('School IT personnel updated successfully');
      queryClient.invalidateQueries({ queryKey: ['exam-officer', 'school-it'] });
      queryClient.invalidateQueries({ queryKey: examOfficerKeys.dashboard() });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update School IT personnel');
    },
  });
}

export function useToggleSchoolItStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => examOfficerApi.toggleSchoolItStatus(id).then((res) => res.data.data),
    onSuccess: (data) => {
      toast.success(`Personnel account ${data.isActive ? 'activated' : 'deactivated'} successfully`);
      queryClient.invalidateQueries({ queryKey: ['exam-officer', 'school-it'] });
      queryClient.invalidateQueries({ queryKey: examOfficerKeys.dashboard() });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to toggle personnel status');
    },
  });
}

