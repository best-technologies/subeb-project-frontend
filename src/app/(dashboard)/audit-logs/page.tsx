"use client";

import React, { useState } from "react";
import { useAuditLogs } from "@/services/hooks/useAudit";
import { AuditLogsTable } from "@/components/audit-logs/AuditLogsTable";

export default function AuditLogsPage() {
  const [page, setPage] = useState(1);
  const limit = 20;
  const { data, isLoading } = useAuditLogs(page, limit);

  const logs = data?.data || [];
  const pagination = data?.pagination;
  const totalPages = pagination?.totalPages || 1;
  const total = pagination?.total || 0;

  return (
    <AuditLogsTable
      title="Audit Logs"
      subtitle="Review system activities and admin actions"
      logs={logs}
      isLoading={isLoading}
      total={total}
      page={page}
      totalPages={totalPages}
      onPageChange={setPage}
    />
  );
}
