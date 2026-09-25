"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  SearchableSelect,
  SearchableSelectOption,
} from "@/components/ui/searchable-select";
import { createClass } from "@/services/api/classes";
import { useEnrollmentMetadata, useEnrollmentLgaSchools } from "@/services/hooks/useEnrollment";
import { LocalGovernment, EnrollmentSchool } from "@/services/types/enrollment";
import { useSessions } from "@/services/hooks/useAcademic";
import { GRADE_OPTIONS } from "./ClassesFilters";
import { toast } from "react-hot-toast";
import {
  GraduationCap,
  School,
  MapPin,
  Users,
  Calendar,
  Layers,
  Loader2,
  Sparkles,
} from "lucide-react";

interface CreateClassDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialLgaId?: string;
  initialSchoolId?: string;
}

const SECTION_OPTIONS = ["A", "B", "C", "D", "E", "Gold", "Silver", "Diamond"];

export const CreateClassDialog: React.FC<CreateClassDialogProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialLgaId = "",
  initialSchoolId = "",
}) => {
  const [lgaId, setLgaId] = useState(initialLgaId);
  const [schoolId, setSchoolId] = useState(initialSchoolId);
  const [grade, setGrade] = useState("Primary 1");
  const [section, setSection] = useState("A");
  const [name, setName] = useState("Primary 1A");
  const [capacity, setCapacity] = useState("35");
  const [academicYear, setAcademicYear] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Metadata for LGAs
  const { data: enrollmentMetadata, loading: metadataLoading } = useEnrollmentMetadata();
  const lgas = useMemo(() => enrollmentMetadata?.localGovernments || [], [enrollmentMetadata]);

  // Schools under selected LGA
  const { data: lgaSchoolsData, loading: schoolsLoading } = useEnrollmentLgaSchools(lgaId);
  const schools = useMemo(() => lgaSchoolsData?.schools || [], [lgaSchoolsData]);

  // Academic sessions
  const { data: sessionsData } = useSessions();
  const sessions = useMemo(() => sessionsData?.data || [], [sessionsData]);

  // Set default active academic session
  useEffect(() => {
    if (!academicYear && sessions.length > 0) {
      const active = sessions.find((s) => s.isCurrent) || sessions[0];
      if (active) {
        setAcademicYear(active.name);
      }
    }
  }, [sessions, academicYear]);

  // Reset or initialize on open
  useEffect(() => {
    if (isOpen) {
      setLgaId(initialLgaId || "");
      setSchoolId(initialSchoolId || "");
      setGrade("Primary 1");
      setSection("A");
      setName("Primary 1A");
      setCapacity("35");
      setError(null);
    }
  }, [isOpen, initialLgaId, initialSchoolId]);

  // Auto-suggest name when Grade or Section changes
  const handleGradeChange = (newGrade: string) => {
    setGrade(newGrade);
    setName(`${newGrade} ${section}`.trim());
  };

  const handleSectionChange = (newSection: string) => {
    setSection(newSection);
    setName(`${grade} ${newSection}`.trim());
  };

  // LGA options for SearchableSelect
  const lgaOptions: SearchableSelectOption[] = useMemo(() => {
    return lgas.map((l: LocalGovernment) => ({
      value: l.id,
      label: l.name,
      description: "LGA in Abia State",
    }));
  }, [lgas]);

  // School options for SearchableSelect
  const schoolOptions: SearchableSelectOption[] = useMemo(() => {
    return schools.map((s: EnrollmentSchool) => ({
      value: s.id,
      label: s.name,
      description: s.code ? `Code: ${s.code}` : undefined,
    }));
  }, [schools]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!schoolId) {
      setError("Please select a school for this class.");
      return;
    }

    if (!name.trim()) {
      setError("Class name cannot be empty.");
      return;
    }

    const capNumber = parseInt(capacity, 10);
    if (isNaN(capNumber) || capNumber < 1) {
      setError("Please enter a valid student capacity (minimum 1).");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await createClass({
        name: name.trim(),
        grade: grade.trim(),
        section: section.trim() || "A",
        schoolId,
        capacity: capNumber,
        academicYear: academicYear || undefined,
      });

      if (res.success) {
        toast.success(`Class "${name.trim()}" created successfully!`);
        onSuccess?.();
        onClose();
      } else {
        setError(res.message || "Failed to create class.");
      }
    } catch (err: any) {
      console.error("Create class error:", err);
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "An unexpected error occurred while creating class.";
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !isSubmitting && !open && onClose()}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto p-0 border-gray-200">
        <form onSubmit={handleSubmit}>
          {/* Header */}
          <div className="bg-linear-to-r from-emerald-600 to-teal-700 p-6 text-white">
            <DialogHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 text-white" />
                </div>
                <div>
                  <DialogTitle className="text-lg font-bold text-white">
                    Create New Class
                  </DialogTitle>
                  <DialogDescription className="text-emerald-100 text-xs mt-0.5">
                    Register a new class section, assign capacity, and connect to a school
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>
          </div>

          <div className="p-6 space-y-5">
            {error && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-xs">
                {error}
              </div>
            )}

            {/* School & LGA Selection */}
            <div className="space-y-4 p-4 rounded-xl bg-gray-50/70 border border-gray-100">
              <div className="flex items-center gap-2 text-xs font-bold text-gray-800">
                <School className="w-3.5 h-3.5 text-brand-primary" />
                <span>School Information</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* LGA Select */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-gray-700">
                    Local Government Area *
                  </Label>
                  <SearchableSelect
                    options={lgaOptions}
                    value={lgaId}
                    onValueChange={(val) => {
                      setLgaId(val);
                      setSchoolId(""); // Reset school on LGA change
                    }}
                    placeholder={metadataLoading ? "Loading LGAs..." : "Select LGA"}
                    searchPlaceholder="Search LGA..."
                    emptyText="No matching LGA found"
                    triggerClassName="h-9 text-xs bg-white"
                  />
                </div>

                {/* School Select */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-gray-700">
                    School *
                  </Label>
                  <SearchableSelect
                    options={schoolOptions}
                    value={schoolId}
                    onValueChange={setSchoolId}
                    disabled={!lgaId || schoolsLoading || schools.length === 0}
                    isLoading={schoolsLoading && !!lgaId}
                    placeholder={
                      !lgaId
                        ? "Select LGA first"
                        : schoolsLoading
                        ? "Loading schools..."
                        : schools.length === 0
                        ? "No schools in this LGA"
                        : "Select school"
                    }
                    searchPlaceholder="Search school by name..."
                    emptyText="No matching school found"
                    triggerClassName="h-9 text-xs bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Class Details */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-gray-800">
                <Layers className="w-3.5 h-3.5 text-brand-primary" />
                <span>Class Details</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Grade */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-gray-700">
                    Grade Level *
                  </Label>
                  <Select value={grade} onValueChange={handleGradeChange}>
                    <SelectTrigger className="h-9 text-xs bg-white">
                      <SelectValue placeholder="Select Grade" />
                    </SelectTrigger>
                    <SelectContent className="max-h-60 text-xs">
                      {GRADE_OPTIONS.map((g) => (
                        <SelectItem key={g} value={g}>
                          {g}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Section */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-gray-700">
                    Section *
                  </Label>
                  <Select value={section} onValueChange={handleSectionChange}>
                    <SelectTrigger className="h-9 text-xs bg-white">
                      <SelectValue placeholder="Select Section" />
                    </SelectTrigger>
                    <SelectContent className="text-xs">
                      {SECTION_OPTIONS.map((sec) => (
                        <SelectItem key={sec} value={sec}>
                          Section {sec}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Class Name (Auto-suggested, customizable) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold text-gray-700">
                    Class Name *
                  </Label>
                  <span className="text-[10px] text-gray-400">
                    Auto-generated from Grade & Section
                  </span>
                </div>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Primary 1A"
                  className="h-9 text-xs bg-white"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Capacity */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-gray-700 flex items-center gap-1">
                    <Users className="w-3 h-3 text-brand-primary" />
                    <span>Student Capacity *</span>
                  </Label>
                  <Input
                    type="number"
                    min={1}
                    max={200}
                    value={capacity}
                    onChange={(e) => setCapacity(e.target.value)}
                    placeholder="35"
                    className="h-9 text-xs bg-white"
                    required
                  />
                  <p className="text-[10px] text-gray-400">
                    Standard recommended class capacity is 35 pupils
                  </p>
                </div>

                {/* Academic Session */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-gray-700 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-brand-primary" />
                    <span>Academic Year *</span>
                  </Label>
                  <Select value={academicYear} onValueChange={setAcademicYear}>
                    <SelectTrigger className="h-9 text-xs bg-white">
                      <SelectValue placeholder="Select Year" />
                    </SelectTrigger>
                    <SelectContent className="text-xs">
                      {sessions.map((s) => (
                        <SelectItem key={s.id} value={s.name}>
                          {s.name} {s.isCurrent ? "(Current)" : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <DialogFooter className="p-4 sm:p-6 bg-gray-50/80 border-t border-gray-100 flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="text-xs h-9"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !schoolId || !name.trim()}
              className="bg-brand-primary hover:bg-brand-primary-2 text-white text-xs h-9 gap-1.5"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Creating Class...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Create Class</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
