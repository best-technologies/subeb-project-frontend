import api from "@/lib/axios";
import { OfficerData, ApiResponse } from "./types";

/**
 * Enroll a new officer
 * @param data Officer data from the form
 * @returns Promise with API response
 */
export async function enrollOfficer(data: OfficerData): Promise<ApiResponse> {
  console.log("enrollOfficer called with data:", data);

  // TODO: Uncomment when backend endpoint is ready
  // const response = await api.post('/officers/enroll', data);
  // return response.data;

  // For now, simulate API call and return mock response
  console.log("Simulating API call to /officers/enroll");
  console.log("Would send this data:", JSON.stringify(data, null, 2));

  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 1500));

  // Mock successful response
  const mockResponse: ApiResponse = {
    success: true,
    message: "Officer enrolled successfully!",
    data: {
      id: `officer_${Date.now()}`,
      ...data,
      createdAt: new Date().toISOString(),
    },
  };

  console.log("Mock API response:", mockResponse);
  return mockResponse;
}

// Future: Add other officer-related API calls
// export async function getOfficers(filters?: OfficerFilters): Promise<ApiResponse<Officer[]>> { }
// export async function getOfficer(id: string): Promise<ApiResponse<Officer>> { }
// export async function updateOfficer(id: string, data: Partial<OfficerData>): Promise<ApiResponse> { }
// export async function deleteOfficer(id: string): Promise<ApiResponse> { }
