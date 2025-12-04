import api from "@/lib/axios";
import type {
  BulkEnrollStudentsRequest,
  BulkEnrollStudentsResponse,
  EnrollmentMetadataResponse,
  LgaSchoolsResponse,
  SchoolClassesResponse,
} from "@/services/types/enrollment";

// Re-export types for use in hooks
export type {
  EnrollmentMetadataResponse,
  LgaSchoolsResponse,
  SchoolClassesResponse,
};

/**
 * Get enrollment metadata (session, term, LGAs)
 * GET /admin/enrollment/students/enrollment/metadata
 */
export async function fetchEnrollmentMetadata(): Promise<EnrollmentMetadataResponse> {
  try {
    const response = await api.get<EnrollmentMetadataResponse>(
      "/admin/enrollment/students/enrollment/metadata"
    );
    return response.data;
  } catch (error: unknown) {
    const err = error as {
      response?: { data?: unknown; status?: number };
      message?: string;
    };
    console.error("Enrollment metadata error:", err);
    if (err.response?.data) {
      throw err.response.data;
    }
    throw {
      success: false,
      message: "Unable to load enrollment metadata. Please try again.",
      statusCode: err.response?.status || 500,
    };
  }
}

/**
 * Get schools in a specific LGA
 * GET /admin/enrollment/students/enrollment/lgas/:lgaId/schools
 */
export async function fetchLgaSchools(
  lgaId: string
): Promise<LgaSchoolsResponse> {
  try {
    const response = await api.get<LgaSchoolsResponse>(
      `/admin/enrollment/students/enrollment/lgas/${lgaId}/schools`
    );
    return response.data;
  } catch (error: unknown) {
    const err = error as {
      response?: { data?: unknown; status?: number };
      message?: string;
    };
    console.error("LGA schools error:", err);
    if (err.response?.data) {
      throw err.response.data;
    }
    throw {
      success: false,
      message: "Unable to load schools. Please try again.",
      statusCode: err.response?.status || 500,
    };
  }
}

/**
 * Get classes in a specific school
 * GET /admin/enrollment/students/enrollment/schools/:schoolId/classes
 */
export async function fetchSchoolClasses(
  schoolId: string
): Promise<SchoolClassesResponse> {
  try {
    const response = await api.get<SchoolClassesResponse>(
      `/admin/enrollment/students/enrollment/schools/${schoolId}/classes`
    );
    return response.data;
  } catch (error: unknown) {
    const err = error as {
      response?: { data?: unknown; status?: number };
      message?: string;
    };
    console.error("School classes error:", err);
    if (err.response?.data) {
      throw err.response.data;
    }
    throw {
      success: false,
      message: "Unable to load classes. Please try again.",
      statusCode: err.response?.status || 500,
    };
  }
}

/**
 * Enroll single or multiple students
 * POST /admin/enrollment/students/enrollsingleorbulkstudents
 */
export async function enrollStudents(
  data: BulkEnrollStudentsRequest
): Promise<BulkEnrollStudentsResponse> {
  try {
    const response = await api.post<BulkEnrollStudentsResponse>(
      "/admin/enrollment/students/enrollsingleorbulkstudents",
      data
    );
    return response.data;
  } catch (error: unknown) {
    const err = error as {
      response?: { data?: unknown; status?: number };
      message?: string;
    };
    console.error("Student enrollment error:", err);
    if (err.response?.data) {
      throw err.response.data;
    }
    throw {
      success: false,
      message: "Unable to enroll student(s). Please try again.",
      statusCode: err.response?.status || 500,
    };
  }
}
