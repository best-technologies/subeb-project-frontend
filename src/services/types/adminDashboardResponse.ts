// Types for Admin Dashboard API Response

export interface School {
  id: string;
  name: string;
  code: string;
  level: string;
  totalStudents: number;
  totalTeachers: number;
}

export interface LGA {
  id: string;
  name: string;
  code: string;
  state: string;
}

export interface Class {
  id: string;
  name: string;
  grade: string;
  section: string;
  capacity: number;
  currentEnrollment: number;
  school: {
    name: string;
  };
}

export interface GenderCount {
  _count: {
    gender: number;
  };
  gender: 'MALE' | 'FEMALE';
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  level: string;
}

export interface TopStudent {
  id: string;
  position: number;
  studentName: string;
  examNumber: string;
  gender: 'MALE' | 'FEMALE';
  totalScore: number;
  school: string;
  class: string;
}

export interface AdminDashboardData {
  session: string;
  term: string;
  totalStudents: number;
  totalMale: number;
  totalFemale: number;
  schools: School[];
  lgas: LGA[];
  classes: Class[];
  genders: GenderCount[];
  subjects: Subject[];
  topStudents: TopStudent[];
  lastUpdated: string;
}

export interface AdminDashboardResponse {
  success: boolean;
  message: string;
  data: AdminDashboardData;
  statusCode: number;
}

// Error response type
export interface ApiErrorResponse {
  success: false;
  message: string;
  statusCode: number;
  error?: string;
} 