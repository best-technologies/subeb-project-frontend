"use client";
import React, { useState } from "react";
import { CheckCircleIcon, ExclamationCircleIcon, TrashIcon, PlusIcon, AcademicCapIcon } from "@heroicons/react/24/outline";
import { useGlobalAdminDashboard } from "@/services";
import { subjectNames } from "@/types/student";

const ACCESS_PIN = "2024ASUBEB"; // Change this to your desired pin

const getSessionYears = () => {
  const currentYear = new Date().getFullYear();
  return Array.from({ length: 6 }, (_, i) => `${currentYear - i}/${currentYear - i + 1}`);
};

const terms = ["First", "Second", "Third"];
const genders = ["Male", "Female"];
const subjectKeys = Object.keys(subjectNames) as (keyof typeof subjectNames)[];

const initialStudentState = {
  studentName: "",
  examNumber: "",
  class: "",
  gender: "",
  subjects: Object.fromEntries(subjectKeys.map((key) => [key, ""])) as Record<string, string>,
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
  const [students, setStudents] = useState<typeof initialStudentState[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [activeTab, setActiveTab] = useState<'session' | 'student' | 'review'>('session');
  const [pin, setPin] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);

  // Fetch real data from API
  const { data: dashboardData } = useGlobalAdminDashboard();

  // Use real data from API
  const schools = dashboardData?.data?.schools?.map(s => s.name) || dashboardData?.schools?.map(s => s.name) || [];
  const lgas = dashboardData?.data?.lgas?.map(l => l.name) || dashboardData?.lgas?.map(l => l.name) || [];
  const classes = dashboardData?.data?.classes?.map(c => c.name) || dashboardData?.classes?.map(c => c.name) || [];

  const handleStudentChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setStudent((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubjectScoreChange = (subject: string, value: string) => {
    if (/^\d{0,3}$/.test(value) && (+value <= 100)) {
      setStudent((prev) => ({
        ...prev,
        subjects: { ...prev.subjects, [subject]: value },
      }));
    }
  };

  const handleAddStudent = () => {
    if (!student.studentName || !student.examNumber || !student.class || !student.gender) {
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
    <>
      {!authenticated && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-sm flex flex-col gap-6 border border-gray-200 relative animate-fade-in"
          >
            <h2 className="text-2xl font-bold text-center text-blue-700">Enter Access Pin</h2>
            <input
              type="password"
              value={pin}
              onChange={e => setPin(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg text-center tracking-widest"
              placeholder="Access Pin"
              autoFocus
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !pin}
              className={`w-full py-3 rounded-lg font-semibold text-white transition-colors text-lg ${loading || !pin ? "bg-blue-300 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}`}
            >
              {loading ? "Verifying..." : "Unlock Grades Entry"}
            </button>
            {error && (
              <div className="absolute left-0 right-0 -bottom-14 flex justify-center">
                <div className="bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg animate-shake text-center font-medium">
                  {error}
                </div>
              </div>
            )}
          </form>
        </div>
      )}
      {authenticated && (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
          {/* Toast Notification */}
          {showToast && (error || success) && (
            <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 text-white font-medium ${error ? "bg-red-500" : "bg-green-500"}`}>
              {error ? <ExclamationCircleIcon className="w-5 h-5" /> : <CheckCircleIcon className="w-5 h-5" />}
              {error || success}
            </div>
          )}

          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-3 mb-2">
                <AcademicCapIcon className="w-10 h-10 text-blue-600" />
                <h1 className="text-3xl font-bold text-gray-900">Student Grades Entry</h1>
              </div>
              <p className="text-gray-600">Manage and submit student examination scores</p>
            </div>

            {/* Tab Navigation */}
            <div className="bg-white rounded-lg shadow-sm mb-6">
              <div className="flex border-b">
                <button
                  onClick={() => setActiveTab('session')}
                  className={`flex-1 px-6 py-4 font-medium text-center transition-colors ${
                    activeTab === 'session'
                      ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  1. Session Info
                </button>
                <button
                  onClick={() => canProceedToStudent && setActiveTab('student')}
                  disabled={!canProceedToStudent}
                  className={`flex-1 px-6 py-4 font-medium text-center transition-colors ${
                    activeTab === 'student'
                      ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                      : canProceedToStudent
                      ? 'text-gray-500 hover:text-gray-700'
                      : 'text-gray-300 cursor-not-allowed'
                  }`}
                >
                  2. Add Students
                </button>
                <button
                  onClick={() => canProceedToReview && setActiveTab('review')}
                  disabled={!canProceedToReview}
                  className={`flex-1 px-6 py-4 font-medium text-center transition-colors ${
                    activeTab === 'review'
                      ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                      : canProceedToReview
                      ? 'text-gray-500 hover:text-gray-700'
                      : 'text-gray-300 cursor-not-allowed'
                  }`}
                >
                  3. Review & Submit
                </button>
              </div>
            </div>

            {/* Tab Content */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              {/* Session Info Tab */}
              {activeTab === 'session' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Session Information</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Academic Session</label>
                      <select
                        value={session}
                        onChange={e => setSession(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select session</option>
                        {getSessionYears().map(year => <option key={year} value={year}>{year}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Term</label>
                      <select
                        value={term}
                        onChange={e => setTerm(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select term</option>
                        {terms.map(t => <option key={t} value={t}>{t} Term</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">School</label>
                      <select
                        value={school}
                        onChange={e => setSchool(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select school</option>
                        {schools.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Local Government Area</label>
                      <select
                        value={lgaValue}
                        onChange={e => setLgaValue(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select LGA</option>
                        {lgas.map(lga => <option key={lga} value={lga}>{lga}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="flex justify-end pt-4">
                    <button
                      onClick={() => canProceedToStudent && setActiveTab('student')}
                      disabled={!canProceedToStudent}
                      className={`px-6 py-2 rounded-md font-medium transition-colors ${
                        canProceedToStudent
                          ? 'bg-blue-600 text-white hover:bg-blue-700'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      Continue to Add Students
                    </button>
                  </div>
                </div>
              )}

              {/* Add Students Tab */}
              {activeTab === 'student' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-900">Add Students</h2>
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                      {students.length} student{students.length !== 1 ? 's' : ''} added
                    </span>
                  </div>

                  {/* Student Form */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-gray-50 rounded-lg">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Student Name</label>
                      <input
                        type="text"
                        name="studentName"
                        value={student.studentName}
                        onChange={handleStudentChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter full name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Exam Number</label>
                      <input
                        type="text"
                        name="examNumber"
                        value={student.examNumber}
                        onChange={handleStudentChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter exam number"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Class</label>
                      <select
                        name="class"
                        value={student.class}
                        onChange={handleStudentChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select class</option>
                        {classes.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                      <select
                        name="gender"
                        value={student.gender}
                        onChange={handleStudentChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select gender</option>
                        {genders.map(g => <option key={g} value={g}>{g}</option>)}
                      </select>
                    </div>
                  </div>

                  {/* Subjects Scores */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Subject Scores</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {subjectKeys.map((key) => (
                        <div key={key}>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            {subjectNames[key]}
                          </label>
                          <input
                            type="number"
                            min={0}
                            max={100}
                            value={student.subjects[key]}
                            onChange={e => handleSubjectScoreChange(key, e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center"
                            placeholder="0-100"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-between pt-4">
                    <button
                      onClick={() => setActiveTab('session')}
                      className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleAddStudent}
                      className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                    >
                      <PlusIcon className="w-4 h-4" />
                      Add Student
                    </button>
                  </div>

                  {/* Added Students List */}
                  {students.length > 0 && (
                    <div className="mt-8">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Added Students</h3>
                      <div className="space-y-2">
                        {students.map((stu, idx) => (
                          <div key={idx} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-md">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-medium">
                                {getInitials(stu.studentName)}
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">{stu.studentName}</p>
                                <p className="text-sm text-gray-500">{stu.examNumber} • {stu.class} • {stu.gender}</p>
                              </div>
                            </div>
                            <button
                              onClick={() => handleRemoveStudent(idx)}
                              className="text-red-600 hover:text-red-800 transition-colors"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                      <div className="flex justify-end mt-4">
                        <button
                          onClick={() => setActiveTab('review')}
                          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                        >
                          Review & Submit
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Review Tab */}
              {activeTab === 'review' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-gray-900">Review & Submit</h2>
                  
                  {/* Session Summary */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-medium text-gray-900 mb-2">Session Information</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div><span className="text-gray-600">Session:</span> <span className="font-medium">{session}</span></div>
                      <div><span className="text-gray-600">Term:</span> <span className="font-medium">{term}</span></div>
                      <div><span className="text-gray-600">School:</span> <span className="font-medium">{school}</span></div>
                      <div><span className="text-gray-600">LGA:</span> <span className="font-medium">{lgaValue}</span></div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium text-gray-900 mb-4">Students ({students.length})</h3>
                    <div className="space-y-2">
                      {students.map((stu, idx) => (
                        <div key={idx} className="p-3 border border-gray-200 rounded-md">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-medium">
                                {getInitials(stu.studentName)}
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">{stu.studentName}</p>
                                <p className="text-sm text-gray-500">{stu.examNumber} • {stu.class} • {stu.gender}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-gray-600">
                                Avg: {Math.round(Object.values(stu.subjects).reduce((sum, score) => sum + Number(score), 0) / subjectKeys.length)}%
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-between pt-6">
                    <button
                      onClick={() => setActiveTab('student')}
                      className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                    >
                      Back to Edit
                    </button>
                    <button
                      onClick={() => {
                        setSuccess("Grades submitted successfully!");
                        setError(null);
                        setStudents([]);
                        setActiveTab('session');
                        setShowToast(true);
                      }}
                      className="flex items-center gap-2 px-8 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors font-medium"
                    >
                      <CheckCircleIcon className="w-5 h-5" />
                      Submit All Grades
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}