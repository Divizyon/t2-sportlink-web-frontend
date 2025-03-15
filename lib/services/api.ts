import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';

// API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

// Create Axios instance with default config
export const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage or wherever you store it
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      // For example: redirect to login or refresh token
      localStorage.removeItem('token');
      window.location.href = '/auth/login';
    }
    return Promise.reject(error);
  }
);

// Type for API error response
export interface ApiError {
  message: string;
  code?: string;
  status?: number;
}

// Helper function to handle API errors
export const handleApiError = (error: AxiosError<ApiError>): ApiError => {
  return {
    message: error.response?.data?.message || 'An unexpected error occurred',
    code: error.response?.data?.code,
    status: error.response?.status
  };
};

export default api; 