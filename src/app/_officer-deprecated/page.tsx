"use client";
import React, { useState, useMemo, useEffect } from "react";
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  TrashIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import { SquarePen } from "lucide-react";
import { useRouter } from "next/navigation";
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
import PageHeader from "@/components/shared/PageHeader";
import { LoadingModal } from "@/components/ui/LoadingModal";
import { Dialog } from "@/components/ui/dialog";
import { SimpleFooter } from "@/components/shared/Footer";
import { useAuthStore } from "@/store/authStore";
import {
  useGradeEntryMetadata,
  useLgaSchools,
  useSchoolClasses,
  useClassStudents,
} from "@/services/hooks/useGrading";
import { uploadResults } from "@/services";

// Helper function to convert term format from backend (e.g., "FIRST_TERM" -> "First")
const formatTermName = (termName: string): string => {
  if (termName.includes("FIRST")) return "First";
  if (termName.includes("SECOND")) return "Second";
  if (termName.includes("THIRD")) return "Third";
  return termName;
};

const initialStudentState = {
  studentId: "",
  studentName: "",
  examNumber: "",
  class: "",
  classId: "",
  classLevel: "" as "PRIMARY" | "SECONDARY" | "",
  gender: "",
  subjects: {} as Record<string, string>,
};

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0]?.toUpperCase())
    .join("")
    .slice(0, 2);
}

// Student Selector Component with Search and Grouping
interface StudentSelectorProps {
  students: Array<{
    id: string;
    fullName: string;
    hasResultForActiveTerm: boolean;
  }>;
  selectedStudentId: string;
  onStudentSelect: (value: string) => void;
  disabled: boolean;
  classId: string;
  onAddStudent: () => void;
}

