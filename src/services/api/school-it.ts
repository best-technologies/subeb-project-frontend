import api from "@/lib/axios";

export const schoolItApi = {
  // Dashboard
  getDashboardAnalytics: () => api.get('/school-it/dashboard'),

  // Students
  getStudents: (params?: { page?: number; limit?: number; search?: string; classId?: string; status?: string }) =>
    api.get('/school-it/students', { params }),
  
  enrolStudent: (data: any) => api.post('/school-it/students', data),
  
  updateStudent: (id: string, data: any) => api.put(`/school-it/students/${id}`, data),

  updateStudentStatus: (id: string, data: { isActive: boolean; reason?: string }) =>
    api.patch(`/school-it/students/${id}/status`, data),

  // Results
  getSubjects: () => api.get('/school-it/results/subjects'),

  getResults: (params?: { classId?: string; status?: string; page?: number; limit?: number; search?: string }) =>
    api.get('/school-it/results', { params }),
  
  getStudentResults: (studentId: string) => api.get(`/school-it/results/${studentId}`),
  
  checkMissingResults: () => api.get('/school-it/results/check/missing'),
  submitResultsForApproval: () => api.post('/school-it/results/submit'),
  
  uploadResultsAtomic: (data: any) => api.post('/school-it/results/upload', data),

  previewBulkResults: (formData: FormData) =>
    api.post('/school-it/results/preview-bulk', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  getAuditLogs: (params?: { page?: number; limit?: number }) =>
    api.get('/school-it/audit-logs', { params }),
};
