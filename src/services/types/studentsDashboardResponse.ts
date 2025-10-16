// Types for Students Dashboard API Response

export interface LGA {
  id: string;
  name: string;
  code: string;
  state: string;
}

export interface School {
  id: string;
  name: string;
  code: string;
  level: string;
}

export interface Class {
  id: string;
  name: string;
  grade: string;
  section: string;
  school: {
    name: string;
  };
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  level: string;
}

export interface GenderCount {
  _count: {
    gender: number;
  };
  gender: "MALE" | "FEMALE";
}

export interface PerformanceStudent {
  id: string; // UUID for API calls
  position: number;
  studentName: string;
  examNo: string;
  school: string;
  class: string;
  total: number;
  average: number;
  percentage: number;
  gender: "MALE" | "FEMALE";
}

export interface StudentsDashboardData {
  session: string;
  term: string;
  lgas: LGA[];
  schools: School[];
  classes: Class[];
  subjects: Subject[];
  genders: GenderCount[];
  performanceTable: PerformanceStudent[];
}

export interface StudentsDashboardResponse {
  success: boolean;
  message: string;
  data: StudentsDashboardData;
  statusCode: number;
}

// Filter types
export interface StudentsFilters {
  lga?: string;
  school?: string;
  class?: string;
  gender?: string;
  subject?: string;
  session?: string;
}

// Error response type
export interface ApiErrorResponse {
  success: false;
  message: string;
  statusCode: number;
  error?: string;
}
