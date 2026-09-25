"use client";
import React, { useState, useMemo, useRef } from "react";
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  TrashIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import { SquarePen, Camera, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { LoadingModal } from "@/components/ui/LoadingModal";
import { Dialog } from "@/components/ui/custom-dialog";
import {
  SearchableSelect,
  type SearchableSelectOption,
} from "@/components/ui/searchable-select";
import { cn } from "@/lib/utils";
import { enrollStudents } from "@/services/api/enrollment";
import {
  useEnrollmentMetadata,
  useEnrollmentLgaSchools,
  useEnrollmentSchoolClasses,
} from "@/services/hooks/useEnrollment";
import { useSessions, useTerms } from "@/services/hooks/useAcademic";
import type { EnrolledStudent } from "@/services/types/enrollment";
import { uploadApi } from "@/services/api/upload";

// Helper to format term name
const formatTermName = (termName: string): string => {
  if (termName.includes("FIRST")) return "First";
  if (termName.includes("SECOND")) return "Second";
  if (termName.includes("THIRD")) return "Third";
  return termName;
};

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0]?.toUpperCase())
    .join("")
    .slice(0, 2);
}

interface StudentFormData {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: "MALE" | "FEMALE" | "";
  schoolId: string;
  classId: string;
  className: string;
  profilePicture?: string;
}

const initialStudentState: StudentFormData = {
  firstName: "",
  lastName: "",
  dateOfBirth: "",
  gender: "",
  schoolId: "",
  classId: "",
  className: "",
  profilePicture: "",
};

