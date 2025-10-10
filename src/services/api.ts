import {
  AdminDashboardResponse,
  ApiErrorResponse,
} from "./types/adminDashboardResponse";
import {
  StudentsDashboardResponse,
  StudentsFilters,
} from "./types/studentsDashboardResponse";
import { CurrentSessionResponse } from "./api/session";
import { StudentDetailsResponse } from "./types/studentDetailsResponse";

// API Configuration
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000";
const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION || "v1";

//  Debug logging: log the API configuration commented out by Juwon in order clean up the code.
// Can be deleted

// console.log('API Configuration:');
// console.log('  API_BASE_URL:', API_BASE_URL);
// console.log('  API_VERSION:', API_VERSION);
// console.log('  process.env.NEXT_PUBLIC_API_BASE_URL:', process.env.NEXT_PUBLIC_API_BASE_URL);
// console.log('  process.env.NEXT_PUBLIC_API_VERSION:', process.env.NEXT_PUBLIC_API_VERSION);

// Base API client configuration
class ApiClient {
  private baseURL: string;
  private defaultHeaders: HeadersInit;

  constructor() {
    this.baseURL = `${API_BASE_URL}/api/${API_VERSION}`;
    this.defaultHeaders = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };
    // console.log("API Client - Initialized with baseURL:", this.baseURL);
  }

  // Generic request method
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;

    const config: RequestInit = {
      ...options,
      headers: {
        ...this.defaultHeaders,
        ...options.headers,
      },
    };

    // console.log("API Client - Making request to:", url);
    // console.log("API Client - Request config:", config);

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const errorData: ApiErrorResponse = await response.json().catch(() => ({
          success: false,
          message: `HTTP error! status: ${response.status}`,
          statusCode: response.status,
        }));

        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        );
      }

      const data = await response.json();
      // console.log("API Client - Response data:", data);
      return data as T;
    } catch (error) {
      // console.error("API Client - Request failed:", error);

      // If it's a network error (API not available), throw error
      if (error instanceof TypeError && error.message.includes("fetch")) {
        // console.log("API Client - Network error, API not available");
        throw new Error(
          `API not available - please check if your backend is accessible at ${API_BASE_URL}`
        );
      }

      if (error instanceof Error) {
        throw new Error(`API request failed. Error message: ${error.message}`);
      }
      throw new Error("API request failed: Unknown error");
    }
  }

  // GET request helper
  private async get<T>(
    endpoint: string,
    queryParams?: Record<string, string>,
    headers?: HeadersInit
  ): Promise<T> {
    let url = endpoint;
    if (queryParams && Object.keys(queryParams).length > 0) {
      const params = new URLSearchParams(queryParams);
      url = `${endpoint}?${params.toString()}`;
    }
    return this.request<T>(url, {
      method: "GET",
      headers,
    });
  }

  // POST request helper
  private async post<T>(
    endpoint: string,
    data?: unknown,
    headers?: HeadersInit
  ): Promise<T> {
    return this.request<T>(endpoint, {
      method: "POST",
      headers,
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // PUT request helper
  private async put<T>(
    endpoint: string,
    data?: unknown,
    headers?: HeadersInit
  ): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PUT",
      headers,
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // DELETE request helper
  private async delete<T>(endpoint: string, headers?: HeadersInit): Promise<T> {
    return this.request<T>(endpoint, {
      method: "DELETE",
      headers,
    });
  }

  // Admin Dashboard API Methods
  async getAdminDashboard(params?: {
    session?: string;
    term?: string;
    page?: number;
    limit?: number;
    search?: string;
    schoolId?: string;
    classId?: string;
    gender?: string;
    schoolLevel?: string;
    lgaId?: string;
    sortBy?: string;
    sortOrder?: string;
    includeStats?: boolean;
    includePerformance?: boolean;
  }): Promise<AdminDashboardResponse> {
    // console.log("🔍 API Client - Admin Dashboard Request with params:", params);

    try {
      // Convert params to query string
      const queryParams: Record<string, string> = {};
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            queryParams[key] = String(value);
          }
        });
      }

      const response = await this.get<AdminDashboardResponse>(
        "/admin/dashboard",
        queryParams
      );
      // console.log("✅ API Client - Admin Dashboard Response:", response);
      return response;
    } catch (error) {
      console.error("❌ API Client - Error in getAdminDashboard:", error);
      throw error;
    }
  }

  // Students Dashboard API Methods
  async getStudentsDashboard(
    filters: StudentsFilters = {}
  ): Promise<StudentsDashboardResponse> {
    // console.log("API Client - Students Dashboard Request:");
    // console.log("Filters being sent to backend:", filters);
    // console.log(
    //   "Active filters:",
    //   Object.entries(filters)
    //     .filter(([, value]) => value && value !== "")
    //     .map(([key, value]) => `${key}: ${value}`)
    // );

    // Build query parameters
    const queryParams: Record<string, string> = {};
    if (filters.session) queryParams.session = filters.session;
    if (filters.lga) queryParams.lga = filters.lga;
    if (filters.school) queryParams.school = filters.school;
    if (filters.class) queryParams.class = filters.class;
    if (filters.gender) queryParams.gender = filters.gender;
    if (filters.subject) queryParams.subject = filters.subject;

    // console.log("Endpoint:", "/admin/students/dashboard");
    // console.log("Query parameters:", queryParams);

    try {
      const response = await this.get<StudentsDashboardResponse>(
        "/admin/students/dashboard",
        queryParams
      );
      // console.log(
      //   "API Client - Students dashboard response received:",
      //   response
      // );
      return response;
    } catch (error) {
      console.error("API Client - Error in getStudentsDashboard:", error);
      throw error;
    }
  }

  // Future authentication methods (for when auth is implemented)
  private getAuthHeaders(): HeadersInit {
    // TODO: Implement when authentication is added
    // const token = localStorage.getItem('authToken');
    // return token ? { Authorization: `Bearer ${token}` } : {};
    return {};
  }

  // Method to set auth token (for future use)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  setAuthToken(token: string): void {
    // TODO: Implement when authentication is added
    // localStorage.setItem('authToken', token);
  }

  // Method to clear auth token (for future use)
  clearAuthToken(): void {
    // TODO: Implement when authentication is added
    // localStorage.removeItem('authToken');
  }

  // Current Session API Method
  async getCurrentSession(): Promise<CurrentSessionResponse> {
    try {
      // Add cache-busting headers to prevent 304 responses
      const response = await this.get<CurrentSessionResponse>(
        "/academic/sessions/current",
        undefined,
        {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        }
      );
      return response;
    } catch (error) {
      console.error("API Client - Error in getCurrentSession:", error);
      throw error;
    }
  }

  // Student Details API Method
  async getStudentDetails(studentId: string): Promise<StudentDetailsResponse> {
    try {
      const response = await this.get<StudentDetailsResponse>(
        `/admin/students/${studentId}/details`
      );
      return response;
    } catch (error) {
      console.error("API Client - Error in getStudentDetails:", error);
      throw error;
    }
  }

  // Student PDF Result Download API Method
  async downloadStudentResultPDF(studentId: string): Promise<Blob> {
    try {
      const url = `${this.baseURL}/admin/students/${studentId}/result.pdf`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          ...this.defaultHeaders,
          Accept: "application/pdf",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const blob = await response.blob();
      return blob;
    } catch (error) {
      console.error(
        "❌ API Client - Error in downloadStudentResultPDF:",
        error
      );
      throw error;
    }
  }
}

