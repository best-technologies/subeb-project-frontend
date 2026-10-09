import api from '@/lib/axios';

export const examOfficerApi = {
  getDashboardAnalytics: () => api.get('/exam-officer/dashboard'),
  getSchoolsWithResults: (status?: string) => 
    api.get('/exam-officer/results', { params: { status } }),
  getSchoolResultsDetails: (schoolId: string) => 
    api.get(`/exam-officer/results/${schoolId}`),
  approveSchoolResults: (schoolId: string, studentIds?: string[]) => 
    api.post(`/exam-officer/results/${schoolId}/approve`, { studentIds }),
  rejectSchoolResults: (schoolId: string, studentIds?: string[]) => 
    api.post(`/exam-officer/results/${schoolId}/reject`, { studentIds }),
  getProfile: () => api.get('/exam-officer/profile'),
  updateProfile: (data: any) => api.patch('/exam-officer/profile', data),
  getAuditLogs: (params?: { page?: number; limit?: number }) => 
    api.get('/exam-officer/audit-logs', { params }),
  getOfficerLgas: () => api.get('/exam-officer/lgas'),
  getSchoolsInLga: (lgaId?: string) => 
    api.get('/exam-officer/schools', { params: { lgaId } }),
  getSchoolItList: (params?: { search?: string; schoolId?: string; status?: string; lgaId?: string }) => 
    api.get('/exam-officer/school-it', { params }),
  createSchoolIt: (data: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    schoolId: string;
    profilePicture?: string;
  }) => api.post('/exam-officer/school-it', data),
  updateSchoolIt: (id: string, data: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    schoolId?: string;
    isActive?: boolean;
  }) => api.patch(`/exam-officer/school-it/${id}`, data),
  toggleSchoolItStatus: (id: string) => 
    api.patch(`/exam-officer/school-it/${id}/toggle-status`),
};
