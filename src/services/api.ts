import { AdminDashboardResponse, ApiErrorResponse } from './types/adminDashboardResponse';

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';
const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION || 'v1';

console.log('API Configuration:');
console.log('  API_BASE_URL:', API_BASE_URL);
console.log('  API_VERSION:', API_VERSION);
console.log('  process.env.NEXT_PUBLIC_API_BASE_URL:', process.env.NEXT_PUBLIC_API_BASE_URL);
console.log('  process.env.NEXT_PUBLIC_API_VERSION:', process.env.NEXT_PUBLIC_API_VERSION);

// Base API client configuration
class ApiClient {
  private baseURL: string;
  private defaultHeaders: HeadersInit;

  constructor() {
    this.baseURL = `${API_BASE_URL}/api/${API_VERSION}`;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
    console.log('API Client - Initialized with baseURL:', this.baseURL);
  }

  // Generic request method
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      ...options,
      headers: {
        ...this.defaultHeaders,
        ...options.headers,
      },
    };

    console.log('API Client - Making request to:', url);
    console.log('API Client - Request config:', config);

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData: ApiErrorResponse = await response.json().catch(() => ({
          success: false,
          message: `HTTP error! status: ${response.status}`,
          statusCode: response.status,
        }));
        
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('API Client - Response data:', data);
      return data as T;
    } catch (error) {
      console.error('API Client - Request failed:', error);
      
      // If it's a network error (API not available), throw error
      if (error instanceof TypeError && error.message.includes('fetch')) {
        console.log('API Client - Network error, API not available');
        throw new Error('API not available - please ensure your backend is running at http://localhost:3000');
      }
      
      if (error instanceof Error) {
        throw new Error(`API request failed: ${error.message}`);
      }
      throw new Error('API request failed: Unknown error');
    }
  }

  // GET request helper
  private async get<T>(endpoint: string, headers?: HeadersInit): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'GET',
      headers,
    });
  }

  // POST request helper
  private async post<T>(
    endpoint: string,
    data?: any,
    headers?: HeadersInit
  ): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      headers,
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // PUT request helper
  private async put<T>(
    endpoint: string,
    data?: any,
    headers?: HeadersInit
  ): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      headers,
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // DELETE request helper
  private async delete<T>(endpoint: string, headers?: HeadersInit): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
      headers,
    });
  }

  // Admin Dashboard API Methods
  async getAdminDashboard(): Promise<AdminDashboardResponse> {
    console.log('API Client - Making request to:', `${this.baseURL}/admin/dashboard`);
    try {
      const response = await this.get<AdminDashboardResponse>('/admin/dashboard');
      console.log('API Client - Response received:', response);
      return response;
    } catch (error) {
      console.error('API Client - Error in getAdminDashboard:', error);
      throw error;
    }
  }

  // Future authentication methods (for when auth is implemented)
  private getAuthHeaders(): HeadersInit {
    // TODO: Implement when authentication is added
    // const token = localStorage.getItem('authToken');
    // return token ? { Authorization: `Bearer ${token}` } : {};
    return {};
  }

  // Method to set auth token (for future use)
  setAuthToken(token: string): void {
    // TODO: Implement when authentication is added
    // localStorage.setItem('authToken', token);
  }

  // Method to clear auth token (for future use)
  clearAuthToken(): void {
    // TODO: Implement when authentication is added
    // localStorage.removeItem('authToken');
  }


}

// Create and export a singleton instance
const apiClient = new ApiClient();

// Export the client instance
export default apiClient;

// Export individual methods for direct use
export const getAdminDashboard = () => apiClient.getAdminDashboard();
export const setAuthToken = (token: string) => apiClient.setAuthToken(token);
export const clearAuthToken = () => apiClient.clearAuthToken();

// Export the class for testing or custom instances
export { ApiClient }; 