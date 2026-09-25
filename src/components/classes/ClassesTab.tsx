"use client";

import React, { useState, useMemo } from "react";
import { useClasses } from "@/services/hooks/useClasses";
import { useEnrollmentMetadata, useEnrollmentLgaSchools } from "@/services/hooks/useEnrollment";
import { ClassesHeader } from "./ClassesHeader";
import { ClassesChartsSection } from "./charts/ClassesChartsSection";
import { ClassesFilters } from "./ClassesFilters";
import { ClassesTable } from "./ClassesTable";
import { CreateClassDialog } from "./CreateClassDialog";
import { ClassDetailsDialog } from "./ClassDetailsDialog";
import { EditClassModal } from "./EditClassModal";
import { ClassItem } from "@/services/types/classResponse";

export const ClassesTab: React.FC = () => {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedClassForDetails, setSelectedClassForDetails] = useState<ClassItem | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [selectedClassForEdit, setSelectedClassForEdit] = useState<ClassItem | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // Classes listing & search hook
  const {
    classes,
    pagination,
    params,
    loading,
    isSearching,
    selectLga,
    selectSchool,
    selectGrade,
    updateSearch,
    changePage,
    clearFilters,
    refetch,
  } = useClasses();

  // LGAs metadata
  const { data: enrollmentMetadata } = useEnrollmentMetadata();
  const lgas = useMemo(() => enrollmentMetadata?.localGovernments || [], [enrollmentMetadata]);

  // Schools for current LGA filter
  const { data: lgaSchoolsData } = useEnrollmentLgaSchools(params.lgaId || "");
  const schools = useMemo(() => lgaSchoolsData?.schools || [], [lgaSchoolsData]);

  const handleViewClass = (cls: ClassItem) => {
    setSelectedClassForDetails(cls);
    setShowDetailsDialog(true);
  };

  const handleEditClass = (cls: ClassItem) => {
    setSelectedClassForEdit(cls);
    setShowEditModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <ClassesHeader onAddClass={() => setShowCreateDialog(true)} />

      {/* Analytics Section with KPIs, Grade Distribution, LGA Distribution, and Capacity Utilization */}
      <ClassesChartsSection />

      {/* Filters & Search */}
      <ClassesFilters
        lgas={lgas}
        schools={schools}
        selectedLgaId={params.lgaId}
        selectedSchoolId={params.schoolId}
        selectedGrade={params.grade}
        searchTerm={params.search || ""}
        isSearching={isSearching}
        onSearchChange={updateSearch}
        onClearSearch={() => updateSearch("")}
        onLgaChange={(lgaId, lgaName) => selectLga(lgaId, lgaName)}
        onSchoolChange={(schoolId, schoolName) => selectSchool(schoolId, schoolName)}
        onGradeChange={selectGrade}
        onClearFilters={clearFilters}
      />

      {/* Classes Directory Table */}
      <ClassesTable
        classes={classes}
        pagination={pagination}
        loading={loading}
        onPageChange={changePage}
        onViewClass={handleViewClass}
        onEditClass={handleEditClass}
      />

      {/* Create Class Dialog */}
      <CreateClassDialog
        isOpen={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        onSuccess={() => {
          refetch();
        }}
        initialLgaId={params.lgaId}
        initialSchoolId={params.schoolId}
      />

      {/* Class Details Dialog */}
      <ClassDetailsDialog
        cls={selectedClassForDetails}
        isOpen={showDetailsDialog}
        onClose={() => {
          setShowDetailsDialog(false);
          setSelectedClassForDetails(null);
        }}
      />

      {/* Edit Class Modal */}
      <EditClassModal
        cls={selectedClassForEdit}
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedClassForEdit(null);
        }}
        onSuccess={() => {
          refetch();
        }}
      />
    </div>
  );
};

export default ClassesTab;
