import axios from 'axios';
import type { AxiosInstance, AxiosResponse, AxiosError } from 'axios';

// API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
const TOKEN_KEY = 'token';

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
    try {
      // Get token from localStorage or wherever you store it
      const token = localStorage.getItem(TOKEN_KEY);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    } catch (error) {
      console.error('Token alınırken hata oluştu:', error);
      return config;
    }
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
      try {
        localStorage.removeItem(TOKEN_KEY);
        // Direkt olarak sayfayı yönlendir
        window.location.href = '/auth/login';
      } catch (e) {
        console.error('Token silinemedi:', e);
      }
    }
    return Promise.reject(error);
  }
);

// Type for API error response
export interface ApiError {
  message: string;
  code: string;
  status: number;
}

// Helper function to handle API errors
export const handleApiError = (error: AxiosError<ApiError>): ApiError => {
  return {
    message: error.response?.data?.message || 'An unexpected error occurred',
    code: error.response?.data?.code || 'UNKNOWN_ERROR',
    status: error.response?.status || 500
  };
};

export default api; 