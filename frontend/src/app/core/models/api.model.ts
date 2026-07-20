/**
 * API Response Models
 * Standard API response structures
 */

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: string[];
  timestamp: Date;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
  timestamp: Date;
}

export interface ApiErrorResponse {
  success: false;
  error: ApiError;
}
