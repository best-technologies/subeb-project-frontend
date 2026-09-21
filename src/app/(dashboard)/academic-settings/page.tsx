"use client";

import React, { useState, useEffect } from "react";
import {
  useSessions,
  useActivateSession,
  useTerms,
  useActivateTerm,
} from "@/services/hooks/useAcademic";
import { Button } from "@/components/ui/Button";
import { Plus, CheckCircle2, AlertTriangle, Loader2 } from "lucide-react";
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
import { toast } from "react-hot-toast";

interface ConfirmDialogState {
  isOpen: boolean;
  type: "session" | "term";
  id: string;
  name: string;
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

  const sessions = sessionsData?.data || [];

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

  const selectedSession = sessions.find((s: any) => s.id === selectedSessionId);

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

  const isPending = activateSessionMutation.isPending || activateTermMutation.isPending;

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Academic Settings</h1>
          <p className="text-gray-600">
            Manage academic sessions, terms, and schedule transitions state-wide.
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            className="flex items-center gap-2 bg-brand-primary hover:bg-brand-primary/90 text-white shadow-xs"
            onClick={() => setIsSessionModalOpen(true)}
          >
            <Plus size={18} />
            <span>Create Session</span>
          </Button>
          <Button
            className="flex items-center gap-2 bg-brand-primary hover:bg-brand-primary/90 text-white shadow-xs"
            onClick={() => setIsTermModalOpen(true)}
          >
            <Plus size={18} />
            <span>Create Term</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Sessions Panel */}
        <Card className="overflow-hidden border border-gray-200 shadow-xs">
          <CardHeader className="bg-gray-50/80 border-b border-gray-100 p-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold text-gray-900">
                  Academic Sessions
                </CardTitle>
                <p className="text-xs text-gray-500 mt-0.5">
                  Click a session to view its terms. Exactly one session is active state-wide.
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            <Table>
              <TableHeader className="bg-gray-50/50">
                <TableRow>
                  <TableHead className="w-[40%] text-xs uppercase font-semibold text-gray-600">
                    Session Name
                  </TableHead>
                  <TableHead className="w-[30%] text-xs uppercase font-semibold text-gray-600">
                    Status
                  </TableHead>
                  <TableHead className="w-[30%] text-right text-xs uppercase font-semibold text-gray-600">
                    Action
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loadingSessions ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-gray-500 py-8">
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin text-brand-primary" />
                        <span>Loading sessions...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : sessions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-gray-500 py-8">
                      No academic sessions found
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
                          className={`cursor-pointer transition-colors ${
                            isSelected
                              ? "bg-emerald-50/50 hover:bg-emerald-50"
                              : "hover:bg-gray-50"
                          }`}
                          onClick={() => setSelectedSessionId(session.id)}
                        >
                          <TableCell className="font-semibold text-gray-900 py-3.5">
                            <div className="flex items-center gap-2">
                              <span>{session.name}</span>
                              {isSelected && (
                                <span className="text-[11px] font-medium text-emerald-700 bg-emerald-100/60 px-2 py-0.5 rounded">
                                  Selected
                                </span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="py-3.5">
                            {isActive ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                                OPEN (Active)
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
                                CLOSED
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="text-right py-3.5">
                            {isActive ? (
                              <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                Active Session
                              </span>
                            ) : (
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 text-xs font-medium text-brand-primary border-brand-primary hover:bg-brand-primary hover:text-white transition-colors"
                                disabled={isPending}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenActivateSession(session);
                                }}
                              >
                                Open & Activate
                              </Button>
                            )}
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
        <Card className="overflow-hidden border border-gray-200 shadow-xs">
          <CardHeader className="bg-gray-50/80 border-b border-gray-100 p-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold text-gray-900">
                  Academic Terms {selectedSession ? `(${selectedSession.name})` : ""}
                </CardTitle>
                <p className="text-xs text-gray-500 mt-0.5">
                  Exactly one term is open and active for student evaluations.
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            {selectedSessionId ? (
              <Table>
                <TableHeader className="bg-gray-50/50">
                  <TableRow>
                    <TableHead className="w-[40%] text-xs uppercase font-semibold text-gray-600">
                      Term Name
                    </TableHead>
                    <TableHead className="w-[30%] text-xs uppercase font-semibold text-gray-600">
                      Status
                    </TableHead>
                    <TableHead className="w-[30%] text-right text-xs uppercase font-semibold text-gray-600">
                      Action
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loadingTerms ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-gray-500 py-8">
                        <div className="flex items-center justify-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin text-brand-primary" />
                          <span>Loading terms...</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : terms.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-gray-500 py-8">
                        No terms created for this session yet
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
                          <TableRow key={term.id} className="hover:bg-gray-50 transition-colors">
                            <TableCell className="font-semibold text-gray-900 py-3.5">
                              {formatTermName(term.name)}
                            </TableCell>
                            <TableCell className="py-3.5">
                              {isActive ? (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                                  OPEN (Active)
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
                                  CLOSED
                                </span>
                              )}
                            </TableCell>
                            <TableCell className="text-right py-3.5">
                              {isActive ? (
                                <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                  Active Term
                                </span>
                              ) : (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-8 text-xs font-medium text-brand-primary border-brand-primary hover:bg-brand-primary hover:text-white transition-colors"
                                  disabled={isPending}
                                  onClick={() => handleOpenActivateTerm(term)}
                                >
                                  Open & Activate
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      }
                    )
                  )}
                </TableBody>
              </Table>
            ) : (
              <div className="p-10 text-center text-gray-500">
                Please select a session from the left panel to view and manage its terms.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Confirmation Dialog Box */}
      <Dialog
        open={confirmDialog.isOpen}
        onOpenChange={(open) => {
          if (!isPending) {
            setConfirmDialog((prev) => ({ ...prev, isOpen: open }));
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold text-gray-900">
                  {confirmDialog.type === "session"
                    ? "Switch Active Academic Session?"
                    : "Switch Active Academic Term?"}
                </DialogTitle>
              </div>
            </div>
            <DialogDescription className="text-sm text-gray-600 pt-3 space-y-2">
              {confirmDialog.type === "session" ? (
                <>
                  <p>
                    Are you sure you want to open and activate{" "}
                    <strong className="text-gray-900 font-semibold">{confirmDialog.name}</strong>?
                  </p>
                  <p className="text-xs text-amber-700 bg-amber-50 p-2.5 rounded-md border border-amber-200">
                    <strong>Notice:</strong> This will make{" "}
                    <strong>{confirmDialog.name}</strong> the state-wide active session. All other
                    sessions and their terms will be automatically closed, and the admin dashboard
                    will immediately reflect this active period.
                  </p>
                </>
              ) : (
                <>
                  <p>
                    Are you sure you want to open and activate{" "}
                    <strong className="text-gray-900 font-semibold">{confirmDialog.name}</strong>{" "}
                    for <strong className="text-gray-900">{selectedSession?.name}</strong>?
                  </p>
                  <p className="text-xs text-amber-700 bg-amber-50 p-2.5 rounded-md border border-amber-200">
                    <strong>Notice:</strong> This will set <strong>{confirmDialog.name}</strong> as
                    the current active term for student evaluations and results. Previously active
                    terms will be closed.
                  </p>
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 gap-2 sm:gap-0">
            <Button
              variant="outline"
              disabled={isPending}
              onClick={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
            >
              Cancel
            </Button>
            <Button
              className="bg-brand-primary hover:bg-brand-primary/90 text-white font-medium"
              disabled={isPending}
              onClick={handleConfirmAction}
            >
              {isPending ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Activating...</span>
                </div>
              ) : (
                `Yes, Activate ${confirmDialog.type === "session" ? "Session" : "Term"}`
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
      />
    </div>
  );
}