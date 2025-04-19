import api, { handleApiError } from './api';
import type { ApiError } from './api';
import type { AxiosError } from 'axios';

// Auth types
export interface UserData {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  profile_picture?: string;
  role: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  username: string;
  first_name: string;
  last_name: string;
  phone: string;
  profile_picture?: string;
  default_location_latitude: number;
  default_location_longitude: number;
}

export interface AuthResponse {
  token: string;
  user: UserData;
  message: string;
}

// Auth service class
class AuthService {
  private readonly BASE_PATH = '/auth';

  // Login user
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>(
        `${this.BASE_PATH}/login`,
        credentials
      );
      
      // Başarılı giriş durumunda token'ı localStorage'a kaydet
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        // Kullanıcı bilgilerini de kaydedebiliriz
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      
      return response.data;
    } catch (error) {
      const apiError = handleApiError(error as AxiosError<ApiError>);
      
      // Email doğrulama hatasını kontrol et
      if (apiError.message?.includes('Email adresinizi doğrulamanız gerekmektedir')) {
        return {
          token: '',
          user: {} as UserData,
          message: apiError.message,
          needsEmailVerification: true,
          email: credentials.email
        } as AuthResponse & { needsEmailVerification: boolean, email: string };
      }
      
      throw apiError;
    }
  }

  // Register user
  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>(
        `${this.BASE_PATH}/register`,
        data
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error as AxiosError<ApiError>);
    }
  }
  
  // Resend email confirmation
  async resendEmailConfirmation(email: string): Promise<{ message: string }> {
    try {
      const response = await api.post<{ message: string }>(
        `${this.BASE_PATH}/resend-confirmation`,
        { email }
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error as AxiosError<ApiError>);
    }
  }

  // Reset password
  async resetPassword(email: string): Promise<{ message: string }> {
    try {
      const response = await api.post<{ message: string }>(
        `${this.BASE_PATH}/reset-password`,
        { email }
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error as AxiosError<ApiError>);
    }
  }

  // Get current user
  async getCurrentUser(): Promise<UserData> {
    try {
      const response = await api.get<{ user: UserData }>(`${this.BASE_PATH}/me`);
      return response.data.user;
    } catch (error) {
      throw handleApiError(error as AxiosError<ApiError>);
    }
  }

  // Logout user
  async logout(): Promise<void> {
    try {
      await api.post(`${this.BASE_PATH}/logout`);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }
  
  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }
  
  // Get current user from localStorage
  getLocalUser(): UserData | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }
}

export const authService = new AuthService();
export default authService; 