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

export async function getOfficers(page: number = 1, limit: number = 10): Promise<ApiResponse> {
  const response = await api.get(`/admin/subeb-officers?page=${page}&limit=${limit}`);
  return response.data;
}

export async function updateOfficer(id: string, data: Partial<OfficerData>): Promise<ApiResponse> {
  const response = await api.patch(`/admin/subeb-officers/${id}`, data);
  return response.data;
}