function StudentSelector({
  students,
  selectedStudentId,
  onStudentSelect,
  disabled,
  classId,
  onAddStudent,
}: StudentSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  // Filter and group students
  const { awaitingUpload, alreadyUploaded } = useMemo(() => {
    const filtered = students.filter((s) =>
      s.fullName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return {
      awaitingUpload: filtered.filter((s) => !s.hasResultForActiveTerm),
      alreadyUploaded: filtered.filter((s) => s.hasResultForActiveTerm),
    };
  }, [students, searchQuery]);

  const selectedStudent = students.find((s) => s.id === selectedStudentId);

  return (
    <Select
      value={selectedStudentId}
      onValueChange={(value) => {
        onStudentSelect(value);
        setIsOpen(false);
      }}
      disabled={disabled}
      open={isOpen}
      onOpenChange={setIsOpen}
    >
      <SelectTrigger className="focus:ring-brand-green hover:border-brand-green/40">
        <SelectValue
          placeholder={
            !classId
              ? "Select class first"
              : students.length === 0
              ? "No students available"
              : "Select student"
          }
        >
          {selectedStudent && (
            <span className="capitalize">{selectedStudent.fullName}</span>
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="border-brand-green/20">
        {/* Search Input with Add Student Button */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 p-2">
          <div className="relative flex items-center gap-2">
            <div className="relative flex-1">
              <Input
                type="text"
                placeholder="Search student..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-24 h-9 text-sm"
                onClick={(e) => e.stopPropagation()}
                onKeyDown={(e) => e.stopPropagation()}
              />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onAddStudent();
                }}
                className="absolute right-1 top-1/2 -translate-y-1/2 px-2.5 py-1 text-xs font-medium rounded-full bg-brand-green text-white hover:bg-brand-green/90 transition-colors whitespace-nowrap"
              >
                Add Student
              </button>
            </div>
          </div>
        </div>

        {/* Awaiting Upload Group */}
        <div className="py-1">
          <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 bg-gray-50">
            Awaiting Upload ({awaitingUpload.length})
          </div>
          {awaitingUpload.length > 0 ? (
            awaitingUpload.map((s) => (
              <SelectItem
                key={s.id}
                value={s.id}
                className="pl-6 focus:bg-brand-green/10 focus:text-brand-green hover:bg-brand-green/5 data-[state=checked]:text-brand-green [&>span>svg]:text-brand-green cursor-pointer"
              >
                <span className="capitalize">{s.fullName}</span>
              </SelectItem>
            ))
          ) : (
            <div className="px-8 py-2 text-xs text-gray-400 italic">
              No students awaiting upload
            </div>
          )}
        </div>

        {/* Already Uploaded Group */}
        {alreadyUploaded.length > 0 && (
          <div className="py-1">
            <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 bg-gray-50">
              Already Uploaded ({alreadyUploaded.length})
            </div>
            {alreadyUploaded.map((s) => (
              <SelectItem
                key={s.id}
                value={s.id}
                disabled
                className="pl-6 opacity-50 cursor-not-allowed data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
              >
                <span className="capitalize text-gray-400">{s.fullName}</span>
              </SelectItem>
            ))}
          </div>
        )}

        {/* No Results Message */}
        {awaitingUpload.length === 0 && alreadyUploaded.length === 0 && (
          <div className="py-6 text-center text-sm text-gray-500">
            No students found
          </div>
        )}
      </SelectContent>
    </Select>
  );
}

export default function EnterGradesPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [isValidating, setIsValidating] = useState(true);
  const [session, setSession] = useState("2024/2025");
  const [sessionId, setSessionId] = useState("");
  const [term, setTerm] = useState("First");
  const [termId, setTermId] = useState("");
  const [school, setSchool] = useState("");
  const [schoolId, setSchoolId] = useState("");
  const [lgaValue, setLgaValue] = useState("");
  const [lgaId, setLgaId] = useState("");
  const [student, setStudent] = useState(initialStudentState);
  const [students, setStudents] = useState<(typeof initialStudentState)[]>([]);
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
  const [showClassChangeWarning, setShowClassChangeWarning] = useState(false);
  const [pendingClassId, setPendingClassId] = useState<string | null>(null);
  const [showSubmitPrompt, setShowSubmitPrompt] = useState(false);

  // Validate role on mount - only SUBEB_OFFICER can access
  useEffect(() => {
    if (isAuthenticated && user) {
      const normalizedRole = user.role.toLowerCase();

      // Only SUBEB_OFFICER can access enter-grades
      if (normalizedRole !== "subeb_officer") {
        // Redirect SUPER_ADMIN to their default page
        router.replace("/dashboard");
        return;
      }
    }

    setIsValidating(false);
  }, [isAuthenticated, user, router]);

  // Restore students from localStorage on mount
  useEffect(() => {
    const savedStudents = localStorage.getItem("pendingGradeSubmissions");
    if (savedStudents) {
      try {
        const parsed = JSON.parse(savedStudents);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setStudents(parsed);
          setSuccess(
            `Restored ${parsed.length} unsaved student${
              parsed.length !== 1 ? "s" : ""
            } from previous session`
          );
          setShowToast(true);
        }
      } catch (err) {
        console.error("Failed to restore saved students:", err);
      }
    }
  }, []);

  // Save students to localStorage whenever they change
  useEffect(() => {
    if (students.length > 0) {
      localStorage.setItem("pendingGradeSubmissions", JSON.stringify(students));
    } else {
      localStorage.removeItem("pendingGradeSubmissions");
    }
  }, [students]);

  // Show submit prompt when students reach 10 or more
  useEffect(() => {
    if (students.length === 10 && !showSubmitPrompt) {
      setShowSubmitPrompt(true);
    }
  }, [students.length, showSubmitPrompt]);

  // Fetch grade entry metadata from new API
  const {
    data: gradeMetadata,
    loading: metadataLoading,
    error: metadataError,
  } = useGradeEntryMetadata();

  // Fetch schools when LGA is selected
  const {
    data: lgaSchoolsData,
    loading: schoolsLoading,
    error: schoolsError,
  } = useLgaSchools(lgaId);

  // Fetch classes when school is selected and moving to student tab
  const {
    data: schoolClassesData,
    loading: classesLoading,
    error: classesError,
  } = useSchoolClasses(schoolId);

  // Fetch students when class is selected
  const {
    data: classStudentsData,
    loading: studentsLoading,
    error: studentsError,
  } = useClassStudents(student.classId);

  // Auto-populate session and term from grade metadata
  React.useEffect(() => {
    if (gradeMetadata?.currentSession) {
      setSession(gradeMetadata.currentSession.name);
      setSessionId(gradeMetadata.currentSession.id);
    }
    if (gradeMetadata?.currentTerm) {
      setTerm(formatTermName(gradeMetadata.currentTerm.name));
      setTermId(gradeMetadata.currentTerm.id);
    }
  }, [gradeMetadata]);

  // Extract LGAs from grade metadata
  const lgas = useMemo(
    () => gradeMetadata?.localGovernments || [],
    [gradeMetadata]
  );

  // Extract schools from LGA schools data
  const schools = useMemo(
    () => lgaSchoolsData?.schools || [],
    [lgaSchoolsData]
  );

  // Extract classes from school classes data
  const classes = useMemo(
    () => schoolClassesData?.classes || [],
    [schoolClassesData]
  );

  // Extract students from class students data
  const availableStudents = useMemo(
    () => classStudentsData?.students || [],
    [classStudentsData]
  );

  // Extract all subjects from metadata (flatten primary and secondary)
  const allSubjects = useMemo(() => {
    const subjectsData = gradeMetadata?.subjects;
    console.log("Grade Metadata:", gradeMetadata);
    console.log("Subjects from metadata:", subjectsData);

    if (!subjectsData) return [];

    const primarySubjects = subjectsData.primary?.subjects || [];
    const secondarySubjects = subjectsData.secondary?.subjects || [];

    return [...primarySubjects, ...secondarySubjects];
  }, [gradeMetadata]);

  // Filter subjects based on selected class level
  const availableSubjects = useMemo(() => {
    if (!student.classLevel || !allSubjects) return [];
    return allSubjects.filter((s) => s.level === student.classLevel);
  }, [allSubjects, student.classLevel]);

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
      setStudent((prev) => ({ ...prev, class: "", classId: "" }));
    }
  }, [schoolId]);

  // Handle API errors with toast notifications
  React.useEffect(() => {
    if (metadataError) {
      setError(metadataError);
      setShowToast(true);
    }
  }, [metadataError]);

  React.useEffect(() => {
    if (schoolsError) {
      setError(schoolsError);
      setShowToast(true);
    }
  }, [schoolsError]);

  React.useEffect(() => {
    if (classesError) {
      setError(classesError);
      setShowToast(true);
    }
  }, [classesError]);

  React.useEffect(() => {
    if (studentsError) {
      setError(studentsError);
      setShowToast(true);
    }
  }, [studentsError]);

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

  // Show success modal when students are loaded
  React.useEffect(() => {
    if (classStudentsData && !studentsLoading && student.classId) {
      setSuccessMessage(
        `Successfully loaded ${classStudentsData.students.length} students`
      );
      setShowSuccessModal(true);
    }
  }, [classStudentsData, studentsLoading, student.classId]);

  const handleSelectChange = (name: string, value: string) => {
    if (name === "class") {
      // Warn if changing class with students added
      if (students.length > 0 && value !== student.classId) {
        setPendingClassId(value);
        setShowClassChangeWarning(true);
        return;
      }

      // Find the selected class and set both name and ID
      const selectedClass = classes.find((c) => c.id === value);
      if (selectedClass) {
        // Get subjects for this class level - ensure allSubjects is an array
        const subjects = Array.isArray(allSubjects) ? allSubjects : [];

        // Determine class level from class name (e.g., "Primary 2" -> "PRIMARY")
        const className = selectedClass.name.toLowerCase();
        let classLevel: "PRIMARY" | "SECONDARY" = "PRIMARY";
        if (
          className.includes("jss") ||
          className.includes("sss") ||
          className.includes("secondary")
        ) {
          classLevel = "SECONDARY";
        } else if (className.includes("primary")) {
          classLevel = "PRIMARY";
        }

        console.log("Selected Class:", selectedClass);
        console.log("Determined Class Level:", classLevel);
        console.log("All Subjects:", subjects);

        const classSubjects = subjects.filter((s) => s.level === classLevel);

        console.log("Filtered Class Subjects:", classSubjects);

        // Initialize subjects with empty strings
        const initialSubjects = Object.fromEntries(
          classSubjects.map((s) => [s.id, ""])
        );

        setStudent((prev) => ({
          ...prev,
          class: selectedClass.name,
          classId: selectedClass.id,
          classLevel: classLevel,
          subjects: initialSubjects,
          // Reset student fields when class changes
          studentId: "",
          studentName: "",
          examNumber: "",
          gender: "",
        }));
      }
    } else if (name === "student") {
      // Find the selected student and auto-fill fields
      const selectedStudent = availableStudents.find((s) => s.id === value);
      if (selectedStudent) {
        setStudent((prev) => ({
          ...prev,
          studentId: selectedStudent.id,
          studentName: selectedStudent.fullName,
          examNumber: selectedStudent.studentId,
          gender: selectedStudent.gender === "MALE" ? "Male" : "Female",
        }));
      }
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

  const handleConfirmClassChange = () => {
    if (!pendingClassId) return;

    // Clear students and proceed with class change
    setStudents([]);
    const selectedClass = classes.find((c) => c.id === pendingClassId);
    if (selectedClass) {
      const subjects = Array.isArray(allSubjects) ? allSubjects : [];
      const className = selectedClass.name.toLowerCase();
      let classLevel: "PRIMARY" | "SECONDARY" = "PRIMARY";
      if (
        className.includes("jss") ||
        className.includes("sss") ||
        className.includes("secondary")
      ) {
        classLevel = "SECONDARY";
      } else if (className.includes("primary")) {
        classLevel = "PRIMARY";
      }

      const classSubjects = subjects.filter((s) => s.level === classLevel);
      const initialSubjects = Object.fromEntries(
        classSubjects.map((s) => [s.id, ""])
      );

      setStudent((prev) => ({
        ...prev,
        class: selectedClass.name,
        classId: selectedClass.id,
        classLevel: classLevel,
        subjects: initialSubjects,
        studentId: "",
        studentName: "",
        examNumber: "",
        gender: "",
      }));
    }

    setShowClassChangeWarning(false);
    setPendingClassId(null);
  };

  const handleSubjectScoreChange = (subject: string, value: string) => {
    if (/^\d{0,3}$/.test(value) && +value <= 100) {
      setStudent((prev) => ({
        ...prev,
        subjects: { ...prev.subjects, [subject]: value },
      }));
    }
  };

  const handleAddStudent = () => {
    if (
      !student.studentName ||
      !student.examNumber ||
      !student.class ||
      !student.gender ||
      !student.studentId
    ) {
      setError("Please select a student and ensure all fields are filled.");
      setSuccess(null);
      setShowToast(true);
      return;
    }
    // Validate all subjects have scores
    for (const subject of availableSubjects) {
      const score = student.subjects[subject.id];
      if (
        score === "" ||
        isNaN(Number(score)) ||
        Number(score) < 0 ||
        Number(score) > 100
      ) {
        setError("Please enter valid scores (0-100) for all subjects.");
        setSuccess(null);
        setShowToast(true);
        return;
      }
    }

    // Check if student already added
    const isDuplicate = students.some((s) => s.studentId === student.studentId);
    if (isDuplicate) {
      setError("This student has already been added.");
      setSuccess(null);
      setShowToast(true);
      return;
    }

    setStudents((prev) => [...prev, student]);
    // Preserve class, classId, classLevel, and subjects when resetting
    setStudent((prev) => ({
      ...initialStudentState,
      class: prev.class,
      classId: prev.classId,
      classLevel: prev.classLevel,
      subjects: prev.subjects,
    }));
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
    // Only warn when navigating from review to session tab with unsubmitted students
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

  React.useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => setShowToast(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  // Show loading state while validating role
  if (isValidating) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-brand-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying access...</p>
        </div>
      </div>
    );
  }

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
      <LoadingModal
        isOpen={studentsLoading && !!student.classId}
        message="Loading students in selected class..."
      />
      <LoadingModal
        isOpen={isSubmitting}
        message={`Submitting grades for ${students.length} student${
          students.length !== 1 ? "s" : ""
        }...`}
      />

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
                {students.length !== 1 ? "s" : ""} with grades that haven&apos;t
                been submitted yet. If you navigate away now, all entered data
                will be lost.
              </p>
              <p className="text-sm text-brand-black-accent">
                If you want to make changes to the grades, please close this
                dialog and go back to the{" "}
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

      {/* Class Change Warning Dialog */}
      <Dialog
        open={showClassChangeWarning}
        onOpenChange={() => {
          setShowClassChangeWarning(false);
          setPendingClassId(null);
        }}
        showCloseButton={false}
      >
        <div className="p-6">
          <div className="flex items-start gap-3 mb-4">
            <ExclamationCircleIcon className="w-6 h-6 text-amber-500 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-semibold text-brand-black mb-2">
                Change Class Warning
              </h3>
              <p className="text-sm text-brand-black-accent mb-3">
                You have {students.length} student
                {students.length !== 1 ? "s" : ""} with grades already added.
                Changing the class will clear all added students.
              </p>
              <p className="text-sm text-brand-black-accent font-medium">
                Please submit your current students before changing the class to
                avoid data loss.
              </p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 mt-6">
            <Button
              onClick={() => {
                setShowClassChangeWarning(false);
                setPendingClassId(null);
              }}
              variant="outline"
              className="flex-1 order-2 sm:order-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmClassChange}
              className="flex-1 text-white order-1 sm:order-2 bg-destructive hover:bg-destructive/90"
            >
              Clear All & Change Class
            </Button>
          </div>
        </div>
      </Dialog>

      {/* Submit Prompt Dialog */}
      <Dialog
        open={showSubmitPrompt}
        onOpenChange={setShowSubmitPrompt}
        showCloseButton={false}
      >
        <div className="p-6">
          <div className="flex items-start gap-3 mb-4">
            <CheckCircleIcon className="w-6 h-6 text-brand-green flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-semibold text-brand-black mb-2">
                Consider Submitting Your Progress
              </h3>
              <p className="text-sm text-brand-black-accent mb-3">
                You&apos;ve added {students.length} students! To avoid losing
                your work due to unexpected power outages or device issues, we
                recommend submitting your grades now.
              </p>
              <p className="text-sm text-brand-black-accent">
                Your progress is being saved locally, but submitting ensures
                your data is safely stored on the server.
              </p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 mt-6">
            <Button
              onClick={() => setShowSubmitPrompt(false)}
              variant="outline"
              className="flex-1 order-2 sm:order-1"
            >
              Continue Adding
            </Button>
            <Button
              onClick={() => {
                setShowSubmitPrompt(false);
                handleTabChange("review");
              }}
              className="flex-1 order-1 sm:order-2 bg-brand-green"
            >
              Go to Submit
            </Button>
          </div>
        </div>
      </Dialog>

      {/* Toast Notification */}
      {showToast && (error || success) && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 text-white font-medium ${
            error ? "bg-destructive" : "bg-green-500"
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

      {/* Header */}
      <PageHeader />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-0 pt-6">
        {/* Page Title - Centered */}
        <div className="text-center mb-8">
          <h1 className="text-lg lg:text-3xl font-medium text-brand-black mb-2">
            Student Grades Entry
          </h1>
          <p className="text-sm md:text-lg text-brand-black-accent">
            Manage and submit student examination scores
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="bg-[#FCFCFC] rounded-lg mb-6 max-w-4xl mx-auto">
          <div className="flex">
            <button
              onClick={() => handleTabChange("session")}
              className={`flex-1 min-w-0 px-2 sm:px-4 md:px-6 py-3 md:py-4 font-medium text-xs sm:text-sm md:text-base text-center transition-colors rounded-bl-lg rounded-tl-lg whitespace-nowrap ${
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
              className={`flex-1 min-w-0 px-2 sm:px-4 md:px-6 py-3 md:py-4 font-medium text-xs sm:text-sm md:text-base text-center transition-colors whitespace-nowrap ${
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
              className={`flex-1 min-w-0 px-2 sm:px-4 md:px-6 py-3 md:py-4 font-medium text-xs sm:text-sm md:text-base text-center transition-colors rounded-br-lg rounded-tr-lg whitespace-nowrap ${
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
        <div className="bg-white rounded-lg shadow-sm p-6 max-w-4xl mx-auto">
          {/* Session Info Tab */}
          {activeTab === "session" && (
            <div className="space-y-6">
              <h2 className="text-lg lg:text-xl font-medium text-black mb-4">
                Session Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                      {lgas.map((lga) => (
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
                      ))}
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
                      {schools.map((s) => (
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
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end pt-4">
                <Button
                  onClick={() =>
                    canProceedToStudent && handleTabChange("student")
                  }
                  disabled={!canProceedToStudent}
                  className="bg-brand-green relative overflow-hidden"
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
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-brand-black">
                  Add Students
                </h2>
                <span className="bg-[#F2F7F5] text-brand-green px-3 py-1 rounded-full text-sm font-medium">
                  {students.length} student
                  {students.length !== 1 ? "s" : ""} added
                </span>
              </div>

              {/* Student Form */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 rounded-lg">
                <div className="space-y-2">
                  <Label className="text-brand-black-accent">Class</Label>
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
                            <span className="ml-auto px-2 py-0.5 text-xs rounded-full bg-brand-green text-white font-medium">
                              {c.totalStudents}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-brand-black-accent">
                    Student Name
                  </Label>
                  <StudentSelector
                    students={availableStudents}
                    selectedStudentId={student.studentId}
                    onStudentSelect={(value) =>
                      handleSelectChange("student", value)
                    }
                    disabled={
                      !student.classId || availableStudents.length === 0
                    }
                    classId={student.classId}
                    onAddStudent={() => {
                      if (user?.id) {
                        router.push(`/${user.id}/add-student`);
                      }
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-brand-black-accent">
                    Student Number
                  </Label>
                  <Input
                    name="examNumber"
                    value={student.examNumber}
                    readOnly
                    disabled
                    placeholder="Auto-filled"
                    className="bg-gray-50 cursor-not-allowed"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-brand-black-accent">Gender</Label>
                  <Input
                    name="gender"
                    value={student.gender}
                    readOnly
                    disabled
                    placeholder="Auto-filled"
                    className="bg-gray-50 cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Subjects Scores */}
              <div>
                <h3 className="text-lg font-medium text-brand-black mb-4">
                  Subject Scores
                </h3>
                {!student.classId ? (
                  <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <p className="text-gray-500 text-sm">
                      Please select a class to view available subjects
                    </p>
                  </div>
                ) : availableSubjects.length === 0 ? (
                  <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-8 text-center">
                    <p className="text-yellow-700 text-sm">
                      No subjects found for this class level
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {availableSubjects.map((subject) => (
                      <div key={subject.id} className="space-y-2">
                        <Label className="text-sm text-brand-black-accent">
                          {subject.name}
                        </Label>
                        <Input
                          type="number"
                          min={0}
                          max={100}
                          value={student.subjects[subject.id] || ""}
                          onChange={(e) =>
                            handleSubjectScoreChange(subject.id, e.target.value)
                          }
                          className="text-center"
                          placeholder="0-100"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-between pt-4">
                <Button
                  variant="outline"
                  onClick={() => handleTabChange("session")}
                  className="text-brand-black-accent"
                >
                  Go back to Session Info
                </Button>
                <Button
                  onClick={handleAddStudent}
                  className="flex items-center gap-2 !bg-[#E5E7EA] text-brand-black hover:bg-[#d5d7da]"
                >
                  <PlusIcon className="w-4 h-4" />
                  Add Student
                </Button>
              </div>

              {/* Added Students List */}
              {students.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-lg font-medium text-brand-black mb-4">
                    Added Students ({students.length})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {students.map((stu, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-md"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-brand-green text-white flex items-center justify-center text-sm font-medium">
                            {getInitials(stu.studentName)}
                          </div>
                          <div>
                            <p className="font-medium text-brand-black">
                              {stu.studentName}
                            </p>
                            <p className="text-sm text-brand-black-accent">
                              {stu.examNumber} • {stu.class} • {stu.gender}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
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
                  <div className="flex justify-end mt-4">
                    <Button
                      className="bg-brand-green"
                      onClick={() => handleTabChange("review")}
                    >
                      Continue to Review & Submit
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Review Tab */}
          {activeTab === "review" && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-brand-black">
                Review & Submit
              </h2>

              {/* Session Summary */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-brand-black mb-2">
                  Session Information
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
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
                <h3 className="font-medium text-brand-black mb-4">
                  Students ({students.length})
                </h3>
                <div className="space-y-2">
                  {students.map((stu, idx) => (
                    <div
                      key={idx}
                      className="p-3 border border-gray-200 rounded-md"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-brand-green text-white text-brand-primary-foreground flex items-center justify-center text-sm font-medium">
                            {getInitials(stu.studentName)}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {stu.studentName}
                            </p>
                            <p className="text-sm text-gray-500">
                              {stu.examNumber} • {stu.class} • {stu.gender}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">
                            Avg:{" "}
                            {Object.keys(stu.subjects).length > 0
                              ? Math.round(
                                  Object.values(stu.subjects).reduce(
                                    (sum, score) => sum + Number(score),
                                    0
                                  ) / Object.keys(stu.subjects).length
                                )
                              : 0}
                            %
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between pt-6">
                <Button
                  variant="outline"
                  onClick={() => handleTabChange("student")}
                >
                  Back to Edit
                </Button>
                <Button
                  onClick={async () => {
                    if (isSubmitting) return;

                    setIsSubmitting(true);
                    try {
                      // Transform students data to API format
                      const studentsPayload = students.map((stu) => ({
                        studentId: stu.studentId,
                        subjects: Object.entries(stu.subjects).map(
                          ([subjectId, score]) => ({
                            subjectId,
                            score: Number(score),
                          })
                        ),
                      }));

                      // Make API call
                      const response = await uploadResults({
                        sessionId,
                        termId,
                        lgaId,
                        schoolId,
                        classId: student.classId,
                        students: studentsPayload,
                      });

                      if (response.success) {
                        setSuccess(
                          response.message ||
                            `Successfully submitted grades for ${
                              students.length
                            } student${students.length !== 1 ? "s" : ""}!`
                        );
                        setError(null);
                        setStudents([]);
                        setStudent(initialStudentState);
                        // Clear localStorage on successful submission
                        localStorage.removeItem("pendingGradeSubmissions");
                        setActiveTab("session");
                        setShowToast(true);
                      } else {
                        throw new Error(
                          response.message || "Failed to submit grades"
                        );
                      }
                    } catch (err: unknown) {
                      const error = err as { message?: string };
                      setError(
                        error.message ||
                          "Failed to submit grades. Please try again."
                      );
                      setSuccess(null);
                      setShowToast(true);
                    } finally {
                      setIsSubmitting(false);
                    }
                  }}
                  disabled={isSubmitting}
                  className="flex items-center gap-2 font-medium bg-brand-green disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <CheckCircleIcon className="w-5 h-5" />
                      Submit All Grades
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <SimpleFooter />
    </div>
  );
}
