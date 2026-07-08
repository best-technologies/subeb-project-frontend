"use client";
import React, { useState, useMemo } from "react";
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  TrashIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import { SquarePen } from "lucide-react";
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
import { enrollStudents } from "@/services/api/enrollment";
import {
  useEnrollmentMetadata,
  useEnrollmentLgaSchools,
  useEnrollmentSchoolClasses,
} from "@/services/hooks/useEnrollment";
import type { EnrolledStudent } from "@/services/types/enrollment";

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
}

const initialStudentState: StudentFormData = {
  firstName: "",
  lastName: "",
  dateOfBirth: "",
  gender: "",
  schoolId: "",
  classId: "",
  className: "",
};

export default function EnrolStudentPage() {
  const [session, setSession] = useState("2024/2025");
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

  // Fetch enrollment metadata, schools, and classes
  const {
    data: enrollmentMetadata,
    loading: metadataLoading,
    error: metadataError,
  } = useEnrollmentMetadata();

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

  // Auto-populate session and term from metadata
  React.useEffect(() => {
    if (enrollmentMetadata?.currentSession) {
      setSession(enrollmentMetadata.currentSession.name);
    }
    if (enrollmentMetadata?.currentTerm) {
      setTerm(formatTermName(enrollmentMetadata.currentTerm.name));
    }
  }, [enrollmentMetadata]);

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
      {/* Loading Dialogs */}
      <LoadingModal
        isOpen={metadataLoading}
        message="Loading academic session and term information..."
      />
      <LoadingModal
        isOpen={schoolsLoading && !!lgaId}
        message="Loading schools in selected LGA..."
      />
      <LoadingModal
        isOpen={classesLoading && !!schoolId}
        message="Loading classes in selected school..."
      />
      <LoadingModal isOpen={isSubmitting} message="Enrolling students..." />

      {/* Success Modal with Auto-Dismiss */}
      <LoadingModal isOpen={showSuccessModal} message={successMessage} />

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

      {/* Enrollment Success Dialog */}
      <Dialog
        open={showEnrollmentSuccess}
        onOpenChange={() => setShowEnrollmentSuccess(false)}
      >
        <div className="p-6 max-h-[80vh] overflow-y-auto">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-brand-green/10 rounded-full flex items-center justify-center">
              <CheckCircleIcon className="w-8 h-8 text-brand-green" />
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
                  <span className="bg-brand-green text-white px-3 py-1 rounded-full text-xs font-medium">
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
              className="flex-1 bg-brand-green"
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
            error ? "bg-destructive" : "bg-brand-green"
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

      <div className="max-w-6xl mx-auto px-2 sm:px-4 md:px-6 lg:px-0 pt-4 sm:pt-6">
        {/* Page Title - Centered */}
        <div className="text-center mb-4 sm:mb-6 md:mb-8">
          <h1 className="text-base sm:text-lg lg:text-3xl font-medium text-brand-black mb-1 sm:mb-2">
            Student Enrollment
          </h1>
          <p className="text-xs sm:text-sm md:text-lg text-brand-black-accent">
            Add new students to the system
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="bg-[#FCFCFC] rounded-lg mb-4 sm:mb-6 max-w-4xl mx-auto">
          <div className="flex">
            <button
              onClick={() => handleTabChange("session")}
              className={`flex-1 min-w-0 px-1 xs:px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 font-medium text-[9px] xs:text-[10px] sm:text-xs md:text-sm lg:text-base text-center transition-colors rounded-bl-lg rounded-tl-lg leading-tight ${
                activeTab === "session"
                  ? "text-brand-green border-b-4 border-brand-green bg-brand-green/4"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              1. Session Info
            </button>
            <button
              onClick={() => canProceedToStudent && handleTabChange("student")}
              disabled={!canProceedToStudent}
              className={`flex-1 min-w-0 px-1 xs:px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 font-medium text-[9px] xs:text-[10px] sm:text-xs md:text-sm lg:text-base text-center transition-colors leading-tight ${
                activeTab === "student"
                  ? "text-brand-green border-b-4 border-brand-green bg-brand-green/4"
                  : canProceedToStudent
                  ? "text-gray-500 hover:text-gray-700"
                  : "text-gray-300 cursor-not-allowed"
              }`}
            >
              2. Add Students
            </button>
            <button
              onClick={() => canProceedToReview && handleTabChange("review")}
              disabled={!canProceedToReview}
              className={`flex-1 min-w-0 px-1 xs:px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 font-medium text-[9px] xs:text-[10px] sm:text-xs md:text-sm lg:text-base text-center transition-colors rounded-br-lg rounded-tr-lg leading-tight ${
                activeTab === "review"
                  ? "text-brand-green border-b-4 border-brand-green bg-brand-green/4"
                  : canProceedToReview
                  ? "text-gray-500 hover:text-gray-700"
                  : "text-gray-300 cursor-not-allowed"
              }`}
            >
              3. Review & Submit
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow-sm p-3 sm:p-4 md:p-6 max-w-4xl mx-auto">
          {/* Session Info Tab */}
          {activeTab === "session" && (
            <div className="space-y-4 sm:space-y-6">
              <h2 className="text-base sm:text-lg lg:text-xl font-medium text-black mb-3 sm:mb-4">
                Session Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-2">
                  <Label className="text-brand-black-accent font-medium">
                    Academic Session
                  </Label>
                  <Select value={session} onValueChange={setSession} disabled>
                    <SelectTrigger className="opacity-50 cursor-not-allowed focus:ring-brand-green hover:border-brand-green/40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="border-brand-green/20 text-brand-green">
                      <SelectItem
                        value={session}
                        className="focus:bg-brand-green/10 focus:text-brand-green hover:bg-brand-green/5 data-[state=checked]:text-brand-green [&>span>svg]:text-brand-green"
                      >
                        {session}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  {metadataLoading && (
                    <p className="text-sm text-gray-500">Loading session...</p>
                  )}
                  {metadataError && (
                    <p className="text-sm text-red-500">{metadataError}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="text-brand-black-accent font-medium">
                    Term
                  </Label>
                  <Select value={term} onValueChange={setTerm} disabled>
                    <SelectTrigger className="opacity-50 cursor-not-allowed focus:ring-brand-green hover:border-brand-green/40">
                      <SelectValue placeholder="Select term" />
                    </SelectTrigger>
                    <SelectContent className="border-brand-green/20 text-brand-green">
                      <SelectItem
                        value={term}
                        className="focus:bg-brand-green/10 focus:text-brand-green hover:bg-brand-green/5 data-[state=checked]:text-brand-green [&>span>svg]:text-brand-green"
                      >
                        {term} Term
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-brand-black-accent font-medium">
                    Local Government Area
                  </Label>
                  <Select value={lgaId} onValueChange={handleLgaChange}>
                    <SelectTrigger className="focus:ring-brand-green hover:border-brand-green/40">
                      <SelectValue placeholder="Select LGA" />
                    </SelectTrigger>
                    <SelectContent className="border-brand-green/20 text-brand-green">
                      {lgas.map(
                        (lga: {
                          id: string;
                          name: string;
                          totalSchools: number;
                        }) => (
                          <SelectItem
                            key={lga.id}
                            value={lga.id}
                            className="focus:bg-brand-green/10 focus:text-brand-green hover:bg-brand-green/5 data-[state=checked]:text-brand-green [&>span>svg]:text-brand-green"
                          >
                            <div className="flex items-center justify-between w-full gap-2">
                              <span className="capitalize">{lga.name}</span>
                              <span className="ml-auto px-2 py-0.5 text-xs rounded-full bg-brand-green text-white font-medium">
                                {lga.totalSchools}
                              </span>
                            </div>
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-brand-black-accent font-medium">
                    School
                  </Label>
                  <Select
                    value={schoolId}
                    onValueChange={handleSchoolChange}
                    disabled={!lgaId || schools.length === 0}
                  >
                    <SelectTrigger
                      className={`focus:ring-brand-green hover:border-brand-green/40 ${
                        !lgaId ? "opacity-50" : ""
                      }`}
                    >
                      <SelectValue
                        placeholder={
                          !lgaId
                            ? "Select LGA first"
                            : schools.length === 0
                            ? "No schools available"
                            : "Select school"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent className="border-brand-green/20 text-brand-green">
                      {schools.map(
                        (s: {
                          id: string;
                          name: string;
                          totalClasses: number;
                        }) => (
                          <SelectItem
                            key={s.id}
                            value={s.id}
                            className="focus:bg-brand-green/10 focus:text-brand-green hover:bg-brand-green/5 data-[state=checked]:text-brand-green [&>span>svg]:text-brand-green"
                          >
                            <div className="flex items-center justify-between w-full gap-2">
                              <span className="capitalize">{s.name}</span>
                              <span className="ml-auto px-2 py-0.5 text-xs rounded-full bg-brand-green text-white font-medium">
                                {s.totalClasses}
                              </span>
                            </div>
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end pt-3 sm:pt-4">
                <Button
                  onClick={() =>
                    canProceedToStudent && handleTabChange("student")
                  }
                  disabled={!canProceedToStudent}
                  className="bg-brand-green relative overflow-hidden text-xs sm:text-sm md:text-base w-full sm:w-auto"
                >
                  {canProceedToStudent && (
                    <>
                      <span className="absolute inset-0 animate-ripple-wave"></span>
                      <span className="absolute inset-0 animate-ripple-wave-delayed"></span>
                    </>
                  )}
                  <span className="relative z-10">
                    Continue to Add Students
                  </span>
                </Button>
              </div>
            </div>
          )}

          {/* Add Students Tab */}
          {activeTab === "student" && (
            <div className="space-y-4 sm:space-y-6">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-base sm:text-lg md:text-xl font-semibold text-brand-black">
                  Add Students
                </h2>
                <span className="bg-brand-green/10 text-brand-green px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap">
                  {students.length} {students.length !== 1 ? "s" : ""}
                </span>
              </div>

              {/* Student Form */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 p-2 sm:p-4 rounded-lg">
                <div className="space-y-2 md:col-span-2">
                  <Label className="text-brand-black-accent">Class *</Label>
                  <Select
                    value={student.classId}
                    onValueChange={(value) =>
                      handleSelectChange("class", value)
                    }
                  >
                    <SelectTrigger className="focus:ring-brand-green hover:border-brand-green/40">
                      <SelectValue placeholder="Select class" />
                    </SelectTrigger>
                    <SelectContent className="border-brand-green/20 text-brand-green">
                      {classes.map((c) => (
                        <SelectItem
                          key={c.id}
                          value={c.id}
                          className="focus:bg-brand-green/10 focus:text-brand-green hover:bg-brand-green/5 data-[state=checked]:text-brand-green [&>span>svg]:text-brand-green"
                        >
                          <div className="flex items-center justify-between w-full gap-2">
                            <span className="capitalize">{c.name}</span>
                            {c.capacity && (
                              <span className="ml-auto text-xs text-gray-500">
                                {c.currentStudents}/{c.capacity}
                              </span>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-brand-black-accent">
                    First Name *
                  </Label>
                  <Input
                    name="firstName"
                    value={student.firstName}
                    onChange={handleStudentChange}
                    placeholder="Enter first name"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-brand-black-accent">Last Name *</Label>
                  <Input
                    name="lastName"
                    value={student.lastName}
                    onChange={handleStudentChange}
                    placeholder="Enter last name"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-brand-black-accent">
                    Date of Birth *
                  </Label>
                  <Input
                    type="date"
                    name="dateOfBirth"
                    value={student.dateOfBirth}
                    onChange={handleStudentChange}
                    max={new Date().toISOString().split("T")[0]}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-brand-black-accent">Gender *</Label>
                  <Select
                    value={student.gender}
                    onValueChange={(value) =>
                      handleSelectChange("gender", value)
                    }
                  >
                    <SelectTrigger className="focus:ring-brand-green hover:border-brand-green/40">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent className="border-brand-green/20 text-brand-green">
                      <SelectItem
                        value="MALE"
                        className="focus:bg-brand-green/10 focus:text-brand-green hover:bg-brand-green/5 data-[state=checked]:text-brand-green [&>span>svg]:text-brand-green"
                      >
                        Male
                      </SelectItem>
                      <SelectItem
                        value="FEMALE"
                        className="focus:bg-brand-green/10 focus:text-brand-green hover:bg-brand-green/5 data-[state=checked]:text-brand-green [&>span>svg]:text-brand-green"
                      >
                        Female
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-between gap-2 sm:gap-3 pt-3 sm:pt-4">
                <Button
                  variant="outline"
                  onClick={() => handleTabChange("session")}
                  className="text-brand-black-accent text-xs sm:text-sm order-2 sm:order-1 w-full sm:w-auto"
                >
                  Go back
                </Button>
                <Button
                  onClick={handleAddStudent}
                  className="flex items-center justify-center gap-2 !bg-[#E5E7EA] text-brand-black hover:bg-[#d5d7da] text-xs sm:text-sm order-1 sm:order-2 w-full sm:w-auto"
                >
                  <PlusIcon className="w-4 h-4" />
                  Add Student
                </Button>
              </div>

              {/* Added Students List */}
              {students.length > 0 && (
                <div className="mt-4 sm:mt-6 md:mt-8">
                  <h3 className="text-base sm:text-lg font-medium text-brand-black mb-3 sm:mb-4">
                    Added Students ({students.length})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                    {students.map((stu, idx) => (
                      <div
                        key={idx}
                        className="flex items-start sm:items-center justify-between p-2 sm:p-3 bg-white border border-gray-200 rounded-md gap-2"
                      >
                        <div className="flex items-start sm:items-center gap-2 sm:gap-3 min-w-0 flex-1">
                          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-brand-green text-white flex items-center justify-center text-xs sm:text-sm font-medium flex-shrink-0">
                            {getInitials(`${stu.firstName} ${stu.lastName}`)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-brand-black text-xs sm:text-sm truncate">
                              {stu.firstName} {stu.lastName}
                            </p>
                            <p className="text-[10px] sm:text-xs text-brand-black-accent truncate">
                              {stu.dateOfBirth} • {stu.className} •{" "}
                              {stu.gender === "MALE" ? "Male" : "Female"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditStudent(idx)}
                            className="text-brand-black-accent hover:text-brand-black"
                          >
                            <SquarePen className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveStudent(idx)}
                            className="text-destructive hover:text-destructive"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-end mt-3 sm:mt-4">
                    <Button
                      className="bg-brand-green text-xs sm:text-sm md:text-base w-full sm:w-auto"
                      onClick={() => handleTabChange("review")}
                    >
                      Continue to Review
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Review Tab */}
          {activeTab === "review" && (
            <div className="space-y-4 sm:space-y-6">
              <h2 className="text-base sm:text-lg md:text-xl font-semibold text-brand-black">
                Review & Submit
              </h2>

              {/* Session Summary */}
              <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                <h3 className="font-medium text-brand-black mb-2 text-sm sm:text-base">
                  Session Information
                </h3>
                <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4 text-xs sm:text-sm">
                  <div>
                    <span className="text-brand-black-accent">Session:</span>{" "}
                    <span className="font-medium">{session}</span>
                  </div>
                  <div>
                    <span className="text-brand-black-accent">Term:</span>{" "}
                    <span className="font-medium">{term}</span>
                  </div>
                  <div>
                    <span className="text-brand-black-accent">School:</span>{" "}
                    <span className="font-medium" title={school}>
                      {school.length > 10
                        ? `${school.slice(0, 10)}...`
                        : school}
                    </span>
                  </div>
                  <div>
                    <span className="text-brand-black-accent">LGA:</span>{" "}
                    <span className="font-medium">{lgaValue}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-medium text-brand-black mb-3 sm:mb-4 text-sm sm:text-base">
                  Students ({students.length})
                </h3>
                <div className="space-y-2">
                  {students.map((stu, idx) => (
                    <div
                      key={idx}
                      className="p-2 sm:p-3 border border-gray-200 rounded-md"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-brand-green text-white text-brand-green-foreground flex items-center justify-center text-xs sm:text-sm font-medium flex-shrink-0">
                            {getInitials(`${stu.firstName} ${stu.lastName}`)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-gray-900 text-xs sm:text-sm truncate">
                              {stu.firstName} {stu.lastName}
                            </p>
                            <p className="text-[10px] sm:text-xs text-gray-500 truncate">
                              {stu.dateOfBirth} • {stu.className} •{" "}
                              {stu.gender === "MALE" ? "Male" : "Female"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-between gap-2 sm:gap-3 pt-4 sm:pt-6">
                <Button
                  variant="outline"
                  onClick={() => handleTabChange("student")}
                  className="text-xs sm:text-sm order-2 sm:order-1 w-full sm:w-auto"
                >
                  Back to Edit
                </Button>
                <Button
                  onClick={handleSubmitEnrollment}
                  disabled={isSubmitting}
                  className="flex items-center justify-center gap-2 font-medium bg-brand-green text-xs sm:text-sm order-1 sm:order-2 w-full sm:w-auto"
                >
                  <CheckCircleIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                  {isSubmitting ? "Enrolling..." : "Submit"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
