// Types for Admin Dashboard API Response

export interface Session {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  isActive?: boolean;
}

export interface Term {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  isActive?: boolean;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface Summary {
  totalStudents: number;
  totalMale: number;
  totalFemale: number;
  totalSchools: number;
  totalClasses: number;
  totalLgas: number;
}

export interface School {
  id: string;
  name: string;
  code: string;
  level: string;
  address?: string;
  lga?: string;
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
  studentName: string;
  examNumber: string;
  school: string;
  schoolCode: string;
  class: string;
  gender: 'MALE' | 'FEMALE';
  // Optional fields for backward compatibility
  position?: number;
  totalScore?: number;
}

export interface AdminDashboardData {
  currentSession: Session;
  currentTerm: Term;
  availableSessions: Session[];
  availableTerms: Term[];
  pagination: Pagination;
  summary: Summary;
  filters: Record<string, unknown>;
  data: {
    schools: School[];
    lgas: LGA[];
    classes: Class[];
    students: TopStudent[];
    subjects: Subject[];
  };
  statistics: {
    genderDistribution: Array<{
      gender: string;
      _count: { gender: number };
    }>;
    schoolLevelDistribution: Array<{
      level: string;
      _count: { level: number };
    }>;
    classGradeDistribution: Array<{
      grade: string;
      _count: { grade: number };
    }>;
  };
  performance: {
    topStudents: TopStudent[];
  };
  // Legacy fields for backward compatibility
  schools?: School[];
  lgas?: LGA[];
  classes?: Class[];
  genders?: GenderCount[];
  subjects?: Subject[];
  topStudents?: TopStudent[];
  lastUpdated?: string;
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