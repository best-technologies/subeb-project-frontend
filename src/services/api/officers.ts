import api from "@/lib/axios";
import { OfficerData, ApiResponse } from "./types";

/**
 * Enroll a new officer
 * @param data Officer data from the form
 * @returns Promise with API response
 */
export async function enrollOfficer(data: OfficerData): Promise<ApiResponse> {
  console.log("enrollOfficer called with data:", data);

  const response = await api.post(
    "/admin/enrollment/subeb-officers/enroll",
    data
  );
  return response.data;
}

// Future: Add other officer-related API calls
// export async function getOfficers(filters?: OfficerFilters): Promise<ApiResponse<Officer[]>> { }
// export async function getOfficer(id: string): Promise<ApiResponse<Officer>> { }
// export async function updateOfficer(id: string, data: Partial<OfficerData>): Promise<ApiResponse> { }
// export async function deleteOfficer(id: string): Promise<ApiResponse> { }
