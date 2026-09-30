"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  useSessions,
  useActivateSession,
  useTerms,
  useActivateTerm,
} from "@/services/hooks/useAcademic";
import { Button } from "@/components/ui/Button";
import {
  Plus,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Calendar,
  Sparkles,
  BookOpen,
  ChevronRight,
  ShieldCheck,
  Layers,
  MoreVertical,
  Eye,
  School,
  FileCheck,
  Clock,
  GraduationCap,
} from "lucide-react";
import { useEnrollmentMetadata } from "@/services/hooks/useEnrollment";
import { getSchoolAnalytics } from "@/services/api";
import { Skeleton } from "@/components/ui/skeleton";
import { CreateSessionModal } from "@/components/academic/CreateSessionModal";
import { CreateTermModal } from "@/components/academic/CreateTermModal";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "react-hot-toast";

interface ConfirmDialogState {
  isOpen: boolean;
  type: "session" | "term";
  id: string;
  name: string;
}

interface ViewDetailState {
  isOpen: boolean;
  type: "session" | "term";
  data: any;
}

export default function AcademicSettingsPage() {
  const { data: sessionsData, isLoading: loadingSessions } = useSessions();
  const activateSessionMutation = useActivateSession();
  const activateTermMutation = useActivateTerm();

  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);
  const [isTermModalOpen, setIsTermModalOpen] = useState(false);

  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState>({
    isOpen: false,
    type: "session",
    id: "",
    name: "",
  });

  const [viewDetailModal, setViewDetailModal] = useState<ViewDetailState>({
    isOpen: false,
    type: "session",
    data: null,
  });

  const sessions = useMemo(() => {
    return (sessionsData?.data || [])
      .slice()
      .sort((a: any, b: any) => b.name.localeCompare(a.name));
  }, [sessionsData?.data]);

  // Auto-select the active session on first load
  useEffect(() => {
    if (sessions.length > 0 && !selectedSessionId) {
      const active = sessions.find((s: any) => s.isCurrent && s.status === "OPEN") || sessions[0];
      if (active) {
        setSelectedSessionId(active.id);
      }
    }
  }, [sessions, selectedSessionId]);

  // Always query terms if a session is selected
  const { data: termsData, isLoading: loadingTerms } = useTerms(selectedSessionId || undefined);
  const terms = termsData?.data || [];

  const { data: enrollmentMetadata } = useEnrollmentMetadata();

  const totalSchoolsFromMetadata = useMemo(() => {
    if (!enrollmentMetadata?.localGovernments) return 0;
    return enrollmentMetadata.localGovernments.reduce(
      (acc: number, lga: any) => acc + (lga.totalSchools || 0),
      0
    );
  }, [enrollmentMetadata]);

  const [isModalAnalyticsLoading, setIsModalAnalyticsLoading] = useState(false);
  const [modalAnalytics, setModalAnalytics] = useState<{
    totalSchools: number;
    uploadedSchoolsCount: number;
    uploadedStudentResultsCount: number;
  } | null>(null);

  const selectedSession = sessions.find((s: any) => s.id === selectedSessionId);
  const activeSession = sessions.find((s: any) => s.isCurrent && s.status === "OPEN");
  const activeTerm = terms.find((t: any) => t.isCurrent && t.status === "OPEN");

  // Fetch live stats (total schools, school results uploaded, student results uploaded) when details modal opens
  useEffect(() => {
    if (viewDetailModal.isOpen && viewDetailModal.data) {
      let isMounted = true;
      setIsModalAnalyticsLoading(true);
      const fetchStats = async () => {
        try {
          const sessionName =
            viewDetailModal.type === "session"
              ? viewDetailModal.data.name
              : selectedSession?.name;
          const termName =
            viewDetailModal.type === "term"
              ? viewDetailModal.data.name
              : "ALL_TERMS";

          const res = await getSchoolAnalytics({
            session: sessionName,
            term: termName,
          });

          if (isMounted && res?.success && res?.data) {
            const summary = res.data.summary;
            const uploadedSchools = (res.data.byLga || []).reduce(
              (acc: number, lga: any) =>
                acc + (lga.studentCount > 0 ? lga.schoolCount : 0),
              0
            );
            setModalAnalytics({
              totalSchools: summary.totalSchools || 0,
              uploadedSchoolsCount: uploadedSchools || 0,
              uploadedStudentResultsCount: summary.totalAssessedStudents || 0,
            });
          }
        } catch (err) {
          console.error("Failed to load detail modal analytics", err);
        } finally {
          if (isMounted) {
            setIsModalAnalyticsLoading(false);
          }
        }
      };
      fetchStats();
      return () => {
        isMounted = false;
      };
    } else {
      setModalAnalytics(null);
      setIsModalAnalyticsLoading(false);
    }
  }, [viewDetailModal.isOpen, viewDetailModal.data, viewDetailModal.type, selectedSession]);

  const formatTermName = (name?: string) => {
    if (!name) return "Not Set";
    return name
      .replace(/_/g, " ")
      .toLowerCase()
      .replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const handleOpenActivateSession = (session: { id: string; name: string }) => {
    setConfirmDialog({
      isOpen: true,
      type: "session",
      id: session.id,
      name: session.name,
    });
  };

  const handleOpenActivateTerm = (term: { id: string; name: string }) => {
    setConfirmDialog({
      isOpen: true,
      type: "term",
      id: term.id,
      name: formatTermName(term.name),
    });
  };

  const handleConfirmAction = () => {
    if (confirmDialog.type === "session") {
      activateSessionMutation.mutate(confirmDialog.id, {
        onSuccess: () => {
          toast.success(`Academic Session ${confirmDialog.name} is now OPEN and active!`);
          setSelectedSessionId(confirmDialog.id);
          setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        },
        onError: (err: any) => {
          const msg = err.response?.data?.message || err.message || "Failed to activate session";
          toast.error(msg);
        },
      });
    } else {
      activateTermMutation.mutate(confirmDialog.id, {
        onSuccess: () => {
          toast.success(`Academic Term ${confirmDialog.name} is now OPEN and active!`);
          setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        },
        onError: (err: any) => {
          const msg = err.response?.data?.message || err.message || "Failed to activate term";
          toast.error(msg);
        },
      });
    }
  };

  const handleViewDetails = (type: "session" | "term", data: any) => {
    setViewDetailModal({
      isOpen: true,
      type,
      data,
    });
  };

  const isPending = activateSessionMutation.isPending || activateTermMutation.isPending;

  return (
    <div className="space-y-6">
      {/* Header & Quick Action Buttons */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Academic Settings</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage academic sessions, terms, and schedule transitions state-wide.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button
            onClick={() => setIsSessionModalOpen(true)}
            className="flex items-center gap-2 bg-brand-primary text-white hover:bg-brand-primary/90 font-medium px-4 py-2.5 rounded-xl shadow-sm transition-all"
          >
            <Plus size={18} />
            <span>Create Session</span>
          </Button>
          <Button
            onClick={() => setIsTermModalOpen(true)}
            className="flex items-center gap-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200/60 font-medium px-4 py-2.5 rounded-xl transition-all"
          >
            <Plus size={18} />
            <span>Create Term</span>
          </Button>
        </div>
      </div>

      {/* Hero Overview Metrics Cards (Subtexts removed per request) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Active Session Summary Card */}
        <div className="bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-950 text-white rounded-2xl p-5 shadow-sm relative overflow-hidden flex flex-col justify-between">
          <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 w-28 h-28 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-200/90">
              Active State-Wide Session
            </span>
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-emerald-300 backdrop-blur-xs">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-bold tracking-tight">
              {loadingSessions ? (
                <Skeleton className="h-8 w-40 bg-white/20 rounded-md" />
              ) : activeSession ? (
                activeSession.name
              ) : (
                "No Active Session"
              )}
            </div>
          </div>
        </div>

        {/* Active Term Summary Card */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Current Evaluation Term
            </span>
            <div className="w-9 h-9 rounded-xl bg-brand-primary/10 text-brand-primary flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-bold text-gray-900 tracking-tight">
              {loadingSessions || loadingTerms ? (
                <Skeleton className="h-8 w-36 rounded-md" />
              ) : activeTerm ? (
                formatTermName(activeTerm.name)
              ) : (
                "No Active Term"
              )}
            </div>
          </div>
        </div>

        {/* Total Sessions Count */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Registered Sessions
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-bold text-gray-900 tracking-tight">
              {loadingSessions ? (
                <Skeleton className="h-8 w-24 rounded-md" />
              ) : (
                `${sessions.length} ${sessions.length === 1 ? "Session" : "Sessions"}`
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Panels Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sessions Panel */}
        <Card className="rounded-2xl border border-gray-100 shadow-sm overflow-hidden bg-white">
          <CardHeader className="bg-gradient-to-r from-gray-50/90 via-gray-50/50 to-white border-b border-gray-100 p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-brand-primary/10 text-brand-primary flex items-center justify-center font-bold shadow-2xs">
                  <Calendar className="w-5 h-5 text-brand-primary" />
                </div>
                <div>
                  <CardTitle className="text-base font-bold text-gray-900 tracking-tight">
                    Academic Sessions
                  </CardTitle>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Click a session to view terms. Exactly 1 session is active state-wide.
                  </p>
                </div>
              </div>
              {loadingSessions ? (
                <Skeleton className="h-6 w-20 rounded-full" />
              ) : (
                <span className="text-xs font-semibold bg-gray-100 text-gray-700 px-3 py-1 rounded-full border border-gray-200/60">
                  {sessions.length} {sessions.length === 1 ? "Session" : "Sessions"}
                </span>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            <Table>
              <TableHeader className="bg-gray-50/70 border-b border-gray-100">
                <TableRow>
                  <TableHead className="w-[50%] text-xs uppercase font-semibold text-gray-500 py-3.5 pl-6">
                    Session Name
                  </TableHead>
                  <TableHead className="w-[35%] text-xs uppercase font-semibold text-gray-500 py-3.5">
                    Status
                  </TableHead>
                  <TableHead className="w-[15%] text-right text-xs uppercase font-semibold text-gray-500 py-3.5 pr-6">
                    Action
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-100/80">
                {loadingSessions ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-gray-500 py-14">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Loader2 className="w-6 h-6 animate-spin text-brand-primary" />
                        <span className="text-sm font-medium text-gray-600">Loading academic sessions...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : sessions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-14">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <div className="w-12 h-12 rounded-2xl bg-gray-100 text-gray-400 flex items-center justify-center">
                          <Calendar className="w-6 h-6" />
                        </div>
                        <p className="text-sm font-semibold text-gray-800">No Academic Sessions</p>
                        <p className="text-xs text-gray-500 max-w-xs">
                          Click "Create Session" above to set up your first academic calendar year.
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  sessions.map(
                    (session: {
                      id: string;
                      name: string;
                      status?: "OPEN" | "CLOSED";
                      isCurrent?: boolean;
                    }) => {
                      const isActive = session.isCurrent && session.status === "OPEN";
                      const isSelected = selectedSessionId === session.id;

                      return (
                        <TableRow
                          key={session.id}
                          className={`cursor-pointer transition-all ${
                            isSelected
                              ? "bg-emerald-50/70 border-l-4 border-l-brand-primary"
                              : "hover:bg-gray-50/80 border-l-4 border-l-transparent"
                          }`}
                          onClick={() => setSelectedSessionId(session.id)}
                        >
                          <TableCell className="py-4 pl-6 font-bold text-gray-900 text-base">
                            <div className="flex items-center gap-3">
                              <span>{session.name}</span>
                              {isSelected && (
                                <span className="text-[10px] font-bold tracking-wide uppercase text-brand-primary bg-brand-primary/10 px-2 py-0.5 rounded-full">
                                  Selected
                                </span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="py-4">
                            {isActive ? (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100/90 text-emerald-800 border border-emerald-300/60 shadow-2xs">
                                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                                OPEN (Active)
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
                                CLOSED
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="text-right py-4 pr-6">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  className="h-8 w-8 p-0 hover:bg-gray-100 rounded-lg text-gray-500"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <span className="sr-only">Open menu</span>
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-44 font-sans">
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleViewDetails("session", session);
                                  }}
                                  className="cursor-pointer"
                                >
                                  <Eye className="mr-2 h-4 w-4 text-gray-500" />
                                  <span>View Session</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  disabled={isActive || isPending}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleOpenActivateSession(session);
                                  }}
                                  className="cursor-pointer disabled:opacity-50"
                                >
                                  <CheckCircle2 className="mr-2 h-4 w-4 text-emerald-600" />
                                  <span>{isActive ? "Active (Current)" : "Activate Session"}</span>
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    }
                  )
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Terms Panel */}
        <Card className="rounded-2xl border border-gray-100 shadow-sm overflow-hidden bg-white">
          <CardHeader className="bg-gradient-to-r from-gray-50/90 via-gray-50/50 to-white border-b border-gray-100 p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold shadow-2xs">
                  <BookOpen className="w-5 h-5 text-emerald-700" />
                </div>
                <div>
                  <CardTitle className="text-base font-bold text-gray-900 tracking-tight">
                    Academic Terms {selectedSession ? `(${selectedSession.name})` : ""}
                  </CardTitle>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Exactly 1 term is open and active for evaluations.
                  </p>
                </div>
              </div>
              {selectedSession && (
                <span className="text-xs font-semibold bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full border border-emerald-200/60">
                  {terms.length} {terms.length === 1 ? "Term" : "Terms"}
                </span>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            {selectedSessionId ? (
              <Table>
                <TableHeader className="bg-gray-50/70 border-b border-gray-100">
                  <TableRow>
                    <TableHead className="w-[50%] text-xs uppercase font-semibold text-gray-500 py-3.5 pl-6">
                      Term Name
                    </TableHead>
                    <TableHead className="w-[35%] text-xs uppercase font-semibold text-gray-500 py-3.5">
                      Status
                    </TableHead>
                    <TableHead className="w-[15%] text-right text-xs uppercase font-semibold text-gray-500 py-3.5 pr-6">
                      Action
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-gray-100/80">
                  {loadingTerms ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-gray-500 py-14">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <Loader2 className="w-6 h-6 animate-spin text-brand-primary" />
                          <span className="text-sm font-medium text-gray-600">Loading terms...</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : terms.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-14">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                            <BookOpen className="w-6 h-6" />
                          </div>
                          <p className="text-sm font-semibold text-gray-800">No Terms Registered</p>
                          <p className="text-xs text-gray-500 max-w-xs">
                            No terms created for session <strong>{selectedSession?.name}</strong> yet.
                          </p>
                          <Button
                            size="sm"
                            onClick={() => setIsTermModalOpen(true)}
                            className="mt-2 bg-brand-primary text-white text-xs rounded-xl px-4"
                          >
                            <Plus className="w-3.5 h-3.5 mr-1" />
                            Create Term
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    terms.map(
                      (term: {
                        id: string;
                        name: string;
                        status?: "OPEN" | "CLOSED";
                        isCurrent?: boolean;
                      }) => {
                        const isActive = term.isCurrent && term.status === "OPEN";

                        return (
                          <TableRow key={term.id} className="hover:bg-gray-50/80 transition-all">
                            <TableCell className="py-4 pl-6 font-bold text-gray-900 text-base">
                              {formatTermName(term.name)}
                            </TableCell>
                            <TableCell className="py-4">
                              {isActive ? (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100/90 text-emerald-800 border border-emerald-300/60 shadow-2xs">
                                  <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                                  OPEN (Active)
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
                                  CLOSED
                                </span>
                              )}
                            </TableCell>
                            <TableCell className="text-right py-4 pr-6">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    className="h-8 w-8 p-0 hover:bg-gray-100 rounded-lg text-gray-500"
                                  >
                                    <span className="sr-only">Open menu</span>
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-44 font-sans">
                                  <DropdownMenuItem
                                    onClick={() => handleViewDetails("term", term)}
                                    className="cursor-pointer"
                                  >
                                    <Eye className="mr-2 h-4 w-4 text-gray-500" />
                                    <span>View Term</span>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    disabled={isActive || isPending}
                                    onClick={() => handleOpenActivateTerm(term)}
                                    className="cursor-pointer disabled:opacity-50"
                                  >
                                    <CheckCircle2 className="mr-2 h-4 w-4 text-emerald-600" />
                                    <span>{isActive ? "Active (Current)" : "Activate Term"}</span>
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        );
                      }
                    )
                  )}
                </TableBody>
              </Table>
            ) : (
              <div className="p-16 text-center text-gray-400 text-sm flex flex-col items-center justify-center gap-2">
                <div className="w-12 h-12 rounded-2xl bg-gray-100 text-gray-400 flex items-center justify-center">
                  <Layers className="w-6 h-6" />
                </div>
                <p className="font-semibold text-gray-700">No Session Selected</p>
                <p className="text-xs text-gray-500 max-w-xs">
                  Select an academic session from the left panel to inspect its terms.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* View Details Modal (ShadCN-based) */}
      <Dialog
        open={viewDetailModal.isOpen}
        onOpenChange={(open) => {
          if (!open) setViewDetailModal((prev) => ({ ...prev, isOpen: false }));
        }}
      >
        <DialogContent className="sm:max-w-lg rounded-2xl p-6">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-brand-primary/10 text-brand-primary flex items-center justify-center shrink-0">
                {viewDetailModal.type === "session" ? (
                  <Calendar className="w-6 h-6 text-brand-primary" />
                ) : (
                  <BookOpen className="w-6 h-6 text-brand-primary" />
                )}
              </div>
              <div>
                <DialogTitle className="text-lg font-bold text-gray-900">
                  {viewDetailModal.type === "session" ? "Session Details" : "Term Details"}
                </DialogTitle>
                <DialogDescription className="text-xs text-gray-500">
                  Comprehensive academic schedule information
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {viewDetailModal.data && (() => {
            const totalSchoolsCount =
              viewDetailModal.data.totalSchools ??
              viewDetailModal.data.schoolsCount ??
              (modalAnalytics?.totalSchools && modalAnalytics.totalSchools > 0
                ? modalAnalytics.totalSchools
                : totalSchoolsFromMetadata);

            const uploadedSchoolsCount =
              viewDetailModal.data.uploadedSchoolsCount ??
              viewDetailModal.data.resultsCount ??
              modalAnalytics?.uploadedSchoolsCount ??
              0;

            const studentResultsCount =
              viewDetailModal.data.uploadedStudentResultsCount ??
              viewDetailModal.data.totalAssessedStudents ??
              modalAnalytics?.uploadedStudentResultsCount ??
              0;

            return (
              <div className="space-y-4 pt-3">
                {/* Primary Name & Status Header Banner */}
                <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 border border-gray-100">
                  <div>
                    <span className="text-xs text-gray-500 uppercase font-semibold tracking-wider">
                      {viewDetailModal.type === "session" ? "Session Name" : "Term Name"}
                    </span>
                    <p className="text-xl font-bold text-gray-900">
                      {viewDetailModal.type === "session"
                        ? viewDetailModal.data.name
                        : formatTermName(viewDetailModal.data.name)}
                    </p>
                    {viewDetailModal.type === "term" && selectedSession && (
                      <p className="text-xs text-gray-500 font-medium mt-0.5">
                        Session: <span className="font-semibold text-gray-700">{selectedSession.name}</span>
                      </p>
                    )}
                  </div>
                  <div>
                    {viewDetailModal.data.isCurrent && viewDetailModal.data.status === "OPEN" ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                        <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                        OPEN (Active)
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
                        CLOSED
                      </span>
                    )}
                  </div>
                </div>

                {/* Detailed Metrics Balanced 2x2 Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Running Time / Duration */}
                  <div className="p-3.5 rounded-xl border border-gray-100 bg-white space-y-1">
                    <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                      <Clock className="w-4 h-4 text-brand-primary" />
                      <span>Duration / Dates</span>
                    </div>
                    <p className="text-sm font-semibold text-gray-900">
                      {viewDetailModal.data.startDate && viewDetailModal.data.endDate
                        ? `${viewDetailModal.data.startDate.split("T")[0]} to ${viewDetailModal.data.endDate.split("T")[0]}`
                        : "Not specified"}
                    </p>
                  </div>

                  {/* Total Schools Added */}
                  <div className="p-3.5 rounded-xl border border-gray-100 bg-white space-y-1">
                    <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                      <School className="w-4 h-4 text-emerald-600" />
                      <span>Total Schools Added</span>
                    </div>
                    {isModalAnalyticsLoading ? (
                      <Skeleton className="h-5 w-24 rounded-md mt-1" />
                    ) : (
                      <p className="text-sm font-semibold text-gray-900">
                        {totalSchoolsCount} {totalSchoolsCount === 1 ? "School" : "Schools"}
                      </p>
                    )}
                  </div>

                  {/* School Results Uploaded */}
                  <div className="p-3.5 rounded-xl border border-gray-100 bg-white space-y-1">
                    <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                      <FileCheck className="w-4 h-4 text-emerald-600" />
                      <span>School Results Uploaded</span>
                    </div>
                    {isModalAnalyticsLoading ? (
                      <Skeleton className="h-5 w-24 rounded-md mt-1" />
                    ) : (
                      <p className="text-sm font-semibold text-gray-900">
                        {uploadedSchoolsCount} {uploadedSchoolsCount === 1 ? "School" : "Schools"}
                      </p>
                    )}
                  </div>

                  {/* Student Results Uploaded */}
                  <div className="p-3.5 rounded-xl border border-gray-100 bg-white space-y-1">
                    <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                      <GraduationCap className="w-4 h-4 text-emerald-600" />
                      <span>Student Results Uploaded</span>
                    </div>
                    {isModalAnalyticsLoading ? (
                      <Skeleton className="h-5 w-28 rounded-md mt-1" />
                    ) : (
                      <p className="text-sm font-semibold text-gray-900">
                        {studentResultsCount} {studentResultsCount === 1 ? "Result" : "Results"}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })()}

          <DialogFooter className="mt-4">
            <Button
              onClick={() => setViewDetailModal((prev) => ({ ...prev, isOpen: false }))}
              className="w-full bg-brand-primary hover:bg-brand-primary/90 text-white rounded-xl py-2"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog Box */}
      <Dialog
        open={confirmDialog.isOpen}
        onOpenChange={(open) => {
          if (!isPending) {
            setConfirmDialog((prev) => ({ ...prev, isOpen: open }));
          }
        }}
      >
        <DialogContent className="sm:max-w-md rounded-2xl p-6">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-200/60">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold text-gray-900">
                  {confirmDialog.type === "session"
                    ? "Switch Active Session?"
                    : "Switch Active Term?"}
                </DialogTitle>
                <p className="text-xs text-gray-500">State-wide academic calendar transition</p>
              </div>
            </div>
            <DialogDescription asChild>
              <div className="text-sm text-gray-600 pt-4 space-y-3">
                {confirmDialog.type === "session" ? (
                  <>
                    <p>
                      Are you sure you want to open and activate{" "}
                      <strong className="text-gray-900 font-semibold">{confirmDialog.name}</strong>?
                    </p>
                    <div className="text-xs text-amber-800 bg-amber-50/80 p-3 rounded-xl border border-amber-200/80 space-y-1">
                      <strong className="font-semibold block">Notice:</strong>
                      <p>
                        This will set <strong>{confirmDialog.name}</strong> as the active session.
                        Other sessions and terms will be automatically closed.
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <p>
                      Are you sure you want to open and activate{" "}
                      <strong className="text-gray-900 font-semibold">{confirmDialog.name}</strong>{" "}
                      for <strong className="text-gray-900">{selectedSession?.name}</strong>?
                    </p>
                    <div className="text-xs text-amber-800 bg-amber-50/80 p-3 rounded-xl border border-amber-200/80 space-y-1">
                      <strong className="font-semibold block">Notice:</strong>
                      <p>
                        This will set <strong>{confirmDialog.name}</strong> as the current evaluation
                        term for results and records.
                      </p>
                    </div>
                  </>
                )}
              </div>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-6 gap-2 sm:gap-0">
            <Button
              variant="outline"
              disabled={isPending}
              onClick={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
              className="rounded-xl"
            >
              Cancel
            </Button>
            <Button
              className="bg-brand-primary hover:bg-brand-primary/90 text-white font-medium rounded-xl"
              disabled={isPending}
              onClick={handleConfirmAction}
            >
              {isPending ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Activating...</span>
                </div>
              ) : (
                `Activate ${confirmDialog.type === "session" ? "Session" : "Term"}`
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <CreateSessionModal
        isOpen={isSessionModalOpen}
        onClose={() => setIsSessionModalOpen(false)}
      />

      <CreateTermModal
        isOpen={isTermModalOpen}
        onClose={() => setIsTermModalOpen(false)}
        defaultSessionId={selectedSessionId || undefined}
      />
    </div>
  );
}