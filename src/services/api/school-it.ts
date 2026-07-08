import api from "@/lib/axios";

export const schoolItApi = {
  // Dashboard
  getDashboardAnalytics: () => api.get('/school-it/dashboard'),

  // Students
  getStudents: (params?: { page?: number; limit?: number; search?: string }) =>
    api.get('/school-it/students', { params }),
  
  enrolStudent: (data: any) => api.post('/school-it/students', data),
  
  updateStudent: (id: string, data: any) => api.put(`/school-it/students/${id}`, data),

  // Results
  getResults: (params?: { classId?: string; page?: number; limit?: number }) =>
    api.get('/school-it/results', { params }),
  
  uploadResultsAtomic: (data: any) => api.post('/school-it/results/upload', data),
};