export default function EnrolStudentPage() {
  const [sessionId, setSessionId] = useState("");
  const [session, setSession] = useState("2024/2025");
  const [termId, setTermId] = useState("");
  const [term, setTerm] = useState("First");
  const [school, setSchool] = useState("");
  const [schoolId, setSchoolId] = useState("");
  const [lgaValue, setLgaValue] = useState("");
  const [lgaId, setLgaId] = useState("");
  const [student, setStudent] = useState<StudentFormData>(initialStudentState);
  const [students, setStudents] = useState<StudentFormData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [activeTab, setActiveTab] = useState<"session" | "student" | "review">(
    "session"
  );
  const [showNavigationWarning, setShowNavigationWarning] = useState(false);
  const [pendingTab, setPendingTab] = useState<
    "session" | "student" | "review" | null
  >(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [enrolledStudents, setEnrolledStudents] = useState<EnrolledStudent[]>(
    []
  );
  const [showEnrollmentSuccess, setShowEnrollmentSuccess] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Warning dialog state for selecting non-current session/term
  const [showAcademicWarning, setShowAcademicWarning] = useState(false);
  const [pendingAcademicChange, setPendingAcademicChange] = useState<{
    type: "session" | "term";
    id: string;
    name: string;
  } | null>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (e.g. max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be less than 5MB");
      setShowToast(true);
      return;
    }

    try {
      setIsUploadingImage(true);
      const data = await uploadApi.uploadImage(file);
      setStudent(prev => ({ ...prev, profilePicture: data.url }));
      setSuccess("Profile picture uploaded!");
      setShowToast(true);
    } catch (err) {
      setError("Failed to upload image. Please try again.");
      setShowToast(true);
    } finally {
      setIsUploadingImage(false);
    }
  };

  // Fetch enrollment metadata, schools, and classes
  const {
    data: enrollmentMetadata,
    loading: metadataLoading,
    error: metadataError,
  } = useEnrollmentMetadata();

  // Fetch available sessions and terms from academic management
  const { data: sessionsData, isLoading: sessionsLoading } = useSessions();
  const { data: termsData, isLoading: termsLoading } = useTerms(
    sessionId || undefined
  );

  const availableSessions = useMemo(
    () => sessionsData?.data || [],
    [sessionsData]
  );

  const availableTerms = useMemo(
    () => termsData?.data || [],
    [termsData]
  );

  // Identify current active session and term
  const currentSession = useMemo(() => {
    return (
      availableSessions.find((s) => s.isCurrent) ||
      (enrollmentMetadata?.currentSession
        ? {
            id: enrollmentMetadata.currentSession.id,
            name: enrollmentMetadata.currentSession.name,
            isCurrent: true,
            status: "OPEN" as const,
            createdAt: "",
          }
        : null)
    );
  }, [availableSessions, enrollmentMetadata]);

  const currentTerm = useMemo(() => {
    return (
      availableTerms.find((t) => t.isCurrent) ||
      (enrollmentMetadata?.currentTerm
        ? {
            id: enrollmentMetadata.currentTerm.id,
            name: enrollmentMetadata.currentTerm.name,
            sessionId: enrollmentMetadata.currentTerm.sessionId,
            isCurrent: true,
            status: "OPEN" as const,
            createdAt: "",
          }
        : null)
    );
  }, [availableTerms, enrollmentMetadata]);

  const {
    data: lgaSchoolsData,
    loading: schoolsLoading,
    error: schoolsError,
  } = useEnrollmentLgaSchools(lgaId);

  const {
    data: schoolClassesData,
    loading: classesLoading,
    error: classesError,
  } = useEnrollmentSchoolClasses(schoolId);

  // Initialize session and term from current active session/term or metadata
  React.useEffect(() => {
    if (currentSession && !sessionId) {
      setSessionId(currentSession.id);
      setSession(currentSession.name);
    }
  }, [currentSession, sessionId]);

  React.useEffect(() => {
    if (currentTerm && !termId) {
      setTermId(currentTerm.id);
      setTerm(formatTermName(currentTerm.name));
    }
  }, [currentTerm, termId]);

  // When terms load for a selected session, if current term is not in list, auto-select current or first
  React.useEffect(() => {
    if (availableTerms.length > 0) {
      const match = availableTerms.find((t) => t.id === termId);
      if (!match) {
        const defaultTerm =
          availableTerms.find((t) => t.isCurrent) ||
          availableTerms.find((t) => t.status === "OPEN") ||
          availableTerms[0];
        if (defaultTerm) {
          setTermId(defaultTerm.id);
          setTerm(formatTermName(defaultTerm.name));
        }
      }
    }
  }, [availableTerms, termId]);

  // Extract data
  const lgas = useMemo(
    () => enrollmentMetadata?.localGovernments || [],
    [enrollmentMetadata]
  );

  const schools = useMemo(
    () => lgaSchoolsData?.schools || [],
    [lgaSchoolsData]
  );

  const classes = useMemo(
    () => schoolClassesData?.classes || [],
    [schoolClassesData]
  );

  // Searchable select options for LGAs and Schools
  const lgaOptions = useMemo<SearchableSelectOption[]>(
    () =>
      lgas.map((lga: { id: string; name: string; totalSchools: number }) => ({
        value: lga.id,
        label: lga.name,
        badge: lga.totalSchools,
      })),
    [lgas]
  );

  const schoolOptions = useMemo<SearchableSelectOption[]>(
    () =>
      schools.map((s: { id: string; name: string; totalClasses: number }) => ({
        value: s.id,
        label: s.name,
        badge: s.totalClasses,
      })),
    [schools]
  );

  // Reset school selection when LGA changes
  React.useEffect(() => {
    if (lgaId) {
      setSchool("");
      setSchoolId("");
    }
  }, [lgaId]);

  // Reset class selection when school changes
  React.useEffect(() => {
    if (schoolId) {
      setStudent((prev) => ({ ...prev, classId: "", className: "" }));
    }
  }, [schoolId]);

  // Handle API errors
  React.useEffect(() => {
    if (metadataError || schoolsError || classesError) {
      setError(metadataError || schoolsError || classesError);
      setShowToast(true);
    }
  }, [metadataError, schoolsError, classesError]);

  // Auto-dismiss success modal after 5 seconds
  React.useEffect(() => {
    if (showSuccessModal) {
      const timer = setTimeout(() => {
        setShowSuccessModal(false);
        setSuccessMessage("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [showSuccessModal]);

  // Show success modal when schools are loaded
  React.useEffect(() => {
    if (lgaSchoolsData && !schoolsLoading && lgaId) {
      setSuccessMessage(
        `Successfully loaded ${lgaSchoolsData.schools.length} schools`
      );
      setShowSuccessModal(true);
    }
  }, [lgaSchoolsData, schoolsLoading, lgaId]);

  // Show success modal when classes are loaded
  React.useEffect(() => {
    if (schoolClassesData && !classesLoading && schoolId) {
      setSuccessMessage(
        `Successfully loaded ${schoolClassesData.classes.length} classes`
      );
      setShowSuccessModal(true);
    }
  }, [schoolClassesData, classesLoading, schoolId]);

  const handleSessionChange = (newSessionId: string) => {
    if (newSessionId === sessionId) return;

    const selectedSessionObj = availableSessions.find((s) => s.id === newSessionId);
    if (!selectedSessionObj) return;

    const isCurrent = Boolean(
      selectedSessionObj.isCurrent ||
      (currentSession && selectedSessionObj.id === currentSession.id)
    );

    if (!isCurrent) {
      setPendingAcademicChange({
        type: "session",
        id: selectedSessionObj.id,
        name: selectedSessionObj.name,
      });
      setShowAcademicWarning(true);
    } else {
      setSessionId(selectedSessionObj.id);
      setSession(selectedSessionObj.name);
      setTermId("");
      setTerm("");
    }
  };

  const handleTermChange = (newTermId: string) => {
    if (newTermId === termId) return;

    const selectedTermObj = availableTerms.find((t) => t.id === newTermId);
    const termName = selectedTermObj ? formatTermName(selectedTermObj.name) : newTermId;

    const isSessionCurrent = Boolean(
      currentSession && sessionId === currentSession.id
    );
    const isTermCurrent = Boolean(
      selectedTermObj?.isCurrent ||
      (currentTerm && selectedTermObj?.id === currentTerm.id)
    );

    if (!isSessionCurrent || !isTermCurrent) {
      setPendingAcademicChange({
        type: "term",
        id: newTermId,
        name: termName,
      });
      setShowAcademicWarning(true);
    } else {
      setTermId(newTermId);
      setTerm(termName);
    }
  };

  const handleConfirmAcademicChange = () => {
    if (!pendingAcademicChange) return;

    if (pendingAcademicChange.type === "session") {
      setSessionId(pendingAcademicChange.id);
      setSession(pendingAcademicChange.name);
      setTermId("");
      setTerm("");
    } else if (pendingAcademicChange.type === "term") {
      setTermId(pendingAcademicChange.id);
      setTerm(pendingAcademicChange.name);
    }

    setShowAcademicWarning(false);
    setPendingAcademicChange(null);
  };

  const handleCancelAcademicChange = () => {
    setShowAcademicWarning(false);
    setPendingAcademicChange(null);
  };

  const handleStudentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setStudent((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    if (name === "class") {
      const selectedClass = classes.find((c) => c.id === value);
      if (selectedClass) {
        setStudent((prev) => ({
          ...prev,
          classId: selectedClass.id,
          className: selectedClass.name,
          schoolId: schoolId,
        }));
      }
    } else if (name === "gender") {
      setStudent((prev) => ({ ...prev, gender: value as "MALE" | "FEMALE" }));
    } else {
      setStudent((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleLgaChange = (value: string) => {
    const selectedLga = lgas.find((lga) => lga.id === value);
    if (selectedLga) {
      setLgaValue(selectedLga.name);
      setLgaId(selectedLga.id);
    }
  };

  const handleSchoolChange = (value: string) => {
    const selectedSchool = schools.find((s) => s.id === value);
    if (selectedSchool) {
      setSchool(selectedSchool.name);
      setSchoolId(selectedSchool.id);
    }
  };

  const validateStudent = (): boolean => {
    if (
      !student.firstName ||
      !student.lastName ||
      !student.dateOfBirth ||
      !student.gender ||
      !student.classId
    ) {
      setError("Please fill all required fields.");
      setSuccess(null);
      setShowToast(true);
      return false;
    }

    // Validate date of birth
    const birthDate = new Date(student.dateOfBirth);
    const today = new Date();
    const minDate = new Date(
      today.getFullYear() - 25,
      today.getMonth(),
      today.getDate()
    );
    const maxDate = new Date(
      today.getFullYear() - 3,
      today.getMonth(),
      today.getDate()
    );

    if (birthDate < minDate || birthDate > maxDate) {
      setError("Student must be between 3 and 25 years old.");
      setSuccess(null);
      setShowToast(true);
      return false;
    }

    // Check if student already added
    const isDuplicate = students.some(
      (s) =>
        s.firstName.toLowerCase() === student.firstName.toLowerCase() &&
        s.lastName.toLowerCase() === student.lastName.toLowerCase() &&
        s.dateOfBirth === student.dateOfBirth
    );
    if (isDuplicate) {
      setError("This student has already been added.");
      setSuccess(null);
      setShowToast(true);
      return false;
    }

    return true;
  };

  const handleAddStudent = () => {
    if (!validateStudent()) return;

    setStudents((prev) => [...prev, { ...student, schoolId: schoolId }]);
    setStudent({
      ...initialStudentState,
      classId: student.classId,
      className: student.className,
      schoolId: schoolId,
    });
    setError(null);
    setSuccess("Student added successfully!");
    setShowToast(true);
  };

  const handleEditStudent = (index: number) => {
    const studentToEdit = students[index];
    setStudent(studentToEdit);
    setStudents((prev) => prev.filter((_, i) => i !== index));
    setSuccess("Student loaded for editing.");
    setShowToast(true);
  };

  const handleRemoveStudent = (index: number) => {
    setStudents((prev) => prev.filter((_, i) => i !== index));
    setSuccess("Student removed.");
    setError(null);
    setShowToast(true);
  };

  const canProceedToStudent = session && term && school && lgaValue;
  const canProceedToReview = students.length > 0;

  const handleTabChange = (tab: "session" | "student" | "review") => {
    if (activeTab === "review" && students.length > 0 && tab === "session") {
      setPendingTab(tab);
      setShowNavigationWarning(true);
    } else {
      setActiveTab(tab);
    }
  };

  const handleConfirmNavigation = () => {
    setStudents([]);
    setStudent(initialStudentState);
    setShowNavigationWarning(false);
    if (pendingTab) {
      setActiveTab(pendingTab);
      setPendingTab(null);
    }
  };

  const handleCancelNavigation = () => {
    setShowNavigationWarning(false);
    setPendingTab(null);
  };

  const handleSubmitEnrollment = async () => {
    try {
      setIsSubmitting(true);
      setError(null);

      const enrollmentData = students.map((s) => ({
        firstName: s.firstName,
        lastName: s.lastName,
        dateOfBirth: s.dateOfBirth,
        gender: s.gender as "MALE" | "FEMALE",
        schoolId: s.schoolId,
        classId: s.classId,
      }));

      const response = await enrollStudents({ students: enrollmentData });

      if (response.success && response.data) {
        setEnrolledStudents(response.data);
        setShowEnrollmentSuccess(true);
        setStudents([]);
        setStudent(initialStudentState);
        setActiveTab("session");
        // Note: LGA and School will be cleared when dialog closes
      } else {
        setError(response.message || "Failed to enroll students");
        setShowToast(true);
      }
    } catch (err: unknown) {
      const error = err as { message?: string };
      setError(error.message || "Failed to enroll students. Please try again.");
      setShowToast(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  React.useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => setShowToast(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Submission Loading & Confirmation Dialogs */}
      <LoadingModal
        isOpen={isSubmitting}
        title="Processing Enrollment..."
        message="Enrolling students..."
      />

      {/* Success Modal with Auto-Dismiss */}
      <LoadingModal
        isOpen={showSuccessModal}
        title="Success"
        message={successMessage}
      />

      {/* Navigation Warning Dialog */}
      <Dialog
        open={showNavigationWarning}
        onOpenChange={handleCancelNavigation}
        showCloseButton={false}
      >
        <div className="p-6">
          <div className="flex items-start gap-3 mb-4">
            <ExclamationCircleIcon className="w-6 h-6 text-amber-500 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-semibold text-brand-black mb-2">
                Unsaved Changes Warning
              </h3>
              <p className="text-sm text-brand-black-accent mb-3">
                You have {students.length} student
                {students.length !== 1 ? "s" : ""} that haven&apos;t been
                submitted yet. If you navigate away now, all entered data will
                be lost.
              </p>
              <p className="text-sm text-brand-black-accent">
                If you want to make changes, please close this dialog and go
                back to the{" "}
                <span className="font-medium">&quot;2. Add Students&quot;</span>{" "}
                tab instead.
              </p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 mt-6">
            <Button
              onClick={handleCancelNavigation}
              variant="outline"
              className="flex-1 order-2 sm:order-1"
            >
              Close Dialog
            </Button>
            <Button
              onClick={handleConfirmNavigation}
              className="flex-1 text-white order-1 sm:order-2 bg-destructive hover:bg-destructive/90"
            >
              Clear All & Go Back
            </Button>
          </div>
        </div>
      </Dialog>

      {/* Non-Current Academic Period Warning Dialog */}
      <Dialog
        open={showAcademicWarning}
        onOpenChange={handleCancelAcademicChange}
        showCloseButton={false}
      >
        <div className="p-6">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0 text-amber-600">
              <ExclamationCircleIcon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-brand-black mb-1">
                {pendingAcademicChange?.type === "session"
                  ? "Non-Current Academic Session Selected"
                  : "Non-Current Academic Term Selected"}
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                {pendingAcademicChange?.type === "session"
                  ? `You are selecting the academic session "${pendingAcademicChange.name}", which is not the current active session (${currentSession?.name || "active session"}).`
                  : `You are selecting "${pendingAcademicChange?.name} Term", which is not the current active term (${currentTerm ? `${formatTermName(currentTerm.name)} Term` : "active term"}).`}
              </p>
              <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-lg text-xs text-amber-900 mb-1">
                <p className="font-semibold mb-1">Confirmation Required:</p>
                <p>
                  Enrolling students into a previous or future academic period will record their enrollment under that specific session and term. Once you confirm, you can proceed through the form and submit this batch as usual.
                </p>
              </div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 mt-6">
            <Button
              type="button"
              onClick={handleCancelAcademicChange}
              variant="outline"
              className="flex-1 order-2 sm:order-1"
            >
              Cancel & Keep Current
            </Button>
            <Button
              type="button"
              onClick={handleConfirmAcademicChange}
              className="flex-1 text-white order-1 sm:order-2 bg-amber-600 hover:bg-amber-700"
            >
              Confirm & Proceed
            </Button>
          </div>
        </div>
      </Dialog>

      {/* Enrollment Success Dialog */}
      <Dialog
        open={showEnrollmentSuccess}
        onOpenChange={() => setShowEnrollmentSuccess(false)}
      >
        <div className="p-6 max-h-[80vh] overflow-y-auto">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-brand-primary/10 rounded-full flex items-center justify-center">
              <CheckCircleIcon className="w-8 h-8 text-brand-primary" />
            </div>
          </div>

          <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">
            Enrollment Successful!
          </h2>
          <p className="text-center text-gray-600 mb-6">
            {enrolledStudents.length} student
            {enrolledStudents.length > 1 ? "s" : ""} enrolled successfully
          </p>

          <div className="space-y-4 mb-6">
            {enrolledStudents.map((s, index) => (
              <div
                key={s.id}
                className="border border-gray-200 rounded-lg p-4 bg-gray-50"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {s.firstName} {s.lastName}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Student ID: {s.studentId}
                    </p>
                  </div>
                  <span className="bg-brand-primary text-white px-3 py-1 rounded-full text-xs font-medium">
                    #{index + 1}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-600">Username:</span>
                    <p className="font-medium text-gray-900">
                      {s.user.username}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600">Gender:</span>
                    <p className="font-medium text-gray-900">{s.gender}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={() => {
                const studentData = enrolledStudents
                  .map(
                    (s, i) =>
                      `${i + 1}. ${s.firstName} ${s.lastName}\n` +
                      `   Student ID: ${s.studentId}\n` +
                      `   Username: ${s.user.username}\n` +
                      `   Gender: ${s.gender}\n`
                  )
                  .join("\n");

                const blob = new Blob([studentData], { type: "text/plain" });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `enrolled-students-${
                  new Date().toISOString().split("T")[0]
                }.txt`;
                a.click();
                window.URL.revokeObjectURL(url);
              }}
              variant="outline"
              className="flex-1"
            >
              Download Details
            </Button>
            <Button
              onClick={() => {
                setShowEnrollmentSuccess(false);
                // Clear all fields except session and term
                setLgaValue("");
                setLgaId("");
                setSchool("");
                setSchoolId("");
              }}
              className="flex-1 bg-brand-primary"
            >
              Close
            </Button>
          </div>
        </div>
      </Dialog>

      {/* Toast Notification */}
      {showToast && (error || success) && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 text-white font-medium ${
            error ? "bg-destructive" : "bg-brand-primary"
          }`}
        >
          {error ? (
            <ExclamationCircleIcon className="w-5 h-5" />
          ) : (
            <CheckCircleIcon className="w-5 h-5" />
          )}
          {error || success}
        </div>
      )}

      <div className="w-full px-2 sm:px-4 md:px-6 lg:px-8 pt-2 sm:pt-4 pb-12">
        {/* Page Title */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-brand-black mb-1 sm:mb-2">
            Student Enrollment
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-brand-black-accent">
            Add and register new students into the ASUBEB system
          </p>
        </div>

        {/* 3 Steps Side-by-Side Sharing Full Width */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* =========================================
              COLUMN 1: Step 1 - Session Information
             ========================================= */}
          <div
            className={`rounded-xl border transition-all duration-200 ${
              activeTab === "session"
                ? "bg-white border-brand-primary shadow-md ring-1 ring-brand-primary/20"
                : "bg-white border-gray-200/90 shadow-xs"
            } p-5 sm:p-6 flex flex-col justify-between`}
          >
            <div>
              {/* Header / Tab */}
              <div
                onClick={() => canProceedToStudent && handleTabChange("session")}
                className={`flex items-center justify-between pb-4 border-b border-gray-100 ${
                  activeTab !== "session" && canProceedToStudent
                    ? "cursor-pointer group"
                    : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                      activeTab === "session"
                        ? "bg-brand-primary text-white shadow-xs"
                        : canProceedToStudent
                        ? "bg-emerald-100 text-brand-primary"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {activeTab !== "session" && canProceedToStudent ? (
                      <Check className="w-4 h-4 text-brand-primary stroke-[2.5]" />
                    ) : (
                      "1"
                    )}
                  </div>
                  <div>
                    <h2
                      className={`font-semibold text-base transition-colors ${
                        activeTab === "session"
                          ? "text-brand-primary"
                          : "text-gray-900 group-hover:text-brand-primary"
                      }`}
                    >
                      1. Session Info
                    </h2>
                    <p className="text-xs text-gray-500">
                      Session, term, LGA & school
                    </p>
                  </div>
                </div>

                {activeTab === "session" ? (
                  <span className="text-[11px] bg-brand-primary/10 text-brand-primary px-2.5 py-0.5 rounded-full font-medium">
                    Active
                  </span>
                ) : canProceedToStudent ? (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTabChange("session");
                    }}
                    className="text-[11px] text-brand-primary bg-emerald-50 hover:bg-emerald-100 px-2.5 py-0.5 rounded-full font-medium border border-emerald-200/60 flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <SquarePen className="w-3 h-3" />
                    Edit
                  </button>
                ) : null}
              </div>

              {/* Form Fields Stacked in 1 Column */}
              <div
                className={`space-y-4 pt-4 transition-opacity duration-200 ${
                  activeTab !== "session"
                    ? "opacity-60 pointer-events-none select-none"
                    : ""
                }`}
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-medium text-brand-black-accent">
                      Academic Session
                    </Label>
                    {sessionId && currentSession && sessionId !== currentSession.id && (
                      <span className="text-[10px] text-amber-600 font-semibold bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                        Non-Current
                      </span>
                    )}
                  </div>
                  <Select
                    value={sessionId || undefined}
                    onValueChange={handleSessionChange}
                    disabled={sessionsLoading && availableSessions.length === 0}
                  >
                    <SelectTrigger className="focus:ring-brand-primary hover:border-brand-primary/40 bg-white">
                      <SelectValue placeholder="Select session">
                        {session || "Select session"}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="border-brand-primary/20 text-brand-primary max-h-60">
                      {availableSessions.length > 0 ? (
                        availableSessions.map((s) => (
                          <SelectItem
                            key={s.id}
                            value={s.id}
                            className="focus:bg-brand-primary/10 focus:text-brand-primary hover:bg-brand-primary/5 data-[state=checked]:text-brand-primary [&>span>svg]:text-brand-primary"
                          >
                            <div className="flex items-center justify-between w-full gap-2">
                              <span>{s.name}</span>
                              {s.isCurrent ? (
                                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-full font-semibold">
                                  Current
                                </span>
                              ) : (
                                <span className="text-[10px] text-gray-400">
                                  {s.status}
                                </span>
                              )}
                            </div>
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem
                          value={sessionId || "default"}
                          className="focus:bg-brand-primary/10 focus:text-brand-primary hover:bg-brand-primary/5 data-[state=checked]:text-brand-primary [&>span>svg]:text-brand-primary"
                        >
                          {session || "Loading sessions..."}
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  {sessionsLoading && (
                    <p className="text-[11px] text-gray-500">Loading sessions...</p>
                  )}
                  {metadataError && (
                    <p className="text-[11px] text-red-500">{metadataError}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-medium text-brand-black-accent">
                      Term
                    </Label>
                    {termId && currentTerm && termId !== currentTerm.id && (
                      <span className="text-[10px] text-amber-600 font-semibold bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                        Non-Current
                      </span>
                    )}
                  </div>
                  <Select
                    value={termId || term || undefined}
                    onValueChange={handleTermChange}
                    disabled={!sessionId || (termsLoading && availableTerms.length === 0)}
                  >
                    <SelectTrigger className="focus:ring-brand-primary hover:border-brand-primary/40 bg-white">
                      <SelectValue placeholder="Select term">
                        {term ? `${term} Term` : "Select term"}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="border-brand-primary/20 text-brand-primary">
                      {availableTerms.length > 0 ? (
                        availableTerms.map((t) => (
                          <SelectItem
                            key={t.id}
                            value={t.id}
                            className="focus:bg-brand-primary/10 focus:text-brand-primary hover:bg-brand-primary/5 data-[state=checked]:text-brand-primary [&>span>svg]:text-brand-primary"
                          >
                            <div className="flex items-center justify-between w-full gap-2">
                              <span>{formatTermName(t.name)} Term</span>
                              {t.isCurrent && (
                                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-full font-semibold">
                                  Current
                                </span>
                              )}
                            </div>
                          </SelectItem>
                        ))
                      ) : (
                        ["First", "Second", "Third"].map((tName) => (
                          <SelectItem
                            key={tName}
                            value={tName}
                            className="focus:bg-brand-primary/10 focus:text-brand-primary hover:bg-brand-primary/5 data-[state=checked]:text-brand-primary [&>span>svg]:text-brand-primary"
                          >
                            {tName} Term
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  {termsLoading && (
                    <p className="text-[11px] text-gray-500">Loading terms...</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-brand-black-accent">
                    Local Government Area
                  </Label>
                  <SearchableSelect
                    options={lgaOptions}
                    value={lgaId}
                    onValueChange={handleLgaChange}
                    placeholder="Select LGA"
                    searchPlaceholder="Search LGA by name..."
                    emptyText="No LGA found."
                    triggerClassName="focus:ring-brand-primary hover:border-brand-primary/40 bg-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-brand-black-accent">
                    School
                  </Label>
                  <SearchableSelect
                    options={schoolOptions}
                    value={schoolId}
                    onValueChange={handleSchoolChange}
                    disabled={!lgaId || schoolsLoading || schools.length === 0}
                    isLoading={schoolsLoading && !!lgaId}
                    placeholder={
                      !lgaId
                        ? "Select LGA first"
                        : schoolsLoading
                        ? "Loading schools..."
                        : schools.length === 0
                        ? "No schools available"
                        : "Select school"
                    }
                    searchPlaceholder="Search school by name..."
                    emptyText={
                      !lgaId
                        ? "Please select an LGA first"
                        : schoolsLoading
                        ? "Loading schools in selected LGA..."
                        : schools.length === 0
                        ? "No schools in this LGA"
                        : "No matching school found."
                    }
                    triggerClassName={cn(
                      "focus:ring-brand-primary hover:border-brand-primary/40 bg-white",
                      !lgaId && "opacity-50"
                    )}
                  />
                </div>
              </div>
            </div>

            {/* Bottom Action Button */}
            <div className="pt-5 mt-6 border-t border-gray-100">
              {activeTab === "session" ? (
                <Button
                  type="button"
                  onClick={() =>
                    canProceedToStudent && handleTabChange("student")
                  }
                  disabled={!canProceedToStudent}
                  className="w-full bg-brand-primary text-white text-sm py-2.5 shadow-sm"
                >
                  Continue to Add Students
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleTabChange("session")}
                  className="w-full text-xs text-brand-primary border-brand-primary/30 hover:bg-brand-primary/5"
                >
                  Revert to Edit Session
                </Button>
              )}
            </div>
          </div>

          {/* =========================================
              COLUMN 2: Step 2 - Add Students
             ========================================= */}
          <div
            className={`rounded-xl border transition-all duration-200 ${
              !canProceedToStudent
                ? "bg-gray-50/70 border-gray-200 opacity-60"
                : activeTab === "student"
                ? "bg-white border-brand-primary shadow-md ring-1 ring-brand-primary/20"
                : "bg-white border-gray-200/90 shadow-xs"
            } p-5 sm:p-6 flex flex-col justify-between`}
          >
            <div>
              {/* Header / Tab */}
              <div
                onClick={() =>
                  canProceedToStudent && handleTabChange("student")
                }
                className={`flex items-center justify-between pb-4 border-b border-gray-100 ${
                  canProceedToStudent && activeTab !== "student"
                    ? "cursor-pointer group"
                    : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                      !canProceedToStudent
                        ? "bg-gray-200 text-gray-400"
                        : activeTab === "student"
                        ? "bg-brand-primary text-white shadow-xs"
                        : students.length > 0
                        ? "bg-emerald-100 text-brand-primary"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {students.length > 0 && activeTab === "review" ? (
                      <Check className="w-4 h-4 text-brand-primary stroke-[2.5]" />
                    ) : (
                      "2"
                    )}
                  </div>
                  <div>
                    <h2
                      className={`font-semibold text-base transition-colors ${
                        !canProceedToStudent
                          ? "text-gray-400"
                          : activeTab === "student"
                          ? "text-brand-primary"
                          : "text-gray-900 group-hover:text-brand-primary"
                      }`}
                    >
                      2. Add Students
                    </h2>
                    <p
                      className={`text-xs ${
                        !canProceedToStudent ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      {students.length} student
                      {students.length !== 1 ? "s" : ""} added
                    </p>
                  </div>
                </div>

                {!canProceedToStudent ? (
                  <span className="text-[11px] bg-gray-100 text-gray-400 px-2.5 py-0.5 rounded-full font-medium">
                    Locked
                  </span>
                ) : activeTab === "student" ? (
                  <span className="text-[11px] bg-brand-primary/10 text-brand-primary px-2.5 py-0.5 rounded-full font-medium">
                    Active
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTabChange("student");
                    }}
                    className="text-[11px] text-brand-primary bg-emerald-50 hover:bg-emerald-100 px-2.5 py-0.5 rounded-full font-medium border border-emerald-200/60 flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <SquarePen className="w-3 h-3" />
                    Edit
                  </button>
                )}
              </div>

              {/* Form Fields Stacked in 1 Column */}
              <div
                className={`space-y-3.5 pt-4 transition-opacity duration-200 ${
                  !canProceedToStudent || activeTab !== "student"
                    ? "opacity-60 pointer-events-none select-none"
                    : ""
                }`}
              >
                {/* Photo Upload */}
                <div className="flex items-center gap-3 pb-1">
                  <div className="relative">
                    <div className="w-14 h-14 rounded-full border-2 border-brand-primary/20 bg-brand-primary/5 flex items-center justify-center overflow-hidden">
                      {student.profilePicture ? (
                        <img
                          src={student.profilePicture}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Camera className="w-6 h-6 text-brand-primary/40" />
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploadingImage || activeTab !== "student"}
                      className="absolute -bottom-1 -right-1 bg-brand-primary text-white p-1 rounded-full shadow-sm hover:bg-brand-primary/90 disabled:opacity-50"
                      title="Upload profile picture"
                    >
                      {isUploadingImage ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <PlusIcon className="w-3 h-3" />
                      )}
                    </button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageUpload}
                      accept="image/png, image/jpeg"
                      className="hidden"
                    />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-brand-black">
                      Profile Photo
                    </p>
                    <p className="text-[11px] text-gray-500">
                      Optional • Max 5MB
                    </p>
                  </div>
                </div>

                {/* Class */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-brand-black-accent">
                    Class *
                  </Label>
                  <Select
                    value={student.classId}
                    onValueChange={(val) => handleSelectChange("class", val)}
                    disabled={classesLoading || classes.length === 0}
                  >
                    <SelectTrigger className="focus:ring-brand-primary hover:border-brand-primary/40 bg-white text-xs h-9">
                      <SelectValue
                        placeholder={
                          classesLoading
                            ? "Loading classes..."
                            : classes.length === 0
                            ? "No classes available"
                            : "Select class"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent className="border-brand-primary/20 text-brand-primary">
                      {classes.map((c) => (
                        <SelectItem
                          key={c.id}
                          value={c.id}
                          className="focus:bg-brand-primary/10 focus:text-brand-primary hover:bg-brand-primary/5 data-[state=checked]:text-brand-primary [&>span>svg]:text-brand-primary text-xs"
                        >
                          <div className="flex items-center justify-between w-full gap-2">
                            <span className="capitalize">{c.name}</span>
                            {c.capacity && (
                              <span className="ml-auto text-[10px] text-gray-500">
                                {c.currentStudents}/{c.capacity}
                              </span>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {classesLoading && (
                    <p className="text-[11px] text-gray-500">Loading classes...</p>
                  )}
                </div>

                {/* First Name */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-brand-black-accent">
                    First Name *
                  </Label>
                  <Input
                    name="firstName"
                    value={student.firstName}
                    onChange={handleStudentChange}
                    placeholder="Enter first name"
                    className="text-xs h-9 bg-white"
                  />
                </div>

                {/* Last Name */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-brand-black-accent">
                    Last Name *
                  </Label>
                  <Input
                    name="lastName"
                    value={student.lastName}
                    onChange={handleStudentChange}
                    placeholder="Enter last name"
                    className="text-xs h-9 bg-white"
                  />
                </div>

                {/* Date of Birth */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-brand-black-accent">
                    Date of Birth *
                  </Label>
                  <Input
                    type="date"
                    name="dateOfBirth"
                    value={student.dateOfBirth}
                    onChange={handleStudentChange}
                    max={new Date().toISOString().split("T")[0]}
                    className="text-xs h-9 bg-white"
                  />
                </div>

                {/* Gender */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-brand-black-accent">
                    Gender *
                  </Label>
                  <Select
                    value={student.gender}
                    onValueChange={(val) => handleSelectChange("gender", val)}
                  >
                    <SelectTrigger className="focus:ring-brand-primary hover:border-brand-primary/40 bg-white text-xs h-9">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent className="border-brand-primary/20 text-brand-primary">
                      <SelectItem
                        value="MALE"
                        className="focus:bg-brand-primary/10 focus:text-brand-primary hover:bg-brand-primary/5 data-[state=checked]:text-brand-primary [&>span>svg]:text-brand-primary text-xs"
                      >
                        Male
                      </SelectItem>
                      <SelectItem
                        value="FEMALE"
                        className="focus:bg-brand-primary/10 focus:text-brand-primary hover:bg-brand-primary/5 data-[state=checked]:text-brand-primary [&>span>svg]:text-brand-primary text-xs"
                      >
                        Female
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Add to Batch Button */}
                <div className="pt-1">
                  <Button
                    type="button"
                    onClick={handleAddStudent}
                    disabled={activeTab !== "student"}
                    className="w-full flex items-center justify-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-brand-black text-xs py-2 h-9 border border-gray-200 shadow-2xs"
                  >
                    <PlusIcon className="w-3.5 h-3.5 text-brand-primary" />
                    Add Student to Batch
                  </Button>
                </div>

                {/* Added Students List inside Column 2 */}
                {students.length > 0 && (
                  <div className="pt-3 border-t border-gray-100">
                    <p className="text-xs font-semibold text-brand-black mb-2 flex items-center justify-between">
                      <span>Draft Students ({students.length})</span>
                    </p>
                    <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
                      {students.map((stu, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2 bg-gray-50/80 border border-gray-200 rounded-md text-xs"
                        >
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <div className="w-6 h-6 rounded-full bg-brand-primary text-white text-[10px] font-semibold flex items-center justify-center flex-shrink-0">
                              {getInitials(`${stu.firstName} ${stu.lastName}`)}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-medium text-brand-black truncate">
                                {stu.firstName} {stu.lastName}
                              </p>
                              <p className="text-[10px] text-gray-500 truncate">
                                {stu.className} •{" "}
                                {stu.gender === "MALE" ? "Male" : "Female"}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-0.5 flex-shrink-0">
                            <button
                              type="button"
                              onClick={() => handleEditStudent(idx)}
                              className="p-1 text-gray-500 hover:text-brand-primary"
                              title="Edit"
                            >
                              <SquarePen className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemoveStudent(idx)}
                              className="p-1 text-red-500 hover:text-red-700"
                              title="Remove"
                            >
                              <TrashIcon className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Action Button */}
            <div className="pt-5 mt-6 border-t border-gray-100">
              {activeTab === "student" ? (
                <Button
                  type="button"
                  onClick={() =>
                    canProceedToReview && handleTabChange("review")
                  }
                  disabled={!canProceedToReview}
                  className="w-full bg-brand-primary text-white text-sm py-2.5 shadow-sm"
                >
                  Continue to Review ({students.length})
                </Button>
              ) : canProceedToStudent ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleTabChange("student")}
                  className="w-full text-xs text-brand-primary border-brand-primary/30 hover:bg-brand-primary/5"
                >
                  Revert to Edit Students
                </Button>
              ) : null}
            </div>
          </div>

          {/* =========================================
              COLUMN 3: Step 3 - Review & Submit
             ========================================= */}
          <div
            className={`rounded-xl border transition-all duration-200 ${
              !canProceedToReview
                ? "bg-gray-50/70 border-gray-200 opacity-60"
                : activeTab === "review"
                ? "bg-white border-brand-primary shadow-md ring-1 ring-brand-primary/20"
                : "bg-white border-gray-200/90 shadow-xs"
            } p-5 sm:p-6 flex flex-col justify-between`}
          >
            <div>
              {/* Header / Tab */}
              <div
                onClick={() =>
                  canProceedToReview && handleTabChange("review")
                }
                className={`flex items-center justify-between pb-4 border-b border-gray-100 ${
                  canProceedToReview && activeTab !== "review"
                    ? "cursor-pointer group"
                    : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                      !canProceedToReview
                        ? "bg-gray-200 text-gray-400"
                        : activeTab === "review"
                        ? "bg-brand-primary text-white shadow-xs"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    3
                  </div>
                  <div>
                    <h2
                      className={`font-semibold text-base transition-colors ${
                        !canProceedToReview
                          ? "text-gray-400"
                          : activeTab === "review"
                          ? "text-brand-primary"
                          : "text-gray-900 group-hover:text-brand-primary"
                      }`}
                    >
                      3. Review & Submit
                    </h2>
                    <p
                      className={`text-xs ${
                        !canProceedToReview ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      Summary & final submission
                    </p>
                  </div>
                </div>

                {!canProceedToReview ? (
                  <span className="text-[11px] bg-gray-100 text-gray-400 px-2.5 py-0.5 rounded-full font-medium">
                    Locked
                  </span>
                ) : activeTab === "review" ? (
                  <span className="text-[11px] bg-brand-primary/10 text-brand-primary px-2.5 py-0.5 rounded-full font-medium">
                    Ready
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTabChange("review");
                    }}
                    className="text-[11px] text-brand-primary bg-emerald-50 hover:bg-emerald-100 px-2.5 py-0.5 rounded-full font-medium border border-emerald-200/60"
                  >
                    View
                  </button>
                )}
              </div>

              {/* Review Content Stacked in 1 Column */}
              <div
                className={`space-y-4 pt-4 transition-opacity duration-200 ${
                  !canProceedToReview || activeTab !== "review"
                    ? "opacity-60 pointer-events-none select-none"
                    : ""
                }`}
              >
                {/* Session Target Summary */}
                <div className="p-3 bg-emerald-50/50 border border-emerald-200/60 rounded-lg space-y-2 text-xs">
                  <div className="flex justify-between items-center py-0.5 border-b border-emerald-100/60">
                    <span className="text-gray-500">Session:</span>
                    <span className="font-semibold text-brand-black flex items-center gap-1.5">
                      {session || "-"}
                      {sessionId && currentSession && sessionId !== currentSession.id && (
                        <span className="text-[10px] text-amber-700 bg-amber-100 px-1.5 py-0.2 rounded font-normal">
                          Non-Current
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-0.5 border-b border-emerald-100/60">
                    <span className="text-gray-500">Term:</span>
                    <span className="font-semibold text-brand-black flex items-center gap-1.5">
                      {term ? `${term} Term` : "-"}
                      {termId && currentTerm && termId !== currentTerm.id && (
                        <span className="text-[10px] text-amber-700 bg-amber-100 px-1.5 py-0.2 rounded font-normal">
                          Non-Current
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-0.5 border-b border-emerald-100/60">
                    <span className="text-gray-500">LGA:</span>
                    <span className="font-semibold text-brand-black capitalize">
                      {lgaValue || "-"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-0.5">
                    <span className="text-gray-500">School:</span>
                    <span
                      className="font-semibold text-brand-black capitalize truncate max-w-[180px]"
                      title={school}
                    >
                      {school || "-"}
                    </span>
                  </div>
                </div>

                {/* Students Roster Summary */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-brand-black">
                      Enrolling Students ({students.length})
                    </p>
                    <span className="text-[11px] text-gray-500">
                      Ready to submit
                    </span>
                  </div>

                  {students.length > 0 ? (
                    <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                      {students.map((stu, idx) => (
                        <div
                          key={idx}
                          className="p-2 border border-gray-200 rounded-md bg-white text-xs flex items-center gap-2"
                        >
                          <div className="w-6 h-6 rounded-full bg-brand-primary text-white text-[10px] font-semibold flex items-center justify-center flex-shrink-0">
                            {getInitials(`${stu.firstName} ${stu.lastName}`)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-brand-black truncate">
                              {stu.firstName} {stu.lastName}
                            </p>
                            <p className="text-[10px] text-gray-500 truncate">
                              {stu.className} •{" "}
                              {stu.gender === "MALE" ? "Male" : "Female"} •{" "}
                              {stu.dateOfBirth}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400 italic py-6 text-center border border-dashed border-gray-200 rounded-lg">
                      No students added to batch yet
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Bottom Action Button */}
            <div className="pt-5 mt-6 border-t border-gray-100">
              <Button
                type="button"
                onClick={handleSubmitEnrollment}
                disabled={
                  isSubmitting || !canProceedToReview || activeTab !== "review"
                }
                className="w-full flex items-center justify-center gap-2 bg-brand-primary text-white text-sm py-2.5 font-medium shadow-sm"
              >
                <CheckCircleIcon className="w-4 h-4" />
                {isSubmitting
                  ? "Enrolling..."
                  : `Submit Enrollment (${students.length})`}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
