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
  private readonly TOKEN_KEY = 'token';
  private readonly USER_KEY = 'user';

  // Login user
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>(
        `${this.BASE_PATH}/login`,
        credentials
      );
      
      // Başarılı giriş durumunda token'ı localStorage'a kaydet
      if (response.data.token) {
        console.log("AuthService: Token alındı, kaydediliyor...");
        this.setToken(response.data.token);
        // Kullanıcı bilgilerini de kaydedebiliriz
        this.setUser(response.data.user);
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
  logout(): void {
    console.log("AuthService: Çıkış yapılıyor, token siliniyor...");
    this.removeToken();
    this.removeUser();
    // Sayfayı yönlendir
    window.location.href = '/auth/login';
  }
  
  // Basit token yönetimi
  setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }
  
  removeToken(): void {
    localStorage.removeItem(this.TOKEN_KEY);
  }
  
  // Basit kullanıcı bilgileri yönetimi
  setUser(user: UserData): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }
  
  removeUser(): void {
    localStorage.removeItem(this.USER_KEY);
  }
  
  // Check if user is authenticated
  isAuthenticated(): boolean {
    const token = localStorage.getItem(this.TOKEN_KEY);
    return !!token;
  }
  
  // Get current user from localStorage
  getLocalUser(): UserData | null {
    const userStr = localStorage.getItem(this.USER_KEY);
    if (!userStr) return null;
    
    try {
      return JSON.parse(userStr);
    } catch (error) {
      console.error('Kullanıcı bilgileri alınamadı:', error);
      return null;
    }
  }
}

export const authService = new AuthService();
export default authService; 