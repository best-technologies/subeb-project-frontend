// Utility functions for student components

export const getScoreColor = (score: number): string => {
  if (score >= 80) return 'text-emerald-400';
  if (score >= 70) return 'text-amber-400';
  if (score >= 60) return 'text-orange-400';
  return 'text-red-400';
};

export const getScoreBgColor = (score: number): string => {
  if (score >= 80) return 'bg-emerald-500/10 border-emerald-500/20';
  if (score >= 70) return 'bg-amber-500/10 border-amber-500/20';
  if (score >= 60) return 'bg-orange-500/10 border-orange-500/20';
  return 'bg-red-500/10 border-red-500/20';
};

export const getPositionBadge = (position: number): string => {
  if (position === 1) return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
  if (position === 2) return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
  if (position === 3) return 'bg-orange-500/20 text-orange-300 border-orange-500/30';
  return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
};

export const getPageNumbers = (currentPage: number, totalPages: number): (number | string)[] => {
  const pages: (number | string)[] = [];
  
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    if (currentPage <= 4) {
      pages.push(1, 2, 3, 4, 5, '...', totalPages);
    } else if (currentPage >= totalPages - 3) {
      pages.push(1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
    } else {
      pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
    }
  }
  
  return pages;
};
