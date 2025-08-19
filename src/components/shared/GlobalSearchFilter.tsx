'use client';
import React from 'react';
import { MagnifyingGlassIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { Session, Term, Pagination } from '@/services/types/adminDashboardResponse';

interface GlobalSearchFilterProps {
  // Search and filter state
  searchTerm: string;
  onSearchChange: (term: string) => void;
  
  // Session and term selection
  availableSessions?: Session[];
  availableTerms?: Term[];
  selectedSession?: Session;
  selectedTerm?: Term;
  onSessionChange?: (session: Session) => void;
  onTermChange?: (term: Term) => void;
  
  // Additional filters
  lgaFilter?: string;
  onLgaFilterChange?: (lga: string) => void;
  schoolFilter?: string;
  onSchoolFilterChange?: (school: string) => void;
  availableLgas?: string[];
  availableSchools?: string[];
  
  // Pagination
  pagination?: Pagination;
  onPageChange?: (page: number) => void;
  onLimitChange?: (limit: number) => void;
  
  // Additional filters
  additionalFilters?: React.ReactNode;
  
  // Styling
  className?: string;
  showPagination?: boolean;
  showSessionTerm?: boolean;
}

export const GlobalSearchFilter: React.FC<GlobalSearchFilterProps> = ({
  searchTerm,
  onSearchChange,
  availableSessions = [],
  availableTerms = [],
  selectedSession,
  selectedTerm,
  onSessionChange,
  onTermChange,
  lgaFilter = '',
  onLgaFilterChange,
  schoolFilter = '',
  onSchoolFilterChange,
  availableLgas = [],
  availableSchools = [],
  pagination,
  onPageChange,
  onLimitChange,
  additionalFilters,
  className = '',
  showPagination = true,
  showSessionTerm = true,
}) => {

  const handlePageChange = (newPage: number) => {
    if (onPageChange && pagination && newPage >= 1 && newPage <= pagination.totalPages) {
      onPageChange(newPage);
    }
  };

  const handleLimitChange = (newLimit: number) => {
    if (onLimitChange) {
      onLimitChange(newLimit);
    }
  };

  return (
    <div className={`bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 ${className}`}>
      {/* Main Search and Filters Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-4">
        {/* Search Input - Smaller */}
        <div className="lg:col-span-2 relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search students..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          />
        </div>

        {/* Session Selection */}
        {showSessionTerm && availableSessions.length > 0 && (
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">Session</label>
            <select
              value={selectedSession?.id || ''}
              onChange={(e) => {
                const session = availableSessions.find(s => s.id === e.target.value);
                if (session && onSessionChange) {
                  onSessionChange(session);
                }
              }}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-2 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {availableSessions.map((session) => (
                <option key={session.id} value={session.id}>
                  {session.name} {session.isCurrent && '(Current)'}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Term Selection */}
        {showSessionTerm && availableTerms.length > 0 && (
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">Term</label>
            <select
              value={selectedTerm?.id || ''}
              onChange={(e) => {
                const term = availableTerms.find(t => t.id === e.target.value);
                if (term && onTermChange) {
                  onTermChange(term);
                }
              }}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-2 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {availableTerms.map((term) => (
                <option key={term.id} value={term.id}>
                  {term.name.replace('_', ' ')} {term.isCurrent && '(Current)'}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* LGA Filter */}
        {availableLgas.length > 0 && onLgaFilterChange && (
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">LGA</label>
            <select
              value={lgaFilter}
              onChange={(e) => onLgaFilterChange(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-2 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All LGAs</option>
              {availableLgas.map((lga) => (
                <option key={lga} value={lga}>
                  {lga}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* School Filter */}
        {availableSchools.length > 0 && onSchoolFilterChange && (
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">School</label>
            <select
              value={schoolFilter}
              onChange={(e) => onSchoolFilterChange(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-2 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Schools</option>
              {availableSchools.map((school) => (
                <option key={school} value={school}>
                  {school}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Additional Filters */}
      {additionalFilters && (
        <div className="border-t border-white/10 pt-4">
          {additionalFilters}
        </div>
      )}

      {/* Pagination */}
      {showPagination && pagination && (
        <div className="border-t border-white/10 pt-4 mt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm text-gray-300">
              <span>
                Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                {pagination.total} results
              </span>
              
              <select
                value={pagination.limit}
                onChange={(e) => handleLimitChange(Number(e.target.value))}
                className="bg-white/10 border border-white/20 rounded px-2 py-1 text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value={10}>10 per page</option>
                <option value={25}>25 per page</option>
                <option value={50}>50 per page</option>
                <option value={100}>100 per page</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className="flex items-center gap-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white hover:bg-white/20 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeftIcon className="w-4 h-4" />
                Previous
              </button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                  const pageNum = Math.max(1, Math.min(pagination.totalPages - 4, pagination.page - 2)) + i;
                  if (pageNum > pagination.totalPages) return null;
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`px-3 py-2 rounded-lg text-sm transition-colors duration-200 ${
                        pageNum === pagination.page
                          ? 'bg-blue-600 text-white'
                          : 'bg-white/10 text-white hover:bg-white/20'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages}
                className="flex items-center gap-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white hover:bg-white/20 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
                <ChevronRightIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
