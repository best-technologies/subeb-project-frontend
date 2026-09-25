export interface ClassItem {
  id: string;
  name: string;
  grade: string;
  section: string;
  capacity: number;
  currentEnrollment: number;
  studentCount: number;
  utilization: number;
  academicYear: string;
  createdAt?: string;
  updatedAt?: string;
  school: {
    id: string;
    name: string;
    code?: string;
    level?: string;
    lga?: {
      id: string;
      name: string;
    } | null;
  };
  teacher?: {
    id: string;
    name: string;
    email?: string;
  } | null;
}

export interface ClassPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ClassesData {
  classes: ClassItem[];
  pagination: ClassPagination;
}

export interface ClassesResponse {
  success: boolean;
  message: string;
  data: ClassesData;
}

export interface ClassQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  schoolId?: string;
  lgaId?: string;
  grade?: string;
  academicYear?: string;
}

export interface CreateClassRequest {
  name: string;
  grade: string;
  section?: string;
  schoolId: string;
  capacity?: number;
  academicYear?: string;
  teacherId?: string;
}

export interface UpdateClassRequest {
  name?: string;
  grade?: string;
  section?: string;
  capacity?: number;
  academicYear?: string;
  teacherId?: string;
  isActive?: boolean;
}

export interface GradeClassAnalytics {
  grade: string;
  classCount: number;
  studentCount: number;
  averageSize: number;
  utilization: number;
}

export interface LgaClassAnalytics {
  lgaId: string;
  lgaName: string;
  classCount: number;
  studentCount: number;
  averageSize: number;
}

export interface TopSchoolClassAnalytics {
  schoolId: string;
  schoolName: string;
  lgaName: string;
  classCount: number;
  studentCount: number;
}

export interface ClassAnalyticsSummary {
  totalClasses: number;
  totalEnrolledStudents: number;
  averageClassSize: number;
  totalCapacity: number;
  capacityUtilization: number;
  overcrowdedClasses: number;
  balancedClasses: number;
  underEnrolledClasses: number;
}

export interface ClassAnalyticsData {
  summary: ClassAnalyticsSummary;
  byGrade: GradeClassAnalytics[];
  byLga: LgaClassAnalytics[];
  topSchools: TopSchoolClassAnalytics[];
  utilizationBands: Array<{
    name: string;
    count: number;
    percentage: number;
  }>;
}

export interface ClassAnalyticsResponse {
  success: boolean;
  message: string;
  data: ClassAnalyticsData;
}

export interface ClassAnalyticsQueryParams {
  session?: string;
  term?: string;
  lgaId?: string;
  schoolId?: string;
}
