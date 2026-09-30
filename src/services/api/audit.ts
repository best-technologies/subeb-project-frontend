import api from "@/lib/axios";

export interface AuditLogData {
  id: string;
  userId: string;
  userName?: string;
  action: string;
  details: string; // JSON string or text
  entity: string;
  entityId: string;
  createdAt: string;
}

export interface AuditLogsResponse {
  data: AuditLogData[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export async function getAuditLogs(page = 1, limit = 20): Promise<AuditLogsResponse> {
  const response = await api.get(`/admin/audit-logs?page=${page}&limit=${limit}`);
  return response.data;
}
