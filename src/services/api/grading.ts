import api from "@/lib/axios";

// ============================================================================
// Type Definitions
// ============================================================================

export interface LocalGovernment {
  id: string;
  name: string;
  code: string;
  state: string;
  totalSchools: number;
}

export interface School {
  id: string;
  name: string;
  code: string;
  level: string;
  isActive: boolean;
  totalClasses: number;
}

export interface ClassInfo {
  id: string;
  name: string;
  grade: string;
  section: string;
  isActive: boolean;
  totalStudents: number;
}

export interface StudentInfo {
  id: string;
  studentId: string;
  gender: "MALE" | "FEMALE";
  email: string | null;
  stateId: string;
  firstName: string;
  lastName: string;
  fullName: string;
  hasResultForActiveTerm: boolean;
}

export interface CurrentSession {
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

export interface CurrentTerm {
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

export interface GradeEntryMetadataResponse {
  success: boolean;
  message: string;
  data: {
    stateId: string;
    currentSession: CurrentSession;
    currentTerm: CurrentTerm;
    totalLocalGovernments: number;
    localGovernments: LocalGovernment[];
  };
  statusCode: number;
}

export interface LgaSchoolsResponse {
  success: boolean;
  message: string;
  data: {
    stateId: string;
    lgaId: string;
    total: number;
    schools: School[];
  };
  statusCode: number;
}

export interface SchoolClassesResponse {
  success: boolean;
  message: string;
  data: {
    stateId: string;
    schoolId: string;
    total: number;
    classes: ClassInfo[];
  };
  statusCode: number;
}

export interface ClassStudentsResponse {
  success: boolean;
  message: string;
  data: {
    currentSession: {
      id: string;
      name: string;
      isCurrent: boolean;
    };
    currentTerm: {
      isCurrent: boolean;
      name: string;
      id: string;
    };
    stateId: string;
    schoolId: string;
    classId: string;
    total: number;
    students: StudentInfo[];
  };
  statusCode: number;
}

// ============================================================================
// API Functions
// ============================================================================

/**
 * Fetch grade entry metadata including current session, term, and LGAs
 */
export async function fetchGradeEntryMetadata(): Promise<GradeEntryMetadataResponse> {
  try {
    const response = await api.get<GradeEntryMetadataResponse>(
      "/grading/metadata/grade-entry"
    );
    return response.data;
  } catch (error: unknown) {
    const err = error as {
      response?: { data?: unknown; status?: number };
      message?: string;
    };
    console.error("Fetch grade entry metadata error:", err);

    if (err.response?.data) {
      throw err.response.data;
    }

    throw {
      success: false,
      message:
        err.response?.status === 401
          ? "Session expired. Please log in again."
          : err.response?.status === 500
          ? "Server error. Please try again later."
          : "Unable to load academic information. Please check your internet connection and try again.",
      statusCode: err.response?.status || 500,
    };
  }
}

/**
 * Fetch schools in a specific LGA
 * @param lgaId - The ID of the local government area
 */
export async function fetchLgaSchools(
  lgaId: string
): Promise<LgaSchoolsResponse> {
  try {
    const response = await api.get<LgaSchoolsResponse>(
      `/grading/metadata/lgas/${lgaId}/schools`
    );
    return response.data;
  } catch (error: unknown) {
    const err = error as {
      response?: { data?: unknown; status?: number };
      message?: string;
    };
    console.error("Fetch LGA schools error:", err);

    if (err.response?.data) {
      throw err.response.data;
    }

    throw {
      success: false,
      message:
        err.response?.status === 401
          ? "Session expired. Please log in again."
          : err.response?.status === 404
          ? "No schools found in this local government area."
          : err.response?.status === 500
          ? "Server error. Please try again later."
          : "Unable to load schools. Please check your internet connection and try again.",
      statusCode: err.response?.status || 500,
    };
  }
}

/**
 * Fetch classes in a specific school
 * @param schoolId - The ID of the school
 */
export async function fetchSchoolClasses(
  schoolId: string
): Promise<SchoolClassesResponse> {
  try {
    const response = await api.get<SchoolClassesResponse>(
      `/grading/metadata/schools/${schoolId}/classes`
    );
    return response.data;
  } catch (error: unknown) {
    const err = error as {
      response?: { data?: unknown; status?: number };
      message?: string;
    };
    console.error("Fetch school classes error:", err);

    if (err.response?.data) {
      throw err.response.data;
    }

    throw {
      success: false,
      message:
        err.response?.status === 401
          ? "Session expired. Please log in again."
          : err.response?.status === 404
          ? "No classes found in this school."
          : err.response?.status === 500
          ? "Server error. Please try again later."
          : "Unable to load classes. Please check your internet connection and try again.",
      statusCode: err.response?.status || 500,
    };
  }
}

/**
 * Fetch students in a specific class
 * @param classId - The ID of the class
 */
export async function fetchClassStudents(
  classId: string
): Promise<ClassStudentsResponse> {
  try {
    const response = await api.get<ClassStudentsResponse>(
      `/grading/metadata/classes/${classId}/students`
    );
    return response.data;
  } catch (error: unknown) {
    const err = error as {
      response?: { data?: unknown; status?: number };
      message?: string;
    };
    console.error("Fetch class students error:", err);

    if (err.response?.data) {
      throw err.response.data;
    }

    throw {
      success: false,
      message:
        err.response?.status === 401
          ? "Session expired. Please log in again."
          : err.response?.status === 404
          ? "No students found in this class."
          : err.response?.status === 500
          ? "Server error. Please try again later."
          : "Unable to load students. Please check your internet connection and try again.",
      statusCode: err.response?.status || 500,
    };
  }
}
