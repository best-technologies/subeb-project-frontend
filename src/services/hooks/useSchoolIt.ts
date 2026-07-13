import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { schoolItApi } from '../api/school-it';
import { toast } from 'react-hot-toast';

export const schoolItKeys = {
  all: ['school-it'] as const,
  dashboard: () => [...schoolItKeys.all, 'dashboard'] as const,
  students: (params?: any) => [...schoolItKeys.all, 'students', params] as const,
  subjects: () => [...schoolItKeys.all, 'subjects'] as const,
  results: (params?: any) => [...schoolItKeys.all, 'results', params] as const,
  studentResults: (id: string) => [...schoolItKeys.all, 'student-results', id] as const,
};

export function useSchoolItDashboard() {
  return useQuery({
    queryKey: schoolItKeys.dashboard(),
    queryFn: () => schoolItApi.getDashboardAnalytics().then((res) => res.data),
  });
}

export function useSchoolItSubjects() {
  return useQuery({
    queryKey: schoolItKeys.subjects(),
    queryFn: () => schoolItApi.getSubjects().then((res) => res.data),
  });
}

export function useSchoolItStudents(params?: { page?: number; limit?: number; search?: string }) {
  return useQuery({
    queryKey: schoolItKeys.students(params),
    queryFn: () => schoolItApi.getStudents(params).then((res) => res.data),
  });
}

export function useEnrolSchoolItStudent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => schoolItApi.enrolStudent(data),
    onSuccess: () => {
      toast.success('Student enrolled successfully');
      queryClient.invalidateQueries({ queryKey: schoolItKeys.students() });
      queryClient.invalidateQueries({ queryKey: schoolItKeys.dashboard() });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to enrol student');
    },
  });
}

export function useUpdateSchoolItStudent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => schoolItApi.updateStudent(id, data),
    onSuccess: () => {
      toast.success('Student updated successfully');
      queryClient.invalidateQueries({ queryKey: schoolItKeys.students() });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update student');
    },
  });
}

export function useSchoolItResults(params?: { classId?: string; page?: number; limit?: number }) {
  return useQuery({
    queryKey: schoolItKeys.results(params),
    queryFn: () => schoolItApi.getResults(params).then((res) => res.data),
  });
}

export function useUploadSchoolItResults() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => schoolItApi.uploadResultsAtomic(data),
    onSuccess: (res) => {
      toast.success(res.data?.message || 'Results uploaded successfully');
      queryClient.invalidateQueries({ queryKey: schoolItKeys.results() });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to upload results');
    },
  });
}

export function useSchoolItStudentResults(studentId: string) {
  return useQuery({
    queryKey: schoolItKeys.studentResults(studentId),
    queryFn: () => schoolItApi.getStudentResults(studentId).then((res) => res.data),
    enabled: !!studentId,
  });
}
