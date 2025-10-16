"use client";
import React, { useState, useMemo } from "react";
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  TrashIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
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
import ProtectedRoute from "@/components/ProtectedRoute";

const ACCESS_PIN = "2024ASUBEB"; // Change this to your desired pin

const genders = ["Male", "Female"];
const subjectKeys = Object.keys(subjectNames) as (keyof typeof subjectNames)[];

// Helper function to convert term format
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
  const [pin, setPin] = useState("2024ASUBEB");
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);

  // Fetch real data from API
  const { data: dashboardData } = useGlobalAdminDashboard();
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

  const handleRemoveStudent = (index: number) => {
    setStudents((prev) => prev.filter((_, i) => i !== index));
    setSuccess("Student removed.");
    setError(null);
    setShowToast(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      if (pin === ACCESS_PIN) {
        setAuthenticated(true);
        setError("");
      } else {
        setError("Invalid access pin. Please try again.");
      }
      setLoading(false);
    }, 600);
  };

  const canProceedToStudent = session && term && school && lgaValue;
  const canProceedToReview = students.length > 0;

  React.useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => setShowToast(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  return (
    <ProtectedRoute>
      {!authenticated && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-sm flex flex-col gap-6 border border-gray-200 relative animate-fade-in"
          >
            <h2 className="text-2xl font-bold text-center text-brand-primary">
              Enter Access Pin
            </h2>
            <Input
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              className="text-lg text-center tracking-widest"
              placeholder="Access Pin"
              autoFocus
              disabled={loading}
            />
            <Button
              type="submit"
              disabled={loading || !pin}
              className="text-lg"
            >
              {loading ? "Verifying..." : "Unlock Grades Entry"}
            </Button>
            {error && (
              <div className="absolute left-0 right-0 -bottom-14 flex justify-center">
                <div className="bg-destructive text-destructive-foreground px-4 py-2 rounded-lg shadow-lg animate-shake text-center font-medium">
                  {error}
                </div>
              </div>
            )}
          </form>
        </div>
      )}
      {authenticated && (
        <div className="min-h-screen bg-brand-accent-background py-8 px-4">
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

          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="flex flex-col items-center justify-center gap-3 mb-2">
                {/* ASUBEB | Logo */}
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-brand-secondary rounded-lg flex items-center justify-center">
                    <span className="text-brand-secondary-contrast font-bold text-sm">
                      A
                    </span>
                  </div>
                  <span className="text-brand-primary  font-bold text-lg">
                    ASUBEB
                  </span>
                </div>
                {/* <AcademicCapIcon className="w-10 h-10 text-brand-primary" /> */}
                <h1 className="text-3xl font-bold text-brand-primary">
                  Student Grades Entry
                </h1>
              </div>
              <p className="text-gray-600">
                Manage and submit student examination scores
              </p>
            </div>

            {/* Tab Navigation */}
            <div className="bg-white rounded-lg shadow-sm mb-6">
              <div className="flex border-b">
                <button
                  onClick={() => setActiveTab("session")}
                  className={`flex-1 px-6 py-4 font-medium text-center transition-colors ${
                    activeTab === "session"
                      ? "text-brand-primary border-b-2 border-brand-primary bg-brand-primary/5"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  1. Session Info
                </button>
                <button
                  onClick={() => canProceedToStudent && setActiveTab("student")}
                  disabled={!canProceedToStudent}
                  className={`flex-1 px-6 py-4 font-medium text-center transition-colors ${
                    activeTab === "student"
                      ? "text-brand-primary border-b-2 border-brand-primary bg-brand-primary/5"
                      : canProceedToStudent
                      ? "text-gray-500 hover:text-gray-700"
                      : "text-gray-300 cursor-not-allowed"
                  }`}
                >
                  2. Add Students
                </button>
                <button
                  onClick={() => canProceedToReview && setActiveTab("review")}
                  disabled={!canProceedToReview}
                  className={`flex-1 px-6 py-4 font-medium text-center transition-colors ${
                    activeTab === "review"
                      ? "text-brand-primary border-b-2 border-brand-primary bg-brand-primary/5"
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
            <div className="bg-white rounded-lg shadow-sm p-6">
              {/* Session Info Tab */}
              {activeTab === "session" && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    Session Information
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>Academic Session</Label>
                      <Select
                        value={session}
                        onValueChange={setSession}
                        disabled
                      >
                        <SelectTrigger className="opacity-50">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={session}>{session}</SelectItem>
                        </SelectContent>
                      </Select>
                      {sessionLoading && (
                        <p className="text-sm text-gray-500">
                          Loading session...
                        </p>
                      )}
                      {sessionError && (
                        <p className="text-sm text-red-500">{sessionError}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label>Term</Label>
                      <Select value={term} onValueChange={setTerm} disabled>
                        <SelectTrigger className="opacity-50">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={term}>{term} Term</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Local Government Area</Label>
                      <Select value={lgaValue} onValueChange={setLgaValue}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select LGA" />
                        </SelectTrigger>
                        <SelectContent>
                          {lgas.map((lga) => (
                            <SelectItem key={lga} value={lga}>
                              {lga}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>School</Label>
                      <Select
                        value={school}
                        onValueChange={setSchool}
                        disabled={!lgaValue || filteredSchools.length === 0}
                      >
                        <SelectTrigger
                          className={!lgaValue ? "opacity-50" : ""}
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
                        <SelectContent>
                          {filteredSchools.map((s) => (
                            <SelectItem key={s.id} value={s.name}>
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
                        canProceedToStudent && setActiveTab("student")
                      }
                      disabled={!canProceedToStudent}
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
                    <h2 className="text-xl font-semibold text-gray-900">
                      Add Students
                    </h2>
                    <span className="bg-brand-primary/10 text-brand-primary px-3 py-1 rounded-full text-sm font-medium">
                      {students.length} student
                      {students.length !== 1 ? "s" : ""} added
                    </span>
                  </div>

                  {/* Student Form */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-gray-50 rounded-lg">
                    <div className="space-y-2">
                      <Label>Student Name</Label>
                      <Input
                        name="studentName"
                        value={student.studentName}
                        onChange={handleStudentChange}
                        placeholder="Enter full name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Exam Number</Label>
                      <Input
                        name="examNumber"
                        value={student.examNumber}
                        onChange={handleStudentChange}
                        placeholder="Enter exam number"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Class</Label>
                      <Select
                        value={student.class}
                        onValueChange={(value) =>
                          handleSelectChange("class", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select class" />
                        </SelectTrigger>
                        <SelectContent>
                          {classes.map((c) => (
                            <SelectItem key={c} value={c}>
                              {c}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Gender</Label>
                      <Select
                        value={student.gender}
                        onValueChange={(value) =>
                          handleSelectChange("gender", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          {genders.map((g) => (
                            <SelectItem key={g} value={g}>
                              {g}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Subjects Scores */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      Subject Scores
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {subjectKeys.map((key) => (
                        <div key={key} className="space-y-2">
                          <Label className="text-sm">{subjectNames[key]}</Label>
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
                      onClick={() => setActiveTab("session")}
                    >
                      Back
                    </Button>
                    <Button
                      onClick={handleAddStudent}
                      className="flex items-center gap-2"
                    >
                      <PlusIcon className="w-4 h-4" />
                      Add Student
                    </Button>
                  </div>

                  {/* Added Students List */}
                  {students.length > 0 && (
                    <div className="mt-8">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">
                        Added Students
                      </h3>
                      <div className="space-y-2">
                        {students.map((stu, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-md"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-brand-primary text-brand-primary-foreground flex items-center justify-center text-sm font-medium">
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
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveStudent(idx)}
                              className="text-destructive hover:text-destructive"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                      <div className="flex justify-end mt-4">
                        <Button onClick={() => setActiveTab("review")}>
                          Review & Submit
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Review Tab */}
              {activeTab === "review" && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Review & Submit
                  </h2>

                  {/* Session Summary */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-medium text-gray-900 mb-2">
                      Session Information
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Session:</span>{" "}
                        <span className="font-medium">{session}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Term:</span>{" "}
                        <span className="font-medium">{term}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">School:</span>{" "}
                        <span className="font-medium">{school}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">LGA:</span>{" "}
                        <span className="font-medium">{lgaValue}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium text-gray-900 mb-4">
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
                              <div className="w-8 h-8 rounded-full bg-brand-primary text-brand-primary-foreground flex items-center justify-center text-sm font-medium">
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
                      onClick={() => setActiveTab("student")}
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
                      className="flex items-center gap-2 font-medium"
                    >
                      <CheckCircleIcon className="w-5 h-5" />
                      Submit All Grades
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </ProtectedRoute>
  );
}
