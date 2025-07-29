import { useState, useEffect } from 'react';
import { getAdminDashboard } from '../api';
import { AdminDashboardResponse, AdminDashboardData } from '../types/adminDashboardResponse';

interface UseAdminDashboardReturn {
  data: AdminDashboardData | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useAdminDashboard = (): UseAdminDashboardReturn => {
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      const response: AdminDashboardResponse = await getAdminDashboard();
      
      if (response.success) {
        setData(response.data);
      } else {
        setError(response.message || 'Failed to fetch dashboard data');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      console.error('Error fetching admin dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const refetch = async (): Promise<void> => {
    await fetchDashboardData();
  };

  return {
    data,
    loading,
    error,
    refetch,
  };
}; 