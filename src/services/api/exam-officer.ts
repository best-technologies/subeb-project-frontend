import api from '@/lib/axios';

export const examOfficerApi = {
  getDashboardAnalytics: () => api.get('/exam-officer/dashboard'),
  getSchoolsWithResults: (status?: string) => 
    api.get('/exam-officer/results', { params: { status } }),
  getSchoolResultsDetails: (schoolId: string) => 
    api.get(`/exam-officer/results/${schoolId}`),
  approveSchoolResults: (schoolId: string) => 
    api.post(`/exam-officer/results/${schoolId}/approve`),
  rejectSchoolResults: (schoolId: string) => 
    api.post(`/exam-officer/results/${schoolId}/reject`),
  getProfile: () => api.get('/exam-officer/profile'),
  updateProfile: (data: any) => api.patch('/exam-officer/profile', data),
  getAuditLogs: (params?: { page?: number; limit?: number }) => 
    api.get('/exam-officer/audit-logs', { params }),
};
