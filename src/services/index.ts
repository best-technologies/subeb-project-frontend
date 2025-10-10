// Export API functions
export {
  getAdminDashboard,
  getStudentsDashboard,
  getCurrentSession,
  getStudentDetails,
} from "./api";

// Export hooks
export { useAdminDashboard } from "./hooks/useAdminDashboard";
export { useStudentsDashboard } from "./hooks/useStudentsDashboard";
export { useGlobalAdminDashboard } from "./hooks/useGlobalAdminDashboard";
export { useGlobalStudentsDashboard } from "./hooks/useGlobalStudentsDashboard";
export { useGlobalSearchFilter } from "./hooks/useGlobalSearchFilter";
export { useCurrentSession } from "./hooks/useCurrentSession";

// Export types
export type {
  AdminDashboardResponse,
  AdminDashboardData,
  TopStudent,
  School,
  Class,
  Subject,
  GenderCount,
  LGA,
  Session,
  Term,
  Pagination,
  Summary,
} from "./types/adminDashboardResponse";

export type {
  StudentsDashboardResponse,
  StudentsDashboardData,
  StudentsFilters,
  PerformanceStudent,
  LGA as StudentsLGA,
  School as StudentsSchool,
  Class as StudentsClass,
  Subject as StudentsSubject,
  GenderCount as StudentsGenderCount,
} from "./types/studentsDashboardResponse";

export type {
  AcademicSession,
  Term as SessionTerm,
  CurrentSessionResponse,
} from "./api/session";

export type {
  StudentDetailsResponse,
  StudentDetailsData,
  PerformanceSummary,
  SubjectBreakdown,
  Assessment,
  StudentDetailsStudent,
} from "./types/studentDetailsResponse";
