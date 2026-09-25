"use client";

import React, { useState, useMemo } from "react";
import { AdminDashboardData } from "@/services/types/adminDashboardResponse";
import { SchoolDirectoryItem } from "@/services/types/schoolsDirectoryResponse";
import { useSchoolSearch } from "@/services/hooks/useSchoolSearch";
import { useSessions, useTerms } from "@/services/hooks/useAcademic";
import SchoolsHeader from "./SchoolsHeader";
import { SchoolChartsSection } from "./charts/SchoolChartsSection";
import SchoolsFilters from "./SchoolsFilters";
import SchoolsTable from "./SchoolsTable";
import { SchoolDetailsDialog } from "./SchoolDetailsDialog";
import { AddSchoolDialog } from "./AddSchoolDialog";
import { EditSchoolSheet } from "./EditSchoolSheet";
import { formatTermName } from "@/utils/formatters";
import { LoadingModal } from "@/components/ui/LoadingModal";

interface SchoolsTabProps {
  dashboardData: AdminDashboardData;
}

const SchoolsTab: React.FC<SchoolsTabProps> = ({ dashboardData }) => {
  // Modal state
  const [selectedSchool, setSelectedSchool] = useState<SchoolDirectoryItem | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showAddSchoolDialog, setShowAddSchoolDialog] = useState(false);
  const [selectedSchoolForEdit, setSelectedSchoolForEdit] = useState<SchoolDirectoryItem | null>(null);
  const [showEditSheet, setShowEditSheet] = useState(false);
  const [isChartsLoading, setIsChartsLoading] = useState(true);

  // Progressive search & cascading filter hook
  const {
    schools,
    pagination,
    params,
    filterStage,
    loading,
    isSearching,
    selectedLgaName,
    isSessionEnabled,
    isTermEnabled,
    isLgaEnabled,
    selectSession,
    selectTerm,
    selectLga,
    updateSearch,
    changePage,
    clearFilters,
    refetch,
  } = useSchoolSearch();

  // Dynamic session and term data
  const { data: sessionsData } = useSessions();
  const activeSessionId = useMemo(() => {
    if (params.session) return params.session;
    if (sessionsData?.data && sessionsData.data.length > 0) {
      const curr =
        sessionsData.data.find((s) => s.isCurrent) ||
        sessionsData.data.find((s) => s.status === "OPEN") ||
        sessionsData.data[0];
      return curr?.id;
    }
    return dashboardData?.currentSession?.id;
  }, [params.session, sessionsData, dashboardData]);

  const { data: termsData } = useTerms(activeSessionId);

  const availableSessions = useMemo(() => {
    if (sessionsData?.data && sessionsData.data.length > 0) {
      return sessionsData.data;
    }
    return dashboardData?.availableSessions || [];
  }, [sessionsData, dashboardData]);

  const availableTerms = useMemo(() => {
    if (termsData?.data && termsData.data.length > 0) {
      return termsData.data;
    }
    return dashboardData?.availableTerms || [];
  }, [termsData, dashboardData]);

  // Abia State LGAs from dashboard
  const lgas = useMemo(() => {
    return dashboardData?.data?.lgas || [];
  }, [dashboardData]);

  // Formatted names for step messages & dialog
  const selectedSessionName = useMemo(() => {
    if (!params.session) return undefined;
    const match = availableSessions.find((s) => s.id === params.session || s.name === params.session);
    return match?.name || params.session;
  }, [params.session, availableSessions]);

  const selectedTermName = useMemo(() => {
    if (!params.term) return undefined;
    if (params.term === "ALL_TERMS") return "All Terms";
    const match = availableTerms.find((t) => t.id === params.term || t.name === params.term);
    return formatTermName(match?.name || params.term);
  }, [params.term, availableTerms]);

  const handleViewSchool = (school: SchoolDirectoryItem) => {
    setSelectedSchool(school);
    setShowDetailsDialog(true);
  };

  const handleEditSchool = (school: SchoolDirectoryItem) => {
    setSelectedSchoolForEdit(school);
    setShowEditSheet(true);
  };

  return (
    <div className="space-y-6">
      {/* 1. Page Header Card */}
      <SchoolsHeader onAddSchool={() => setShowAddSchoolDialog(true)} />

      {/* 2. Visual Demographic & Performance Analytics Suite */}
      <SchoolChartsSection
        availableSessions={availableSessions}
        availableTerms={availableTerms}
        onLoadingChange={setIsChartsLoading}
      />

      {/* 3. Progressive Cascading Filters & Direct Search */}
      <SchoolsFilters
        lgas={lgas}
        availableSessions={availableSessions}
        availableTerms={availableTerms}
        selectedSession={params.session}
        selectedTerm={params.term}
        selectedLgaId={params.lgaId}
        searchTerm={params.search || ""}
        isSearching={isSearching}
        onSearchChange={updateSearch}
        onClearSearch={() => updateSearch("")}
        isSessionEnabled={isSessionEnabled}
        isTermEnabled={isTermEnabled}
        isLgaEnabled={isLgaEnabled}
        onSessionChange={selectSession}
        onTermChange={selectTerm}
        onLgaChange={selectLga}
        onClearFilters={clearFilters}
      />

      {/* 4. Step-Guided Schools Directory Table */}
      <SchoolsTable
        schools={schools}
        filterStage={filterStage}
        selectedSessionName={selectedSessionName}
        selectedTermName={selectedTermName}
        selectedLgaName={selectedLgaName}
        searchTerm={params.search}
        currentPage={pagination.page}
        totalPages={pagination.totalPages}
        totalItems={pagination.total}
        itemsPerPage={pagination.limit}
        isTableLoading={loading}
        isSearching={isSearching}
        onPageChange={changePage}
        onViewSchool={handleViewSchool}
        onEditSchool={handleEditSchool}
      />

      {/* 5. School Details Modal */}
      <SchoolDetailsDialog
        school={selectedSchool}
        isOpen={showDetailsDialog}
        onClose={() => {
          setShowDetailsDialog(false);
          setSelectedSchool(null);
        }}
        sessionName={selectedSessionName}
        termName={selectedTermName}
      />

      {/* 6. Add School Modal */}
      <AddSchoolDialog
        isOpen={showAddSchoolDialog}
        onClose={() => setShowAddSchoolDialog(false)}
        lgas={lgas}
        onSuccess={() => refetch()}
      />

      {/* 7. Edit School Slide-in Sheet */}
      <EditSchoolSheet
        school={selectedSchoolForEdit}
        isOpen={showEditSheet}
        onClose={() => {
          setShowEditSheet(false);
          setSelectedSchoolForEdit(null);
        }}
        lgas={lgas}
        onSuccess={() => refetch()}
      />

      {/* 8. Full-page Loading Modal with backdrop only during active filter changes */}
      <LoadingModal
        isOpen={
          loading &&
          !isSearching &&
          Boolean(params.lgaId || (params.session && params.session !== "CURRENT_SESSION") || (params.term && params.term !== "ALL_TERMS")) &&
          filterStage !== "idle"
        }
        title="Crunching Data..."
        message={
          params.lgaId
            ? `Fetching schools directory under ${selectedLgaName || "selected LGA"}...`
            : "Crunching schools directory data..."
        }
      />
    </div>
  );
};

export default SchoolsTab;
