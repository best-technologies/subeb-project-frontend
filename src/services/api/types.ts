// Officer API types
export interface OfficerData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  nin: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

export interface ApiError {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
}
