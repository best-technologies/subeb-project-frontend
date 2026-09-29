"use client";

import React, { useState } from "react";
import { useClasses } from "@/services/hooks/useClasses";
import { ClassesHeader } from "./ClassesHeader";
import { ClassesChartsSection } from "./charts/ClassesChartsSection";
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

  // Classes listing hook
  const {
    classes,
    pagination,
    loading,
    changePage,
    refetch,
  } = useClasses();

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

      {/* Classes Table */}
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
