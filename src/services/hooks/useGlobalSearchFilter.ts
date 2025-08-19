import { useState, useCallback } from 'react';
import { Session, Term } from '@/services/types/adminDashboardResponse';

interface UseGlobalSearchFilterProps {
  initialSearchTerm?: string;
  initialPage?: number;
  initialLimit?: number;
  availableSessions?: Session[];
  availableTerms?: Term[];
  onSearch?: (searchTerm: string) => void;
  onSessionChange?: (session: Session) => void;
  onTermChange?: (term: Term) => void;
  onPageChange?: (page: number) => void;
  onLimitChange?: (limit: number) => void;
}

export const useGlobalSearchFilter = ({
  initialSearchTerm = '',
  initialPage = 1,
  initialLimit = 10,
  availableSessions = [],
  availableTerms = [],
  onSearch,
  onSessionChange,
  onTermChange,
  onPageChange,
  onLimitChange,
}: UseGlobalSearchFilterProps = {}) => {
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  // Don't automatically select a session on initialization
  const [selectedSession, setSelectedSession] = useState<Session | undefined>(undefined);
  // Don't automatically select a term on initialization
  const [selectedTerm, setSelectedTerm] = useState<Term | undefined>(undefined);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [currentLimit, setCurrentLimit] = useState(initialLimit);

  const handleSearchChange = useCallback((term: string) => {
    setSearchTerm(term);
    setCurrentPage(1); // Reset to first page when searching
    onSearch?.(term);
  }, [onSearch]);

  const handleSessionChange = useCallback((session: Session) => {
    setSelectedSession(session);
    setCurrentPage(1); // Reset to first page when changing session
    onSessionChange?.(session);
  }, [onSessionChange]);

  const handleTermChange = useCallback((term: Term) => {
    setSelectedTerm(term);
    setCurrentPage(1); // Reset to first page when changing term
    onTermChange?.(term);
  }, [onTermChange]);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    onPageChange?.(page);
  }, [onPageChange]);

  const handleLimitChange = useCallback((limit: number) => {
    setCurrentLimit(limit);
    setCurrentPage(1); // Reset to first page when changing limit
    onLimitChange?.(limit);
  }, [onLimitChange]);

  const resetFilters = useCallback(() => {
    setSearchTerm('');
    setCurrentPage(1);
    setSelectedSession(availableSessions.find(s => s.isCurrent));
    setSelectedTerm(availableTerms.find(t => t.isCurrent));
    onSearch?.('');
    onPageChange?.(1);
  }, [availableSessions, availableTerms, onSearch, onPageChange]);

  return {
    // State
    searchTerm,
    selectedSession,
    selectedTerm,
    currentPage,
    currentLimit,
    
    // Handlers
    handleSearchChange,
    handleSessionChange,
    handleTermChange,
    handlePageChange,
    handleLimitChange,
    resetFilters,
    
    // Available options
    availableSessions,
    availableTerms,
  };
};
