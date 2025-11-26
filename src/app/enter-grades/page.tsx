"use client";
import React, { useState, useMemo } from "react";
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  TrashIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import { SquarePen } from "lucide-react";
import { useGlobalAdminDashboard, useCurrentSession } from "@/services";
import { subjectNames } from "@/types/student";
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

const genders = ["Male", "Female"];
const subjectKeys = Object.keys(subjectNames) as (keyof typeof subjectNames)[];

// Helper function to convert term format from backend (e.g., "FIRST_TERM" -> "First")
const formatTermName = (termName: string): string => {
  if (termName.includes("FIRST")) return "First";
  if (termName.includes("SECOND")) return "Second";
  if (termName.includes("THIRD")) return "Third";
  return termName;
};

const initialStudentState = {
  studentName: "",
  examNumber: "",
  class: "",
  gender: "",
  subjects: Object.fromEntries(subjectKeys.map((key) => [key, ""])) as Record<
    string,
    string
  >,
};

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0]?.toUpperCase())
    .join("")
    .slice(0, 2);
}

export default function EnterGradesPage() {
  const [session, setSession] = useState("2024/2025");
  const [term, setTerm] = useState("First");
  const [school, setSchool] = useState("");
  const [lgaValue, setLgaValue] = useState("");
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

  // Fetch real data from API
  const { data: dashboardData, loading: dashboardLoading } =
    useGlobalAdminDashboard();
  const {
    session: currentSession,
    loading: sessionLoading,
    error: sessionError,
  } = useCurrentSession();

  // Auto-populate session and term from current session
  React.useEffect(() => {
    if (currentSession) {
      setSession(currentSession.name);
      const currentTerm = currentSession.terms.find((t) => t.isCurrent);
      if (currentTerm) {
        setTerm(formatTermName(currentTerm.name));
      }
    }
  }, [currentSession]);

  // Use real data from API
  const schools = useMemo(
    () => dashboardData?.data?.schools || dashboardData?.schools || [],
    [dashboardData]
  );

  const lgas = useMemo(
    () =>
      dashboardData?.data?.lgas?.map((l) => l.name) ||
      dashboardData?.lgas?.map((l) => l.name) ||
      [],
    [dashboardData]
  );

  const classes = useMemo(
    () =>
      dashboardData?.data?.classes?.map((c) => c.name) ||
      dashboardData?.classes?.map((c) => c.name) ||
      [],
    [dashboardData]
  );

  // Filter schools by selected LGA
  const filteredSchools = useMemo(() => {
    if (!lgaValue || !schools) return [];
    return schools.filter((school) => school.lga === lgaValue);
  }, [schools, lgaValue]);

  // Loading state for schools when LGA is selected
  const [isLoadingSchools, setIsLoadingSchools] = useState(false);

  // Simulate schools loading when LGA changes (if needed for API call)
  React.useEffect(() => {
    if (lgaValue && dashboardLoading) {
      setIsLoadingSchools(true);
    } else {
      setIsLoadingSchools(false);
    }
  }, [lgaValue, dashboardLoading]);

  // Reset school selection when LGA changes
  React.useEffect(() => {
    if (lgaValue) {
      setSchool("");
    }
  }, [lgaValue]);

  const handleStudentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setStudent((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setStudent((prev) => ({ ...prev, [name]: value }));
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
      !student.gender
    ) {
      setError("Please fill all student fields.");
      setSuccess(null);
      setShowToast(true);
      return;
    }
    for (const key of subjectKeys) {
      if (
        student.subjects[key] === "" ||
        isNaN(Number(student.subjects[key])) ||
        Number(student.subjects[key]) < 0 ||
        Number(student.subjects[key]) > 100
      ) {
        setError("Please enter valid scores (0-100) for all subjects.");
        setSuccess(null);
        setShowToast(true);
        return;
      }
    }
    setStudents((prev) => [...prev, student]);
    setStudent(initialStudentState);
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

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Loading Dialogs */}
      <LoadingModal
        isOpen={sessionLoading}
        message="Loading academic session and term information..."
      />
      <LoadingModal
        isOpen={dashboardLoading && !sessionLoading && lgas.length === 0}
        message="Loading local government areas..."
      />
      <LoadingModal
        isOpen={isLoadingSchools && !!lgaValue}
        message="Loading schools in selected LGA..."
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
      <div className="max-w-6xl mx-auto">
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
              className={`flex-1 px-6 py-4 font-medium text-center transition-colors rounded-bl-lg rounded-tl-lg ${
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
              className={`flex-1 px-6 py-4 font-medium text-center transition-colors ${
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
              className={`flex-1 px-6 py-4 font-medium text-center transition-colors rounded-br-lg rounded-tr-lg ${
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
                  {sessionLoading && (
                    <p className="text-sm text-gray-500">Loading session...</p>
                  )}
                  {sessionError && (
                    <p className="text-sm text-red-500">{sessionError}</p>
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
                        value="First"
                        className="focus:bg-brand-green/10 focus:text-brand-green hover:bg-brand-green/5 data-[state=checked]:text-brand-green [&>span>svg]:text-brand-green"
                      >
                        First Term
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-brand-black-accent font-medium">
                    Local Government Area
                  </Label>
                  <Select value={lgaValue} onValueChange={setLgaValue}>
                    <SelectTrigger className="focus:ring-brand-green hover:border-brand-green/40">
                      <SelectValue placeholder="Select LGA" />
                    </SelectTrigger>
                    <SelectContent className="border-brand-green/20 text-brand-green">
                      {lgas.map((lga) => (
                        <SelectItem
                          key={lga}
                          value={lga}
                          className="focus:bg-brand-green/10 focus:text-brand-green hover:bg-brand-green/5 data-[state=checked]:text-brand-green [&>span>svg]:text-brand-green"
                        >
                          {lga}
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
                    value={school}
                    onValueChange={setSchool}
                    disabled={!lgaValue || filteredSchools.length === 0}
                  >
                    <SelectTrigger
                      className={`focus:ring-brand-green hover:border-brand-green/40 ${
                        !lgaValue ? "opacity-50" : ""
                      }`}
                    >
                      <SelectValue
                        placeholder={
                          !lgaValue
                            ? "Select LGA first"
                            : filteredSchools.length === 0
                            ? "No schools available"
                            : "Select school"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent className="border-brand-green/20 text-brand-green">
                      {filteredSchools.map((s) => (
                        <SelectItem
                          key={s.id}
                          value={s.name}
                          className="focus:bg-brand-green/10 focus:text-brand-green hover:bg-brand-green/5 data-[state=checked]:text-brand-green [&>span>svg]:text-brand-green"
                        >
                          {s.name}
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
                  className="bg-brand-green"
                >
                  Continue to Add Students
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
                    value={student.class}
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
                          key={c}
                          value={c}
                          className="focus:bg-brand-green/10 focus:text-brand-green hover:bg-brand-green/5 data-[state=checked]:text-brand-green [&>span>svg]:text-brand-green"
                        >
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-brand-black-accent">
                    Student Name
                  </Label>
                  <Input
                    name="studentName"
                    value={student.studentName}
                    onChange={handleStudentChange}
                    placeholder="Enter full name"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-brand-black-accent">Exam Number</Label>
                  <Input
                    name="examNumber"
                    value={student.examNumber}
                    onChange={handleStudentChange}
                    placeholder="Enter exam number"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-brand-black-accent">Gender</Label>
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
                      {genders.map((g) => (
                        <SelectItem
                          key={g}
                          value={g}
                          className="focus:bg-brand-green/10 focus:text-brand-green hover:bg-brand-green/5 data-[state=checked]:text-brand-green [&>span>svg]:text-brand-green"
                        >
                          {g}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Subjects Scores */}
              <div>
                <h3 className="text-lg font-medium text-brand-black mb-4">
                  Subject Scores
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {subjectKeys.map((key) => (
                    <div key={key} className="space-y-2">
                      <Label className="text-sm text-brand-black-accent">
                        {subjectNames[key]}
                      </Label>
                      <Input
                        type="number"
                        min={0}
                        max={100}
                        value={student.subjects[key]}
                        onChange={(e) =>
                          handleSubjectScoreChange(key, e.target.value)
                        }
                        className="text-center"
                        placeholder="0-100"
                      />
                    </div>
                  ))}
                </div>
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
                            {Math.round(
                              Object.values(stu.subjects).reduce(
                                (sum, score) => sum + Number(score),
                                0
                              ) / subjectKeys.length
                            )}
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
                  onClick={() => {
                    setSuccess("Grades submitted successfully!");
                    setError(null);
                    setStudents([]);
                    setActiveTab("session");
                    setShowToast(true);
                  }}
                  className="flex items-center gap-2 font-medium bg-brand-green"
                >
                  <CheckCircleIcon className="w-5 h-5" />
                  Submit All Grades
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