// Create and export a singleton instance
const apiClient = new ApiClient();

// Export the client instance
export default apiClient;

// Export individual methods for direct use
export const getAdminDashboard = (
  params?: Parameters<typeof apiClient.getAdminDashboard>[0]
) => apiClient.getAdminDashboard(params);
export const getStudentsDashboard = (filters?: StudentsFilters) =>
  apiClient.getStudentsDashboard(filters);
export const getCurrentSession = () => apiClient.getCurrentSession();
export const getStudentDetails = (studentId: string) =>
  apiClient.getStudentDetails(studentId);
export const downloadStudentResultPDF = (studentId: string) =>
  apiClient.downloadStudentResultPDF(studentId);
export const setAuthToken = (token: string) => apiClient.setAuthToken(token);
export const clearAuthToken = () => apiClient.clearAuthToken();

// Export the class for testing or custom instances
export { ApiClient };

// Student Search and Filter API with progressive filtering
export const searchStudents = async (params: {
  session?: string;
  term?: string;
  lgaId?: string;
  schoolId?: string;
  classId?: string;
  gender?: string;
  search?: string;
  page?: number;
  limit?: number;
}) => {
  // console.log("searchStudents called with params:", params);

  const queryParams = new URLSearchParams();

  // Add all non-undefined parameters to query string
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      queryParams.append(key, value.toString());
    }
  });

  // Use the correct endpoint with API version - same as ApiClient
  const url = `${API_BASE_URL}/api/${API_VERSION}/admin/students/dashboard?${queryParams.toString()}`;
  // console.log("Making request to:", url);

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      // Add any authentication headers if needed
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMessage =
      errorData.message || `HTTP ${response.status}: ${response.statusText}`;

    if (response.status === 400) {
      throw new Error(`Bad request - invalid parameters: ${errorMessage}`);
    } else if (response.status === 500) {
      throw new Error(`Internal server error: ${errorMessage}`);
    } else {
      throw new Error(`Failed to fetch data: ${errorMessage}`);
    }
  }

  return response.json();
};
