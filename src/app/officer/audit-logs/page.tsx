"use client";

import React, { useState } from "react";
import { useExamOfficerAuditLogs } from "@/services/hooks/useExamOfficer";
import { AuditLogsTable } from "@/components/audit-logs/AuditLogsTable";

export default function ExamOfficerAuditLogs() {
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 20;

  const { data: response, isLoading } = useExamOfficerAuditLogs({ page: currentPage, limit });
  const logs = response?.data || [];
  const pagination = response?.pagination;
  const totalPages = pagination?.totalPages || 1;
  const total = pagination?.total || 0;

  return (
    <AuditLogsTable
      title="Audit Logs"
      subtitle="Track your past approval, rejection, and officer activities."
      logs={logs}
      isLoading={isLoading}
      total={total}
      page={currentPage}
      totalPages={totalPages}
      onPageChange={setCurrentPage}
    />
  );
}