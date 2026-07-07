import { useQuery } from "@tanstack/react-query";
import { getAuditLogs } from "../api/audit";

export const auditKeys = {
  all: ["audit"] as const,
  logs: (page: number, limit: number) => [...auditKeys.all, "logs", page, limit] as const,
};

export function useAuditLogs(page = 1, limit = 20) {
  return useQuery({
    queryKey: auditKeys.logs(page, limit),
    queryFn: () => getAuditLogs(page, limit),
  });
}
