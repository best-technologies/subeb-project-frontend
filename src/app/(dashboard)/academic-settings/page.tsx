"use client";

import React, { useState } from "react";
import { useSessions, useUpdateSessionStatus, useTerms, useUpdateTermStatus } from "@/services/hooks/useAcademic";
import { Button } from "@/components/ui/Button";
import { Plus } from "lucide-react";
import { CreateSessionModal } from "@/components/academic/CreateSessionModal";
import { CreateTermModal } from "@/components/academic/CreateTermModal";

export default function AcademicSettingsPage() {
  const { data: sessionsData, isLoading: loadingSessions } = useSessions();
  const updateSessionMutation = useUpdateSessionStatus();
  const updateTermMutation = useUpdateTermStatus();

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
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-800">Sessions</h2>
          </div>
          <div className="p-0">
            <table className="w-full">
              <thead className="bg-brand-accent-background">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Session Name</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loadingSessions ? (
                  <tr><td colSpan={3} className="px-6 py-4 text-center text-gray-500">Loading...</td></tr>
                ) : sessions.length === 0 ? (
                  <tr><td colSpan={3} className="px-6 py-4 text-center text-gray-500">No sessions found</td></tr>
                ) : (
                  sessions.map((session: { id: string, name: string, status?: 'OPEN' | 'CLOSED' }) => (
                    <tr 
                      key={session.id} 
                      className={`hover:bg-gray-50 cursor-pointer transition-colors ${selectedSessionId === session.id ? 'bg-brand-secondary/20' : ''}`}
                      onClick={() => setSelectedSessionId(session.id)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{session.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${session.status === 'OPEN' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                          {session.status || 'CLOSED'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <Button 
                          variant="outline" 
                          size="sm"
                          disabled={updateSessionMutation.isPending}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleSessionStatus(session.id, session.status || 'CLOSED');
                          }}
                        >
                          {session.status === 'OPEN' ? 'Close Session' : 'Open Session'}
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Terms Panel */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-800">Terms</h2>
            {!selectedSessionId && <span className="text-sm text-gray-500">Select a session first</span>}
          </div>
          <div className="p-0">
            {selectedSessionId ? (
              <table className="w-full">
                <thead className="bg-brand-accent-background">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Term Name</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {loadingTerms ? (
                    <tr><td colSpan={3} className="px-6 py-4 text-center text-gray-500">Loading terms...</td></tr>
                  ) : terms.length === 0 ? (
                    <tr><td colSpan={3} className="px-6 py-4 text-center text-gray-500">No terms found for this session</td></tr>
                  ) : (
                    terms.map((term: { id: string, name: string, status?: 'OPEN' | 'CLOSED' }) => (
                      <tr key={term.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{term.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${term.status === 'OPEN' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                            {term.status || 'CLOSED'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <Button 
                            variant="outline" 
                            size="sm"
                            disabled={updateTermMutation.isPending}
                            onClick={() => handleToggleTermStatus(term.id, term.status || 'CLOSED')}
                          >
                            {term.status === 'OPEN' ? 'Close Term' : 'Open Term'}
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            ) : (
              <div className="p-10 text-center text-gray-500">
                Please click on a session from the left panel to view and manage its terms.
              </div>
            )}
          </div>
        </div>
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