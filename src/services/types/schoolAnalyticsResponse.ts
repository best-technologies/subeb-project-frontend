export interface SchoolLgaPerformanceItem {
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

export interface TopSchoolRankingItem {
  schoolId: string;
  schoolName: string;
  lgaName: string;
  averagePercentage: number;
  studentCount: number;
  passRate: number;
}

export interface SchoolPerformanceBandItem {
  band: string;
  key: "distinction" | "good" | "average" | "needsImprovement";
  count: number;
  percentage: number;
  color: string;
}

export interface SchoolSizeDistributionItem {
  cohort: string;
  key: "small" | "medium" | "large" | "mega";
  count: number;
  percentage: number;
  averagePercentage: number;
  color: string;
}

export interface SchoolAnalyticsSummary {
  totalSchools: number;
  statewideSchoolAverage: number;
  totalStudents: number;
  totalAssessedStudents: number;
  averageSchoolSize: number;
  topPerformingSchool: string;
  topPerformingLga: string;
}

export interface SchoolAnalyticsData {
  session: string;
  term: string;
  summary: SchoolAnalyticsSummary;
  byLga: SchoolLgaPerformanceItem[];
  topSchools: TopSchoolRankingItem[];
  performanceBands: SchoolPerformanceBandItem[];
  sizeDistribution: SchoolSizeDistributionItem[];
}

export interface SchoolAnalyticsResponse {
  success: boolean;
  message: string;
  data: SchoolAnalyticsData;
}
