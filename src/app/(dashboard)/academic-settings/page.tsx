"use client";

import React, { useState } from "react";
import { useSessions, useUpdateSessionStatus, useActivateSession, useTerms, useUpdateTermStatus, useActivateTerm } from "@/services/hooks/useAcademic";
import { Button } from "@/components/ui/Button";
import { Plus } from "lucide-react";
import { CreateSessionModal } from "@/components/academic/CreateSessionModal";
import { CreateTermModal } from "@/components/academic/CreateTermModal";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";

export default function AcademicSettingsPage() {
  const { data: sessionsData, isLoading: loadingSessions } = useSessions();
  const updateSessionMutation = useUpdateSessionStatus();
  const activateSessionMutation = useActivateSession();
  const updateTermMutation = useUpdateTermStatus();
  const activateTermMutation = useActivateTerm();

  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);
  const [isTermModalOpen, setIsTermModalOpen] = useState(false);
  
  // Always query terms if a session is selected
  const { data: termsData, isLoading: loadingTerms } = useTerms(selectedSessionId || undefined);

  const sessions = sessionsData?.data || [];
  const terms = termsData?.data || [];

  const handleToggleSessionStatus = (id: string, currentStatus: 'OPEN' | 'CLOSED') => {
    const newStatus = currentStatus === 'OPEN' ? 'CLOSED' : 'OPEN';
    updateSessionMutation.mutate({ id, status: newStatus });
  };

  const handleToggleTermStatus = (id: string, currentStatus: 'OPEN' | 'CLOSED') => {
    const newStatus = currentStatus === 'OPEN' ? 'CLOSED' : 'OPEN';
    updateTermMutation.mutate({ id, status: newStatus });
  };

  const handleActivateSession = (id: string) => {
    activateSessionMutation.mutate(id);
  };

  const handleActivateTerm = (id: string) => {
    activateTermMutation.mutate(id);
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Academic Settings</h1>
          <p className="text-gray-600">Manage sessions, terms, and their statuses.</p>
        </div>
        <div className="flex gap-4">
          <Button 
            className="flex items-center gap-2 bg-brand-primary text-white"
            onClick={() => setIsSessionModalOpen(true)}
          >
            <Plus size={20} />
            <span>Create Session</span>
          </Button>
          <Button 
            className="flex items-center gap-2 bg-brand-primary text-white"
            onClick={() => setIsTermModalOpen(true)}
          >
            <Plus size={20} />
            <span>Create Term</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Sessions Panel */}
        <Card className="overflow-hidden">
          <CardHeader className="bg-gray-50 border-b border-gray-100 p-4">
            <CardTitle className="text-lg font-semibold text-gray-800">Sessions</CardTitle>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            <Table>
              <TableHeader className="bg-brand-accent-background">
                <TableRow>
                  <TableHead className="w-[30%]">Session Name</TableHead>
                  <TableHead className="w-[25%]">Current</TableHead>
                  <TableHead className="w-[20%]">Status</TableHead>
                  <TableHead className="text-right w-[25%]">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loadingSessions ? (
                  <TableRow><TableCell colSpan={4} className="text-center text-gray-500 py-4">Loading...</TableCell></TableRow>
                ) : sessions.length === 0 ? (
                  <TableRow><TableCell colSpan={4} className="text-center text-gray-500 py-4">No sessions found</TableCell></TableRow>
                ) : (
                  sessions.map((session: { id: string, name: string, status?: 'OPEN' | 'CLOSED', isCurrent?: boolean }) => (
                    <TableRow 
                      key={session.id} 
                      className={`cursor-pointer transition-colors ${selectedSessionId === session.id ? 'bg-brand-secondary/10 hover:bg-brand-secondary/20' : 'hover:bg-gray-50'}`}
                      onClick={() => setSelectedSessionId(session.id)}
                    >
                      <TableCell className="font-medium text-gray-900">
                        {session.name}
                        {session.isCurrent && (
                          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                            Active
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        {session.isCurrent ? (
                           <span className="text-sm font-medium text-gray-500">Current</span>
                        ) : (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="text-brand-primary hover:bg-brand-primary/10 hover:text-brand-primary h-8"
                            disabled={activateSessionMutation.isPending}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleActivateSession(session.id);
                            }}
                          >
                            Set Active
                          </Button>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${session.status === 'OPEN' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                          {session.status || 'CLOSED'}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="outline" 
                          size="sm"
                          className={`h-8 ${session.status === 'OPEN' ? "!bg-red-500 !text-white !border-red-500 hover:!bg-transparent hover:!text-red-500 hover:!border-red-500" : "text-brand-primary border-brand-primary"}`}
                          disabled={updateSessionMutation.isPending}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleSessionStatus(session.id, session.status || 'CLOSED');
                          }}
                        >
                          {session.status === 'OPEN' ? 'Close' : 'Open'}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Terms Panel */}
        <Card className="overflow-hidden">
          <CardHeader className="bg-gray-50 border-b border-gray-100 p-4 flex flex-row justify-between items-center space-y-0">
            <CardTitle className="text-lg font-semibold text-gray-800">Terms</CardTitle>
            {!selectedSessionId && <span className="text-sm text-gray-500">Select a session first</span>}
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            {selectedSessionId ? (
              <Table>
                <TableHeader className="bg-brand-accent-background">
                  <TableRow>
                    <TableHead className="w-[30%]">Term Name</TableHead>
                    <TableHead className="w-[25%]">Current</TableHead>
                    <TableHead className="w-[20%]">Status</TableHead>
                    <TableHead className="text-right w-[25%]">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loadingTerms ? (
                    <TableRow><TableCell colSpan={4} className="text-center text-gray-500 py-4">Loading terms...</TableCell></TableRow>
                  ) : terms.length === 0 ? (
                    <TableRow><TableCell colSpan={4} className="text-center text-gray-500 py-4">No terms found for this session</TableCell></TableRow>
                  ) : (
                    terms.map((term: { id: string, name: string, status?: 'OPEN' | 'CLOSED', isCurrent?: boolean }) => (
                      <TableRow key={term.id} className="hover:bg-gray-50 transition-colors">
                        <TableCell className="font-medium text-gray-900">
                          {term.name}
                          {term.isCurrent && (
                            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                              Active
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          {term.isCurrent ? (
                             <span className="text-sm font-medium text-gray-500">Current</span>
                          ) : (
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="text-brand-primary hover:bg-brand-primary/10 hover:text-brand-primary h-8"
                              disabled={activateTermMutation.isPending}
                              onClick={() => handleActivateTerm(term.id)}
                            >
                              Set Active
                            </Button>
                          )}
                        </TableCell>
                        <TableCell>
                          <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${term.status === 'OPEN' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                            {term.status || 'CLOSED'}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="outline" 
                            size="sm"
                            className={`h-8 ${term.status === 'OPEN' ? "!bg-red-500 !text-white !border-red-500 hover:!bg-transparent hover:!text-red-500 hover:!border-red-500" : "text-brand-primary border-brand-primary"}`}
                            disabled={updateTermMutation.isPending}
                            onClick={() => handleToggleTermStatus(term.id, term.status || 'CLOSED')}
                          >
                            {term.status === 'OPEN' ? 'Close' : 'Open'}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            ) : (
              <div className="p-10 text-center text-gray-500">
                Please click on a session from the left panel to view and manage its terms.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

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