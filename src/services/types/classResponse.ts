export interface ClassRegisteredSchool {
  id: string;
  name: string;
  code?: string;
  lgaName?: string;
  studentCount?: number;
}

export interface ClassItem {
  id: string;
  name: string;
  grade: string;
  section?: string;
  capacity?: number;
  currentEnrollment?: number;
  studentCount: number;
  schoolsCount?: number;
  schools?: ClassRegisteredSchool[];
  students?: any[];
  utilization?: number;
  academicYear: string;
  createdAt?: string;
  updatedAt?: string;
  school?: {
    id: string;
    name: string;
    code?: string;
    level?: string;
    lga?: {
      id: string;
      name: string;
    } | null;
  } | null;
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
  statewide?: boolean;
}

export interface CreateClassRequest {
  name: string;
  grade?: string;
  section?: string;
  schoolId?: string;
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
  classesWithTeachers?: number;
  schoolsRepresented?: number;
  totalAssessedClasses?: number;
  totalCapacity?: number;
  capacityUtilization?: number;
}

export interface GradePerformanceAnalytics {
  grade: string;
  schoolLevel?: "PRIMARY" | "SECONDARY" | string;
  classCount: number;
  studentCount: number;
  averageScore: number;
  passRate: number;
}

export interface TopPerformingClassItem {
  rank: number;
  classId: string;
  className: string;
  grade: string;
  schoolName: string;
  schoolLevel?: "PRIMARY" | "SECONDARY" | string;
  lgaName: string;
  studentCount: number;
  averageScore: number;
  passRate: number;
}

export interface PerformanceBandItem {
  name: string;
  count: number;
  percentage: number;
  color?: string;
}

export interface ClassAnalyticsData {
  summary: ClassAnalyticsSummary;
  byGrade?: GradeClassAnalytics[];
  byLga?: LgaClassAnalytics[];
  topSchools?: TopSchoolClassAnalytics[];
  performanceByGrade?: GradePerformanceAnalytics[];
  topPerformingClasses?: TopPerformingClassItem[];
  performanceBands?: PerformanceBandItem[];
  primaryPerformanceBands?: PerformanceBandItem[];
  secondaryPerformanceBands?: PerformanceBandItem[];
  utilizationBands?: Array<{
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
