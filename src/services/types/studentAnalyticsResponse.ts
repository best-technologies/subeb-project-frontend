export interface ClassPerformanceItem {
  className: string;
  studentCount: number;
  averageScore: number;
  averagePercentage: number;
  maleAverage: number;
  femaleAverage: number;
}

export interface SchoolPerformanceItem {
  schoolId: string;
  schoolName: string;
  lgaName: string;
  studentCount: number;
  averagePercentage: number;
  totalScore: number;
}

export interface LgaPerformanceItem {
  lgaId: string;
  lgaName: string;
  lgaCode: string;
  schoolCount: number;
  studentCount: number;
  averagePercentage: number;
  passRate: number;
  previousAverage?: number | null;
  change?: number | null;
}

export interface GenderPerformanceItem {
  gender: string;
  studentCount: number;
  averagePercentage: number;
  passRate: number;
  sharePercentage: number;
}

export interface AgeRangePerformanceItem {
  range: string;
  studentCount: number;
  averagePercentage: number;
  passRate: number;
}

export interface AnalyticsSummary {
  overallAverage: number;
  totalStudentsAssessed: number;
  totalEnrollment: number;
  topPerformingLga: string;
  topPerformingClass: string;
  genderParityIndex: number;
}

export interface StudentAnalyticsData {
  session: string;
  term: string;
  summary: AnalyticsSummary;
  byClass: ClassPerformanceItem[];
  bySchool: SchoolPerformanceItem[];
  byLga: LgaPerformanceItem[];
  byGender: GenderPerformanceItem[];
  byAgeRange: AgeRangePerformanceItem[];
}

export interface StudentAnalyticsResponse {
  success: boolean;
  message: string;
  data: StudentAnalyticsData;
}
