// Types for Student Details API Response

export interface Teacher {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
}

export interface Parent {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  relationship: string;
}

export interface StudentDetailsStudent {
  id: string;
  studentId: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  dateOfBirth: string;
  gender: "MALE" | "FEMALE";
  address: string | null;
  enrollmentDate: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  school: {
    id: string;
    name: string;
    code: string;
    level: string;
    address: string;
    phone: string | null;
    email: string | null;
    website: string | null;
    principalName: string | null;
    principalPhone: string | null;
    principalEmail: string | null;
    establishedYear: number | null;
    totalStudents: number;
    totalTeachers: number;
    capacity: number | null;
    lga: {
      id: string;
      name: string;
      code: string;
      state: string;
    };
  };
  class: {
    id: string;
    name: string;
    grade: string;
    section: string;
    capacity: number;
    currentEnrollment: number;
    academicYear: string;
    teacher: Teacher | null;
  };
  parent: Parent | null;
}

export interface Assessment {
  id: string;
  type: "EXAM" | "QUIZ" | "ASSIGNMENT" | "PROJECT";
  title: string;
  description: string | null;
  maxScore: number;
  score: number;
  percentage: number;
  remarks: string | null;
  dateGiven: string;
  dateSubmitted: string | null;
  isSubmitted: boolean;
  isGraded: boolean;
  createdAt: string;
  subject: {
    id: string;
    name: string;
    code: string;
    level: string;
  };
  teacher: Teacher | null;
}

export interface SubjectBreakdown {
  subject: {
    id: string;
    name: string;
    code: string;
    level: string;
  };
  assessments: Assessment[];
  totalScore: number;
  totalMaxScore: number;
  averageScore: number;
  percentage: number;
  assessmentCount: number;
}

export interface AssessmentTypeBreakdown {
  type: "EXAM" | "QUIZ" | "ASSIGNMENT" | "PROJECT";
  count: number;
  totalScore: number;
  totalMaxScore: number;
  averageScore: number;
  percentage: number;
}

export interface PerformanceSummary {
  session: string;
  term: "FIRST_TERM" | "SECOND_TERM" | "THIRD_TERM";
  totalAssessments: number;
  totalScore: number;
  totalMaxScore: number;
  averageScore: number;
  overallPercentage: number;
  grade: string;
  subjectBreakdown: SubjectBreakdown[];
  assessmentTypeBreakdown: AssessmentTypeBreakdown[];
}

export interface StudentDetailsData {
  student: StudentDetailsStudent;
  performanceSummary: PerformanceSummary;
  lastUpdated: string;
}

export interface StudentDetailsResponse {
  success: boolean;
  message: string;
  data: StudentDetailsData;
  statusCode: number;
}

// Error response type
export interface StudentDetailsErrorResponse {
  success: false;
  message: string;
  statusCode: number;
  error?: string;
}
