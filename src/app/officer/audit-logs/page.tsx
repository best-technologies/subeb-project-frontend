"use client";

import React, { useState } from "react";
import { useExamOfficerAuditLogs } from "@/services/hooks/useExamOfficer";
import { AuditLogsTable } from "@/components/audit-logs/AuditLogsTable";

export default function ExamOfficerAuditLogs() {
  const [page, setPage] = useState(1);
  const limit = 20;

  const { data, isLoading } = useExamOfficerAuditLogs(page, limit);
  const logs = Array.isArray(data) ? data : (data?.data || []);
  const pagination = data?.pagination;
  const totalPages = pagination?.totalPages || 1;
  const total = pagination?.total || (Array.isArray(data) ? data.length : 0);

  return (
    <AuditLogsTable
      title="Audit Logs"
      subtitle="Track your past approval, rejection, and officer activities."
      logs={logs}
      isLoading={isLoading}
      total={total}
      page={page}
      totalPages={totalPages}
      onPageChange={setPage}
    />
  );
}