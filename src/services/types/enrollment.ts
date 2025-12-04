export interface EnrollStudentRequest {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: "MALE" | "FEMALE";
  schoolId: string;
  classId: string;
}

export interface BulkEnrollStudentsRequest {
  students: EnrollStudentRequest[];
}

export interface EnrolledStudent {
  id: string;
  userId: string;
  studentId: string;
  schoolId: string;
  classId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  dateOfBirth: string;
  gender: "MALE" | "FEMALE";
  address: string | null;
  enrollmentDate: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  stateId: string;
  parentId: string | null;
  user: {
    id: string;
    email: string;
    role: string;
    username: string;
  };
  tempPassword: string;
}

export interface BulkEnrollStudentsResponse {
  success: boolean;
  message: string;
  data: EnrolledStudent[];
  length: number;
  statusCode: number;
}

// Enrollment Metadata Types
export interface AcademicSession {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  isCurrent: boolean;
  createdAt: string;
  updatedAt: string;
  stateId: string;
}

export interface AcademicTerm {
  id: string;
  sessionId: string;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  isCurrent: boolean;
  createdAt: string;
  updatedAt: string;
  stateId: string;
}

export interface LocalGovernment {
  id: string;
  name: string;
  code: string;
  state: string;
  totalSchools: number;
}

export interface EnrollmentMetadataResponse {
  success: boolean;
  message: string;
  data: {
    stateId: string;
    currentSession: AcademicSession;
    currentTerm: AcademicTerm;
    totalLocalGovernments: number;
    localGovernments: LocalGovernment[];
  };
  statusCode: number;
}

export interface EnrollmentSchool {
  id: string;
  name: string;
  code: string;
  lgaId: string;
  address: string | null;
  totalStudents: number;
  totalClasses: number;
}

export interface LgaSchoolsResponse {
  success: boolean;
  message: string;
  data: {
    lga: {
      id: string;
      name: string;
      code: string;
    };
    totalSchools: number;
    schools: EnrollmentSchool[];
  };
  statusCode: number;
}

export interface EnrollmentClass {
  id: string;
  name: string;
  schoolId: string;
  capacity: number | null;
  currentStudents: number;
}

export interface SchoolClassesResponse {
  success: boolean;
  message: string;
  data: {
    school: {
      id: string;
      name: string;
      code: string;
    };
    totalClasses: number;
    classes: EnrollmentClass[];
  };
  statusCode: number;
}
